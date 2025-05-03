import cron from 'node-cron';
import ConfirmedCart from '../models/confirmedCartModel.js';
import Product from '../models/productModel.js';
import QolbaqModel from '../models/qolbaqModel.js';

const cronproduct = cron.schedule('*/1 * * * *', async () => {
  console.log('Cron job çalıştı ve sepetleri kontrol ediyor...');
  const oneMinuteAgo = new Date();
  oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

  try {
    const expiredCarts = await ConfirmedCart.find({
      confirmedAt: { $lt: oneMinuteAgo },
      paymentStatus: { $in: ['failed', 'paid'] }, // sadece failed ve paid olanlar
    });

    for (let cart of expiredCarts) {
      console.log(`Sepet bulundu: ${cart._id} - Durum: ${cart.paymentStatus}`);

      for (let item of cart.products) {
        const product = await Product.findById(item.productId);
        if (product) {
          console.log(`Product bulundu: ${product.title} (ID: ${item.productId})`);

          // sadece paymentStatus "failed" ise stok geri eklensin
          if (cart.paymentStatus === 'failed') {
            const qolbaqProduct = await QolbaqModel.findById(product.productId);
            if (qolbaqProduct) {
              console.log(`Stok geri ekleniyor: ${qolbaqProduct.title}`);
              qolbaqProduct.stock += item.quantity;
              await qolbaqProduct.save();
            } else {
              console.log(`QolbaqModel'de ürün bulunamadı: ${product.productId}`);
            }
          }

          // Ürün her durumda silinsin
          await Product.findByIdAndDelete(item.productId);
          console.log(`Product silindi: ${item.productId}`);
        } else {
          console.log(`Product bulunamadı: ${item.productId}`);
        }
      }

      // sadece "failed" olan sepetler tamamen silinsin
      if (cart.paymentStatus === 'failed') {
        await ConfirmedCart.findByIdAndDelete(cart._id);
        console.log(`Sepet silindi: ${cart._id}`);
      } else {
        console.log(`Sepet "paid" durumunda, silinmedi: ${cart._id}`);
      }
    }
  } catch (error) {
    console.error('Cron job sırasında hata:', error.message);
  }
});

export default cronproduct;
