export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.code === "P2002") {
    return res.status(409).json({ message: `Duplicate value for: ${err.meta?.target?.join(', ') || 'field'}` });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ message: "Record not found" });
  }
  if (err.code === "P2003") {
    return res.status(400).json({ message: "Invalid reference — related record does not exist" });
  }

  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Internal Server Error" });
};
