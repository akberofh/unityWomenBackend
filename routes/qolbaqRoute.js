import express from 'express'
import {upload, uploadToCloudinary } from '../middleware/uploadMiddleware.js'
import { deleteById, getByCategoryQolbaq, getByIdQolbaq, getQolbaq, qolbaqAdd, qolbaqUpdate } from '../controllers/qolbaqController.js'
import {  userControlAuth , adminOrAdminstratorAuth} from '../middleware/authMiddleware.js'

const router = express.Router()


router.get('/', getQolbaq)

router.get('/:catagory', getByCategoryQolbaq)


router.post('/', upload.single('photo'),uploadToCloudinary,  userControlAuth, adminOrAdminstratorAuth,  qolbaqAdd)

router.get('/id/:id', getByIdQolbaq)

router.delete('/:id', userControlAuth, adminOrAdminstratorAuth, deleteById)

router.put('/:id', upload.single('photo'), uploadToCloudinary, userControlAuth, adminOrAdminstratorAuth, qolbaqUpdate);


router.patch('/:id', (req, res) => {
    res.json({msg: 'update metod'})
})

export default router