import { Request, Response, NextFunction } from "express";
import { ResponseData } from "../utils/Response";

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user || user.role !== "Admin") {
    return ResponseData.forbidden(res, "Akses khusus admin");
  }

  next();
};
