import express from 'express';
import referralStats from '../models/referralStats.js';
import { userControlAuth } from '../middleware/authMiddleware.js';
import { getMyTeamReferralstats } from '../controllers/referralStatsController.js';

const router = express.Router();


router.get('/qazanc', async (req, res) => {
    try {
        const salaries = await referralStats.find().sort({});
        res.json(salaries);
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası', error: err });
    }
});

router.get('/mane', userControlAuth, getMyTeamReferralstats);


export default router;
