import { Router } from "express";
import multer from "multer";
import { foundController } from "../controllers/foundController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() }); // simpan di memory dulu

// POST /api/found → admin + upload image optional
router.post("/", authMiddleware, authorizeRoles("Admin"), upload.single("image"), foundController.createFound);

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
  "/admin/foundreports",
  authMiddleware,                // cek login
  authorizeRoles("Admin"),       // cek role admin
  upload.single("image"),        // optional: upload file
  foundController.createAdminFoundReport // panggil service createdAdminFoundReport
);

router.get(
  "/foundreports/admin",
  authMiddleware,                // cek login
  foundController.getAdminFoundReports
);


export default router;
