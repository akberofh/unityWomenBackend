import mongoose from "mongoose";

const yenisalarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalEarnings: { type: Number },
  salary: { type: Number },
  rightTotal: { type: Number },
  leftTotal: { type: Number },
  rank: { type: String },
  salaryRate: { type: Number },
  periodSalaries: [{
    periodLabel: String,
    salary: Number,
    rank: String,
    total: Number,
    rightTotal: Number,
    leftTotal: Number,
    rate: Number,
    name: String,
    email: String,
    photo: String,
    periodStart: Date,
    periodEnd: Date
  }],
  calculatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("YeniSalary", yenisalarySchema);

