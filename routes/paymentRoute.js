import express from 'express'
import{ upload, uploadToCloudinary } from '../middleware/uploadMiddleware.js'
import { deleteById,  getByIdQolbaq, getQolbaq, qolbaqAdd } from '../controllers/paymentController.js'
import {  adminOrAdministratorAuth, userControlAuth } from '../middleware/authMiddleware.js'

const router = express.Router()


router.get('/paymentId/:confirmedCartId', userControlAuth,  getQolbaq)

router.get('/id/:id', userControlAuth , adminOrAdministratorAuth,  getByIdQolbaq)


router.post('/', upload.single('photo'), uploadToCloudinary, userControlAuth,   qolbaqAdd)


router.delete('/:id', userControlAuth, adminOrAdministratorAuth,   deleteById)


export default router