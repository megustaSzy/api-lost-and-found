import { Router } from "express";
import { lostController } from "../controllers/lostController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", authMiddleware, authorizeRoles("User"), lostController.createLost);

router.get("/me", authMiddleware, authorizeRoles("User"), lostController.getMyLost);

router.get("/", authMiddleware, authorizeRoles("Admin"), lostController.getAllLost);

router.get("/:id", authMiddleware, lostController.getLostById);

router.put("/:id", authMiddleware, authorizeRoles("User"), lostController.updateLost);

router.delete("/:id", authMiddleware, authorizeRoles("User"), lostController.deleteLost);

router.patch("/:id/status", authMiddleware, authorizeRoles("Admin"), lostController.updateLostStatus);

export default router;
