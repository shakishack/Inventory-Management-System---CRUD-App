import mongoose from "mongoose";

function getTodayDDMMYYYY() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
}

const orderSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    standardCost: {
      type: Number,
      required: [true, "Standard cost is required"],
      min: [0, "Standard cost cannot be negative"],
    },
    listPrice: {
      type: Number,
      required: [true, "List price is required"],
      min: [0.01, "List price must be greater than 0"],
    },
    profit: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    status: {
      type: String,
      enum: {
        values: ["Pending", "Shipped", "Canceled"],
        message: "Status must be Pending, Shipped, or Canceled",
      },
      default: "Pending",
    },
    warehouse: {
      type: String,
      required: [true, "Warehouse is required"],
      trim: true,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    orderDate: {
      type: String,
      default: getTodayDDMMYYYY,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
