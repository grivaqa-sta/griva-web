const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

// Apply Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

// Import API Routers
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const settingRoutes = require("./routes/settingRoutes");
const subscriberRoutes = require("./routes/subscriberRoutes");

// Mount API Routers
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/subscribers", subscriberRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
    },
  });
});

module.exports = app;
