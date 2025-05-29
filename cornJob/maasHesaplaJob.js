import cron from 'node-cron';
import { getAllUsersSalary } from '../config/maasHesaplama.js';

// Her 6 saatte bir Azerbaycan saatiyle çalışır: 00:00, 06:00, 12:00, 18:00
const maasHesaplaJob = cron.schedule(
  '0 */6 * * *',
  async () => {
    try {
      console.log('✅ Maaş hesaplama başlatılıyor (AZT - Her 6 saatte bir)');
      const result = await getAllUsersSalary();
      console.log('💰 Maaşlar başarıyla hesaplandı:', result);
    } catch (error) {
      console.error('❌ Maaş hesaplama sırasında hata:', error.message);
    }
  },
  {
    timezone: 'Asia/Baku', // Azerbaycan saat dilimi
  }
);

maasHesaplaJob.start();

export default maasHesaplaJob;
