import User from '../models/userModel.js';
import Salary from '../models/salaryModel.js';



function generatePeriods() {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date();

  const startAz = new Date(start.getTime() + 4 * 60 * 60 * 1000);
  const endAz = new Date(end.getTime() + 4 * 60 * 60 * 1000);
  endAz.setHours(23, 59, 59, 999);

  return [{ start: startAz, end: endAz }];
}





export const getAllUsersSalary = async () => {
  const results = [];
  await Salary.deleteMany({});

  const users = await User.find({ payment: true });

  const periods = generatePeriods();


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



      const isSeverelyImbalanced = hasRight && hasLeft && (Math.max(rightTotal, leftTotal) / (rightTotal + leftTotal)) > 0.99;

      let mode = "";
      let salaryRate = 0;
      let salary = 0;
      let rank = "";
      let splitFactor = 1;
      let side = "";

      if (!hasRight || !hasLeft || isSeverelyImbalanced) {


        mode = "Single Side";

        // Hesaplama için her zaman BÜYÜK olan kolu baz al
        const oneSideTotal = Math.max(rightTotal, leftTotal) + selfEarnings;
        side = rightTotal > leftTotal ? "Right" : "Left";


                if (oneSideTotal < 100) continue;



        if (oneSideTotal >= 1000) salaryRate = 0.003;
        else if (oneSideTotal >= 500) salaryRate = 0.005;
        else if (oneSideTotal >= 250) salaryRate = 0.009;
        else if (oneSideTotal >= 150) salaryRate = 0.01;
        else if (oneSideTotal >= 100) salaryRate = 0.02;



        if (oneSideTotal >= 13000) rank = "Qizil Direktor";
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


        mode = "Dual Side";
        side = "Right & Left";

        const big = Math.max(rightTotal, leftTotal);
        const ratio = big / (rightTotal + leftTotal);


                if (total < 60) continue;


        if (ratio >= 0.99) splitFactor = 20;
        else if (ratio >= 0.97) splitFactor = 11;
        else if (ratio >= 0.95) splitFactor = 8.5;
        else if (ratio >= 0.90) splitFactor = 4;
        else if (ratio >= 0.85) splitFactor = 3.5;
        else if (ratio >= 0.80) splitFactor = 2.8;

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
        const periodSelfEarnings = usersInThisPeriod.find(u => u._id.equals(user._id))?.dailyEarnings || 0;

        let periodSalary = 0;

        if (mode === "Single Side") {
          const periodOneSideTotal = Math.max(periodRightTotal, periodLeftTotal) + periodSelfEarnings;
          periodSalary = (periodOneSideTotal * salaryRate).toFixed(2);
        } else {
          periodSalary = ((periodTotal * salaryRate) / splitFactor).toFixed(2);
        }

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


      const responseTotal = mode === "Single Side" ? Math.max(rightTotal, leftTotal) + selfEarnings : total;

      results.push({
        userId: user._id,
        name: user.name,
        referralCode: user.referralCode,
        email: user.email,
        referralChain: user.referralChain,
        mode,
        side,
        total: responseTotal,
        salary: Number(salary),
        rank,
        rate: salaryRate * 100,
        splitFactor,
        periodSalaries,
        rightTotal,
        leftTotal
      });



      let a = await Salary.create({
        userId: user._id,
        totalEarnings: responseTotal,
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


    } catch (err) {
      console.error(`Hata: ${user.name} için hesaplama yapılamadı.`, err);
    }
  }
  console.log("İşlem tamamlandı:", results.length);

};


