import cron from 'node-cron';
import ConfirmedCart from '../models/confirmedCartModel.js';
import Product from '../models/productModel.js';
import QolbaqModel from '../models/qolbaqModel.js';

cron.schedule('*/1 * * * *', async () => { // Her dakika çalışacak
  console.log('Cron job çalıştı ve sepetleri kontrol ediyor...');
  const oneMinuteAgo = new Date();
  oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);  // 1 dakika öncesi

  try {
    // 'pending' ödeme durumu olan ve 1 dakikadan eski sepetleri al
    const expiredCarts = await ConfirmedCart.find({
      confirmedAt: { $lt: oneMinuteAgo },
      paymentStatus: 'pending',
    });

    for (let cart of expiredCarts) {
      console.log(`Sepet bulundu ve siliniyor: ${cart._id}`);

      // Sepetteki her ürün için işlemleri yap
      for (let item of cart.products) {
        // Ürün bilgilerini `Product` üzerinden al
        const product = await Product.findById(item.productId);
        if (product) {
          console.log(`Product modelinde ürün bulundu: ${product.title} (ID: ${item.productId})`);

          // QolbaqModel'deki ürünün stok bilgisini güncelle
          const qolbaqProduct = await QolbaqModel.findById(product.productId); // Burada doğru ID'yi kullanıyoruz
          if (qolbaqProduct) {
            console.log(`QolbaqModel'de stok güncelleniyor: ${qolbaqProduct.title}`);
            qolbaqProduct.stock += item.quantity;  // Sepetteki ürün miktarı kadar stok artırılır
            await qolbaqProduct.save();  // Güncellenen stok kaydedilir
          } else {
            console.log(`QolbaqModel'de ürün bulunamadı: ${product.productId}`);
          }

          // Product modelinden ürünü sil
          await Product.findByIdAndDelete(item.productId); // Sepetteki ürünü sil
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
