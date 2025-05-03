import cron from 'node-cron';
import ConfirmedCart from '../models/confirmedCartModel.js';
import Product from '../models/productModel.js';
import QolbaqModel from '../models/qolbaqModel.js';

cron.schedule('*/1 * * * *', async () => {
  console.log('Cron job çalıştı ve sepetleri kontrol ediyor...');
  const fiveMinutesAgo = new Date();
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

  try {
    // 5 dakikadan eski ve 'failed' veya 'paid' olan sepetleri al
    const expiredCarts = await ConfirmedCart.find({
      confirmedAt: { $lt: fiveMinutesAgo },
      paymentStatus: { $in: ['failed', 'paid'] },
    });

    for (let cart of expiredCarts) {
      console.log(`Sepet bulundu ve siliniyor: ${cart._id}`);

      for (let item of cart.products) {
        const product = await Product.findById(item.productId);
        if (product) {
          console.log(`Product modelinde ürün bulundu: ${product.title} (ID: ${item.productId})`);

          // Sadece 'failed' ise stoka geri ekle
          if (cart.paymentStatus === 'failed') {
            const qolbaqProduct = await QolbaqModel.findById(product.productId);
            if (qolbaqProduct) {
              console.log(`QolbaqModel'de stok güncelleniyor: ${qolbaqProduct.title}`);
              qolbaqProduct.stock += item.quantity;
              await qolbaqProduct.save();
            } else {
              console.log(`QolbaqModel'de ürün bulunamadı: ${product.productId}`);
            }
          }

          // Product modelinden ürünü sil
          await Product.findByIdAndDelete(item.productId);
          console.log(`Product modelinden ürün silindi: ${item.productId}`);
        } else {
          console.log(`Product modelinde ürün bulunamadı: ${item.productId}`);
        }
      }

      // Sepet silinir
      await ConfirmedCart.findByIdAndDelete(cart._id);
      console.log(`Sepet silindi: ${cart._id}`);
    }
  } catch (error) {
    console.error('Cron job sırasında hata:', error.message);
  }
});

export default cron;
