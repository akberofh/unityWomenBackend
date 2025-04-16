import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';

dotenv.config();

const mongoURI = 'mongodb+srv://pasomap598:cWBMlcnEj5xiGLTw@akberof.ku4tf.mongodb.net';

const calculateTotalEarnings = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("🟢 MongoDB bağlantısı quruldu");

    // payment: true olan ve bir referralLinkOwner olanları say
    const allPaidReferrals = await User.find({
      referralLinkOwner: { $exists: true, $ne: null },
      payment: true
    });

    const totalEarned = allPaidReferrals.length * 2;

    console.log("==========================================");
    console.log(`📊 Sistemdə ümumi qazanc: ${totalEarned} ₼`);
    console.log(`👥 Ödəniş edən referal sayı: ${allPaidReferrals.length}`);
    console.log("==========================================");

    await mongoose.disconnect();
    console.log("🔴 MongoDB bağlantısı kəsildi");

  } catch (err) {
    console.error("🚨 Xəta baş verdi:", err);
  }
};

calculateTotalEarnings();
