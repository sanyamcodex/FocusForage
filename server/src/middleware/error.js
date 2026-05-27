import { isProduction } from "../config/env.js";

export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const payload = {
    success: false,
    message: statusCode === 500 && isProduction ? "Internal server error" : err.message
  };

  if (!isProduction && err.details) payload.details = err.details;
  if (!isProduction) payload.stack = err.stack;

  res.status(statusCode).json(payload);
};

