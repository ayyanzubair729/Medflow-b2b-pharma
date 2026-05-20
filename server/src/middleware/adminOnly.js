export const adminOnly = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ message: "Not authenticated." });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({ message: "Access denied. Admin role required." });
    return;
  }

  next();
};
