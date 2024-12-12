import express from 'express'
import upload from '../middleware/uploadMiddleware.js'
import { deleteById, getByCategoryQolbaq, getByIdQolbaq, getQolbaq, qolbaqAdd, qolbaqUpdate } from '../controllers/qolbaqController.js'
import { adminControlAuth, userControlAuth } from '../middleware/authMiddleware.js'

const router = express.Router()


router.get('/', getQolbaq)

router.get('/:catagory', getByCategoryQolbaq)


router.post('/', upload.single('photo'), userControlAuth, adminControlAuth,  qolbaqAdd)

router.get('/id/:id', getByIdQolbaq)

router.delete('/:id',  deleteById)

router.put('/:id', upload.single('photo'), qolbaqUpdate);


router.patch('/:id', (req, res) => {
    //req.params.id
    res.json({msg: 'update metod'})
})

export default router