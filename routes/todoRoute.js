import express from "express";
import { userControlAuth } from "../middleware/authMiddleware.js";
import { addUserTodo, getUserTodos, deleteUserTodo, updateUserTodo } from "../controllers/todoController.js";
import upload from "../middleware/uploadMiddleware.js";



const router = express.Router();

router.post('/', userControlAuth,upload.single('photo'), addUserTodo);
router.get('/', userControlAuth, getUserTodos);
router.put('/:id',userControlAuth, upload.single('photo'), updateUserTodo);

router.delete('/:id', userControlAuth, deleteUserTodo);

export default router;
