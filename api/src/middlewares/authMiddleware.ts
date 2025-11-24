import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { ResponseData } from "../utils/Response";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return ResponseData.unauthorized(res, "Token tidak ditemukan");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };

    const user = await prisma.tb_user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return ResponseData.unauthorized(res, "User tidak ditemukan");
    }

    (req as any).user = user;
    next();

  } catch (err) {
    return ResponseData.forbidden(res, "Token tidak valid atau sudah expired");
  }
};
