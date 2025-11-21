import multer from "multer";
import path from "path";
import fs from "fs";

// pastikan folder uploads ada
const uploadDir = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// konfigurasi storage Multer
export const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: function (req, file, cb) {
    const allowed = [".png", ".jpg", ".jpeg"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error("Hanya file PNG/JPG/JPEG yang diizinkan"));
    }
    cb(null, true);
  },
});
