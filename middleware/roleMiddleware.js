module.exports = (roles = []) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;

      if (!roles.includes(userRole)) {
        return res.status(403).json({
          error: "Access denied: insufficient permissions"
        });
      }

      next();

    } catch (err) {
      res.status(401).json({ error: "Unauthorized" });
    }
  };
};