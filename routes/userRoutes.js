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
  getUserById,
} from '../controllers/userController.js';
import { adminControlAuth, adminOrAdministratorAuth, userControlAuth } from '../middleware/authMiddleware.js';
import { conditionalUpload, upload, uploadToCloudinary } from '../middleware/uploadMiddleware.js';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';


const router = express.Router();


router.get('/byId/:user_id', getUserById);

router.put(
  '/update/:id',
  userControlAuth,
  adminOrAdministratorAuth,
 conditionalUpload,
  uploadToCloudinary,
  async (req, res) => {
    try {
      const {
        name,
        email,
        payment,
        password,
        referralLinkOwner,
        isVerified,
       
      } = req.body;

      const userRole = req.user.userType;
      let updatedData = {};

      if (userRole === 'admin') {
        updatedData = {
          name,
          email,
          payment,
          referralLinkOwner,
          isVerified,
         
        };

        if (req.file && req.fileUrl) {
          updatedData.photo = req.fileUrl;
        }

        if (password && password.trim() !== '') {
          const hashedPassword = await bcrypt.hash(password, 10);
          updatedData.password = hashedPassword;
        }

      } else if (userRole === 'adminstrator') {
        updatedData = { payment };
      }

      // Gereksiz boş alanları temizle
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] === undefined || updatedData[key] === '') {
          delete updatedData[key];
        }
      });

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
  }
);


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


router.post('/register', upload.single('photo'), uploadToCloudinary, registerUser);


router.post('/auth', authUser);


router.get('/admin/:referralCode', getUserByReferralCode);


router.get('/user/:referralCode', getUserByReferralCodee);


router.post("/system-settings", userControlAuth, adminControlAuth, createSystemSettings);


router.post('/logout', logoutUser);

router.get('/refCode/:referralCode', async (req, res) => {
  try {
    const referralCode = req.params.referralCode;

    if (!referralCode) {
      return res.status(400).json({ message: 'Referral code is required' });
    }

    const referredUsers = await User.find({ referralLinkOwner: referralCode });

    res.json({ referredUsers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/getuser/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'İstifadəçi tapılmadı' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server xətası' });
  }
});

router.get('/', getUser);
router
  .route('/profile')
  .get(userControlAuth, getUserProfile)
  .put(userControlAuth, upload.single('photo'), uploadToCloudinary, updateUserProfile);

export default router;
