import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import cookieParser from "cookie-parser";
import express, { Request, Response, NextFunction } from "express";
import passport from "./config/passport";

import { requestLogger } from "./middlewares/logger";

import userRoute from "./routes/userRoute";
import authRoute from "./routes/authRoute";
import lostRoute from "./routes/lostRoute";
import foundRoute from "./routes/foundRoute";
import countRoute from "./routes/countRoute";

const app = express();

// Daftar domain yang diizinkan akses CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://lost-and-found.vercel.app",
  "https://lostnfound-kappa.vercel.app", // tambahkan frontend baru
];

// Middleware CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Jika origin tidak ada (misal Postman), tetap allow
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // wajib kalau pakai cookies
  })
);

// Middleware parsing JSON & cookies
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize())

// Logger request
app.use(requestLogger);

// Health check route
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: 200,
    message: "SERVER API IS RUNNING",
  });
});

// Routes
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/lost", lostRoute);
app.use("/api/found", foundRoute);
app.use("/api/dashboard", countRoute);

// Error handler global
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
