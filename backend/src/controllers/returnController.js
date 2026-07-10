const ReturnRequest = require("../models/ReturnRequest");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const User = require("../models/User");
const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");
const { sequelize } = require("../config/db");
const brevoService = require("../services/brevoService");
const { emitToRoles, emitToUser, emitToAll, emitToOrder } = require("../socket/socket");

/**
 * Customer Action: Submit a Return/Replacement Request
 * POST /api/returns
 */
exports.submitReturnRequest = async (req, res, next) => {
  let transaction;
  try {
    const userId = req.user.id;
    const { orderId, orderItemId, quantity, type, reason, description, images } = req.body;

    // 1. Basic validation
    if (!orderId || !orderItemId || !quantity || !type || !reason) {
      return res.status(400).json({ error: "Missing required parameters." });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: "Quantity must be greater than 0." });
    }

    const allowedTypes = ["replacement", "refund"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid return request type." });
    }

    const allowedReasons = ["damaged", "defective", "wrong_item", "changed_mind", "other"];
    if (!allowedReasons.includes(reason)) {
      return res.status(400).json({ error: "Invalid return reason." });
    }

    // 2. Damage/Defect proof check (Mandatory photo rule)
    if (["damaged", "defective"].includes(reason)) {
      if (!Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ error: "Photos/Proof is strictly required for damaged or defective items." });
      }
    }

    // Begin ACID transaction
    transaction = await sequelize.transaction();

    // 3. Find order and verify ownership/status
    const order = await Order.findOne({
      where: { id: orderId, user_id: userId },
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: "Order not found or access denied." });
    }

    // Eligibility check: Order status must be delivered/completed
    const statusLower = (order.status || "").toLowerCase().trim();
    if (statusLower !== "delivered" && statusLower !== "completed" && statusLower !== "returned") {
      await transaction.rollback();
      return res.status(400).json({ error: "Only delivered or completed orders can be returned." });
    }

    // 7-day restriction check
    const deliveryDate = order.updatedAt; // updatedAt represents the timestamp when order became delivered/completed
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (new Date(deliveryDate) < sevenDaysAgo) {
      await transaction.rollback();
      return res.status(400).json({ error: "The 7-day return window for this order has expired." });
    }

    // 4. Verify OrderItem exists, belongs to order, and quantity is within limits
    const orderItem = await OrderItem.findOne({
      where: { id: orderItemId, order_id: orderId },
      transaction,
    });

    if (!orderItem) {
      await transaction.rollback();
      return res.status(404).json({ error: "OrderItem not found in this order." });
    }

    if (quantity > orderItem.quantity) {
      await transaction.rollback();
      return res.status(400).json({ error: `Requested quantity (${quantity}) exceeds the purchased quantity (${orderItem.quantity}).` });
    }

    // 5. Prevent double submission (one active request per item)
    const existingRequest = await ReturnRequest.findOne({
      where: { order_item_id: orderItemId, status: ["pending", "approved_replacement", "approved_refund"] },
      transaction,
    });

    if (existingRequest) {
      await transaction.rollback();
      return res.status(400).json({ error: "An active return request already exists for this item." });
    }

    // 6. Create Return Request
    const returnRequest = await ReturnRequest.create({
      order_id: orderId,
      user_id: userId,
      order_item_id: orderItemId,
      quantity,
      type,
      reason,
      description,
      images: Array.isArray(images) ? images : [],
      status: "pending",
    }, { transaction });

    await transaction.commit();

    // 7. Send confirmation email (async)
    const user = await User.findByPk(userId);
    if (user && user.email) {
      brevoService.sendReturnRequestSubmittedEmail(returnRequest, user, order.order_number).catch(err => {
        console.error("Failed to send return confirmation email:", err);
      });
    }

    try {
      emitToRoles(["admin", "staff"], "order-updated", { orderId: orderId });
      emitToRoles(["admin", "staff"], "dashboard-metrics-updated");
    } catch (socketErr) {
      console.error("🔌 [Socket.IO Error]:", socketErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Return request submitted successfully. Our admin team will review it shortly.",
      returnRequest,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    next(error);
  }
};

