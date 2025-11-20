import { Request, Response } from "express";
import { saveLostReportImage, saveFoundReportImage } from "../services/imageService";

// Upload gambar lost report
export const uploadLostReportImage = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const reportId = Number(req.params.id);
    if (!reportId) return res.status(400).json({ message: "Report ID is required" });

    const imageUrl = await saveLostReportImage(file, reportId);

    return res.json({ message: "Lost report image uploaded", imageUrl });
  } catch (err: any) {
    return res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

// Upload gambar found report
export const uploadFoundReportImage = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const reportId = Number(req.params.id);
    if (!reportId) return res.status(400).json({ message: "Report ID is required" });

    const imageUrl = await saveFoundReportImage(file as Express.Multer.File, reportId);
    return res.json({ message: "Found report image uploaded", imageUrl });
  } catch (err: any) {
    return res.status(500).json({ message: "Upload failed", error: err.message });
  }
};
