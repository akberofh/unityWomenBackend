import cron from 'node-cron';
import {  run } from '../config/qazanc.js';

// Her 6 saatte bir Azerbaycan saatiyle çalışır: 00:00, 06:00, 12:00, 18:00
const qazancJob = cron.schedule(
  '0 */4 * * *',
  async () => {
    try {
      console.log('✅ Maaş hesaplama başlatılıyor (AZT - Her 6 saatte bir)');
      const result = await run();
      console.log('💰 Maaşlar başarıyla hesaplandı:', result);
    } catch (error) {
      console.error('❌ Maaş hesaplama sırasında hata:', error.message);
    }
  },
  {
    timezone: 'Asia/Baku', 
  }
);

qazancJob.start();

export default qazancJob;
