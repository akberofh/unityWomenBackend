import express from "express";
import {upload, uploadToCloudinary } from "../middleware/uploadMiddleware.js";
import { catagoryAd, catagoryUpdate, deleteById, getCatagory } from "../controllers/catagoryController.js";
import {  adminOrAdministratorAuth, userControlAuth } from "../middleware/authMiddleware.js";



const router = express.Router();

router.get('/', getCatagory)
router.post('/', userControlAuth, adminOrAdministratorAuth , upload.single('photo'), uploadToCloudinary , catagoryAd);
router.put('/:id', userControlAuth ,adminOrAdministratorAuth , upload.single('photo'), uploadToCloudinary, catagoryUpdate);

router.delete('/:id', userControlAuth , adminOrAdministratorAuth,  deleteById);

export default router;
