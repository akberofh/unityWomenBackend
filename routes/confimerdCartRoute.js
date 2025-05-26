import express from 'express';
import { adminControlAuth, userControlAuth } from '../middleware/authMiddleware.js';
import { getConfirmcard, getUserProduct } from '../controllers/salaryController.js';
import ConfirmedCart from '../models/confirmedCartModel.js';

const router = express.Router();



router.get('/confirmed', userControlAuth, getUserProduct)



router.get('/adConfirmed', userControlAuth, adminControlAuth , getConfirmcard)

router.put('/update/:id', userControlAuth, adminControlAuth,  async (req, res) => {
  try {
    const { paymentStatus ,gathered } = req.body;

    let updatedData = { paymentStatus , gathered};
    const updatedUser = await ConfirmedCart.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.json({ success: true, updatedUser });
  } catch (error) {
    console.error('Güncelleme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

router.delete('/confirmedCard/:id', async (req, res) => {
    try {
        const deletedCard = await ConfirmedCart.findByIdAndDelete(req.params.id);

        if (!deletedCard) {
            return res.status(404).json({ message: 'Kart bulunamadı.' });
        }

        res.status(200).json({ message: 'Kart başarıyla silindi.', deletedCard });
    } catch (error) {
        console.error('Silme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

export default router;
