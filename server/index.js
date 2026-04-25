const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const jwt = require("jsonwebtoken");
const authRoutes = require("./routes/auth.routes");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://celebrity-site-rho.vercel.app"
    ],
    credentials: true,
  },
});

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://celebrity-site-rho.vercel.app"
    ],
    credentials: true,
  }),
);

app.options("*", cors());

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/auth", authRoutes );
app.use("/api/content", require("./routes/content.routes"));
app.use("/api/membership", require("./routes/membership.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/chat", require("./routes/chat.routes"));
app.use('/api/events', require('./routes/event.routes'));
app.use('/api/payments',   require('./routes/payment.routes'));
app.use('/api/gallery',    require('./routes/gallery.routes'));

app.get("/", (req, res) => {
  res.send("API is running...");
});

const Message = require("./models/Message.model");
const User = require("./models/User.model");

// Authenticate socket via JWT
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return next(new Error("User not found"));
    socket.user = user;
    next();
  } catch {
    next(new Error("Auth failed"));
  }
});

const adminWatching = {};

io.on("connection", (socket) => {
  const user = socket.user;

  if (user.role !== "admin") {
    socket.join(`conv_${user._id}`);

    socket.on("user:firstOpen", async () => {
      const existing = await Message.countDocuments({
        conversationId: user._id.toString(),
      });
      if (existing === 0) {
        const botMsg = await Message.create({
          conversationId: user._id.toString(),
          senderId: user._id,
          senderName: "Support",
          role: "bot",
          text: `Welcome, ${user.name.split(" ")[0]}! How can we help you today? Ask us anything about membership, events, or the causes.`,
        });
        socket.emit("chat:message", botMsg);
      }
    });

    socket.on("user:message", async (text) => {
      if (!text?.trim()) return;
      const msg = await Message.create({
        conversationId: user._id.toString(),
        senderId: user._id,
        senderName: user.name,
        role: "user",
        text: text.trim(),
      });
      socket.emit("chat:message", msg);
      io.to(`admin_watch_${user._id}`).emit("chat:message", msg);
      io.to("admins").emit("chat:newMessage", {
        conversationId: user._id.toString(),
        senderName: user.name,
        text: text.trim(),
        time: msg.createdAt,
      });
    });
  }

  if (user.role === "admin") {
    socket.join("admins");

    socket.on("admin:watchConversation", (conversationId) => {
      if (adminWatching[socket.id])
        socket.leave(`admin_watch_${adminWatching[socket.id]}`);
      adminWatching[socket.id] = conversationId;
      socket.join(`admin_watch_${conversationId}`);
    });

    socket.on("admin:reply", async ({ conversationId, text }) => {
      if (!text?.trim() || !conversationId) return;
      const msg = await Message.create({
        conversationId,
        senderId: user._id,
        senderName: "Support Team",
        role: "admin",
        text: text.trim(),
      });
      io.to(`conv_${conversationId}`).emit("chat:message", msg);
      socket.emit("chat:message", msg);
    });
  }

  socket.on("disconnect", () => {
    if (adminWatching[socket.id]) delete adminWatching[socket.id];
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(process.env.PORT || 5000, () =>
      console.log(`Server on port ${process.env.PORT || 5000}`),
    );
  })
  .catch(console.error);
