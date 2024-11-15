import express from "express";
import { userControlAuth } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { addUserProduct, deleteUserProduct, getUserProduct,updateStock,confirmCart, updatePaymentStatus } from "../controllers/productController.js";



const router = express.Router();

router.post('/', userControlAuth,upload.single('photo'), addUserProduct);
router.get('/', userControlAuth, getUserProduct);
router.delete('/:id', userControlAuth, deleteUserProduct);
router.put('/:productId', userControlAuth,updateStock);
router.post('/confirm', userControlAuth, confirmCart);
router.post('/payment', userControlAuth, updatePaymentStatus);



export default router;
