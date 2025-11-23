import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { createError } from "../utils/createError";
import { UserData } from "../types/user";

export const userService = {

    // GET all
    async getAllUsers() {
        return prisma.tb_user.findMany({
            where: { role: 'User' },
                select: {
                id: true,
                name: true,
                email: true,
                role: true,
                notelp: true
            },
            orderBy: { id: 'asc' }
            });
    },
    // GET by ID
    async getUserById(id: number) {
        return prisma.tb_user.findUnique({
            where: {
                id
            }
        });
    },

    // update user by ID
    async updateUserById(id: number, data: UserData) {
        
        const user = await prisma.tb_user.findUnique({
            where: {
                id
            }
        });

        if(!user) createError("id tidak ditemukan", 404);

        if(data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        return prisma.tb_user.update({
            where: {
                id
            },
            data
        });
    },

    async deleteUserById(id: number) {
        
        const user = await prisma.tb_user.findUnique({
            where: {
                id
            }
        });

        if(!user) createError("id tidak ditemukan", 404);

        return prisma.tb_user.delete({
            where: {
                id
            }
        })
    },

}