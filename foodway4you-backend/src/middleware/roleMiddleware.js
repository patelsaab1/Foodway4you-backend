const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Login First...'
      });
    }
console.log("ROLE CHECK - USER ROLE:", req.user.role, "REQUIRED ROLES:", roles);
    const userRole = req.user.role;
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Authorized person can see Sensitive Data.'
      });
    }

    next();
  };
};

export default roleMiddleware;
