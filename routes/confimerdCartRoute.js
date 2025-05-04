import express from 'express';
import { userControlAuth } from '../middleware/authMiddleware.js';
import { getUserProduct } from '../controllers/salaryController.js';

const router = express.Router();



router.get('/confirmed', userControlAuth, getUserProduct)



export default router;
