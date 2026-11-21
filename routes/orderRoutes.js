import { Router } from "express";
import {
  getAllOrders,
  getOrdersSummary,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../controllers/orderController.js";

const router = Router();

router.get("/", getAllOrders);
router.get("/summary", getOrdersSummary);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.put("/:id", updateOrder);
router.patch("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;
