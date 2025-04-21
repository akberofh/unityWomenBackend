import mongoose from 'mongoose';
import User from '../models/userModel.js';
import SystemSettings from '../models/systemSettingsModel.js';
import ReferralStats from '../models/referralStats.js';

mongoose.connect('mongodb+srv://pasomap598:cWBMlcnEj5xiGLTw@akberof.ku4tf.mongodb.net', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB bağlantısı başarılı'))
.catch(err => console.error('MongoDB bağlantı hatası:', err));

function generatePeriods(startDate, endDate) {
  const periods = [];
  let currentStart = new Date(startDate);
  currentStart.setHours(0, 0, 0, 0);

  while (currentStart < endDate) {
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + 14);
    currentEnd.setHours(23, 59, 59, 999);

    periods.push({
      start: new Date(currentStart),
      end: new Date(currentEnd > endDate ? endDate : currentEnd)
    });

    currentStart.setDate(currentStart.getDate() + 15);
    currentStart.setHours(0, 0, 0, 0);
  }

  return periods;
}

const run = async () => {
  try {

    await ReferralStats.deleteMany({});
    

    const systemSettings = await SystemSettings.findOne();
    const systemStart = new Date(systemSettings.referralSystemStartDate);
    const now = new Date();

    const allPaidUsers = await User.find({ payment: true });

    for (const user of allPaidUsers) {
      const referralCode = user.referralCode;

      if (!referralCode) continue;

      const invitedAll = await User.find({ referralLinkOwner: referralCode });
      const invitedPaid = invitedAll.filter(u => u.payment === true);

      const totalEarned = invitedPaid.length * 2;
      const periods = generatePeriods(systemStart, now);

      const periodEarnings = periods.map(period => {
        const usersInPeriod = invitedPaid.filter(u =>
          u.dailyEarningsDate >= period.start && u.dailyEarningsDate <= period.end
        );

        return {
          periodLabel: `${period.start.toLocaleDateString()} - ${period.end.toLocaleDateString()}`,
          userCount: usersInPeriod.length,
          earned: usersInPeriod.length * 2,
          users: usersInPeriod.map(u => ({
            name: u.name,
            email: u.email,
            photo: u.photo,
            referralCode: u.referralCode
          }))
        };
      });

      const statDoc = new ReferralStats({
        referrerName: user.name,
        referrerEmail: user.email,
        referrerPhoto: user.photo,
        count: invitedAll.length,
        totalInvited: invitedPaid.length,
        totalEarned,
        periodEarnings
      });

      await statDoc.save();
      console.log(`✅ ${user.name} için kayıt edildi`);
    }

  } catch (err) {
    console.error("Hata:", err);
  } finally {
    mongoose.disconnect();
  }
};

run();
