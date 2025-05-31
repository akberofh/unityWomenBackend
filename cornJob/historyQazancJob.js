import cron from 'node-cron';
import { historyQazanc } from '../config/historyQazanc.js';

// Her ayın 1'i saat 00:00'da Azerbaycan saatine göre çalışır
const historyQazancJob = cron.schedule(
  '0 22 * * *', 
  async () => {
    const now = new Date();

    // Azerbaycan saatine göre tarih (GMT+4)
    const bakuTime = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    const year = bakuTime.getFullYear();
    const month = bakuTime.getMonth();
    const day = bakuTime.getDate();

    // Bu ayın son günü
    const lastDay = new Date(year, month + 1, 0).getDate();

    if (day === lastDay) {
      try {
        console.log('📅 Ayın son günü saat 23:00 - Maaş hesaplama başlıyor');
        const result = await historyQazanc();
        console.log('💰 Maaşlar başarıyla hesaplandı:', result);
      } catch (error) {
        console.error('❌ Maaş hesaplama hatası:', error.message);
      }
    } else {
      console.log('🔕 Bugün ayın son günü değil, işlem yapılmadı.');
    }
  },
  {
    timezone: 'Asia/Baku',
  }
);

historyQazancJob.start();

export default historyQazancJob;
