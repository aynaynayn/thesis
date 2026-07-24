export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || (["ValidationError", "CastError"].includes(error.name) ? 400 : 500);
  if (error.code === 11000) {
    return res.status(409).json({ message: "A record with that value already exists" });
  }
  return res.status(statusCode).json({
    message: statusCode === 500 ? "Something went wrong" : error.message,
    ...(process.env.NODE_ENV === "development" && statusCode === 500 ? { stack: error.stack } : {}),
  });
}
