import express from "express";
import { adminControlAuth, userControlAuth } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { catagoryAd, catagoryUpdate, deleteById, getCatagory } from "../controllers/catagoryController.js";



const router = express.Router();

router.get('/', getCatagory)
router.post('/', upload.single('photo'),catagoryAd);
router.put('/:id', upload.single('photo'),  catagoryUpdate);

router.delete('/:id', userControlAuth, deleteById);

export default router;
