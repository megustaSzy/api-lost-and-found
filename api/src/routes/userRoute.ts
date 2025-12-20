import { Router } from "express";
import { userController } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = Router();

router.get("/profile", authMiddleware, userController.getProfile);

router.get("/", authMiddleware, adminMiddleware, userController.getAllUsers);

router.get("/:id", authMiddleware, userController.getUserById);

router.patch("/:id", authMiddleware, userController.editUser);

router.delete("/:id", authMiddleware, adminMiddleware, userController.deleteUser);

export default router;
