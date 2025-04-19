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
    next(); // Eğer kullanıcı admin ise bir sonraki middleware'e geç
  } else {
    res.status(403).json({ message: 'Forbidden - Admin access required' }); // Admin değilse 403 hatası döndür
  }
};

const adminstratorControlAuth = (req, res, next) => {
  if (req.user && req.user.userType === 'adminstratir') {
    next(); // Eğer kullanıcı admin ise bir sonraki middleware'e geç
  } else {
    res.status(403).json({ message: 'Forbidden - Admin access required' }); // Admin değilse 403 hatası döndür
  }
};

// middleware/roleMiddleware.js

export const adminOrAdminstratorAuth = (req, res, next) => {
  const user = req.user; // Tokenlə gələn user

  if (!user) {
    return res.status(401).json({ message: 'Token yoxdur və ya etibarsızdır' });
  }

  if (user.userType === 'admin' || user.userType === 'adminstrator') {
    next();
  } else {
    return res.status(403).json({ message: 'Bu əməliyyatı yalnız admin və ya administrator edə bilər' });
  }
};




export { userControlAuth, adminControlAuth ,adminstratorControlAuth ,adminOrAdminstratorAuth};