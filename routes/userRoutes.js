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
  getReferredBy,
  createSystemSettings,
  getReferralStats,
  getUserSalary,
} from '../controllers/userController.js';
import { userControlAuth } from '../middleware/authMiddleware.js';
import {upload, uploadToCloudinary } from '../middleware/uploadMiddleware.js';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';


const router = express.Router();

router.put('/update/:id', upload.single('photo'), uploadToCloudinary, async (req, res) => {
  try {
    const { name, email, payment, password,referralLinkOwner } = req.body;

    // Güncellenecek veriler
    let updatedData = { name, email, payment,referralLinkOwner };

    // Eğer Cloudinary'den gelen URL varsa, bunu ekle
    if (req.fileUrl) {
      updatedData.photo = req.fileUrl;
    }

    // Eğer şifre varsa, hash'leyip ekle
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedData.password = hashedPassword;
    }

    // Kullanıcıyı güncelle
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.json({ success: true, updatedUser });
  } catch (error) {
    console.error('Güncelleme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await User.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Məhsul tapılmadı.' });
    }

    res.status(200).json({ message: 'Məhsul uğurla silindi.' });
  } catch (error) {
    res.status(500).json({ message: 'Silinmə zamanı xəta baş verdi.', error });
  }
});

router.get("/get-link-owner/:referralCode", getReferralLinkOwner);

router.get('/salary/:referralCode', getUserSalary);




router.get('/referral-stats/:referralCode', getReferralStats);


router.get("/referredBykod/:referralCode", getReferredBy);


router.post('/register', upload.single('photo'),uploadToCloudinary, registerUser);


router.post('/auth',   authUser);


router.get('/admin/:referralCode', getUserByReferralCode);


router.get('/user/:referralCode', getUserByReferralCodee);


router.post("/system-settings", createSystemSettings);


router.post('/logout', logoutUser);


router.get('/', getUser);
router
  .route('/profile')
  .get(userControlAuth, getUserProfile)
  .put(userControlAuth,  upload.single('photo'),uploadToCloudinary, updateUserProfile);

export default router;
