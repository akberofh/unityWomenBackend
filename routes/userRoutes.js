import express from 'express';
import {
  getUser,
  authUser,
  registerUser,
  logoutUser,
  updateUserProfile,
  VerfiyEmail,
  getUserProfile,
  getUserByReferralCode,
  processPurchase,
} from '../controllers/userController.js';
import { userControlAuth } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { sendEarningsEmail } from '../middleware/emailService.js';
import { requestPasswordReset, resetPassword } from '../controllers/authController.js';

const router = express.Router();


router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);


router.post('/process-purchase', async (req, res) => {
  const { userId, purchaseAmount } = req.body;

  try {
    // Kazançları işleyip e-posta gönder
    await processPurchase(userId, purchaseAmount);

    // Kazanç bildirimi e-postası gönder
    await sendEarningsEmail(userId, purchaseAmount);

    res.status(200).json({ message: 'Purchase processed and earnings distributed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.post('/register', upload.single('photo'), registerUser);
router.post('/auth',   authUser);
router.post('/verifyEmail', VerfiyEmail);
// URL: /admin/users/:referralCode
router.get('/admin/:referralCode', getUserByReferralCode);

router.post('/logout', logoutUser);
router.get('/', getUser);
router
  .route('/profile')
  .get(userControlAuth, getUserProfile)
  .put(userControlAuth,  upload.single('photo'), updateUserProfile);

export default router;
