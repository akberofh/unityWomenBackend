import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/userModel.js';

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(6).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'akberof.f313@gmail.com',
        pass: 'rqctyqggllodotif'
      },
      tls: {
        rejectUnauthorized: false // Güvenilmeyen sertifikaları kabul et
      },
    });

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    const mailOptions = {
      from: 'akberof.f313@gmail.com',
      to: user.email,
      subject: 'Parola Sıfırlama Talebi',
      text: `Parolanızı sıfırlamak için aşağıdaki bağlantıya tıklayın: ${resetUrl}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Sıfırlama bağlantısı gönderildi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token geçersiz veya süresi dolmuş' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Parola başarıyla güncellendi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
