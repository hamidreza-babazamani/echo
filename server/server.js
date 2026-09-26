import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";
import { connectDB } from "./lib/db.js";
import { initSocket } from "./lib/socket.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
await connectDB();

// Initialize Socket.io
initSocket(server);

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
server.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
