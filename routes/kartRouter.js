import express from 'express';
import { adminControlAuth, userControlAuth } from '../middleware/authMiddleware.js';
import { getKart, kartAdd } from '../controllers/kartController.js';
import KartModel from '../models/kartModel.js';




const router = express.Router();


router.get('/kart',  getKart)

router.post('/kartAdd' , userControlAuth , adminControlAuth , kartAdd)

router.put('/kart/:id', userControlAuth, adminControlAuth,  async (req, res) => {
    try {
      const { kart} = req.body;
  
      let updatedData = { kart};
      const updateKart = await KartModel.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true }
      );
  
      res.json({ success: true, updateKart });
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
  });



export default router;