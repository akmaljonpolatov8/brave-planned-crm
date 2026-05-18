function roleCheck(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Sizda ruxsat yo'q" });
    }
    return next();
  };
}

module.exports = roleCheck;
