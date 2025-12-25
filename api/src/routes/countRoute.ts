import { Router } from "express";
import { countController } from "../controllers/countController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/admin", countController.getAdminDashboardCount);
router.get("/user", authMiddleware, countController.getUserDashboardCount);

export default router;