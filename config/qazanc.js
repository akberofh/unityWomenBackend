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
    currentEnd.setDate(currentEnd.getDate() + 6);
    currentEnd.setHours(23, 59, 59, 999);

    periods.push({
      start: new Date(currentStart),
      end: new Date(currentEnd > endDate ? endDate : currentEnd)
    });

    currentStart.setDate(currentStart.getDate() + 7);
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

    const excludedStart = new Date("2025-04-01T00:00:00Z");
    const excludedEnd = new Date("2025-04-30T23:59:59Z");

    const allPaidUsers = await User.find({ payment: true });

    for (const user of allPaidUsers) {
      const referralCode = user.referralCode;

      if (!referralCode) continue;

      const invitedAll = await User.find({ referralLinkOwner: referralCode });
      const invitedPaid = invitedAll.filter((u) => {
        const created = new Date(u.createdAt);
        return u.payment === true && (created < excludedStart || created > excludedEnd);
      });
      

   

      const totalEarned = invitedPaid.length * 2;
      const periods = generatePeriods(systemStart, now);

      const periodEarnings = periods.map(period => {
        const usersInPeriod = invitedPaid.filter(u =>
          u.dailyEarningsDate >= period.start && u.dailyEarningsDate <= period.end
        );

        return {
          periodLabel: `${period.start.toLocaleDateString('tr-TR')} - ${period.end.toLocaleDateString('tr-TR')}`,
          userCount: usersInPeriod.length,
          earned: usersInPeriod.length * 2,
          users: usersInPeriod.map(u => ({
            name: u.name,
            referralCode: u.referralCode,
            email: u.email,
            photo: u.photo,
            referralCode: u.referralCode
          }))
        };
      });

      const statDoc = new ReferralStats({
        userId: user._id,
        referrerName: user.name,
        referrerEmail: user.email,
        referrerPhoto: user.photo,
        referrerReferralCode: user.referralCode,
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
