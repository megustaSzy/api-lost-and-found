import fs from "fs";
import path from "path";
import prisma from "../lib/prisma";

// Simpan gambar lost report
export const saveLostReportImage = async (file: Express.Multer.File, reportId: number) => {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${file.originalname}`;
  fs.writeFileSync(path.join(uploadDir, filename), file.buffer);

  const imageUrl = `/uploads/${filename}`;

  await prisma.tb_lostReport.update({
    where: { id: reportId },
    data: { imageUrl },
  });

  return imageUrl;
};

// Simpan gambar found report
export const saveFoundReportImage = async (file: Express.Multer.File, reportId: number) => {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${file.originalname}`;
  fs.writeFileSync(path.join(uploadDir, filename), file.buffer);

  const imageUrl = `/uploads/${filename}`;

  await prisma.tb_foundReports.update({
    where: { id: reportId },
    data: { imageUrl },
  });

  return imageUrl;
};