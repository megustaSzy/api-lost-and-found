import { Request, Response, NextFunction } from "express";

export const authorizeRoles = (...allowedRoles: string[]) => {
    
    return (req: Request, res: Response, next: NextFunction) => {

        const user = (req as any).user;

        if (!user) {
            return res.status(401).json({
                message: "unauthorized",
                success: false,
            });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({
                message: "role tidak memiliki akses",
                success: false,
            });
        }

        next();
    };
};
