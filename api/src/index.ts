import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

dotenv.config();

import express from "express";
import userRoute from "./routes/userRoute";
import authRoute from "./routes/authRoute";
import lostRoute from "./routes/lostRoute";
import foundRoute from "./routes/foundRoute";
import imageRoute from "./routes/imageRoute";
import countRoute from "./routes/countRoute";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(express.json());

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(cookieParser());

// Serve folder uploads agar bisa diakses
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

// API routes
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/lost", lostRoute);
app.use("/api/found", foundRoute);
app.use("/api/image", imageRoute); // upload gambar
app.use("/api/count", countRoute);

app.use(errorHandler);

export default app;
