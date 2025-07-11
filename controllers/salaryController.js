import Salary from '../models/salaryModel.js';
import Salarys from '../models/yenisalaryModel.js';
import User from '../models/userModel.js';
import ConfirmedCart from '../models/confirmedCartModel.js';
import referralStates from '../models/yeniQazancModel.js';


export const getMyTeamSalaries = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const referralCode = currentUser.referralCode;

    if (!referralCode) return res.status(400).json({ message: 'Referral kodunuz bulunamadı.' });

    // Kullanıcının zincirindeki tüm kişileri bul
    const teamMembers = await User.find({ referralChain: referralCode }).select('_id');

    const teamIds = teamMembers.map(u => u._id);

    // Bu kişilere ait salary kayıtlarını getir
    const salaries = await Salary.find({ userId: { $in: teamIds } });

    res.status(200).json(salaries);

  } catch (err) {
    console.error("Maas çekme hatası:", err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};


export const getMyTeamSalariess = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const referralCode = currentUser.referralCode;

    if (!referralCode) return res.status(400).json({ message: 'Referral kodunuz bulunamadı.' });

    // Kullanıcının zincirindeki tüm kişileri bul
    const teamMembers = await User.find({ referralChain: referralCode }).select('_id');

    // Takım üyelerinin ID'lerini al
    const teamIds = teamMembers.map(u => u._id);

    // Kendi ID'sini de ekle
    teamIds.push(req.user._id);

    // Bu kişilere ait maaş kayıtlarını getir (kendi maaşı + takım maaşları)
    const salaries = await Salarys.find({ userId: { $in: teamIds } });

    res.status(200).json(salaries);

  } catch (err) {
    console.error("Maaş çekme hatası:", err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

export const getMyTeamSalar = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const referralCode = currentUser.referralCode;

    if (!referralCode) return res.status(400).json({ message: 'Referral kodunuz bulunamadı.' });

    // Kullanıcının zincirindeki tüm kişileri bul
    const teamMembers = await User.find({ referralChain: referralCode }).select('_id');

    // Takım üyelerinin ID'lerini al
    const teamIds = teamMembers.map(u => u._id);

    // Kendi ID'sini de ekle
    teamIds.push(req.user._id);

    // Bu kişilere ait maaş kayıtlarını getir (kendi maaşı + takım maaşları)
    const salaries = await referralStates.find({ userId: { $in: teamIds } });

    res.status(200).json(salaries);

  } catch (err) {
    console.error("Maaş çekme hatası:", err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};



export const getUserProduct = async (req, res) => {
  try {
    if (req.user) {
      const userProduct = await ConfirmedCart.find({ user_id: req.user._id }).select('products photo paymentStatus gathered confirmedAt user_id orderCode'); 
      res.status(200).json(userProduct);
    } else {
      res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const getConfirmcard = async (req, res) => {
  try {
    const alConfirmcard = await ConfirmedCart.find()
      .select('products photo paymentStatus gathered confirmedAt user_id orderCode')
      .sort({ confirmedAt: -1 }); // -1 = azalan sıralama (yeni > eski)

    res.json({ alConfirmcard });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
