import express from "express";
import {upload, uploadToCloudinary } from "../middleware/uploadMiddleware.js";
import { catagoryAd, catagoryUpdate, deleteById, getCatagory } from "../controllers/catagoryController.js";



const router = express.Router();

router.get('/', getCatagory)
router.post('/', upload.single('photo'), uploadToCloudinary , catagoryAd);
router.put('/:id', upload.single('photo'), uploadToCloudinary, catagoryUpdate);

router.delete('/:id', deleteById);

export default router;
