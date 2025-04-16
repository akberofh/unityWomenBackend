import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js'; // Kendi User modeline göre yolu düzelt

dotenv.config();

const generatePeriodss = () => {
  const startDate = new Date("2025-04-01T00:00:00.000Z");
  const endDate = new Date("2025-04-14T23:59:59.999Z");
  return { startDate, endDate };
};

const mongoURI = 'mongodb+srv://pasomap598:cWBMlcnEj5xiGLTw@akberof.ku4tf.mongodb.net';

const getAllSalariesss = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("🟢 MongoDB bağlantısı başarılı");

    const { startDate, endDate } = generatePeriodss();
    const limit = 10000;
    const skip = 0;

    const filteredUsers = await User.find({
      payment: true
    }).skip(skip).limit(limit);

    const getChain = async (refCode) => {
      if (!refCode) return [];
      return await User.find({
        referralChain: refCode,
        dailyEarningsDate: {
          $gte: startDate,
          $lte: endDate
        }
      });
    };

    let grandTotal = 0;
    let totalEarningsAllUsers = 0;

    for (const user of filteredUsers) {
      const children = await User.find({
        referredBy: user.referralCode,
        dailyEarningsDate: {
          $gte: startDate,
          $lte: endDate
        }
      });

      const right = children[0];
      const left = children[1];

      const rightChain = await getChain(right?.referralCode);
      const leftChain = await getChain(left?.referralCode);

      const rightEarnings = right ? (right.dailyEarnings || 0) : 0;
      const leftEarnings = left ? (left.dailyEarnings || 0) : 0;
      const selfEarnings = user.dailyEarnings || 0;

      const rightChainTotal = rightChain.reduce((sum, u) => sum + (u.dailyEarnings || 0), 0);
      const leftChainTotal = leftChain.reduce((sum, u) => sum + (u.dailyEarnings || 0), 0);

      const rightTotal = rightEarnings + rightChainTotal;
      const leftTotal = leftEarnings + leftChainTotal;
      const total = rightTotal + leftTotal + selfEarnings;

      totalEarningsAllUsers += total;

      let salary = 0;

      if (!right || !left) {
        const oneSideTotal = (right ? rightTotal : leftTotal) + selfEarnings;
        let salaryRate = 0;

        if (oneSideTotal >= 10000) salaryRate = 0.006;
        else if (oneSideTotal >= 4000) salaryRate = 0.009;
        else if (oneSideTotal >= 2000) salaryRate = 0.012;
        else if (oneSideTotal >= 1000) salaryRate = 0.015;
        else if (oneSideTotal >= 500) salaryRate = 0.018;
        else if (oneSideTotal >= 200) salaryRate = 0.018;
        else if (oneSideTotal >= 100) salaryRate = 0.03;

        salary = oneSideTotal * salaryRate;
      } else {
        const big = Math.max(rightTotal, leftTotal);
        const ratio = big / (rightTotal + leftTotal);
        let splitFactor = 1;

        if (ratio >= 0.96) splitFactor = 3;
        else if (ratio >= 0.90) splitFactor = 2.5;
        else if (ratio >= 0.80) splitFactor = 2;

        let salaryRate = 0;

        if (total >= 12000) salaryRate = 0.105;
        else if (total >= 8000) salaryRate = 0.10;
        else if (total >= 6000) salaryRate = 0.09;
        else if (total >= 4000) salaryRate = 0.085;
        else if (total >= 1000) salaryRate = 0.078;
        else if (total >= 500) salaryRate = 0.073;
        else if (total >= 250) salaryRate = 0.071;
        else if (total >= 60) salaryRate = 0.068;

        salary = (total * salaryRate) / splitFactor;
      }

      grandTotal += salary;

      console.log(`👤 ${user.name} - ${user.email} => Maaş: ${salary.toFixed(2)} ₼`);
    }

    console.log("------------------------------------------------");
    console.log(`📈 Tüm Kullanıcıların Genel Kazancı: ${totalEarningsAllUsers.toFixed(2)} ₼`);
    console.log(`💰 Toplam Ödənilən Maaş: ${grandTotal.toFixed(2)} ₼`);

    await mongoose.disconnect();
    console.log("🔴 MongoDB bağlantısı kəsildi");

  } catch (err) {
    console.error("🚨 Xəta:", err);
  }
};

getAllSalariesss();
