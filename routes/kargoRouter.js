import express from "express";
import { adminControlAuth, userControlAuth } from "../middleware/authMiddleware.js";
import { deleteById, getKargo, kargoAdd, kargoUpdate } from "../controllers/kargoController.js";



const router = express.Router();

router.get('/kargo', getKargo)
router.post('/kargoAdd', userControlAuth, adminControlAuth,  kargoAdd);
router.put('/kargoId/:id',  userControlAuth , adminControlAuth ,  kargoUpdate);

router.delete('/:id', userControlAuth, adminControlAuth,  deleteById);

export default router;
