import { Request, Response, NextFunction } from "express";
import { ResponseData } from "../utils/Response";

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    
    const user = (req as any).user;

    if (!user) {
      return ResponseData.unauthorized(res, "Unauthorized");
    }

    if (!allowedRoles.includes(user.role)) {
      return ResponseData.forbidden(res, "Role tidak memiliki akses");
    }

    next();
  };
};