/**
 * Customer Action: List current user's return requests
 * GET /api/returns/my-returns
 */
exports.getMyReturns = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const returnRequests = await ReturnRequest.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Order,
          as: "order",
          attributes: ["id", "order_number", "createdAt"],
        },
        {
          model: OrderItem,
          as: "orderItem",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "title", "main_image_url", "stock"],
            },
            {
              model: ProductVariant,
              as: "variant",
              attributes: ["id", "sku", "stock"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, returnRequests });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Action: List all return requests (pending/resolved)
 * GET /api/returns
 */
exports.getAllReturns = async (req, res, next) => {
  try {
    const returnRequests = await ReturnRequest.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: Order,
          as: "order",
          attributes: ["id", "order_number", "createdAt"],
        },
        {
          model: OrderItem,
          as: "orderItem",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "title", "main_image_url", "stock"],
            },
            {
              model: ProductVariant,
              as: "variant",
              attributes: ["id", "sku", "stock"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, returnRequests });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Action: Approve/Reject return request with stock logic fallback
 * PATCH /api/returns/:id/status
 */
exports.updateReturnRequestStatus = async (req, res, next) => {
  let transaction;
  try {
    const { id } = req.params;
    const { status, admin_notes, deliveryBoyId, delivery_boy_id } = req.body;
    const assignedDriverId = deliveryBoyId || delivery_boy_id;

    const allowedStatuses = ["approved_replacement", "approved_refund", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status code." });
    }

    transaction = await sequelize.transaction();

    // Fetch the request with details
    const returnRequest = await ReturnRequest.findByPk(id, {
      include: [
        { model: Order, as: "order" },
        { model: OrderItem, as: "orderItem" },
        { model: User, as: "user" },
      ],
      transaction,
    });

    if (!returnRequest) {
      await transaction.rollback();
      return res.status(404).json({ error: "Return request not found." });
    }

    if (returnRequest.status !== "pending") {
      await transaction.rollback();
      return res.status(400).json({ error: "This return request has already been processed." });
    }

    let finalStatus = status;
    let detailText = "";

    // ─── REJECTION FLOW ───
    if (status === "rejected") {
      returnRequest.status = "rejected";
      returnRequest.admin_notes = admin_notes;
      returnRequest.resolved_at = new Date();
      await returnRequest.save({ transaction });

      await transaction.commit();

      if (returnRequest.user && returnRequest.user.email) {
        brevoService.sendReturnRequestRejectedEmail(
          returnRequest,
          returnRequest.user,
          returnRequest.order.order_number,
          admin_notes
        ).catch(err => console.error("Email send fail:", err));
      }

      try {
        emitToRoles(["admin", "staff"], "order-updated", { orderId: returnRequest.order_id });
        emitToRoles(["admin", "staff"], "dashboard-metrics-updated");
      } catch (socketErr) {
        console.error("🔌 [Socket.IO Error]:", socketErr.message);
      }

      return res.status(200).json({ success: true, message: "Return request rejected.", returnRequest });
    }

    // ─── APPROVAL FLOWS ───
    const orderItem = returnRequest.orderItem;

    if (status === "approved_replacement") {
      // 1. Stock check
      let stockAvailable = false;
      let variant = null;
      let product = null;

      if (orderItem.variant_id) {
        variant = await ProductVariant.findByPk(orderItem.variant_id, { transaction });
        if (variant && variant.stock >= returnRequest.quantity) {
          stockAvailable = true;
        }
      } else if (orderItem.product_id) {
        product = await Product.findByPk(orderItem.product_id, { transaction });
        if (product && product.stock >= returnRequest.quantity) {
          stockAvailable = true;
        }
      }

      if (stockAvailable) {
        // A. Stock Available: Deduct stock and create zero-value replacement order
        if (variant) {
          variant.stock -= returnRequest.quantity;
          await variant.save({ transaction });
        } else if (product) {
          product.stock -= returnRequest.quantity;
          await product.save({ transaction });
        }

        // Generate new Order representation
        const replacementOrderNumber = `RPL-${returnRequest.order.order_number}-${Date.now().toString().slice(-4)}`;
        
        const replacementOrder = await Order.create({
          order_number: replacementOrderNumber,
          user_id: returnRequest.user_id,
          status: assignedDriverId ? "assigned" : "pending",
          delivery_boy_id: assignedDriverId || null,
          assigned_at: assignedDriverId ? new Date() : null,
          total_price: 0.00, // zero price
          shipping_address: returnRequest.order.shipping_address,
          customer_name: returnRequest.order.customer_name,
          customer_phone: returnRequest.order.customer_phone,
          customer_email: returnRequest.order.customer_email,
          payment_method: "Replacement (COD)",
          payment_status: "paid", // Paid already via the original order
          delivery_notes: `REPLACEMENT ORDER FOR: ${returnRequest.order.order_number}. Request ID: #${returnRequest.id}`,
          city: returnRequest.order.city,
          delivery_slot_id: returnRequest.order.delivery_slot_id,
          latitude: returnRequest.order.latitude,
          longitude: returnRequest.order.longitude,
        }, { transaction });

        // Create Order Item
        await OrderItem.create({
          order_id: replacementOrder.id,
          product_id: orderItem.product_id,
          variant_id: orderItem.variant_id,
          quantity: returnRequest.quantity,
          selected_color: orderItem.selected_color,
          selected_storage: orderItem.selected_storage,
          selected_attributes: orderItem.selected_attributes,
          sku: orderItem.sku,
          image_snapshot: orderItem.image_snapshot,
          price_at_purchase: 0.00,
        }, { transaction });

        returnRequest.status = "approved_replacement";
        returnRequest.admin_notes = admin_notes || "Approved replacement. Replacement order generated.";
        returnRequest.resolved_at = new Date();
        if (assignedDriverId) {
          returnRequest.delivery_boy_id = assignedDriverId;
        }
        await returnRequest.save({ transaction });

        detailText = `We have approved a direct replacement for your product. A new replacement order (${replacementOrderNumber}) has been generated and is now in our delivery queue at QAR 0.00.`;
      } else {
        // B. No Stock Available fallback to refund
        finalStatus = "approved_refund";
        detailText = "Replacement requested but stock was unavailable. We have automatically converted this request to a Full Refund.";
      }
    }

    if (finalStatus === "approved_refund") {
      // Process full refund (set status to approved_refund)
      returnRequest.status = "approved_refund";
      returnRequest.admin_notes = admin_notes 
        ? `${admin_notes}\n(Processed as Refund)`
        : "Approved for full refund. Funds are credited/refunded to your wallet/original payment source.";
      returnRequest.resolved_at = new Date();
      if (assignedDriverId) {
        returnRequest.delivery_boy_id = assignedDriverId;
      }
      await returnRequest.save({ transaction });

      // Update parent order status to returned if all items returned (optional design)
      // For simplicity, we just keep order as is or log the refund.
      if (detailText === "") {
        detailText = "We have approved a full refund for your product. The refund has been credited back to your original payment method or wallet.";
      }
    }

    await transaction.commit();

    // Send success email (async)
    if (returnRequest.user && returnRequest.user.email) {
      brevoService.sendReturnRequestApprovedEmail(
        returnRequest,
        returnRequest.user,
        returnRequest.order.order_number,
        detailText
      ).catch(err => console.error("Email send fail:", err));
    }

    try {
      emitToRoles(["admin", "staff"], "order-updated", { orderId: returnRequest.order_id });
      emitToRoles(["admin", "staff"], "dashboard-metrics-updated");
      if (assignedDriverId) {
        emitToUser(assignedDriverId, "driver-assigned", { orderId: returnRequest.order_id });
        emitToUser(assignedDriverId, "order-updated", { orderId: returnRequest.order_id });
      }
    } catch (socketErr) {
      console.error("🔌 [Socket.IO Error]:", socketErr.message);
    }

    res.status(200).json({
      success: true,
      message: finalStatus === "approved_refund" && status === "approved_replacement"
        ? "Replacement stock unavailable. Automatically processed as a Full Refund instead."
        : "Return request status updated successfully.",
      returnRequest,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    next(error);
  }
};
