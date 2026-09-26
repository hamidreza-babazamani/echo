import { Server } from "socket.io";

// Map: { userId: socketId }
// ذخیره می‌کنیم که هر کاربر آنلاین، چه socket ID داره
export const userSocketMap = {};

let io;

// تابع راه‌اندازی Socket.io
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // وقتی یه کاربر جدید وصل میشه
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("✅ User connected:", userId);

    // ذخیره socket ID کاربر
    if (userId && userId !== "undefined") {
      userSocketMap[userId] = socket.id;
    }

    // به همه کاربران بگو کی آنلاینه
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // وقتی کاربر قطع میشه
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", userId);
      if (userId) {
        delete userSocketMap[userId];
      }
      // دوباره لیست آنلاین‌ها رو بفرست
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
};

// برای استفاده توی Controller ها
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
