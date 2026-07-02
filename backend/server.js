process.env.NODE_OPTIONS = "--dns-result-order=ipv4first";
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const passport = require("./config/passport");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();
const httpServer = http.createServer(app);

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "http://localhost:3001", // ← tambah ini
    ],
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

// Map userId → Set of socketIds (1 user bisa buka banyak tab)
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // ── USER JOIN (online presence) ──────────────────────────────────
  socket.on("join_user", (userId) => {
    socket.userId = userId;
    socket.join(`user_${userId}`);

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast ke semua: user ini online
    io.emit("presence_update", { userId, status: "online" });
    console.log(`User ${userId} online (${onlineUsers.get(userId).size} tab)`);
  });

  // ── CONVERSATION ROOM ─────────────────────────────────────────────
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
    socket.currentConversation = conversationId;
  });

  socket.on("leave_conversation", (conversationId) => {
    socket.leave(conversationId);
    if (socket.currentConversation === conversationId) {
      socket.currentConversation = null;
    }
  });

  // ── TYPING INDICATOR ──────────────────────────────────────────────
  socket.on("typing_start", ({ conversationId, userId }) => {
    socket.to(conversationId).emit("user_typing", { userId, isTyping: true });
  });

  socket.on("typing_stop", ({ conversationId, userId }) => {
    socket.to(conversationId).emit("user_typing", { userId, isTyping: false });
  });

  // ── ADMIN ─────────────────────────────────────────────────────────
  socket.on("join_admin", () => {
    socket.join("admin_room");
  });

  // ── GET ONLINE STATUS (query dari client) ─────────────────────────
  socket.on("check_online", (userId, callback) => {
    const isOnline =
      onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
    if (typeof callback === "function")
      callback({ userId, status: isOnline ? "online" : "offline" });
  });

  // ── DISCONNECT ────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    const userId = socket.userId;
    if (userId && onlineUsers.has(userId)) {
      onlineUsers.get(userId).delete(socket.id);
      if (onlineUsers.get(userId).size === 0) {
        onlineUsers.delete(userId);
        // Broadcast ke semua: user ini offline
        io.emit("presence_update", { userId, status: "offline" });
        console.log(`User ${userId} offline`);
      }
    }
    console.log("Socket disconnected:", socket.id);
  });
});

// Middleware
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(passport.initialize());

// Routes
app.use("/api/auth", require("./routes/auth"));
// Dokumentasi API: buka di http://localhost:5000/api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/users", require("./routes/users"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/donations", require("./routes/donations"));
app.use("/api/claims", require("./routes/claims"));
app.use("/api/conversations", require("./routes/conversations"));
app.use("/api/ratings", require("./routes/ratings"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/community", require("./routes/community"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/otp", require("./routes/otp"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/leaderboard", require("./routes/leaderboard"));

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected!"))
  .catch((err) => console.log("MongoDB Error:", err));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));