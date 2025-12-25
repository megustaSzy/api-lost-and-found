import { Response, Request, NextFunction } from "express";
import { ResponseData } from "../utils/Response";

export const authorizeRoles = (...allowedRoles: ("Admin" | "User")[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as { role: "Admin" | "User" } | undefined;

    if (!user) return ResponseData.unauthorized(res, "Unauthorized");

    if (!allowedRoles.includes(user.role)) {
      return ResponseData.forbidden(res, "Role tidak memiliki akses");
    }

    next();
  };
};
