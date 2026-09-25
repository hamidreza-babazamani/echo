import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
await connectDB();

// Middleware
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// Test Route
app.use("/api/status", (req, res) => {
  res.send("Server is Live");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
