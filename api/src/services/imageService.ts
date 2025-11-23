import fs from "fs";
import path from "path";
import prisma from "../lib/prisma";

// ---------------------------
// Utility: Sanitasi filename
// ---------------------------
const sanitizeFilename = (filename: string) => {
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
};

// ---------------------------
// Utility: Simpan file ke folder
// ---------------------------
const saveFileToUploads = (file: Express.Multer.File) => {
  const uploadDir = path.join(process.cwd(), "public/uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const safeName = sanitizeFilename(file.originalname);
  const filename = `${Date.now()}-${safeName}`;
  const filepath = path.join(uploadDir, filename);

  fs.writeFileSync(filepath, file.buffer);

  return `/uploads/${filename}`;
};

// ---------------------------
// Reusable function untuk update DB
// ---------------------------
const updateImageUrlInDB = async (
  reportId: number,
  imageUrl: string,
  type: "lost" | "found"
) => {
  if (type === "lost") {
    return prisma.tb_lostReport.update({
      where: { id: reportId },
      data: { imageUrl },
    });
  }

  return prisma.tb_foundReports.update({
    where: { id: reportId },
    data: { imageUrl },
  });
};

// ---------------------------
// Public functions
// ---------------------------

// LOST REPORT
export const saveLostReportImage = async (
  file: Express.Multer.File,
  reportId: number
) => {
  if (!file) throw new Error("File tidak ditemukan");
  if (!reportId) throw new Error("Report ID tidak valid");

  const imageUrl = saveFileToUploads(file);

  await updateImageUrlInDB(reportId, imageUrl, "lost");

  return imageUrl;
};

// FOUND REPORT
export const saveFoundReportImage = async (
  file: Express.Multer.File,
  reportId: number
) => {
  if (!file) throw new Error("File tidak ditemukan");
  if (!reportId) throw new Error("Report ID tidak valid");

  const imageUrl = saveFileToUploads(file);

  await updateImageUrlInDB(reportId, imageUrl, "found");

  return imageUrl;
};
