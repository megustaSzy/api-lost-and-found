import { Request, Response } from "express"
import { userService } from "../services/userService"
import prisma from "../lib/prisma";

export const userController = {

    async getAllUsers(req: Request, res: Response) {
        const users = await userService.getAllUsers();

        res.status(200).json({
            users,
            success: true
        });
    },

    async getUserById(req: Request, res: Response) {

        const id = Number(req.params.id)

        if(isNaN(id)) {
            return res.status(400).json({
                message: "id tidak valid",
                success: false
            })
        }

        const userId = await userService.getUserById(id);

        if(!userId) {
            return res.status(404).json({
                message: "id tidak ditemukan",
                success: false
            });
        }

        res.status(200).json({
            userId,
            success: true
        });
    },

    async editUser(req: Request, res: Response) {
    
        const editId = Number(req.params.id);

        if(isNaN(editId)) {
            return res.status(400).json({
                message: "id tidak valid",
                success: false
            });
        }

        const updatedUser = await userService.updateUserById(editId, req.body)

        res.status(200).json({
            message: "user berhasil diubah",
            success: true,
            user: updatedUser
        });
    },

    async deleteUser(req: Request, res: Response) {

        const deleteId = Number(req.params.id)

        if(isNaN(deleteId)) {
            return res.status(400).json({
                message: "id tidak valid",
                success: false
            });
        }

        const deleteUser = await userService.deleteUserById(deleteId)

        if(!deleteUser) {
            return res.status(400).json({
                message: "user gagal dihapus",
                success: false
            });
        }

        res.status(200).json({
            message: "user berhasil dihapus",
            success: true
        })

    },

    async addUser (req: Request, res: Response) {
        const user = await userService.addUserNew(req.body)

        res.status(200).json({
            message: "berhasil membuat akun",
            success: true,
            user
        })
    }


}
