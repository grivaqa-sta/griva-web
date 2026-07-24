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
  const envOrigins = [
    ...(process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(",") : []),
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
    process.env.FRONTEND_URL,
    process.env.SOCKET_ORIGIN,
  ]
    .filter(Boolean)
    .map((o) => o.trim());

  const defaultOrigins = [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8080",
    "https://griva-web-chi.vercel.app",
    "https://griva.qa",
    "https://www.griva.qa",
    "https://thegriva.com",
    "https://www.thegriva.com",
    "https://griva-backend-kprt.onrender.com",
    "https://griva-web-production.up.railway.app",
  ];

  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

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
        // Allow guest users without token (e.g. order tracking visitors)
        socket.user = {
          id: -1,
          role: "guest",
          name: "Guest User",
        };
        return next();
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

      // Attach user details to socket (all authenticated roles are allowed to connect)
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

    // Track active connection (only for logged-in users)
    if (userId !== -1) {
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);

      // Join room based on role (role:admin, role:staff, role:delivery)
      socket.join(`role:${role}`);
      console.log(`🔌 [Socket.IO ROOMS]: Socket ${socket.id} joined room "role:${role}"`);

      // Join room for specific user ID for direct/targeted messages
      socket.join(`user:${userId}`);
    }

    // Guest listener to join specific order tracking room
    socket.on("join-order-tracking", (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`🔌 [Socket.IO ROOMS]: Socket ${socket.id} joined tracking room "order:${orderId}"`);
    });

    // Handle Client Disconnect
    socket.on("disconnect", (reason) => {
      console.log(`🔴 [Socket.IO DISCONNECT]: Socket: ${socket.id}, Reason: ${reason}`);
      if (userId !== -1) {
        const sockets = userSockets.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSockets.delete(userId);
          }
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
 * Emit event to specific order tracking room
 * @param {number} orderId 
 * @param {string} event 
 * @param {any} data 
 */
const emitToOrder = (orderId, event, data = null) => {
  if (!io) return;
  io.to(`order:${orderId}`).emit(event, data);
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
  emitToOrder,
};
