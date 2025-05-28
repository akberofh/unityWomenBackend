import express from "express";
import { adminOrAdministratorAuth, userControlAuth } from "../middleware/authMiddleware.js";
import { deleteById, getMany, manyAdd, manyUpdate } from "../controllers/manyController.js";



const router = express.Router();

router.get('/many', getMany)
router.post('/manyAdd', userControlAuth, adminOrAdministratorAuth,  manyAdd);
router.put('/manyId/:id',  userControlAuth , adminOrAdministratorAuth ,  manyUpdate);

router.delete('/:id', userControlAuth, adminOrAdministratorAuth,  deleteById);

export default router;
