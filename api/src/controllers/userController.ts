import { userService } from "../services/userService"
import { Request, Response, NextFunction } from "express";
import { ResponseData } from "../utils/Response";

export const userController = {
    
    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await userService.getAllUsers();
    
            return ResponseData.ok(res, users, "berhasil menambah data")

        } catch (error) {
            return ResponseData.serverError(res, error)
        }
    },

    async getUserById(req: Request, res: Response) {
        try {
            
            const id = Number(req.params.id);
    
            if(isNaN(id)) return ResponseData.badRequest(res, "id tidak valid");
    
            const user = await userService.getUserById(id);
    
            if(!user) return ResponseData.notFound(res, "id tidak ditemukan");
    
            return ResponseData.ok(res, user, "data berhasil")
            
        } catch (error) {
            return ResponseData.serverError(res, error)
        };
    },

    async editUser(req: Request, res: Response) {
        try {
            const id = Number(req.params.id)

            if(isNaN(id)) return ResponseData.badRequest(res, "id tidak valid");

            const currentUser = (req as any).user
            
            if (currentUser.role !== "Admin" && currentUser.id !== id) {
                ResponseData.forbidden(res, "akses ditolak")
            }

            const updateUser = await userService.updateUserById(id, req.body);
            
            return ResponseData.ok(res, updateUser, "user berhasil diperbarui");
        } catch (error) {
            return ResponseData.serverError(res, error)
        }
    },

    async deleteUser(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            if(isNaN(id)) return ResponseData.badRequest(res, "id tidak valid");

            const currentUser = (req as any).user
            if(currentUser.role !== "Admin") ResponseData.forbidden(res, "akses ditolak")

            await userService.deleteUserById(id);

            return ResponseData.ok(res, "akses ditolak")
        } catch (error) {
            return ResponseData.serverError(res, error)
        }
    },

    async getProfile(req: Request, res: Response) {
        return ResponseData.ok(res, (req as any).user, "profil berhasil diambil")
    }
}