import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";



function generateReferralCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

console.log(generateReferralCode());


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
        finCode: user.finCode,
        card: user.card,
        email: user.email,
        gender : user.gender,
        faze : user.faze,
        phone : user.phone,
        userType : user.userType,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        referralLink ,
        referralChain: user.referralChain,
        referralLinkOwner: user.referralLinkOwner,
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
    const { name, email, faze, maze , phone , password, referralCode: referredBy, userType, adminKey, gender,card,finCode ,referralLinkOwner} = req.body;

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
    
      const referredUsersCount = await User.countDocuments({ referredBy });
    
      if (referredUsersCount >= 2) {
        return res.status(400).json({ message: "Bu referral koduyla maksimum 2 kullanıcı kayıt olabilir. Lütfen başka bir referral kodu giriniz." });
      }
    
      referralChain = [...referrer.referralChain, referredBy];
    }
    

    let photo = '';
    if (req.file) {
      photo = req.file.buffer.toString('base64');
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: "Bu telefon nömrəsi artıq qeydiyyatdan keçib. Xahiş edirik, fərqli bir telefon nömrəsi istifadə edin." });
    }

    const referralCodeExists = await User.findOne({ referralCode });
    if (referralCodeExists) {
      return res.status(400).json({ message: "Bu referral kodu artıq istifadə olunub. Xahiş edirik, fərqli bir kod istifadə edin." });
    }

    const finCodeExists = await User.findOne({ finCode });
    if (finCodeExists) {
      return res.status(400).json({ message: "Bu finkod artıq qeydiyyatdan keçib. Xahiş edirik, fərqli bir finkod istifadə edin." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Bu email artıq qeydiyyatdan keçib. Xahiş edirik, fərqli bir email istifadə edin." });
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
      phone,
      faze,
      maze,
      card,
      finCode,
      referralCode,
      referralChain,
      referralLinkOwner,
      referredBy,
      gender: gender.toLowerCase(),
      password,
      userType,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });


    if (user) {
      generateToken(res, user._id);

      const referralLink = `https://unity-women.vercel.app/register?referral=${referralCode}`;

      res.status(201).json({
        _id: user._id,
        email: user.email,
        photo: user.photo,
        phone: user.phone,
        faze: user.faze,
        finCode: user.finCode,
        card: user.card,
        maze: user.maze,
        referralCode: user.referralCode,
        name: user.name,
        userType: user.userType,
        gender: user.gender,
        verificationToken: user.verificationToken,
        referralLink,
        isVerified: user.isVerified,
        payment: user.payment,
        referralChain: user.referralChain,
        referralLinkOwner: user.referralLinkOwner,
      });
    } else {
      res.status(400).json({ message: "User not added" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReferralLinkOwner = async (req, res) => {
  try {
    const { referralCode } = req.params;

    // Bu referralCode'a sahip kullanıcıyı bul
    const user = await User.findOne({ referralCode });

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Eğer referralLinkOwner boşsa, doğrudan kayıt olmuş demektir
    if (!user.referralLinkOwner) {
      return res.status(200).json({ message: "Bu kullanıcı doğrudan kayıt olmuş, bir davetçi yok." });
    }

    // referralLinkOwner referralCode’una sahip kullanıcıyı bul
    const trueReferrer = await User.findOne({ referralCode: user.referralLinkOwner });

    if (!trueReferrer) {
      return res.status(404).json({ message: "Asıl davetçi bulunamadı" });
    }

    // Başarıyla bulunan asıl davetçiyi dön
    res.json({
      referrerName: trueReferrer.name,
      referrerEmail: trueReferrer.email,
      referrerPhoto: trueReferrer.photo,
      referrerReferralCode: trueReferrer.referralCode
    });

  } catch (error) {
    console.error("Asıl davetçi alınamadı:", error);
    res.status(500).json({ message: "Sunucu hatası" });
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
    const { referralCode } = req.params;

    const users = await User.find({ referredBy: referralCode });
    const owner = await User.findOne({ referralCode });

    res.json({
      count: users.length,
      owner: owner ? { name: owner.name, email: owner.email } : null,
      users
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const getUserByReferralCodee = async (req, res) => {
  try {
    const { referralCode } = req.params;

    // Kullanıcıyı ve onun referral zincirini al
    const users = await User.find({ referralChain: referralCode });  // referralChain'deki tüm kullanıcıları getir

    if (users.length === 0) {
      return res.status(404).json({ message: "Bu referans kodu ile kayıtlı kullanıcı bulunamadı" });
    }

    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getReferredBy = async (req, res) => {
  try {
    const { referralCode } = req.params;

    // Bu referralCode'a sahip kullanıcıyı bul
    const user = await User.findOne({ referralCode });

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Eğer referralLinkOwner boşsa, doğrudan kayıt olmuş demektir
    if (!user.referredBy) {
      return res.status(200).json({ message: "Bu kullanıcı doğrudan kayıt olmuş, bir davetçi yok." });
    }

    // referralLinkOwner referralCode’una sahip kullanıcıyı bul
    const trueReferrer = await User.findOne({ referralCode: user.referredBy });

    if (!trueReferrer) {
      return res.status(404).json({ message: "Asıl davetçi bulunamadı" });
    }

    // Başarıyla bulunan asıl davetçiyi dön
    res.json({
      referrerName: trueReferrer.name,
      referrerEmail: trueReferrer.email,
      referrerPhoto: trueReferrer.photo,
      referrerReferralCode: trueReferrer.referralCode
    });

  } catch (error) {
    console.error("Asıl davetçi alınamadı:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};













export {
  
  getUserByReferralCode,
  getUserByReferralCodee,
  authUser,
  registerUser,
  logoutUser,
  getUser,
  getReferredBy,
  getUserProfile,
  updateUserProfile,
  getReferralLinkOwner,
};