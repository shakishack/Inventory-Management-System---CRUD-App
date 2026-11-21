import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import orderRoutes from "./routes/orderRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, status: "ok" });
});

app.use("/api/orders", orderRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

const clientDist = path.resolve(__dirname, "client", "dist");
const clientIndex = path.join(clientDist, "index.html");

if (fs.existsSync(clientIndex)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method === "GET") {
      return res.sendFile(clientIndex);
    }
    return next();
  });
} else {
  app.get("/", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Inventory Management REST API",
      endpoints: "/api/orders",
    });
  });
}

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload",
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

export default app;
