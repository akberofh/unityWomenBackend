import express from 'express';
import {
  getUser,
  authUser,
  registerUser,
  logoutUser,
  updateUserProfile,
  getUserProfile,
  getUserByReferralCode,
  getUserByReferralCodee,
  getReferralLinkOwner,
} from '../controllers/userController.js';
import { userControlAuth } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';


const router = express.Router();



router.get("/get-link-owner/:referralCode", getReferralLinkOwner);


router.post('/register', upload.single('photo'), registerUser);
router.post('/auth',   authUser);
router.get('/admin/:referralCode', getUserByReferralCode);

router.get('/user/:referralCode', getUserByReferralCodee);


router.post('/logout', logoutUser);
router.get('/', getUser);
router
  .route('/profile')
  .get(userControlAuth, getUserProfile)
  .put(userControlAuth,  upload.single('photo'), updateUserProfile);

export default router;
