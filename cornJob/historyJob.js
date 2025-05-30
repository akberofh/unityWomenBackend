import cron from 'node-cron';
import { history } from '../config/history.js';

// Her ayın 1'i saat 00:00'da Azerbaycan saatine göre çalışır
const historyJob = cron.schedule(
  '0 0 1 * *',
  async () => {
    try {
      console.log('✅ Yeni ay başladı, maaş hesaplama başlıyor (AZT - Ayın 1-i 00:00)');
      const result = await history();
      console.log('💰 Maaşlar başarıyla hesaplandı:', result);
    } catch (error) {
      console.error('❌ Maaş hesaplama sırasında hata:', error.message);
    }
  },
  {
    timezone: 'Asia/Baku', // AZT (UTC+4)
  }
);

historyJob.start();

export default historyJob;
