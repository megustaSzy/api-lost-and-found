import { Router } from "express";
import { countController } from "../controllers/countController";

const router = Router();

router.get("/admin", countController.getAdminDashboardCount);
router.get("/user", countController.getUserDashboardCount);

export default router;