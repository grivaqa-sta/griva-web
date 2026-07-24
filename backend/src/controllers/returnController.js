const ReturnRequest = require("../models/ReturnRequest");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const User = require("../models/User");
const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");
const { sequelize } = require("../config/db");
const brevoService = require("../services/brevoService");
const { emitToRoles, emitToUser, emitToAll, emitToOrder } = require("../socket/socket");
const handleApiError = require("../utils/errorHandler");

/**
 * Customer Action: Submit a Return/Replacement Request
 * POST /api/returns
 */
exports.submitReturnRequest = async (req, res) => {
  let transaction;
  try {
    const userId = req.user.id;
    const { orderId, orderItemId, quantity, type, reason, description, images } = req.body;

    if (!orderId || isNaN(Number(orderId)) || !orderItemId || isNaN(Number(orderItemId)) || !quantity || isNaN(Number(quantity)) || !type || !reason) {
      const err = new Error("Missing or invalid required parameters.");
      err.statusCode = 400;
      throw err;
    }

    if (Number(quantity) <= 0) {
      const err = new Error("Quantity must be greater than 0.");
      err.statusCode = 400;
      throw err;
    }

    const allowedTypes = ["replacement", "refund"];
    if (!allowedTypes.includes(type)) {
      const err = new Error("Invalid return request type.");
      err.statusCode = 400;
      throw err;
    }

    const allowedReasons = ["damaged", "defective", "wrong_item", "changed_mind", "other"];
    if (!allowedReasons.includes(reason)) {
      const err = new Error("Invalid return reason.");
      err.statusCode = 400;
      throw err;
    }

    if (["damaged", "defective"].includes(reason)) {
      if (!Array.isArray(images) || images.length === 0) {
        const err = new Error("Photos/Proof is strictly required for damaged or defective items.");
        err.statusCode = 400;
        throw err;
      }
    }

    transaction = await sequelize.transaction();

    const order = await Order.findOne({
      where: { id: orderId, user_id: userId },
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      const err = new Error("Order not found or access denied.");
      err.statusCode = 404;
      throw err;
    }

    const statusLower = (order.status || "").toLowerCase().trim();
    if (statusLower !== "delivered" && statusLower !== "completed" && statusLower !== "returned") {
      await transaction.rollback();
      const err = new Error("Only delivered or completed orders can be returned.");
      err.statusCode = 400;
      throw err;
    }

    const deliveryDate = order.updatedAt;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (new Date(deliveryDate) < sevenDaysAgo) {
      await transaction.rollback();
      const err = new Error("The 7-day return window for this order has expired.");
      err.statusCode = 400;
      throw err;
    }

    const orderItem = await OrderItem.findOne({
      where: { id: orderItemId, order_id: orderId },
      transaction,
    });

    if (!orderItem) {
      await transaction.rollback();
      const err = new Error("OrderItem not found in this order.");
      err.statusCode = 404;
      throw err;
    }

    if (Number(quantity) > orderItem.quantity) {
      await transaction.rollback();
      const err = new Error(`Requested quantity (${quantity}) exceeds the purchased quantity (${orderItem.quantity}).`);
      err.statusCode = 400;
      throw err;
    }

    const existingRequest = await ReturnRequest.findOne({
      where: { order_item_id: orderItemId, status: ["pending", "approved_replacement", "approved_refund"] },
      transaction,
    });

    if (existingRequest) {
      await transaction.rollback();
      const err = new Error("An active return request already exists for this item.");
      err.statusCode = 400;
      throw err;
    }

    const returnRequest = await ReturnRequest.create({
      order_id: orderId,
      user_id: userId,
      order_item_id: orderItemId,
      quantity: Number(quantity),
      type,
      reason,
      description,
      images: Array.isArray(images) ? images : [],
      status: "pending",
    }, { transaction });

    await transaction.commit();

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
    return handleApiError(error, req, res, "ReturnController.submitReturnRequest");
  }
};

/**
 * Customer Action: List current user's return requests
 * GET /api/returns/my-returns
 */
exports.getMyReturns = async (req, res) => {
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
    return handleApiError(error, req, res, "ReturnController.getMyReturns");
  }
};

/**
 * Admin Action: List all return requests (pending/resolved)
 * GET /api/returns
 */
exports.getAllReturns = async (req, res) => {
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
    return handleApiError(error, req, res, "ReturnController.getAllReturns");
  }
};

/**
 * Admin Action: Approve/Reject return request with stock logic fallback
 * PATCH /api/returns/:id/status
 */
exports.updateReturnRequestStatus = async (req, res) => {
  let transaction;
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid return request ID.");
      err.statusCode = 400;
      throw err;
    }

    const { status, admin_notes, deliveryBoyId, delivery_boy_id } = req.body;
    const assignedDriverId = deliveryBoyId || delivery_boy_id;

    const allowedStatuses = ["approved_replacement", "approved_refund", "rejected"];
    if (!allowedStatuses.includes(status)) {
      const err = new Error("Invalid status code.");
      err.statusCode = 400;
      throw err;
    }

    transaction = await sequelize.transaction();

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
      const err = new Error("Return request not found.");
      err.statusCode = 404;
      throw err;
    }

    if (returnRequest.status !== "pending") {
      await transaction.rollback();
      const err = new Error("This return request has already been processed.");
      err.statusCode = 400;
      throw err;
    }

    let finalStatus = status;
    let detailText = "";

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

    const orderItem = returnRequest.orderItem;

    if (status === "approved_replacement") {
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
        if (variant) {
          variant.stock -= returnRequest.quantity;
          await variant.save({ transaction });
        } else if (product) {
          product.stock -= returnRequest.quantity;
          await product.save({ transaction });
        }

        const replacementOrderNumber = `RPL-${returnRequest.order.order_number}-${Date.now().toString().slice(-4)}`;
        
        const replacementOrder = await Order.create({
          order_number: replacementOrderNumber,
          user_id: returnRequest.user_id,
          status: assignedDriverId ? "assigned" : "pending",
          delivery_boy_id: assignedDriverId || null,
          assigned_at: assignedDriverId ? new Date() : null,
          total_price: 0.00,
          shipping_address: returnRequest.order.shipping_address,
          customer_name: returnRequest.order.customer_name,
          customer_phone: returnRequest.order.customer_phone,
          customer_email: returnRequest.order.customer_email,
          payment_method: "Replacement (COD)",
          payment_status: "paid",
          delivery_notes: `REPLACEMENT ORDER FOR: ${returnRequest.order.order_number}. Request ID: #${returnRequest.id}`,
          city: returnRequest.order.city,
          delivery_slot_id: returnRequest.order.delivery_slot_id,
          latitude: returnRequest.order.latitude,
          longitude: returnRequest.order.longitude,
        }, { transaction });

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
        finalStatus = "approved_refund";
        detailText = "Replacement requested but stock was unavailable. We have automatically converted this request to a Full Refund.";
      }
    }

    if (finalStatus === "approved_refund") {
      returnRequest.status = "approved_refund";
      returnRequest.admin_notes = admin_notes 
        ? `${admin_notes}\n(Processed as Refund)`
        : "Approved for full refund. Funds are credited/refunded to your wallet/original payment source.";
      returnRequest.resolved_at = new Date();
      if (assignedDriverId) {
        returnRequest.delivery_boy_id = assignedDriverId;
      }
      await returnRequest.save({ transaction });

      if (detailText === "") {
        detailText = "We have approved a full refund for your product. The refund has been credited back to your original payment method or wallet.";
      }
    }

    await transaction.commit();

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
    return handleApiError(error, req, res, "ReturnController.updateReturnRequestStatus");
  }
};
