import express from "express";
import { adminControlAuth, userControlAuth } from "../middleware/authMiddleware.js";
import {upload, uploadToCloudinary } from "../middleware/uploadMiddleware.js";
import { catagoryAd, catagoryUpdate, deleteById, getCatagory } from "../controllers/catagoryController.js";



const router = express.Router();

router.get('/', getCatagory)
router.post('/', upload.single('photo'), uploadToCloudinary ,userControlAuth, adminControlAuth, catagoryAd);
router.put('/:id', upload.single('photo'), uploadToCloudinary, catagoryUpdate);

router.delete('/:id', userControlAuth, adminControlAuth, deleteById);

export default router;
