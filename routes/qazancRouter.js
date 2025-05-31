import express from 'express';
import referralStats from '../models/referralStats.js';
import referralStates from '../models/yeniQazancModel.js';
import { adminControlAuth, userControlAuth } from '../middleware/authMiddleware.js';
import { getMyTeamReferralstats } from '../controllers/referralStatsController.js';
import { getMyTeamSalar } from '../controllers/salaryController.js';

const router = express.Router();


router.get('/qazanc',userControlAuth, adminControlAuth,  async (req, res) => {
    try {
        const salaries = await referralStats.find().sort({});
        res.json(salaries);
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası', error: err });
    }
});


router.get('/Historyqazanc',   async (req, res) => {
    try {
        const salaries = await referralStates.find().sort({});
        res.json(salaries);
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası', error: err });
    }
});


router.get('/mane', userControlAuth, getMyTeamReferralstats);


router.get('/historyQOne', userControlAuth, getMyTeamSalar);


export default router;
