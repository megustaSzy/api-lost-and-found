import prisma from "../lib/prisma";

interface UserData {
    name: string,
    email: string,
    password: string,
    notelp: string,
    role: "Admin" | "User"
}

export const userService = {

    // GET ALL
    async getAllUsers() {
        return prisma.tb_user.findMany({
            orderBy: {
                id: 'asc'
            }
        })
    },

    async getUserById(id: number) {
        return prisma.tb_user.findUnique({
            where: {
                id
            }
        });
    },

    async updateUserById(id: number, data: UserData) {
        const user = await prisma.tb_user.findUnique({
            where: {
                id
            }
        });

        if(!user) {
            throw new Error ("user tidak ditemukan")
        }

        return prisma.tb_user.update({
            where: {
                id
            },
            data
        })
    },

    async deleteUserById(id: number) {
        const user = await prisma.tb_user.findFirst({
            where: {
                id
            }
        });

        if(!user) {
            throw new Error ("user tidak ditemukan")
        }

        return prisma.tb_user.delete({
            where: {
                id
            }
        })
    },

    async addUserNew(data: UserData) {
        const existingUser = await prisma.tb_user.findUnique({
            where: {
                email: data.email
            }
        });

        if(existingUser) {
            throw new Error("user tidak ditemukan")
        }

        return await prisma.tb_user.create({
            data: {
                name: data.name,
                email: data.email,
                password: data.password,
                notelp: data.notelp,
                role: data.role || "User"
            }
        });
    }
    
}