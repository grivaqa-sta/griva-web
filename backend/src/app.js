const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const app = express();

// Apply Global Middlewares
const allowedOrigins = [
  "http://localhost:3000",       // Next.js dev server
  "http://localhost:8080",       // Backend self (Postman/Thunder)
  "https://griva.qa",            // Production domain
  "https://www.griva.qa",        // Production with www
  "https://griva-web.vercel.app", // Vercel preview URL
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy blocked origin: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Serve public uploads statically for local fallback files
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

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
const categoryRoutes = require("./routes/categoryRoutes");
const flashSaleRoutes = require("./routes/flashSaleRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const addressRoutes = require("./routes/addressRoutes");

// Mount API Routers
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/flash-sales", flashSaleRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/addresses", addressRoutes);

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
