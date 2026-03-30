import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');


    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    //  Extract token
    const token = authHeader.replace('Bearer ', '');

    //  Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DECODED:", decoded);

    // 👤 Find user
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
console.log("AUTH USER:", user);
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    req.user = user;
    next();

  } catch (error) {
   
    console.log("JWT ERROzR--:", error);

    return res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

export default authMiddleware;