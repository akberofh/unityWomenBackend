import express from 'express'
import upload from '../middleware/uploadMiddleware.js'
import { deleteById,  getByIdQolbaq, getQolbaq, qolbaqAdd } from '../controllers/paymentController.js'
import {  userControlAuth } from '../middleware/authMiddleware.js'

const router = express.Router()


router.get('/', getQolbaq)

router.get('/id/:id', getByIdQolbaq)


router.post('/', upload.single('photo'), userControlAuth,   qolbaqAdd)


router.delete('/:id',  deleteById)


export default router