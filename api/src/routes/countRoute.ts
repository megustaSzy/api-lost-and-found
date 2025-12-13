import { Router } from "express";
import { countController } from "../controllers/countController";

const router = Router();

router.get("/", countController.getCount);

export default router;