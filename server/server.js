import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

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

// Routes
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
