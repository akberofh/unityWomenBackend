// models/SystemSettings.js
import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema({
  referralSystemStartDate: {
    type: Date,
    required: true
  }
});

export default mongoose.model("SystemSettings", systemSettingsSchema);
