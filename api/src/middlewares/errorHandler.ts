import { Request, Response, NextFunction } from "express"

interface AppError extends Error {
    statusCode?: number
}

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log("error", err);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        message: err.message || "internal server error",
        success: false
    });
};
