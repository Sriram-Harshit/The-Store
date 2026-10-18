// Structured Request & Error Logging Middleware for TheStore API

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // Intercept the end method to log response stats
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;
    const userRole = req.user?.accountType ? `[${req.user.accountType.toUpperCase()}]` : "[GUEST]";
    const userIdentifier = req.user?.username || req.user?.userId || "anonymous";

    const logLine = `[${timestamp}] ${req.method.padEnd(6)} ${req.originalUrl} | Status: ${res.statusCode} | Duration: ${duration}ms | User: ${userRole} ${userIdentifier}`;

    if (res.statusCode >= 500) {
      console.error(`🔴 ERROR 5XX: ${logLine}`);
    } else if (res.statusCode >= 400) {
      console.warn(`🟡 CLIENT 4XX: ${logLine}`);
    } else {
      console.log(`🟢 SUCCESS: ${logLine}`);
    }

    return originalEnd.apply(this, args);
  };

  next();
};

const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ❌ UNHANDLED BACKEND ERROR on ${req.method} ${req.originalUrl}:`, {
    message: err.message,
    name: err.name,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Handle Mongoose Validation Errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      error: "Schema Validation Error",
      details: messages,
    });
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: `Duplicate value entered for ${field}. Please use another value.`,
    });
  }

  // Handle Mongoose Invalid ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({
      success: false,
      error: `Malformed ID parameter: "${err.value}" is not a valid ObjectId format.`,
    });
  }

  // Handle JWT Malformed / Expired
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Invalid authentication token. Please sign in again.",
    });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Authentication token has expired. Please sign in again.",
    });
  }

  // Generic 500 Internal Error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error occurred.",
  });
};

module.exports = {
  requestLogger,
  errorHandler,
};
