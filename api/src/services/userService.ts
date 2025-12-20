import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { createError } from "../utils/createError";
import { UserData } from "../types/user";

export const userService = {
  // GET all
  async getAllUsers() {
    return prisma.tb_user.findMany({
      where: { role: "User" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        notelp: true,
      },
      orderBy: { id: "asc" },
    });
  },
  // GET by ID
  async getUserById(id: number) {
    return prisma.tb_user.findUnique({
      where: {
        id,
      },
    });
  },

  // update user by ID
  async updateUserById(id: number, data: UserData) {
    const user = await prisma.tb_user.findUnique({ where: { id } });

    if (!user) {
      throw createError("id tidak ditemukan", 404);
    }

    const updateData: Partial<UserData> = {};

    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return prisma.tb_user.update({
      where: { id },
      data: updateData,
    });
  },

  async deleteUserById(id: number) {
    const user = await prisma.tb_user.findUnique({
      where: {
        id,
      },
    });

    if (!user) createError("id tidak ditemukan", 404);

    return prisma.tb_user.delete({
      where: {
        id,
      },
    });
  },
};
