import User from '../models/userModel.js';
import SystemSettings from '../models/systemSettingsModel.js';
import Salary from '../models/salaryModel.js';
import mongoose from "mongoose";


function generatePeriods(startDate, endDate) {
  const periods = [];
  let currentStart = new Date(startDate);
  currentStart.setHours(0, 0, 0, 0);

  while (currentStart < endDate) {
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + 14); // 15 gün (bugün dahil)
    currentEnd.setHours(23, 59, 59, 999);

    periods.push({
      start: new Date(currentStart),
      end: new Date(currentEnd > endDate ? endDate : currentEnd)
    });

    // bir sonraki dönem
    currentStart.setDate(currentStart.getDate() + 15);
    currentStart.setHours(0, 0, 0, 0);
  }

  return periods;
}

mongoose.connect('mongodb+srv://pasomap598:cWBMlcnEj5xiGLTw@akberof.ku4tf.mongodb.net', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB’ye başarılı bir şekilde bağlanıldı!');
    getAllUsersSalary();
  })
  .catch(err => {
    console.error('MongoDB bağlantı hatası:', err);
  });

export const getAllUsersSalary = async (req, res) => {
  try {
    const users = await User.find({ payment: true });

    const systemSettings = await SystemSettings.findOne();
    const systemStart = new Date(systemSettings.referralSystemStartDate);
    const now = new Date();
    const periods = generatePeriods(systemStart, now);

    const results = [];

    for (const user of users) {
      if (!user.payment) continue;

      const referralCode = user.referralCode;

      const children = await User.find({ referredBy: referralCode });
      const right = children[0];
      const left = children[1];

      const getChain = async (refCode) => {
        if (!refCode) return [];
        return await User.find({ referralChain: refCode });
      };

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

      const hasRight = right && rightTotal > 0;
      const hasLeft = left && leftTotal > 0;

      let mode = "";
      let salaryRate = 0;
      let salary = 0;
      let rank = "";
      let splitFactor = 1;
      let side = "";
      let periodSalaries = [];

      if (!hasRight || !hasLeft) {
        const oneSideTotal = (right ? rightTotal : leftTotal) + selfEarnings;
        if (oneSideTotal < 100) continue;

        mode = "Single Side";
        side = right ? "Right" : "Left";

        if (oneSideTotal >= 10000) salaryRate = 0.006;
        else if (oneSideTotal >= 4000) salaryRate = 0.009;
        else if (oneSideTotal >= 2000) salaryRate = 0.012;
        else if (oneSideTotal >= 1000) salaryRate = 0.015;
        else if (oneSideTotal >= 500) salaryRate = 0.018;
        else if (oneSideTotal >= 200) salaryRate = 0.018;
        else if (oneSideTotal >= 100) salaryRate = 0.03;

        if (oneSideTotal >= 10000 && oneSideTotal <= 12000) rank = "Bas Direktor";
        else if (oneSideTotal >= 6001) rank = "Direktor";
        else if (oneSideTotal >= 4000) rank = "Bas Lider";
        else if (oneSideTotal >= 2001) rank = "Iki Qat Lider";
        else if (oneSideTotal >= 1001) rank = "Lider";
        else if (oneSideTotal >= 501) rank = "Bas Menecer";
        else if (oneSideTotal >= 251) rank = "Menecer";
        else if (oneSideTotal >= 121) rank = "Bas Meslehetci";
        else if (oneSideTotal >= 60) rank = "Meslehetci";
        else rank = "Yeni üzv";

        salary = (oneSideTotal * salaryRate).toFixed(2);

        const usersInPeriod = [user];
        if (right) usersInPeriod.push(right);
        if (left) usersInPeriod.push(left);
        usersInPeriod.push(...rightChain, ...leftChain);

        periodSalaries = periods.map(period => {
          const usersInThisPeriod = usersInPeriod.filter(u =>
            u.dailyEarningsDate >= period.start && u.dailyEarningsDate <= period.end
          );
          const periodTotal = usersInThisPeriod.reduce((sum, u) => sum + (u.dailyEarnings || 0), 0);
          const periodSalary = (periodTotal * salaryRate).toFixed(2);

          return {
            periodLabel: `${period.start.toLocaleDateString('tr-TR')} - ${period.end.toLocaleDateString('tr-TR')}`,
            salary: Number(periodSalary),
            rank,
            total: Number(periodTotal),
            rate: salaryRate * 100,
            name: user.name,
            email: user.email,
            photo: user.photo,
            splitFactor,
            rightTotal,
            leftTotal
          };
        });


        results.push({
          userId: user._id,
          name: user.name,
          email: user.email,
          mode,
          side,
          total: oneSideTotal,
          salary: Number(salary),
          rank,
          rate: salaryRate * 100,
          periodSalaries
        });

        // Salary modeline ekleme
        await Salary.create({
          userId: user._id,
          name: user.name,
          email: user.email,
          salary: Number(salary),
          rank,
          mode,
          side,
          total: oneSideTotal,
          rate: salaryRate * 100,
          periodSalaries
        });

      } else {
        if (total < 60) continue;

        mode = "Dual Side";
        const big = Math.max(rightTotal, leftTotal);
        const ratio = big / (rightTotal + leftTotal);

        if (ratio >= 0.96) splitFactor = 3;
        else if (ratio >= 0.90) splitFactor = 2.5;
        else if (ratio >= 0.80) splitFactor = 2;

        if (total >= 12000) salaryRate = 0.105;
        else if (total >= 8000) salaryRate = 0.10;
        else if (total >= 6000) salaryRate = 0.09;
        else if (total >= 4000) salaryRate = 0.085;
        else if (total >= 1000) salaryRate = 0.078;
        else if (total >= 500) salaryRate = 0.073;
        else if (total >= 250) salaryRate = 0.071;
        else if (total >= 60) salaryRate = 0.068;

        if (total >= 10000) rank = "Bas Direktor";
        else if (total >= 6001) rank = "Direktor";
        else if (total >= 4000) rank = "Bas Lider";
        else if (total >= 2001) rank = "Iki Qat Lider";
        else if (total >= 1001) rank = "Lider";
        else if (total >= 501) rank = "Bas Menecer";
        else if (total >= 251) rank = "Menecer";
        else if (total >= 121) rank = "Bas Meslehetci";
        else if (total >= 60) rank = "Meslehetci";
        else rank = "Yeni üzv";

        salary = ((total * salaryRate) / splitFactor).toFixed(2);

        const usersInPeriod = [user];
        if (right) usersInPeriod.push(right);
        if (left) usersInPeriod.push(left);
        usersInPeriod.push(...rightChain, ...leftChain);

        periodSalaries = periods.map(period => {
          const usersInThisPeriod = usersInPeriod.filter(u =>
            u.dailyEarningsDate >= period.start && u.dailyEarningsDate <= period.end
          );
          const periodTotal = usersInThisPeriod.reduce((sum, u) => sum + (u.dailyEarnings || 0), 0);
          const periodSalary = ((periodTotal * salaryRate) / splitFactor).toFixed(2);

          return {
            periodLabel: `${period.start.toLocaleDateString('tr-TR')} - ${period.end.toLocaleDateString('tr-TR')}`,
            salary: Number(periodSalary),
            rank,
            total: Number(periodTotal),
            rate: salaryRate * 100,
            name: user.name,
            email: user.email,
            photo: user.photo
          };
        });

        results.push({
          userId: user._id,
          name: user.name,
          email: user.email,
          mode,
          total,
          rightTotal,
          leftTotal,
          salary: Number(salary),
          rank,
          rate: salaryRate * 100,
          splitFactor,
          periodSalaries
        });

        // Salary modeline ekleme
        await Salary.create({
          userId: user._id,
          name: user.name,
          email: user.email,
          salary: Number(salary),
          rank,
          mode,
          total,
          rightTotal,
          leftTotal,
          rate: salaryRate * 100,
          splitFactor,
          periodSalaries
        });
      }
    }

    return res.json(results);

  } catch (error) {
    console.error("Toplu maaş hesaplama hatası:", error);
    console.error("Sunucu hatası:", err.message);
  }
};
