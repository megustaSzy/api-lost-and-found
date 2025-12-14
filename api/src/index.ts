import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { requestLogger } from "./middlewares/logger";

dotenv.config();

import express from "express";
import userRoute from "./routes/userRoute";
import authRoute from "./routes/authRoute";
import lostRoute from "./routes/lostRoute";
import foundRoute from "./routes/foundRoute";
import countRoute from "./routes/countRoute";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(express.json());

app.use(requestLogger);

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    status: 200,
    message: "SERVER API IS RUNNING",
  })
});

// API routes
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/lost", lostRoute);
app.use("/api/found", foundRoute);
app.use("/api/count", countRoute);

app.use("/uploads", express.static("public/uploads"));

export default app;
