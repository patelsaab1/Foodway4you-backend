const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'You need to login first to continue.'
      });
    }
console.log("ROLE CHECK - USER ROLE:", req.user.role, "REQUIRED ROLES:", roles);
    const userRole = req.user.role;
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only Admin and Restaurant can create Restaurant.'
      });
    }

    next();
  };
};

export default roleMiddleware;
