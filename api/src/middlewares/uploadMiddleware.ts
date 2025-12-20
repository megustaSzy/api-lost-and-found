import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, any, cb) {
    cb(null, "public/uploads");
  },

  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
