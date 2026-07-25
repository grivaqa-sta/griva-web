/**
 * Centralized API Error Handler and Logger
 * Handles logging detailed debugging info to console in production format
 * and returning consistent, standard error responses to the client.
 */

function handleApiError(error, req, res, controllerName = "UnknownController") {
  const timestamp = new Date().toISOString();
  
  // 1. Detailed Production Console Logging
  console.error("========== API ERROR ==========");
  console.error("Timestamp:", timestamp);
  console.error("Controller:", controllerName);
  console.error("Route:", req ? req.originalUrl || req.url : "N/A");
  console.error("Method:", req ? req.method : "N/A");
  console.error("User:", req && req.user ? req.user.id || req.user._id : "Unauthenticated");
  console.error("Body:", req ? req.body : {});
  console.error("Params:", req ? req.params : {});
  console.error("Query:", req ? req.query : {});
  console.error("Error Name:", error ? error.name : "UnknownError");
  console.error("Message:", error ? error.message : "No message");
  if (error && error.stack) {
    console.error("Stack:", error.stack);
  }
  if (error && error.errors) {
    console.error("Validation/Sub-errors:", error.errors);
  }
  console.error("===============================");

  // 2. Determine Response Format based on Error Types

  // Sequelize Unique Constraint Error
  if (error && error.name === "SequelizeUniqueConstraintError") {
    const firstErr = error.errors && error.errors.length > 0 ? error.errors[0] : null;
    return res.status(409).json({
      success: false,
      message: "Already exists",
      field: firstErr ? firstErr.path : undefined,
      value: firstErr ? firstErr.value : undefined,
    });
  }

  // Sequelize Validation Error
  if (error && error.name === "SequelizeValidationError") {
    const formattedErrors = error.errors
      ? error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        }))
      : [];
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
  }

  // Sequelize Foreign Key Constraint Error
  if (error && error.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      success: false,
      message: "Invalid reference",
    });
  }

  // Sequelize General Database Error
  if (error && error.name && error.name.startsWith("Sequelize")) {
    return res.status(500).json({
      success: false,
      message: "Database error",
    });
  }

  // Custom HTTP Status Codes specified on Error object
  const statusCode = error && error.statusCode ? error.statusCode : 500;
  
  if (statusCode === 400) {
    return res.status(400).json({
      success: false,
      message: error.message || "Bad request",
      errors: error.errors || undefined,
    });
  }

  if (statusCode === 401) {
    return res.status(401).json({
      success: false,
      message: error.message || "Unauthorized",
    });
  }

  if (statusCode === 403) {
    return res.status(403).json({
      success: false,
      message: error.message || "Access denied",
    });
  }

  if (statusCode === 404) {
    return res.status(404).json({
      success: false,
      message: error.message || "Resource not found",
    });
  }

  if (statusCode === 409) {
    return res.status(409).json({
      success: false,
      message: error.message || "Already exists",
    });
  }

  // Default Unknown / Internal Server Errors
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

module.exports = handleApiError;
