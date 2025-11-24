import { Router } from "express";
import multer from "multer";
import { uploadController } from "../controllers/imageController";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload gambar lost report
router.post("/lost-report/:id/upload", upload.single("image"), uploadController.uploadLostReportImage);

// Upload gambar found report
router.post("/found-report/:id/upload", upload.single("image"), uploadController.uploadFoundReportImage);

export default router;
