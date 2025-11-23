import { Router } from "express";
import { userController } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = Router();

// 🔹 Profile user yang sedang login
router.get("/profile", authMiddleware, userController.getProfile);

// 🔹 Hanya Admin boleh melihat semua user
router.get("/", authMiddleware, adminMiddleware, userController.getAllUsers);

// 🔹 Semua user yang login bisa melihat detail user (opsional)
router.get("/:id", authMiddleware, userController.getUserById);

// 🔹 Edit user (boleh oleh user itu sendiri / admin — atur logic di controller)
router.put("/:id", authMiddleware, userController.editUser);

// 🔹 Hanya Admin boleh menghapus user
router.delete("/:id", authMiddleware, adminMiddleware, userController.deleteUser);

export default router;
