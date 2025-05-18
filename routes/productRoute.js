import express from "express";
import { userControlAuth } from "../middleware/authMiddleware.js";
import {upload, uploadToCloudinary } from "../middleware/uploadMiddleware.js";
import { addUserProduct, deleteUserProduct, getUserProduct,updateStock,confirmCart, updatePaymentStatus } from "../controllers/productController.js";
import ConfirmedCart from '../models/confirmedCartModel.js';



const router = express.Router();

router.post('/', userControlAuth,upload.single('photo'), uploadToCloudinary,addUserProduct);
router.get('/', userControlAuth, getUserProduct);
router.delete('/:id', userControlAuth, deleteUserProduct);
router.put('/:productId', userControlAuth,updateStock);
router.post('/confirm', userControlAuth, confirmCart);
router.post('/payment', userControlAuth, updatePaymentStatus);

router.get('/payment/:confirmedCartId', async (req, res) => {
  const { confirmedCartId } = req.params;
  const confirmedCart = await ConfirmedCart.findById(confirmedCartId);
  if (!confirmedCart) return res.status(404).json({ error: "Cart not found" });

  // confirmedCart.products sadece onaylanan ürünleri içermeli
  res.json({ products: confirmedCart.products });
});

export default router;
