import { Router } from "express";
import { foundController } from "../controllers/foundController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = Router();

// Hanya admin boleh tambah found
router.post("/", authMiddleware, authorizeRoles("Admin"), foundController.createFound);

router.get("/user/pending", authMiddleware, foundController.getFoundPendingForUser);
router.get("/user/history", authMiddleware, foundController.getFoundHistoryForUser);

// User & admin boleh lihat semua found
router.get("/", authMiddleware, foundController.getAllFound);
router.get("/:id", authMiddleware, foundController.getFoundById);

// Hanya admin boleh edit found
router.patch("/:id", authMiddleware, authorizeRoles("Admin"), foundController.updateFound);

// **PATCH khusus untuk update status**
router.patch("/:id/status", authMiddleware, authorizeRoles("Admin"), foundController.updateFoundStatus);

// Hanya admin yang bisa delete
router.delete("/:id", authMiddleware, authorizeRoles("Admin"), foundController.deleteFound);

export default router;
