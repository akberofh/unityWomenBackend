import express from 'express'
import {upload, uploadToCloudinary } from '../middleware/uploadMiddleware.js'
import { deleteById, getByCategoryQolbaq, getByIdQolbaq, getQolbaq, qolbaqAdd, qolbaqUpdate } from '../controllers/qolbaqController.js'
import {  adminorAdminsControlAuth, userControlAuth } from '../middleware/authMiddleware.js'

const router = express.Router()


router.get('/', getQolbaq)

router.get('/:catagory', getByCategoryQolbaq)


router.post('/',  userControlAuth , adminorAdminsControlAuth , upload.array('photo'),uploadToCloudinary,  qolbaqAdd)

router.get('/id/:id', getByIdQolbaq)

router.delete('/:id', userControlAuth, adminorAdminsControlAuth, deleteById)

router.put('/:id', userControlAuth, adminorAdminsControlAuth, upload.single('photo'), uploadToCloudinary,  qolbaqUpdate);


router.patch('/:id', (req, res) => {
    res.json({msg: 'update metod'})
})

export default router