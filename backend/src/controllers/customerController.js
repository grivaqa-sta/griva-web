const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("../models/User");
const Order = require("../models/Order");
const Address = require("../models/Address");

/**
 * Get Paginated and Filtered Customer Directory
 * GET /api/admin/customers
 */
exports.getCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    const filter = req.query.filter || "";
    const sort = req.query.sort || "newest";

    // SQL subqueries for calculating stats directly in the DB
    const phoneSubquery = `COALESCE(
      "User".phone,
      (SELECT mobile FROM addresses WHERE addresses."userId" = "User".id AND addresses."isDefault" = true LIMIT 1),
      (SELECT mobile FROM addresses WHERE addresses."userId" = "User".id LIMIT 1),
      (SELECT customer_phone FROM "Orders" WHERE "Orders".user_id = "User".id AND "Orders".customer_phone IS NOT NULL LIMIT 1)
    )`;

    const totalOrdersCol = `(SELECT COUNT(*)::int FROM "Orders" WHERE "Orders".user_id = "User".id)`;
    const deliveredOrdersCol = `(SELECT COUNT(*)::int FROM "Orders" WHERE "Orders".user_id = "User".id AND "Orders".status IN ('delivered', 'completed'))`;
    const cancelledOrdersCol = `(SELECT COUNT(*)::int FROM "Orders" WHERE "Orders".user_id = "User".id AND "Orders".status = 'cancelled')`;
    const returnedOrdersCol = `(SELECT COUNT(*)::int FROM "Orders" WHERE "Orders".user_id = "User".id AND "Orders".status = 'returned')`;
    const totalSpentCol = `(SELECT COALESCE(SUM(total_price), 0)::float FROM "Orders" WHERE "Orders".user_id = "User".id AND "Orders".status NOT IN ('cancelled', 'returned'))`;
    const lastOrderDateCol = `(SELECT MAX("createdAt") FROM "Orders" WHERE "Orders".user_id = "User".id)`;

    const where = { role: "customer" };

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        sequelize.literal(`${phoneSubquery} ILIKE ${sequelize.escape(`%${search}%`)}`)
      ];
    }

    if (filter === "ACTIVE") {
      where.status = "ACTIVE";
    } else if (filter === "BLOCKED") {
      where.status = "BLOCKED";
    } else if (filter === "VIP") {
      where[Op.and] = sequelize.literal(`${totalSpentCol} >= 5000`);
    } else if (filter === "HIGH_RISK") {
      where[Op.and] = sequelize.literal(`${cancelledOrdersCol} >= 5`);
    } else if (filter === "NEW") {
      where[Op.and] = sequelize.literal(`${totalOrdersCol} <= 1`);
    } else if (filter === "REPEAT") {
      where[Op.and] = sequelize.literal(`${totalOrdersCol} >= 2`);
    }

    // Run count first for pagination
    const totalItems = await User.count({ where });

    let orderClause = [["createdAt", "DESC"]];
    if (sort === "newest") {
      orderClause = [["createdAt", "DESC"]];
    } else if (sort === "most_orders") {
      orderClause = [[sequelize.literal(totalOrdersCol), "DESC"]];
    } else if (sort === "highest_spending") {
      orderClause = [[sequelize.literal(totalSpentCol), "DESC"]];
    } else if (sort === "highest_success_rate") {
      orderClause = [[sequelize.literal(`COALESCE(${deliveredOrdersCol} * 100.0 / NULLIF(${totalOrdersCol}, 0), 100.0)`), "DESC"]];
    }

    const customers = await User.findAll({
      where,
      attributes: [
        "id",
        "name",
        "email",
        "status",
        "createdAt",
        [sequelize.literal(phoneSubquery), "phone"],
        [sequelize.literal(totalOrdersCol), "totalOrders"],
        [sequelize.literal(deliveredOrdersCol), "deliveredOrders"],
        [sequelize.literal(cancelledOrdersCol), "cancelledOrders"],
        [sequelize.literal(returnedOrdersCol), "returnedOrders"],
        [sequelize.literal(totalSpentCol), "totalSpent"],
        [sequelize.literal(lastOrderDateCol), "lastOrderDate"],
      ],
      order: orderClause,
      limit,
      offset,
    });

    const totalPages = Math.ceil(totalItems / limit);

    const data = customers.map(user => {
      const tOrders = parseInt(user.getDataValue("totalOrders"), 10) || 0;
      const dOrders = parseInt(user.getDataValue("deliveredOrders"), 10) || 0;
      const cOrders = parseInt(user.getDataValue("cancelledOrders"), 10) || 0;
      const rOrders = parseInt(user.getDataValue("returnedOrders"), 10) || 0;
      const tSpent = parseFloat(user.getDataValue("totalSpent")) || 0;
      const lastOrder = user.getDataValue("lastOrderDate");

      const successRate = tOrders > 0 ? Math.round((dOrders / tOrders) * 100) : 100;

      let riskLevel = "LOW";
      if (cOrders >= 5) {
        riskLevel = "HIGH";
      } else if (cOrders >= 3) {
        riskLevel = "MEDIUM";
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.getDataValue("phone") || "",
        status: user.status || "ACTIVE",
        totalOrders: tOrders,
        deliveredOrders: dOrders,
        cancelledOrders: cOrders,
        returnedOrders: rOrders,
        successRate,
        totalSpent: tSpent,
        lastOrderDate: lastOrder,
        riskLevel,
        registrationDate: user.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      customers: data,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Customer Profile and Statistics by ID
 * GET /api/admin/customers/:id
 */
exports.getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ["id", "name", "email", "status", "createdAt", "phone", "role"],
      include: [
        {
          model: Address,
          as: "addresses",
        },
      ],
    });

    if (!user || user.role === "admin") {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    // Get order statistics
    const stats = await Order.findOne({
      where: { user_id: id },
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id")), "totalOrders"],
        [sequelize.literal(`COUNT(CASE WHEN status IN ('delivered', 'completed') THEN 1 END)`), "deliveredOrders"],
        [sequelize.literal(`COUNT(CASE WHEN status = 'cancelled' THEN 1 END)`), "cancelledOrders"],
        [sequelize.literal(`COUNT(CASE WHEN status = 'returned' THEN 1 END)`), "returnedOrders"],
        [sequelize.literal(`COALESCE(SUM(CASE WHEN status NOT IN ('cancelled', 'returned') THEN total_price ELSE 0 END), 0)`), "totalSpent"],
        [sequelize.fn("MAX", sequelize.col("createdAt")), "lastOrderDate"],
      ],
    });

    const totalOrders = parseInt(stats.getDataValue("totalOrders"), 10) || 0;
    const deliveredOrders = parseInt(stats.getDataValue("deliveredOrders"), 10) || 0;
    const cancelledOrders = parseInt(stats.getDataValue("cancelledOrders"), 10) || 0;
    const returnedOrders = parseInt(stats.getDataValue("returnedOrders"), 10) || 0;
    const totalSpent = parseFloat(stats.getDataValue("totalSpent")) || 0;
    const lastOrderDate = stats.getDataValue("lastOrderDate");

    const averageOrderValue = totalOrders > 0 ? parseFloat((totalSpent / totalOrders).toFixed(2)) : 0;
    const successRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 100;

    let riskLevel = "LOW";
    if (cancelledOrders >= 5) {
      riskLevel = "HIGH";
    } else if (cancelledOrders >= 3) {
      riskLevel = "MEDIUM";
    }

    let customerSegment = "New Customer";
    if (totalSpent >= 5000) {
      customerSegment = "VIP Customer";
    } else if (totalOrders >= 2) {
      customerSegment = "Repeat Customer";
    }

    // Home and Office addresses
    const homeAddress = user.addresses ? user.addresses.find(a => a.label === "home") || null : null;
    const officeAddress = user.addresses ? user.addresses.find(a => a.label === "office") || null : null;

    // Latest 10 orders
    const recentOrders = await Order.findAll({
      where: { user_id: id },
      attributes: ["id", "order_number", "createdAt", "total_price", "status"],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    const formattedOrders = recentOrders.map(o => ({
      id: o.id,
      orderNumber: o.order_number,
      date: o.createdAt,
      amount: o.total_price,
      status: o.status,
    }));

    const resolvedPhone = user.phone || (homeAddress ? homeAddress.mobile : null) || (officeAddress ? officeAddress.mobile : null) || "";

    res.status(200).json({
      success: true,
      customer: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: resolvedPhone,
        registrationDate: user.createdAt,
        status: user.status || "ACTIVE",
        addresses: {
          home: homeAddress,
          office: officeAddress,
        },
        stats: {
          totalOrders,
          deliveredOrders,
          cancelledOrders,
          returnedOrders,
          totalSpent,
          averageOrderValue,
          lastOrderDate,
        },
        metrics: {
          successRate,
          riskLevel,
          customerSegment,
        },
        recentOrders: formattedOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Paginated and Status-filtered Customer Order History
 * GET /api/admin/customers/:id/orders
 */
exports.getCustomerOrders = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const { status } = req.query;

    const where = { user_id: id };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      attributes: ["id", "order_number", "createdAt", "total_price", "status"],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    const formattedOrders = rows.map(o => ({
      id: o.id,
      orderNumber: o.order_number,
      date: o.createdAt,
      amount: o.total_price,
      status: o.status,
    }));

    res.status(200).json({
      success: true,
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Customer Directory Analytics Summary
 * GET /api/admin/customers/analytics
 */
exports.getCustomerAnalytics = async (req, res, next) => {
  try {
    const totalCustomers = await User.count({ where: { role: "customer" } });
    const activeCustomers = await User.count({ where: { role: "customer", status: "ACTIVE" } });
    const blockedCustomers = await User.count({ where: { role: "customer", status: "BLOCKED" } });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newCustomersThisMonth = await User.count({
      where: {
        role: "customer",
        createdAt: {
          [Op.gte]: startOfMonth,
        },
      },
    });

    const totalOrdersCol = `(SELECT COUNT(*)::int FROM "Orders" WHERE "Orders".user_id = "User".id)`;
    const deliveredOrdersCol = `(SELECT COUNT(*)::int FROM "Orders" WHERE "Orders".user_id = "User".id AND "Orders".status IN ('delivered', 'completed'))`;
    const cancelledOrdersCol = `(SELECT COUNT(*)::int FROM "Orders" WHERE "Orders".user_id = "User".id AND "Orders".status = 'cancelled')`;
    const totalSpentCol = `(SELECT COALESCE(SUM(total_price), 0)::float FROM "Orders" WHERE "Orders".user_id = "User".id AND "Orders".status NOT IN ('cancelled', 'returned'))`;

    const repeatCustomers = await User.count({
      where: {
        role: "customer",
        [Op.and]: sequelize.literal(`${totalOrdersCol} >= 2`),
      },
    });

    const vipCustomers = await User.count({
      where: {
        role: "customer",
        [Op.and]: sequelize.literal(`${totalSpentCol} >= 5000`),
      },
    });

    const highRiskCustomers = await User.count({
      where: {
        role: "customer",
        [Op.and]: sequelize.literal(`${cancelledOrdersCol} >= 5`),
      },
    });

    const result = await Order.findOne({
      attributes: [[sequelize.literal("COALESCE(SUM(total_price), 0)::float"), "sum"]],
      where: {
        status: {
          [Op.notIn]: ["cancelled", "returned"],
        },
      },
    });
    const totalSpentAll = parseFloat(result.getDataValue("sum")) || 0;
    const averageCustomerValue = totalCustomers > 0 ? parseFloat((totalSpentAll / totalCustomers).toFixed(2)) : 0;

    res.status(200).json({
      success: true,
      analytics: {
        totalCustomers,
        activeCustomers,
        blockedCustomers,
        newCustomersThisMonth,
        repeatCustomers,
        vipCustomers,
        highRiskCustomers,
        averageCustomerValue,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Customer ACTIVE/BLOCKED Status
 * PATCH /api/admin/customers/:id/status
 */
exports.updateCustomerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["ACTIVE", "BLOCKED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status parameter must be 'ACTIVE' or 'BLOCKED'.",
      });
    }

    const customer = await User.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    // Security validation
    if (customer.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot block your own admin account.",
      });
    }

    if (customer.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be blocked or managed from this endpoint.",
      });
    }

    customer.status = status;
    await customer.save();

    res.status(200).json({
      success: true,
      message: `Customer status updated to ${status} successfully.`,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        status: customer.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
