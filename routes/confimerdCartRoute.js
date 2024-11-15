import express from 'express';
import ConfirmedCart from '../models/confirmedCartModel.js';
import { userControlAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Onaylanmış sepetleri görüntüle
router.get('/confirmed', userControlAuth, async (req, res) => {
  try {
    // Kullanıcının ID'sine göre onaylanmış sepetleri getir
    const confirmedCarts = await ConfirmedCart.find({
      user_id: req.user._id,
    }).populate('products.productId'); // Ürün bilgilerini de getirebilmek için populate kullanabilirsin

    // Sepet bulunamazsa hata döndür
    if (confirmedCarts.length === 0) {
      return res.status(404).json({ message: 'Onaylanmış sepet bulunamadı' });
    }

    // Başarılı ise sepetleri gönder
    res.json({ confirmedCarts });
  } catch (error) {
    console.error('Sepetleri getirirken hata:', error.message);
    res.status(500).json({ error: 'Bir hata oluştu' });
  }
});

export default router;
