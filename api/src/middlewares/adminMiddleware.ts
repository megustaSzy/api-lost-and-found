import { Request, Response, NextFunction } from "express";

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user || user.role !== "Admin") {
    return res.status(403).json({
      message: "akses khusus admin",
      success: false
    });
  }

  next();
};
