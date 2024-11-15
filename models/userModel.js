import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, 
    },
    password: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
    },
    referralLink: {
      type: String,
    },
   
    gender: {
      type: String,
      required: true,
      enum: ['kişi', 'qadın'], // Sadece 'male' ve 'female' değerlerine izin verilir
    },
    referralCode: {
      type: String,
      unique: true, // Referans kodu benzersiz olmalı
    },
    isVerified: {
      type: Boolean,
      default: false, // Kullanıcı henüz doğrulanmadı
    },
    referredBy: { 
      type: String,
    },
    referralChain: {
      type: [String], // Üst kademelerdeki tüm referans kodlarını saklamak için bir dizi
      default: [],
    },
    earnings: { 
      type: Number,
       default: 0
       },
       userType: {
        type: String,
        default : "user",
       },
  
    verficationToken: { 
      type: String,
    },
    referralCount: { 
      type: Number, 
      default: 0, // Bu kullanıcı tarafından yönlendirilen kişi sayısı
    },
    resetPasswordToken: String,
  resetPasswordExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verficationToken: String,
    verficationTokenExpiresAt: Date,
  },
  { timestamps: true } // Otomatik olarak oluşturulma ve güncellenme zamanları eklenir
);

// Şifreyi hash'leme işlemi, kullanıcı kaydedilmeden önce yapılır
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next(); // Eğer şifre değişmemişse, işlemi geçiyoruz
  }

  try {
    const salt = await bcrypt.genSalt(10); // 10 rounds ile salt oluşturuluyor
    this.password = await bcrypt.hash(this.password, salt); // Şifreyi hashliyoruz
    next(); // İşlem başarıyla tamamlandı
  } catch (error) {
    next(error); // Eğer bir hata oluşursa, hatayı geçiyoruz
  }
});

// Şifre kontrol fonksiyonu
userSchema.methods.parolaKontrol = async function(girilenParola) {
  try {
    return await bcrypt.compare(girilenParola, this.password); // Girilen şifreyi veritabanındaki hash ile karşılaştırıyoruz
  } catch (error) {
    throw new Error("Şifre kontrolü sırasında bir hata oluştu");
  }
};

userSchema.pre("save", function (next) {
  if (!this.photo) {
    this.photo =
      this.gender === "qadın"
        ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAe1BMVEX///8AAACQkJC1tbWysrL6+vr39/fV1dX09PTQ0NDk5OTo6OgrKyt2dnbv7+/AwMCbm5ukpKSOjo6IiIgyMjJCQkLe3t5wcHBGRkZ/f39WVlZQUFDGxsZkZGQ3NzeCgoILCwuXl5cjIyMVFRVoaGgnJyccHBxVVVWqqqrcK1UCAAAE2klEQVR4nO2d23LqMAxFcYGkNAdCCZfScimXtvz/F54UplMohMS25K1ktB549hqTRJYtudVSFEVRFEVRFEVRFEWxJoqizXC4Mdkw/+120cMhZpqsZ+aSef8JPSoyFss3c5NxGz00CtL++229I+8P6PF5Eo3+3dE7skvQg/RgkJXpHZnl7NM4jtDjtaWi3y//Vp1azWe6sxQ8Ml6gx12Z0ueviEk9HFNnwZx9Df6rQw+/b8R/Jl88BfN4B61wn1dvQWPWaIl7UAiKnsWCENQasc8ilaAxU7TKbZ7JBM0K7XKTlE7QGInLju6Y0tD00D7XfJAKmhe0zxWED+EJaZP4SC1o3tBKfxiRG5oY7XQB/RRKe53+zRaS8Ii2OqPLIWhStNYZtlmZaggKwCMWQWPQXr/wTKGkJQZtvPbLM1rsh5hJUM7fdM5mKOR70V2xGQpJnz6xCZoM7XaC601qxETffILmFe12gtFQRkaKfOkrzpDxMRTyMuUUNDO0XYv1W2FkLC8WrIZbAWeLWF80xgg4weC/XyjdkG43Rqhhwito8MffpsyG+JQit+EQLeh98kK+IUsqWJRhv+mGHPsVl6ihGqphGdwhDd7wofGGGzVUQ/GG3EEb3pBdUA0bYIg+/MVv2Gm8Ifq0ghqqoRrCDXlO7EkyPDTesKOGaqiGaqiGaqiGaqiGaqiGakhAu/GG28Yb+vRpUUM1VEM1FGOILQzq8QuasRqqoRfMlQhHsL14aPpelQDd5l423nASwhDZ4oS3qOuHPdCQuxLhxBJoyFeHf877AGcY5FVqDM4wwBb3EVxRPmsB8BmwqIarKc01qF5DDN29CthhBENE3T/0EYL8hRbnIOKaKECqFGvY2gcU3EE+iYx9d64ALS+6AdJQR7YHjGArzBI/j7yBcWlrwF1BmoPuQp90WP+rM3w5fv44TvtOVz2UszxI8DsR0xfprRcCuppckh4+aL4fu/GyjX74CunF86VP/u1zOYt7yFdnNZIkmWeZZVOXLFt3BomQJoIVWVv4oWubnLBKcdTS0KoSQw1lYmMoqzd5RayanI3Qo3XBLlyt12fiiGWfuhpOou2KQ1wQWob1ulHmvTLFOPQhmKDHbIVTo4UazWLkmNoYy19UnPDoySPptodivFb7yA3tiqSfPoI5uNRoJRKC5OKX4Cicwu+bN6FxeEqYHBbo+Oh1ueotDqLCOOvbjauw3YtJB/cm9y4X92El4sXK3JGuj41zojjAoahVCpOcHkLt5GcQxzZ/o7YzJsHDgABFeX8ZBvx8JG2uC6xKHAOlq5Iwh0pvsduEmEfSG3HtYe/Q3vZdHPnD2v36KcjR/DJe+K6eCXN6pgJMf9Up8z0WNnxyhADcFwRYQh+T4z4RBVCXmQQ43GULaY6cvyu5C4Qn+GUKEs7iAG1SCNX98vgwphCaWRT3Fj2H4la2kFUVDhC0UUYrlOF9pZegUO02vh0XwhSJeuG5ARCohNIHv9tm+e7bJsRrEmswhcZ8eQjKjWYu8JhEYWvCIjbuhuihV8T9IE64Ol9PnP+mAbqR0+B8DOcDPfKqOGc0mKqZ6Bk7Jvu7XJvX9DgmF8E7FDY4bkrx3rdNimMSHLAL6oqjoYhtmGo4noN/Hj3UhFE9zqUqiqIoiqIoiqIoiqIoSm35D+3UZgT7o4gfAAAAAElFTkSuQmCC"
        : "data:image/png;base64,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";
  }
  next();
});

const User = mongoose.model('User', userSchema); // Modeli oluşturuyoruz

export default User;
