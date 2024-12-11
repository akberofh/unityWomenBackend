import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import { sendVerificationEamil, senWelcomeEmail } from "../middleware/Email.js"
import { sendEarningsEmail } from '../middleware/emailService.js';


import crypto from "crypto"

function generateReferralCode() {
  return crypto.randomBytes(6).toString('hex'); 
}

const authUser = async (req, res) => {
  try {
    const { email, password, referralCode } = req.body;
    const user = await User.findOne({
      $or: [{ email }, { referralCode }]
    });

    const referralLink = `https://unity-women.vercel.app/register?referral=${user.referralCode}`;

    if (user && (await user.parolaKontrol(password))) {
      generateToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        photo: user.photo,
        email: user.email,
        gender : user.gender,
        userType : user.userType,
        referralCode: user.referralCode,
        referralLink ,
        referralChain: user.referralChain,
      });
    } else {
      res.status(400).json({ message: 'Email ya da parola hatalı' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, referralCode: referredBy, userType, adminKey, gender } = req.body;

    if (!gender || !['kişi', 'qadın'].includes(gender.toLowerCase())) {
      return res.status(400).json({ message: "Geçerli bir cinsiyet seçimi yapınız (kişi veya qadın)." });
    }

    let referralCode = generateReferralCode();

    // Referans kodunun benzersizliğini kontrol et
    let existingCode = await User.findOne({ referralCode });
    while (existingCode) {
      referralCode = generateReferralCode();
      existingCode = await User.findOne({ referralCode });
    }

    let referralChain = [];

    if (referredBy) {
      const referrer = await User.findOne({ referralCode: referredBy });
      if (!referrer) {
        return res.status(400).json({ message: "Geçersiz referral kodu" });
      }

      // Bu referral kodu ile kaç kişi kayıt olmuş kontrol et
      const referredUsersCount = await User.countDocuments({ referredBy });
      if (referredUsersCount >= 2) {
        return res.status(400).json({ message: "Bu referral koduyla maksimum 2 kullanıcı kayıt olabilir." });
      }

      referralChain = [...referrer.referralChain, referredBy];
    }

    let photo = '';
    if (req.file) {
      photo = req.file.buffer.toString('base64');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (userType === 'admin') {
      if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
        return res.status(403).json({ message: "Admin kaydı için geçersiz anahtar" });
      }
    }

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name,
      email,
      photo,
      referralCode,
      referralChain,
      referredBy,
      gender: gender.toLowerCase(),
      password,
      userType,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await sendVerificationEamil(user.email, verificationToken);

    if (user) {
      generateToken(res, user._id);

      const referralLink = `https://unity-women.vercel.app/register?referral=${referralCode}`;

      res.status(201).json({
        _id: user._id,
        email: user.email,
        photo: user.photo,
        referralCode: user.referralCode,
        name: user.name,
        userType: user.userType,
        gender: user.gender,
        verificationToken: user.verificationToken,
        referralLink,
        isVerified: user.isVerified,
        referralChain: user.referralChain,
      });
    } else {
      res.status(400).json({ message: "User not added" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const VerfiyEmail = async (req, res) => {
  try {
    const { verficationToken } = req.body; 

    const user = await User.findOne({
      verficationToken: verficationToken,
      verficationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or Expired Code" });
    }

    user.isVerified = true;
    user.verficationToken = undefined;
    user.verficationTokenExpiresAt = undefined;
    await user.save();

    await senWelcomeEmail(user.email, user.name); 
    return res.status(200).json({ success: true, message: "Email Verified Successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


const logoutUser = async (req, res) => {
  try {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: 'Çıkış Yapıldı' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    if (req.user) {
      res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        photo: req.user.photo,
        userType: req.user.userType
      });
    } else {
      res.status(404).json({ message: 'Kullanıcı Bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.photo = req.file ? req.file.buffer.toString('base64') : user.photo;


      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        referredBy: updatedUser.referredBy,
        name: updatedUser.name,
        referralChain: updatedUser.referralChain,
        referralCount: updatedUser.referralCount,
        referralLink: updatedUser.referralLink,
        referralCode: updatedUser.referralCode,
        email: updatedUser.email,
        photo: updatedUser.photo,
      });
    } else {
      res.status(404).json({ message: 'Kullanıcı Bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const allUsers = await User.find();
    res.json({ allUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUserByReferralCode = async (req, res) => {
  try {
    const { referralCode } = req.params;  // referralCode URL parametresi olarak alınıyor
    const users = await User.find({ referredBy: referralCode });  // referralCode ile arama yapılıyor

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found for this referral code" });
    }

    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



const processPurchase = async (userId, purchaseAmount) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  let earnings = 0;

  // 1. Seviye: Alışveriş yapan kullanıcıya kazanç ver
  earnings += purchaseAmount * 0.40; // %40 kazanç
  user.earnings += earnings;
  await user.save();

  // E-posta gönder
  await sendEarningsEmail(user.email, earnings);

  // 2. Seviye: İlk kullanıcıdan link alarak kaydolan kişi kazanç alacak
  if (user.referralChain.length > 0) {
    const firstLevelReferrer = await User.findOne({ referralCode: user.referralChain[0] });
    if (firstLevelReferrer) {
      firstLevelReferrer.earnings += purchaseAmount * 0.20; // %20 kazanç
      await firstLevelReferrer.save();

      // 2. Seviye: İlk seviyedeki kişinin referralChain'inde 2. seviye kullanıcı varsa, kazanç ver
      if (firstLevelReferrer.referralChain.length > 0) {
        const secondLevelReferrer = await User.findOne({ referralCode: firstLevelReferrer.referralChain[0] });
        if (secondLevelReferrer) {
          secondLevelReferrer.earnings += purchaseAmount * 0.10; // %10 kazanç
          await secondLevelReferrer.save();

          // 2. seviye için e-posta gönder
          await sendEarningsEmail(secondLevelReferrer.email, purchaseAmount * 0.10);
        }
      }

      // 3. Seviye: Zincirleme referansları takip et
      if (firstLevelReferrer.referralChain.length > 1) {
        const thirdLevelReferrer = await User.findOne({ referralCode: firstLevelReferrer.referralChain[1] });
        if (thirdLevelReferrer) {
          thirdLevelReferrer.earnings += purchaseAmount * 0.05; // %5 kazanç
          await thirdLevelReferrer.save();

          // 3. seviye için e-posta gönder
          await sendEarningsEmail(thirdLevelReferrer.email, purchaseAmount * 0.05);
        }
      }

      // 4. Seviye: Zincirleme referansları takip et
      if (firstLevelReferrer.referralChain.length > 2) {
        const fourthLevelReferrer = await User.findOne({ referralCode: firstLevelReferrer.referralChain[2] });
        if (fourthLevelReferrer) {
          fourthLevelReferrer.earnings += purchaseAmount * 0.03; // %3 kazanç
          await fourthLevelReferrer.save();

          // 4. seviye için e-posta gönder
          await sendEarningsEmail(fourthLevelReferrer.email, purchaseAmount * 0.03);
        }
      }

      // 5. Seviye: Zincirleme referansları takip et
      if (firstLevelReferrer.referralChain.length > 3) {
        const fifthLevelReferrer = await User.findOne({ referralCode: firstLevelReferrer.referralChain[3] });
        if (fifthLevelReferrer) {
          fifthLevelReferrer.earnings += purchaseAmount * 0.02; // %2 kazanç
          await fifthLevelReferrer.save();

          // 5. seviye için e-posta gönder
          await sendEarningsEmail(fifthLevelReferrer.email, purchaseAmount * 0.02);
        }
      }
    }
  }

  return 'Purchase processed and earnings distributed';
};









export {
  processPurchase,
  getUserByReferralCode,
  authUser,
  registerUser,
  logoutUser,
  getUser,
  getUserProfile,
  updateUserProfile,
  VerfiyEmail,
};