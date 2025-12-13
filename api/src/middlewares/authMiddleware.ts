import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { ResponseData } from "../utils/Response";

interface JwtPayload {
  id: number;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  // 1. Cek header Authorization
  if (!authHeader) {
    return ResponseData.unauthorized(
      res,
      "Authorization header tidak ditemukan"
    );
  }

  // 2. Cek format Bearer
  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return ResponseData.unauthorized(res, "Format token tidak valid");
  }

  try {
    // 3. Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // 4. Ambil user dari database
    const user = await prisma.tb_user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return ResponseData.unauthorized(res, "User tidak ditemukan");
    }

    // 5. Inject user ke request
    (req as any).user = user;

    next();
  } catch (error) {
    return ResponseData.forbidden(res, "Token tidak valid atau sudah expired");
  }
};
