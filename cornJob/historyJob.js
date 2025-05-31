import cron from 'node-cron';
import { history } from '../config/history.js';

const historyJob = cron.schedule(
  '0 23 * * *', // Her gün saat 23:00'te çalışır
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
        const result = await history();
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

historyJob.start();

export default historyJob;
