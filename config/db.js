import mongoose from "mongoose";

export default async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  const conn = await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB_NAME || "inventory_db",
  });

  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}
