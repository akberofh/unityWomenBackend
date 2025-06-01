import mongoose from "mongoose";
import User from "../models/userModel.js"; 

// MongoDB bağlantısı
mongoose.connect('mongodb+srv://pasomap598:cWBMlcnEj5xiGLTw@akberof.ku4tf.mongodb.net', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('✅ MongoDB’ye başarılı bir şekilde bağlanıldı!');

    try {
      const result = await User.updateMany(
        { payment: true },
        {
          $set: {
            payment: false,
            dailyEarnings: 0,
            dailyEarningsDate: null
          }
        }
      );

      console.log(`🔁 ${result.modifiedCount} kullanıcının alanları güncellendi (payment: false, dailyEarnings: 0, dailyEarningsDate: null).`);
    } catch (err) {
      console.error('❌ Güncelleme hatası:', err);
    } finally {
      await mongoose.disconnect();
      console.log("🔌 MongoDB bağlantısı kapatıldı.");
    }
  })
  .catch(err => {
    console.error('❌ MongoDB bağlantı hatası:', err);
  });
