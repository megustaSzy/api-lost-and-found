import { Router } from "express";
import multer from "multer";
import { foundController } from "../controllers/foundController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";
import { upload } from "../middlewares/uploadMiddleware";

const router = Router();

// POST /api/found → admin + upload image optional
// router.post("/", authMiddleware, authorizeRoles("Admin"), upload.single("image"), foundController.createFound);

// GET /api/found/user/pending
router.get("/user/pending", authMiddleware, foundController.getFoundPendingForUser);
router.get("/user/history", authMiddleware, foundController.getFoundHistoryForUser);

// GET all found
router.get("/", authMiddleware, foundController.getAllFound);
router.get("/:id", authMiddleware, foundController.getFoundById);

// PATCH update found & status
router.patch("/:id", authMiddleware, authorizeRoles("Admin"), foundController.updateFound);
router.patch("/:id/status", authMiddleware, authorizeRoles("Admin"), foundController.updateFoundStatus);

// DELETE
router.delete("/:id", authMiddleware, authorizeRoles("Admin"), foundController.deleteFound);

router.post(
  "/admin/foundreports", authMiddleware, authorizeRoles("Admin"), upload.single("image"), foundController.createAdminFoundReport);

// GET laporan admin
router.get("/foundreports/admin", authMiddleware, foundController.getAdminFoundReports);

export default router;