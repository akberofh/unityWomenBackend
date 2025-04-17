import express from 'express';
import Salary from '../models/salaryModel.js';

const router = express.Router();


router.get('/maas', async (req, res) => {
    try {
      const salaries = await Salary.find().sort({});
      res.json(salaries);
    } catch (err) {
      res.status(500).json({ message: 'Sunucu hatası', error: err });
    }
  });

  export default router;
