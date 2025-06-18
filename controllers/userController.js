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
        gender: user.gender,
        faze: user.faze,
        phone: user.phone,
        payment: user.payment,
        userType: user.userType,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        referralLink,
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
    const { name, email, faze, maze, phone, password, referralCode: referredBy, userType, adminKey, gender, card, finCode, referralLinkOwner } = req.body;

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
      photo = req.fileUrl;
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
        payment: user.payment,
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
      user.card = req.body.card || user.card;
      if (req.file) {
        // Cloudinary'den alınan URL'yi kullanıcıya kaydet
        user.photo = req.fileUrl;  // Cloudinary URL'si

        if (!user.photo) {
          return res.status(500).json({ message: "Fotoğraf yüklenirken bir hata oluştu." });
        }
      }



      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        photo: updatedUser.photo,
        finCode: updatedUser.finCode,
        card: updatedUser.card,
        email: updatedUser.email,
        gender: updatedUser.gender,
        faze: updatedUser.faze,
        phone: updatedUser.phone,
        payment: updatedUser.payment,
        userType: updatedUser.userType,
        referralCode: updatedUser.referralCode,
        referredBy: updatedUser.referredBy,
        referralLink: user.referralLink,
        referralChain: updatedUser.referralChain,
        referralLinkOwner: updatedUser.referralLinkOwner,
      });
    } else {
      res.status(404).json({ message: 'Kullanıcı Bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUser = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 500;

  try {
    const skip = (page - 1) * limit;
    const total = await User.countDocuments();
    const allUsers = await User.find().skip(skip).limit(limit);

    res.json({
      allUsers,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
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

    res.json({
      count: users.length,

      users
    });
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

function generatePeriods() {
  const now = new Date(); // bugünün tarihi

  const start = new Date(now.getFullYear(), now.getMonth(), 1); // ayın başı
  const end = new Date(); // bugün

  const startAz = new Date(start.getTime() + 4 * 60 * 60 * 1000);
  const endAz = new Date(end.getTime() + 4 * 60 * 60 * 1000);
  endAz.setHours(23, 59, 59, 999);

  return [{ start: startAz, end: endAz }];
}

function generatePeriodss() {
  const now = new Date(); // bugünün tarihi

  const start = new Date(now.getFullYear(), now.getMonth(), 1); // ayın başı
  const end = new Date(); // bugün

  const startAz = new Date(start.getTime() + 4 * 60 * 60 * 1000);
  const endAz = new Date(end.getTime() + 4 * 60 * 60 * 1000);
  endAz.setHours(23, 59, 59, 999);

  return [{ start: startAz, end: endAz }];
}



const getReferralStats = async (req, res) => {
  try {
    const { referralCode } = req.params;

    const user = await User.findOne({ referralCode });
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

    if (!user.payment) {
      return res.status(404).json({ message: "Ödəniş edilməyib. Mükafat hesablana bilməz." });
    }





    const invitedUser = await User.find({ referralLinkOwner: referralCode });

    // Sadece ödeme yapmış ve excluded aralığında oluşturulmamış olanları dahil et
    const invitedUsers = await User.find({
      referralLinkOwner: referralCode,
      payment: true,
      isVerified: { $ne: true }

    });

    const totalEarned = invitedUsers.length * 2;

    const periods = generatePeriods();

    const periodEarnings = periods.map(period => {
      const usersInPeriod = invitedUsers.filter(u =>
        u.dailyEarningsDate >= period.start && u.dailyEarningsDate <= period.end
      );

      return {
        periodLabel: `${period.start.toLocaleDateString('tr-TR')} - ${period.end.toLocaleDateString('tr-TR')}`,
        userCount: usersInPeriod.length,
        earned: usersInPeriod.length * 2
      };
    });

    res.json({
      referrerName: user.name,
      referrerEmail: user.email,
      count: invitedUser.length,
      totalInvited: invitedUsers.length,
      totalEarned,
      periodEarnings,
      invitedUsers: invitedUsers.map(u => ({
        name: u.name,
        email: u.email,
        payment: u.payment,
        photo: u.photo,
        referralCode: u.referralCode
      }))
    });

  } catch (err) {
    console.error("Hata:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};






import SystemSettings from "../models/systemSettingsModel.js";


export const createSystemSettings = async (req, res) => {
  try {
    const { referralSystemStartDate } = req.body;

    // Check if the referralSystemStartDate is provided
    if (!referralSystemStartDate) {
      return res.status(400).json({ message: "Başlangıç tarihi girilmelidir." });
    }

    // Create new system settings entry
    const newSettings = new SystemSettings({
      referralSystemStartDate: new Date(referralSystemStartDate)
    });

    // Save to the database
    await newSettings.save();

    res.status(201).json({ message: "Sistem ayarları başarıyla oluşturuldu." });
  } catch (err) {
    console.error("Hata:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};



export const getUserSalary = async (req, res) => {
  try {
    const { referralCode } = req.params;

    const user = await User.findOne({ referralCode });
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

    if (!user.payment) {
      return res.status(403).json({ message: "Ödəniş edilməyib. Maaş hesablana bilməz." });
    }

    const periods = generatePeriodss();
    const referral = user.referralCode;
    const children = await User.find({ referredBy: referral });
    const right = children[0];
    const left = children[1];

    const getChain = async (refCode) => {
      if (!refCode) return [];
      return await User.find({ referralChain: refCode });
    };

    const rightChain = await getChain(right?.referralCode);
    const leftChain = await getChain(left?.referralCode);

    const rightEarnings = right ? (right.dailyEarnings || 0) : 0;
    const leftEarnings = left ? (left.dailyEarnings || 0) : 0;
    const selfEarnings = user.dailyEarnings || 0;

    const rightChainTotal = rightChain.reduce((sum, u) => sum + (u.dailyEarnings || 0), 0);
    const leftChainTotal = leftChain.reduce((sum, u) => sum + (u.dailyEarnings || 0), 0);

    const rightTotal = rightEarnings + rightChainTotal;
    const leftTotal = leftEarnings + leftChainTotal;
    const total = rightTotal + leftTotal + selfEarnings;

    const hasRight = right && rightTotal > 0;
    const hasLeft = left && leftTotal > 0;

    // YENİ: Kollar arasında ciddi bir dengesizlik olup olmadığını kontrol et
    const legsTotal = rightTotal + leftTotal; // Qolların cəmini bir dəyişəndə saxlayaq

    const isSeverelyImbalanced =
      hasRight &&
      hasLeft &&
      (legsTotal > 300) && // Şərt 1: Qolların cəmi 300-dən böyük olmalıdır
      ((Math.max(rightTotal, leftTotal) / legsTotal) > 0.99); // Şərt 2: Balanssızlıq 99%-dən çox olmalıdır

      
    let mode = "";
    let salaryRate = 0;
    let salary = 0;
    let rank = "";
    let splitFactor = 1;
    let side = "";

    // GÜNCELLENDİ: Tek kol mantığının ne zaman çalışacağını belirleyen koşul güncellendi.
    // Artık tek kol olmaması VEYA kollar arasında aşırı dengesizlik olması durumunda bu blok çalışacak.
    if (!hasRight || !hasLeft || isSeverelyImbalanced) {
      mode = "Single Side";

      // Hesaplama için her zaman BÜYÜK olan kolu baz al
      const oneSideTotal = Math.max(rightTotal, leftTotal) + selfEarnings;
      side = rightTotal > leftTotal ? "Right" : "Left";

      if (oneSideTotal < 100) {
        return res.json({ message: "Maaş hesablamaq üçün kifayət qədər qazanc yoxdur." });
      }

      if (oneSideTotal >= 1000) salaryRate = 0.003;
      else if (oneSideTotal >= 500) salaryRate = 0.005;
      else if (oneSideTotal >= 250) salaryRate = 0.009;
      else if (oneSideTotal >= 150) salaryRate = 0.01;
      else if (oneSideTotal >= 100) salaryRate = 0.02;



      if (oneSideTotal >= 13000) rank = "Qizil Direktor";
      else if (oneSideTotal >= 10000) rank = "Bas Direktor";
      else if (oneSideTotal >= 6001) rank = "Direktor";
      else if (oneSideTotal >= 4000) rank = "Bas Lider";
      else if (oneSideTotal >= 2001) rank = "Iki Qat Lider";
      else if (oneSideTotal >= 1001) rank = "Lider";
      else if (oneSideTotal >= 501) rank = "Bas Menecer";
      else if (oneSideTotal >= 251) rank = "Menecer";
      else if (oneSideTotal >= 121) rank = "Bas Meslehetci";
      else if (oneSideTotal >= 60) rank = "Meslehetci";
      else rank = "Yeni üzv";

      salary = (oneSideTotal * salaryRate).toFixed(2);
    } else {
      // Bu blok artık sadece dengeli veya dengeye yakın çift kollar için çalışacak
      mode = "Dual Side";
      side = "Right & Left";

      if (total < 60) {
        return res.json({ message: "Maaş hesablamaq üçün kifayət qədər qazanc yoxdur" });
      }

      const big = Math.max(rightTotal, leftTotal);
      const ratio = big / (rightTotal + leftTotal);

      // GÜNCELLENDİ: ratio >= 0.99 durumu artık yukarıda ele alındığı için buradan kaldırıldı.
      if (ratio >= 0.97) splitFactor = 20;
      else if (ratio >= 0.95) splitFactor = 11;
      else if (ratio >= 0.90) splitFactor = 8.5;
      else if (ratio >= 0.85) splitFactor = 4;
      else if (ratio >= 0.80) splitFactor = 3.5;

      if (total >= 12000) salaryRate = 0.10;
      else if (total >= 8000) salaryRate = 0.094;
      else if (total >= 6000) salaryRate = 0.086;
      else if (total >= 4000) salaryRate = 0.083;
      else if (total >= 1000) salaryRate = 0.075;
      else if (total >= 500) salaryRate = 0.07;
      else if (total >= 250) salaryRate = 0.07;
      else if (total >= 60) salaryRate = 0.067;

      if (total >= 13000) rank = "Qizil Direktor";
      else if (total >= 10000) rank = "Bas Direktor";
      else if (total >= 6001) rank = "Direktor";
      else if (total >= 4000) rank = "Bas Lider";
      else if (total >= 2001) rank = "Iki Qat Lider";
      else if (total >= 1001) rank = "Lider";
      else if (total >= 501) rank = "Bas Menecer";
      else if (total >= 251) rank = "Menecer";
      else if (total >= 121) rank = "Bas Meslehetci";
      else if (total >= 60) rank = "Meslehetci";
      else rank = "Yeni üzv";

      salary = ((total * salaryRate) / splitFactor).toFixed(2);
    }

    const usersInPeriod = [...rightChain, ...leftChain];
    if (right) usersInPeriod.push(right);
    if (left) usersInPeriod.push(left);
    usersInPeriod.push(user);

    const periodSalaries = periods.map(period => {
      const usersInThisPeriod = usersInPeriod.filter(u =>
        u.dailyEarningsDate >= period.start && u.dailyEarningsDate <= period.end
      );
      const periodTotal = usersInThisPeriod.reduce((sum, u) => sum + (u.dailyEarnings || 0), 0);
      const periodRightTotal = usersInThisPeriod.filter(u => rightChain.includes(u) || u._id.equals(right?._id)).reduce((sum, u) => sum + (u.dailyEarnings || 0), 0);
      const periodLeftTotal = usersInThisPeriod.filter(u => leftChain.includes(u) || u._id.equals(left?._id)).reduce((sum, u) => sum + (u.dailyEarnings || 0), 0);
      const periodSelfEarnings = usersInThisPeriod.find(u => u._id.equals(user._id))?.dailyEarnings || 0;

      let periodSalary = 0;

      // Karmaşık ternary yerine temiz bir if-else yapısı
      if (mode === "Single Side") {
        const periodOneSideTotal = Math.max(periodRightTotal, periodLeftTotal) + periodSelfEarnings;
        periodSalary = (periodOneSideTotal * salaryRate).toFixed(2);
      } else {
        periodSalary = ((periodTotal * salaryRate) / splitFactor).toFixed(2);
      }

      return {
        periodLabel: `${period.start.toLocaleDateString('tr-TR')} - ${period.end.toLocaleDateString('tr-TR')}`,
        salary: Number(periodSalary),
        rank,
        total: periodTotal,
        rightTotal: periodRightTotal,
        leftTotal: periodLeftTotal,
        rate: salaryRate * 100,
        name: user.name,
        email: user.email,
        photo: user.photo,
        periodStart: period.start,
        periodEnd: period.end
      };
    });

    // GÜNCELLENDİ: Dönüş verisindeki `total` değeri, hesaplama moduna göre ayarlandı.
    const responseTotal = mode === "Single Side" ? Math.max(rightTotal, leftTotal) + selfEarnings : total;

    return res.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      mode,
      side,
      total: responseTotal,
      salary: Number(salary),
      rank,
      rate: salaryRate * 100,
      splitFactor,
      periodSalaries,
      rightTotal,
      leftTotal
    });

  } catch (error) {
    console.error("Toplu maaş hesaplama hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};










export {

  getUserByReferralCode,
  getUserByReferralCodee,
  authUser,
  getReferralStats,
  registerUser,
  logoutUser,
  getUser,
  getReferredBy,
  getUserProfile,
  updateUserProfile,
  getReferralLinkOwner,
};