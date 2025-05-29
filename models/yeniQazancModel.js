import mongoose from 'mongoose';

const periodEarningSchema = new mongoose.Schema({
  periodLabel: String,
  userCount: Number,
  earned: Number
});

const yeniQazancModelSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  referrerName: String,
  referrerEmail: String,
  referrerReferralCode: String,
      referralChain: {
      type: [String],
      default: [],
    },
  count: Number, 
  totalInvited: Number,
  totalEarned: Number,
  periodEarnings: [periodEarningSchema]
});

export default mongoose.model('YeniQazancModel', yeniQazancModelSchema);
