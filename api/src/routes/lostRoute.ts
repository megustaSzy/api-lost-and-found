import { Router } from "express";
import { lostController } from "../controllers/lostController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// User buat laporan kehilangan
router.post("/", authMiddleware, authorizeRoles("User"), upload.single("image"), lostController.createLost);

// User lihat semua laporan miliknya
router.get("/me", authMiddleware, authorizeRoles("User"), lostController.getMyLost);

// Admin lihat semua laporan
router.get("/", authMiddleware, authorizeRoles("Admin"), lostController.getAllLost);

// Detail laporan
router.get("/:id", authMiddleware, lostController.getLostById);

// User edit laporan miliknya
router.put("/:id", authMiddleware, authorizeRoles("User"), lostController.updateLost);

// User hapus laporan miliknya
router.delete("/:id", authMiddleware, authorizeRoles("User"), lostController.deleteLost);

// Admin approve/reject laporan
router.patch("/:id/status", authMiddleware, authorizeRoles("Admin"), lostController.updateLostStatus);

export default router;
