const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const helmet = require("helmet");
const { apiLimiter } = require("./middleware/rateLimit");

// Initialize Database Models and Associations
require("./models");

const app = express();

// Trust reverse proxy (Railway, Render, Cloudflare) for client IP rate-limiting & X-Forwarded-For headers
app.set("trust proxy", 1);

// Secure HTTP response headers
app.use(helmet({
  contentSecurityPolicy: false, // Disabled on API layer to allow flexibility on separate SPA/client apps
}));

// Apply Global Middlewares
const getAllowedOrigins = () => {
  const envOrigins = [
    ...(process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(",") : []),
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
    process.env.FRONTEND_URL,
    process.env.SOCKET_ORIGIN,
  ]
    .filter(Boolean)
    .map((o) => o.trim());

  const defaultOrigins = [
    // Local Development
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8080",
    
    // Production - Vercel & Railway & Custom Domains
    "https://griva-web-chi.vercel.app",
    "https://griva.qa",
    "https://www.griva.qa",
    "https://thegriva.com",
    "https://www.thegriva.com",
    "https://griva-backend-kprt.onrender.com",
    "https://griva-web-production.up.railway.app",
  ];

  if (process.env.RENDER_BACKEND_URL && process.env.RENDER_BACKEND_URL.trim()) {
    defaultOrigins.push(process.env.RENDER_BACKEND_URL.trim());
  }

  return Array.from(new Set([...defaultOrigins, ...envOrigins]));
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = getAllowedOrigins();

      // Check exact match, vercel preview subdomains, or local dev localhost
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin) ||
        (process.env.NODE_ENV === "development" && origin.startsWith("http://localhost:"));

      if (isAllowed) {
        return callback(null, true);
      } else {
        console.warn(`⚠️ [CORS REJECTED] Origin not allowed: ${origin}`);
        return callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

// Explicitly handle preflight OPTIONS requests across all routes
app.options("*", cors());

// Apply rate limiter to all API endpoints
app.use("/api", apiLimiter);

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
const returnRoutes = require("./routes/returnRoutes");
const settingRoutes = require("./routes/settingRoutes");
const subscriberRoutes = require("./routes/subscriberRoutes");
const flashSaleRoutes = require("./routes/flashSaleRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
// const bannerRoutes = require("./routes/bannerRoutes");
const addressRoutes = require("./routes/addressRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const subCategoryRoutes = require("./routes/subCategoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes"); // FEATURE: Delivery Boy System
const customerRoutes = require("./routes/customerRoutes");
const staffRoutes = require("./routes/staffRoutes");
const deliveryAttemptRoutes = require("./routes/deliveryAttemptRoutes");
const uploadRoutes = require("./routes/uploadRoutes"); // IMAGE UPLOAD
const deliverySlotRoutes = require("./routes/deliverySlotRoutes");
const dealOfDayRoutes = require("./routes/dealOfDayRoutes");
// const testShippedEmailRoutes = require("./routes/testShippedEmailRoutes");
const discoverMoreRoutes = require("./routes/discoverMoreRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const productPromoBannerRoutes = require("./routes/productPromoBannerRoutes");

// Mount API Routers
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/flash-sales", flashSaleRoutes);
app.use("/api/reviews", reviewRoutes);
// app.use("/api/banners", bannerRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/delivery", deliveryRoutes); // FEATURE: Delivery Boy System
app.use("/api/admin/customers", customerRoutes);
app.use("/api/admin/staff", staffRoutes);
app.use("/api/delivery", deliveryAttemptRoutes); // FEATURE: Delivery Attempt Management
// app.use("/api/test-email", testEmailRoutes);
app.use("/api/uploads", uploadRoutes); // IMAGE UPLOAD
app.use("/api/delivery-slots", deliverySlotRoutes);
app.use("/api/deal-of-day", dealOfDayRoutes);
app.use("/api/discover-more", discoverMoreRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.use("/api/product-promo-banners", productPromoBannerRoutes);

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