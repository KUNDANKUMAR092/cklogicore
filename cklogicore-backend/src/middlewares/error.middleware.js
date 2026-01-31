// src/middleware/error.middleware.js

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Agar JWT expire ho jaye ya galat ho
  if (err.name === "JsonWebTokenError") return res.status(401).json({ message: "Invalid Token" });
  if (err.name === "TokenExpiredError") return res.status(401).json({ message: "Token Expired" });

  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};