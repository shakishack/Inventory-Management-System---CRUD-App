import mongoose from "mongoose";
import Order from "../models/Order.js";

const ORDER_FIELDS = [
  "productName",
  "category",
  "description",
  "standardCost",
  "listPrice",
  "profit",
  "quantity",
  "status",
  "warehouse",
  "customerName",
  "orderDate",
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pickOrderFields(body = {}) {
  const result = {};
  for (const field of ORDER_FIELDS) {
    if (body[field] !== undefined) {
      result[field] = body[field];
    }
  }
  return result;
}

function handleError(res, error) {
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid order ID format",
    });
  }

  console.error(error);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

export async function getAllOrders(req, res) {
  try {
    const { status, category, search } = req.query;
    const filter = {};

    if (status && status.toLowerCase() !== "all") {
      filter.status = new RegExp(`^${escapeRegex(status.trim())}$`, "i");
    }

    if (category) {
      filter.category = new RegExp(`^${escapeRegex(category.trim())}$`, "i");
    }

    if (search && search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [
        { productName: regex },
        { category: regex },
        { customerName: regex },
        { status: regex },
        { warehouse: regex },
        { description: regex },
      ];
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getOrdersSummary(req, res) {
  try {
    const orders = await Order.find();
    const totalOrders = orders.length;
    const totalQty = orders.reduce((sum, o) => sum + o.quantity, 0);
    const totalRevenue = Number(
      orders.reduce((sum, o) => sum + o.listPrice * o.quantity, 0).toFixed(2)
    );
    const totalProfit = Number(
      orders.reduce((sum, o) => sum + o.profit * o.quantity, 0).toFixed(2)
    );

    const byStatus = {};
    const byCategory = {};
    for (const o of orders) {
      byStatus[o.status] = (byStatus[o.status] || 0) + 1;
      byCategory[o.category] = (byCategory[o.category] || 0) + 1;
    }

    const topProfit =
      orders.length > 0
        ? [...orders].sort((a, b) => b.profit - a.profit)[0]
        : null;
    const topQty =
      orders.length > 0
        ? [...orders].sort((a, b) => b.quantity - a.quantity)[0]
        : null;

    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalQty,
        totalRevenue,
        totalProfit,
        byStatus,
        byCategory,
        topProfit,
        topQty,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function createOrder(req, res) {
  try {
    const payload = pickOrderFields(req.body);

    if (payload.orderDate === "") {
      delete payload.orderDate;
    }

    const hasProfit =
      payload.profit !== undefined &&
      payload.profit !== null &&
      payload.profit !== "";
    if (
      !hasProfit &&
      payload.listPrice !== undefined &&
      payload.standardCost !== undefined
    ) {
      const price = Number(payload.listPrice);
      const cost = Number(payload.standardCost);
      if (Number.isFinite(price) && Number.isFinite(cost)) {
        payload.profit = Number((price - cost).toFixed(2));
      }
    }

    const order = await Order.create(payload);
    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    const updates = pickOrderFields(req.body);
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const existing = await Order.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const hasProfit =
      updates.profit !== undefined &&
      updates.profit !== null &&
      updates.profit !== "";
    if (
      !hasProfit &&
      (updates.listPrice !== undefined || updates.standardCost !== undefined)
    ) {
      const nextListPrice =
        updates.listPrice !== undefined
          ? Number(updates.listPrice)
          : existing.listPrice;
      const nextStandardCost =
        updates.standardCost !== undefined
          ? Number(updates.standardCost)
          : existing.standardCost;

      if (Number.isFinite(nextListPrice) && Number.isFinite(nextStandardCost)) {
        updates.profit = Number((nextListPrice - nextStandardCost).toFixed(2));
      }
    }

    const updated = await Order.findByIdAndUpdate(id, updates, {
      returnDocument: "after",
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: updated,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function deleteOrder(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      data: deleted,
    });
  } catch (error) {
    return handleError(res, error);
  }
}
