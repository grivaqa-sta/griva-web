const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

let io = null;

// Track user socket mappings to keep track of concurrent user connections
const userSockets = new Map(); // userId -> Set of socketIds

/**
 * Initialize Socket.IO server
 * @param {import("http").Server} server 
 */
const initSocket = (server) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:8080",
    "https://griva.qa",
    "https://www.griva.qa",
    "https://thegriva.com",
    "https://www.thegriva.com",
    "https://griva-web-chi.vercel.app",
    "https://griva-276jdc4qt-griva.vercel.app",
    "https://griva-web-git-main-griva.vercel.app",
    "https://griva-backend-kprt.onrender.com"
  ];

  if (process.env.SOCKET_ORIGIN) {
    const customOrigins = process.env.SOCKET_ORIGIN.split(",").map(o => o.trim());
    customOrigins.forEach(origin => {
      if (origin && !allowedOrigins.includes(origin)) {
        allowedOrigins.push(origin);
      }
    });
  }

  console.log("🔌 [Socket.IO]: Allowed Origins for WebSockets:", allowedOrigins);

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      // Token can be passed in auth or query handshake options
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      
      if (!token) {
        return next(new Error("Authentication token is required"));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Fetch user from DB to verify role and status
      const user = await User.findByPk(decoded.id, {
        attributes: ["id", "role", "status", "name"]
      });

      if (!user) {
        return next(new Error("User account not found"));
      }

      if (user.status === "BLOCKED") {
        return next(new Error("Your account has been blocked. Please contact support."));
      }

      // Verify role authorization (Admin, Staff, or Delivery role required)
      const allowedRoles = ["admin", "staff", "delivery"];
      if (!allowedRoles.includes(user.role)) {
        return next(new Error("Access denied: Unauthorized role for operations dashboard"));
      }

      // Attach user details to socket
      socket.user = {
        id: user.id,
        role: user.role,
        name: user.name,
      };

      next();
    } catch (err) {
      console.error("🔌 [Socket.IO AUTH ERROR]:", err.message);
      return next(new Error("Authentication failed: " + err.message));
    }
  });

  io.on("connection", (socket) => {
    const { id: userId, role, name } = socket.user;
    console.log(`🟢 [Socket.IO CONNECT]: User: "${name}" (ID: ${userId}, Role: ${role}), Socket: ${socket.id}`);

    // Track active connection
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Join room based on role (role:admin, role:staff, role:delivery)
    socket.join(`role:${role}`);
    console.log(`🔌 [Socket.IO ROOMS]: Socket ${socket.id} joined room "role:${role}"`);

    // Join room for specific user ID for direct/targeted messages
    socket.join(`user:${userId}`);

    // Handle Client Disconnect
    socket.on("disconnect", (reason) => {
      console.log(`🔴 [Socket.IO DISCONNECT]: Socket: ${socket.id}, Reason: ${reason}`);
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
    });

    // Handle Client Errors
    socket.on("error", (err) => {
      console.error(`⚠️ [Socket.IO CLIENT ERROR]: Socket ${socket.id}:`, err);
    });
  });

  return io;
};

/**
 * Get initialized Server instance
 */
const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized!");
  }
  return io;
};

/**
 * Emit event to specific roles
 * @param {string[]} roles 
 * @param {string} event 
 * @param {any} data 
 */
const emitToRoles = (roles, event, data = null) => {
  if (!io) return;
  roles.forEach((role) => {
    io.to(`role:${role}`).emit(event, data);
  });
};

/**
 * Emit event to specific user
 * @param {number} userId 
 * @param {string} event 
 * @param {any} data 
 */
const emitToUser = (userId, event, data = null) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

/**
 * Emit event to all connected clients
 * @param {string} event 
 * @param {any} data 
 */
const emitToAll = (event, data = null) => {
  if (!io) return;
  io.emit(event, data);
};

module.exports = {
  initSocket,
  getIO,
  emitToRoles,
  emitToUser,
  emitToAll,
};
