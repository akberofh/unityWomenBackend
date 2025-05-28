import express from 'express'
import {upload, uploadToCloudinary } from '../middleware/uploadMiddleware.js'
import { deleteById, getByCategoryQolbaq, getByIdQolbaq, getQolbaq, qolbaqAdd, qolbaqUpdate } from '../controllers/qolbaqController.js'
import {  adminOrAdministratorAuth, userControlAuth } from '../middleware/authMiddleware.js'

const router = express.Router()


router.get('/:userId?', getQolbaq)

router.get('/catagory/:catagory/:userId?', getByCategoryQolbaq)


router.post('/',  userControlAuth , adminOrAdministratorAuth , upload.array('photo'),uploadToCloudinary,  qolbaqAdd)

router.get('/id/:id/:userId?', getByIdQolbaq)

router.delete('/:id', userControlAuth, adminOrAdministratorAuth, deleteById)

router.put('/:id', userControlAuth, adminOrAdministratorAuth, upload.array('photo'), uploadToCloudinary,  qolbaqUpdate);


router.patch('/:id', (req, res) => {
    res.json({msg: 'update metod'})
})

export default router