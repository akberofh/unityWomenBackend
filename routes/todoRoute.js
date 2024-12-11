import express from "express";
import { userControlAuth } from "../middleware/authMiddleware.js";
import { addUserTodo, getUserTodos, deleteUserTodo } from "../controllers/todoController.js";
import upload from "../middleware/uploadMiddleware.js";



const router = express.Router();

router.post('/', userControlAuth, upload.single('photo'), addUserTodo);
router.get('/', userControlAuth, getUserTodos);

router.delete('/:id', userControlAuth, deleteUserTodo);

export default router;
