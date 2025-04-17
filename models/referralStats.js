import mongoose from "mongoose";

const referralStatsSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  name: String,
  email: String,
  totalInvited: Number,
  totalPaymentTrue: Number,
  totalEarned: Number,
  date: { type: Date, default: Date.now }
});

export default mongoose.model("ReferralStats", referralStatsSchema);
