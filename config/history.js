import User from '../models/userModel.js';
import SystemSettings from '../models/systemSettingsModel.js';
import Salary from '../models/yenisalaryModel.js';


function generatePeriods(startDate, endDate) {
  const periods = [];
  let current = new Date(startDate);
  current.setDate(1); // Her zaman ayın 1'i ile başla
  current.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    const start = new Date(current);

    // Aynı ayın son günü
    const end = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    periods.push({
      start,
      end: end > endDate ? new Date(endDate) : end,
    });

    // Bir sonraki ayın 1. gününe geç
    current.setMonth(current.getMonth() + 1);
    current.setDate(1);
    current.setHours(0, 0, 0, 0);
  }

  return periods;
}




export const history = async () => {
  
  const users = await User.find({ payment: true });
  const systemSettings = await SystemSettings.findOne();
  const systemStart = new Date(systemSettings.referralSystemStartDate);
  const now = new Date();
  const periods = generatePeriods(systemStart, now);
  
  const results = [];
  
  for (const user of users) {
      try {
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

      let mode = hasRight && hasLeft ? "Dual Side" : "Single Side";
      let salaryRate = 0;
      let salary = 0;
      let rank = "";
      let splitFactor = 1;
      let side = hasRight ? "Right" : "Left";

      const oneSideTotal = (hasRight ? rightTotal : leftTotal) + selfEarnings;

      if (!hasRight || !hasLeft) {
        if (oneSideTotal < 100) continue;

        if (oneSideTotal >= 12000) salaryRate = 0.005;
        else if (oneSideTotal >= 10000) salaryRate = 0.006;
        else if (oneSideTotal >= 4000) salaryRate = 0.009;
        else if (oneSideTotal >= 2000) salaryRate = 0.012;
        else if (oneSideTotal >= 1000) salaryRate = 0.015;
        else if (oneSideTotal >= 500) salaryRate = 0.018;
        else if (oneSideTotal >= 200) salaryRate = 0.018;
        else if (oneSideTotal >= 100) salaryRate = 0.03;

        if (oneSideTotal >= 13000 ) rank = "Qizil Direktor";
        else if (oneSideTotal >= 10000) rank = "Bas Direktor";
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
      } else {
        if (total < 60) continue;

        const big = Math.max(rightTotal, leftTotal);
        const ratio = big / (rightTotal + leftTotal);

        if (ratio >= 0.96) splitFactor = 3;
        else if (ratio >= 0.90) splitFactor = 2.5;
        else if (ratio >= 0.80) splitFactor = 2;

        if (total >= 12000) salaryRate = 0.10;
        else if (total >= 8000) salaryRate = 0.094;
        else if (total >= 6000) salaryRate = 0.086;
        else if (total >= 4000) salaryRate = 0.083;
        else if (total >= 1000) salaryRate = 0.075;
        else if (total >= 500) salaryRate = 0.07;
        else if (total >= 250) salaryRate = 0.07;
        else if (total >= 60) salaryRate = 0.067;

        if (total >= 13000) rank = "Qizil Direktor";
        else if (total >= 10000) rank = "Bas Direktor";
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
      }

      const usersInPeriod = [...rightChain, ...leftChain];
      if (right) usersInPeriod.push(right);
      if (left) usersInPeriod.push(left);
      usersInPeriod.push(user);

      const periodSalaries = periods.map(period => {
        const usersInThisPeriod = usersInPeriod.filter(u =>
          u.dailyEarningsDate >= period.start && u.dailyEarningsDate <= period.end
        );
        const periodTotal = usersInThisPeriod.reduce((sum, u) => sum + (u.dailyEarnings || 0), 0);
        const periodRightTotal = usersInThisPeriod.filter(u => rightChain.includes(u) || u._id.equals(right?._id)).reduce((sum, u) => sum + (u.dailyEarnings || 0), 0);
        const periodLeftTotal = usersInThisPeriod.filter(u => leftChain.includes(u) || u._id.equals(left?._id)).reduce((sum, u) => sum + (u.dailyEarnings || 0), 0);

        const periodSalary =
          mode === "Single Side"
            ? (periodTotal * salaryRate).toFixed(2)
            : ((periodTotal * salaryRate) / splitFactor).toFixed(2);

        return {
          periodLabel: `${period.start.toLocaleDateString('tr-TR')} - ${period.end.toLocaleDateString('tr-TR')}`,
          salary: Number(periodSalary),
          rank,
          total: periodTotal,
          rightTotal: periodRightTotal,
          leftTotal: periodLeftTotal,
          rate: salaryRate * 100,
          name: user.name,
          referralCode: user.referralCode,
          email: user.email,
          referralChain: user.referralChain,
          photo: user.photo,
          periodStart: period.start,
          periodEnd: period.end
        };
      });

      results.push({
        userId: user._id,
        name: user.name,
        referralCode: user.referralCode,
        email: user.email,
        referralChain: user.referralChain,
        mode,
        side,
        total: mode === "Single Side" ? oneSideTotal : total,
        salary: Number(salary),
        rank,
        rate: salaryRate * 100,
        splitFactor,
        periodSalaries,
        rightTotal,
        leftTotal
      });

      let a=  await Salary.create({
        userId: user._id,
        totalEarnings: mode === "Single Side" ? oneSideTotal : total,
        salary: Number(salary),
        rank,
        salaryRate: salaryRate * 100,
        rightTotal,
        leftTotal,
        periodSalaries: periodSalaries.map(p => ({
          periodLabel: p.periodLabel,
          salary: p.salary,
          rank: p.rank,
          total: p.total,
          rightTotal: p.rightTotal,
          leftTotal: p.leftTotal,
          rate: p.rate,
          name: p.name,
          referralChain: p.referralChain,
          referralCode: p.referralCode,
          email: p.email,
          photo: p.photo,
          periodStart: p.periodStart,
          periodEnd: p.periodEnd
        }))
      });

      
    }catch (err) {
      console.error(`Hata: ${user.name} için hesaplama yapılamadı.`, err);
    }

  }

};


