import { userService } from "../services/userService"
import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/createError";

export const userController = {
    
    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await userService.getAllUsers();
    
            return res.status(200).json({
                success: true,
                message: "Berhasil mengambil data users",
                users
            });

        } catch (error) {
            next(error);
        }
    },

    async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            
            const id = Number(req.params.id);
    
            if(isNaN(id)) createError("id tidak valid", 400);
    
            const user = await userService.getUserById(id);
    
            if(!user) createError("user tidak ditemukan", 404);
    
            return res.status(200).json({
                success: true,
                user
            })
        } catch (error) {
            next(error)
        };
    },

    async editUser(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)

            if(isNaN(id)) createError("id tidak valid", 400);

            const currentUser = (req as any).user
            
            if (currentUser.role !== "Admin" && currentUser.id !== id) {
                throw createError("akses ditolak", 403);
            }

            const updateUser = await userService.updateUserById(id, req.body);
            
            return res.status(200).json({
                success: true,
                message: "user berhasil diperbarui",
                user: updateUser
            })
        } catch (error) {
            next(error)
        }
    },

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);

            if(isNaN(id)) createError("id tidak valid", 400);

            const currentUser = (req as any).user
            if(currentUser.role !== "Admin") createError("akses ditolak", 403);

            await userService.deleteUserById(id);

            return res.status(200).json({
                success: true,
                message: "user berhasil dihapus"
            })
        } catch (error) {
            next(error)
        }
    },

    async getProfile(req: Request, res: Response) {
        return res.status(200).json({
            success: true,
            user: (req as any).user
        })
    }
}