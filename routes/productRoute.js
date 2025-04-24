import express from "express";
import { userControlAuth } from "../middleware/authMiddleware.js";
import {upload, uploadToCloudinary } from "../middleware/uploadMiddleware.js";
import { addUserProduct, deleteUserProduct, getUserProduct,updateStock,confirmCart, updatePaymentStatus } from "../controllers/productController.js";



const router = express.Router();

router.post('/', upload.single('photo'), uploadToCloudinary,addUserProduct);
router.get('/',  getUserProduct);
router.delete('/:id',  deleteUserProduct);
router.put('/:productId', updateStock);
router.post('/confirm',  confirmCart);
router.post('/payment',  updatePaymentStatus);



export default router;
