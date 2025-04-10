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
} from '../controllers/userController.js';
import { userControlAuth } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';


const router = express.Router();

router.put('/update/:id', async (req, res) => {
  try {
    const { name, email, payment, password } = req.body; // 'password' bilgisi alınıyor

    let updatedData = { name, email, payment };

    // Eğer password varsa, şifreyi hash'leyip ekliyoruz
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10); // Şifreyi hash'le
      updatedData.password = hashedPassword; // hash'lenmiş şifreyi ekle
    }

    // Kullanıcıyı güncelle
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.json({ success: true, updatedUser });
  } catch (error) {
    console.error('Yenilənmə zamanı xəta:', error);
    res.status(500).json({ success: false, message: 'Server xətası' });
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

router.get("/referredBykod/:referralCode", getReferredBy);


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
