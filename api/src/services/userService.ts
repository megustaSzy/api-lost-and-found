import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { createError } from "../utils/createError";
import { UserData } from "../types/user";
import { Pagination } from "../utils/Pagination";

export const userService = {
  // GET all
  async getAllUsers(page: number, limit: number) {
    const pagination = new Pagination(page, limit);

    const whereClause = {
      role: "User" as const,
    };

    const [count, rows] = await Promise.all([
      prisma.tb_user.count({
        where: whereClause,
      }),
      prisma.tb_user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          notelp: true,
        },
        orderBy: {
          id: "asc",
        },
        skip: pagination.offset,
        take: pagination.limit,
      }),
    ]);

    return pagination.paginate({ count, rows });
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
