// models/Salary.js
import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  email: String,
  total: Number,
  rightTotal: Number,
  leftTotal: Number,
  salary: Number,
  rank: String,
  rate: Number,
  mode: String,
  splitFactor: Number,
  periodStart: Date,
  periodEnd: Date,
}, { timestamps: true });

export default mongoose.model("Salary", salarySchema);
