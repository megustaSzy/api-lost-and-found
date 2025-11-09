import dotenv from "dotenv";
import cors from "cors"

dotenv.config();

import express from "express";
import userRoutes from "./routes/userRoute"



const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));

app.use(express.json());

app.use("/api/users", userRoutes)

export default app;