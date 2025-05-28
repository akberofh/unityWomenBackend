import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalEarnings: { type: Number },
  salary: { type: Number },
  rank: { type: String },
  salaryRate: { type: Number },
  periodSalaries: [{
    periodLabel: String,
    salary: Number,
    rank: String,
    total: Number,
    rate: Number,
    name: String,
    email: String,
    referralChain: {
      type: [String],
      default: [],
    }, referralCode: String,
    photo: String,
    periodStart: Date,
    periodEnd: Date
  }],
  calculatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Salary", salarySchema);

