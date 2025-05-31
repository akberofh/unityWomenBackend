import mongoose from "mongoose";
import User from "../models/userModel.js";

// MongoDB bağlantısı
mongoose.connect('mongodb+srv://pasomap598:cWBMlcnEj5xiGLTw@akberof.ku4tf.mongodb.net', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('✅ MongoDB’ye başarılı bir şekilde bağlanıldı!');

    const excludedStart = new Date("2025-04-01T00:00:00Z");
    const excludedEnd = new Date("2025-04-30T23:59:59Z");

    try {
      const result = await User.updateMany(
        {
          createdAt: {
            $gte: excludedStart,
            $lte: excludedEnd
          }
        },
        {
          $set: { isVerified: true }
        }
      );

      console.log(`🔁 ${result.modifiedCount} kullanıcının isVerified alanı true olarak güncellendi.`);
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
