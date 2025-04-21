import mongoose from 'mongoose';

const periodEarningSchema = new mongoose.Schema({
  periodLabel: String,
  userCount: Number,
  earned: Number
});

const referralStatsSchema = new mongoose.Schema({
  referrerName: String,
  referrerEmail: String,
  count: Number, 
  totalInvited: Number,
  totalEarned: Number,
  periodEarnings: [periodEarningSchema]
});

export default mongoose.model('ReferralStats', referralStatsSchema);
