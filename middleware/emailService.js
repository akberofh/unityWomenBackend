import nodemailer from 'nodemailer';

export const sendEarningsEmail = async (userEmail, earnings) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for port 465, false for other ports
    auth: {
      user: 'akberof.f313@gmail.com',
      pass: 'rqctyqggllodotif'
    },
    tls: {
      rejectUnauthorized: false // Güvenilmeyen sertifikaları kabul et
    }
  });

  const mailOptions = {
    from: 'akberof.f313@gmail.com', 
    to: userEmail,
    subject: 'Kazancınız Hakkında Bilgilendirme',
    text: `Merhaba, kazancınız başarıyla işlenmiştir. Toplam kazancınız: ${earnings} TL.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-posta başarıyla gönderildi.');
  } catch (error) {
    console.log('E-posta gönderme hatası:', error);
  }
};
