import express from "express";
import {  adminOrAdminstratorAuth, userControlAuth } from "../middleware/authMiddleware.js";
import {upload, uploadToCloudinary } from "../middleware/uploadMiddleware.js";
import { catagoryAd, catagoryUpdate, deleteById, getCatagory } from "../controllers/catagoryController.js";



const router = express.Router();

router.get('/', getCatagory)
router.post('/', upload.single('photo'), uploadToCloudinary ,userControlAuth, adminOrAdminstratorAuth, catagoryAd);
router.put('/:id', upload.single('photo'), uploadToCloudinary,userControlAuth, adminOrAdminstratorAuth, catagoryUpdate);

router.delete('/:id',userControlAuth, adminOrAdminstratorAuth, deleteById);

export default router;
