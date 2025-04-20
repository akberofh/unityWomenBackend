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
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    referralLinkOwner: 
    { type: String,
       },
    phone: {
      type: String,
      unique: true,
    },
    faze: {
      type: String,
    },
    photo: {
      type: String,
    },
    finCode: {
      type: String,
      unique: true,
    },
    payment: {
      type: Boolean,
      default: false, 
    },
    card: {
      type: Number,
      default : 0,
    },
    referralLink: {
      type: String,
    },
    gender: {
      type: String,
      required: true,
      enum: ['kişi', 'qadın'], 
    },
    referralCode: {
      type: String,
      unique: true, 
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    referredBy: {
      type: String,
    },
    referralChain: {
      type: [String],
      default: [],
    },
    earnings: {
      type: Number,
      default: 0
    },
    userType: {
      type: String,
      default: "user",
    },

    verficationToken: {
      type: String,
    },
    referralCount: {
      type: Number,
      default: 0, 
    },
    dailyEarnings: {
      type: Number,
      default: 0,
    },
    dailyEarningsDate: {
      type: Date
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verficationToken: String,
    verficationTokenExpiresAt: Date,
  },
  { timestamps: true } 
);

userSchema.post('findOneAndUpdate', async function (doc) {
  if (doc && typeof doc.payment !== 'undefined') {
    const dailyEarnings = doc.payment === true ? 10 : 0;

    doc.dailyEarnings = dailyEarnings;

    if (dailyEarnings === 10 && doc.dailyEarningsDate) {
      doc.dailyEarningsDate = new Date();
    } else {
      doc.dailyEarningsDate = null;
    }

    await doc.save();
  }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10); 
    this.password = await bcrypt.hash(this.password, salt); 
    next(); // İşlem başarıyla tamamlandı
  } catch (error) {
    next(error); // Eğer bir hata oluşursa, hatayı geçiyoruz
  }
});

// Şifre kontrol fonksiyonu
userSchema.methods.parolaKontrol = async function (girilenParola) {
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
        ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShCI89MLwUuQB5nBrOGNBn-Oiqz_tSIyKzsA&s"
        : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9jZ2FzVxFkw-yBn7FM0dOJRzLD26gS5Ro1w&s"
  }
  next();
});

userSchema.pre('save', function (next) {
  // Telefon numarasını + ile başlayacak şekilde formatlayalım
  if (this.phone && !this.phone.startsWith('+')) {
    this.phone = `+${this.phone.replace(/\D/g, '')}`; // Sadece rakamları al ve başına '+' ekle
  }
  next();
});


const User = mongoose.model('User', userSchema); // Modeli oluşturuyoruz

export default User;
