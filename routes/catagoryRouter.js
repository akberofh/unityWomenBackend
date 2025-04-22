import express from "express";
import {upload, uploadToCloudinary } from "../middleware/uploadMiddleware.js";
import { catagoryAd, catagoryUpdate, deleteById, getCatagory } from "../controllers/catagoryController.js";
import {  adminorAdminsControlAuth, userControlAuth } from "../middleware/authMiddleware.js";



const router = express.Router();

router.get('/', getCatagory)
router.post('/', userControlAuth, adminorAdminsControlAuth , upload.single('photo'), uploadToCloudinary , catagoryAd);
router.put('/:id', userControlAuth ,adminorAdminsControlAuth , upload.single('photo'), uploadToCloudinary, catagoryUpdate);

router.delete('/:id', userControlAuth , adminorAdminsControlAuth,  deleteById);

export default router;
