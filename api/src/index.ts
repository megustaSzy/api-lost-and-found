import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { requestLogger } from "./middlewares/logger";

import userRoute from "./routes/userRoute";
import authRoute from "./routes/authRoute";
import lostRoute from "./routes/lostRoute";
import foundRoute from "./routes/foundRoute";
import countRoute from "./routes/countRoute";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://lost-and-found.vercel.app",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.use(requestLogger);

app.get("/", (req, res) => {
  res.json({
    status: 200,
    message: "SERVER API IS RUNNING",
  });
});

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/lost", lostRoute);
app.use("/api/found", foundRoute);
app.use("/api/count", countRoute);

export default app;
