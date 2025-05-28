import express from "express";
import { adminOrAdministratorAuth, userControlAuth } from "../middleware/authMiddleware.js";
import { deleteById, getKargo, kargoAdd, kargoUpdate } from "../controllers/kargoController.js";



const router = express.Router();

router.get('/kargo', getKargo)
router.post('/kargoAdd', userControlAuth, adminOrAdministratorAuth,  kargoAdd);
router.put('/kargoId/:id',  userControlAuth , adminOrAdministratorAuth ,  kargoUpdate);

router.delete('/:id', userControlAuth, adminOrAdministratorAuth,  deleteById);

export default router;
