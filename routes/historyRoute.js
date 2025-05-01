import express from 'express';
import Salary from '../models/salaryModel.js';
import { getMyTeamSalariess } from '../controllers/salaryController.js';
import { userControlAuth } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/history', async (req, res) => {
    try {
        const salaries = await Salary.find().sort({});
        res.json(salaries);
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası', error: err });
    }
});




router.get('/vanHistory', userControlAuth, getMyTeamSalariess);


export default router;


