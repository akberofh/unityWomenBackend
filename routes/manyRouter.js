import express from "express";
import { adminControlAuth, userControlAuth } from "../middleware/authMiddleware.js";
import { deleteById, getMany, manyAdd, manyUpdate } from "../controllers/manyController.js";



const router = express.Router();

router.get('/many', getMany)
router.post('/manyAdd', userControlAuth, adminControlAuth,  manyAdd);
router.put('/manyId/:id',  userControlAuth , adminControlAuth ,  manyUpdate);

router.delete('/:id', userControlAuth, adminControlAuth,  deleteById);

export default router;
