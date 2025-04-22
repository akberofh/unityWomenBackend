import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const userControlAuth = async (req, res, next) => {
  let token;

  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.userId).select('-password');
     
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Unauthorized - invalid token' });
    }
  } else {
    res.status(401).json({ message: 'Unauthorized - token not found' });
  }
};

const adminControlAuth = (req, res, next) => {
  if (req.user && req.user.userType === 'admin') {
    next(); 
  } else {
    res.status(403).json({ message: 'Forbidden - Admin access required' }); 
  }
};


const adminorAdminsControlAuth = (req, res, next) => {
  if (req.user && (req.user.userType === 'admin' || req.user.userType === 'adminstrator')) {
    next(); 
  } else {
    res.status(403).json({ message: 'Forbidden - Admin access required' });
  }
};







export { userControlAuth, adminControlAuth  ,adminorAdminsControlAuth};