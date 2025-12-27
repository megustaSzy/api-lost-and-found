import { Router } from "express";
import multer from "multer";
import { foundController } from "../controllers/foundController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";
import { upload } from "../middlewares/uploadMiddleware";

const router = Router();


router.get("/user/pending", authMiddleware, foundController.getFoundPendingForUser);
router.get("/user/history", authMiddleware, foundController.getFoundHistoryForUser);

// found
router.get("/", authMiddleware, foundController.getAllFound);
router.get("/:id", authMiddleware, foundController.getFoundById);

router.patch("/:id", authMiddleware, authorizeRoles("Admin"), foundController.updateFound);
router.patch("/:id/status", authMiddleware, authorizeRoles("Admin"), foundController.updateFoundStatus);

router.delete("/:id", authMiddleware, authorizeRoles("Admin"), foundController.deleteFound);

router.post(
  "/admin/foundreports", authMiddleware, authorizeRoles("Admin"), upload.single("image"), foundController.createAdminFoundReport);

router.get("/foundreports/admin", authMiddleware, foundController.getAdminFoundReport);

export default router;