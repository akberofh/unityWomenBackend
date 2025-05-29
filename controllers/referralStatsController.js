import referralStats from '../models/referralStats.js';
import referralStates from '../models/yeniQazancModel.js';
import User from '../models/userModel.js';

export const getMyTeamReferralstats = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const referralCode = currentUser.referralCode;

    if (!referralCode) return res.status(400).json({ message: 'Referral kodunuz bulunamadı.' });

    // Kullanıcının zincirindeki tüm kişileri bul
    const teamMembers = await User.find({ referralChain: referralCode }).select('_id');

    const teamIds = teamMembers.map(u => u._id);

    // Bu kişilere ait salary kayıtlarını getir
    const referralStaties = await referralStats.find({ userId: { $in: teamIds } });

    res.status(200).json(referralStaties);

  } catch (err) {
    console.error("Maas çekme hatası:", err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

export const getMyTeamReferralstates = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const referralCode = currentUser.referralCode;

    if (!referralCode) return res.status(400).json({ message: 'Referral kodunuz bulunamadı.' });

    // Kullanıcının zincirindeki tüm kişileri bul
    const teamMembers = await User.find({ referralChain: referralCode }).select('_id');

    const teamIds = teamMembers.map(u => u._id);

    // Bu kişilere ait salary kayıtlarını getir
    const referralStaties = await referralStates.find({ userId: { $in: teamIds } });

    res.status(200).json(referralStaties);

  } catch (err) {
    console.error("Maas çekme hatası:", err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};
