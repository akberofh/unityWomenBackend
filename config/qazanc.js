import User from '../models/userModel.js';
import ReferralStats from '../models/referralStats.js';


function generatePeriods() {
  const now = new Date(); 

  const start = new Date(now.getFullYear(), now.getMonth(), 1); 
  const end = new Date(); 

  const startAz = new Date(start.getTime() + 4 * 60 * 60 * 1000);
  const endAz = new Date(end.getTime() + 4 * 60 * 60 * 1000);
  endAz.setHours(23, 59, 59, 999);

  return [{ start: startAz, end: endAz }];
}

export const run = async () => {
  
  await ReferralStats.deleteMany({});
  


  
  const allPaidUsers = await User.find({ payment: true });
  
  for (const user of allPaidUsers) {
    try {
    const referralCode = user.referralCode;
    
    if (!referralCode) continue;
    
      const invitedAll = await User.find({ referralLinkOwner: referralCode });
      const invitedPaid = invitedAll.filter(u => {
        return u.payment === true && u.isVerified !== true;
      });
      

   

      const totalEarned = invitedPaid.length * 2;
      const periods = generatePeriods();

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
            referralChain: u.referralChain,
            photo: u.photo,
            referralCode: u.referralCode
          }))
        };
      });

      const statDoc = new ReferralStats({
        userId: user._id,
        referrerName: user.name,
        referrerEmail: user.email,
        referralChain: user.referralChain,
        referrerPhoto: user.photo,
        referrerReferralCode: user.referralCode,
        count: invitedAll.length,
        totalInvited: invitedPaid.length,
        totalEarned,
        periodEarnings
      });

      await statDoc.save();
    }
    catch (err) {
    console.error("xeta:", err);
  } 

  } 

    console.log("İşlem tamamlandı:", statDoc.length);

};

