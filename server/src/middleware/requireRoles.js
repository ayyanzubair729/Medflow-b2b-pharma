export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        message: `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
};
