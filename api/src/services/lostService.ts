import prisma from "../lib/prisma";
import { LostData } from "../types/lost";
import { createError } from "../utils/createError";
import { Pagination } from "../utils/Pagination";

export const lostService = {
  async createLost(userId: number, data: LostData) {
    return prisma.tb_lostReport.create({
      data: {
        namaBarang: data.namaBarang,
        deskripsi: data.deskripsi,
        lokasiHilang: data.lokasiHilang,
        tanggal: data.tanggal ? new Date(data.tanggal) : null,
        userId,
      },
    });
  },

  async getMyLostReports(userId: number, page: number, limit: number) {
    const pagination = new Pagination(page, limit);

    const [count, rows] = await Promise.all([
      prisma.tb_lostReport.count({
        where: { userId },
      }),
      prisma.tb_lostReport.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.limit,
      }),
    ]);

    return pagination.paginate({ count, rows });
  },
  async getAllLost(page: number, limit: number) {
    const pagination = new Pagination(page, limit);

    const [count, rows] = await Promise.all([
      prisma.tb_lostReport.count(),
      prisma.tb_lostReport.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: pagination.skip,
        take: pagination.limit,
      }),
    ]);

    return pagination.paginate({ count, rows });
  },
  async getLostById(id: number) {
    return prisma.tb_lostReport.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        foundReport: true,
      },
    });
  },

  async updateLostReport(id: number, userId: number, data: LostData) {
    const existing = await prisma.tb_lostReport.findUnique({ where: { id } });
    if (!existing) throw createError("Laporan tidak ditemukan", 404);
    if (existing.userId !== userId)
      throw createError("Tidak bisa mengedit laporan milik orang lain", 400);

    return prisma.tb_lostReport.update({ where: { id }, data });
  },
  async updateLostStatus(id: number, status: "APPROVED" | "REJECTED") {
    const existing = await prisma.tb_lostReport.findUnique({
      where: { id },
      include: { foundReport: true },
    });

    if (!existing) throw new Error("Laporan tidak ditemukan");

    if (status === "APPROVED" && !existing.foundReport) {
      await prisma.tb_foundReports.create({
        data: {
          namaBarang: existing.namaBarang,
          deskripsi: existing.deskripsi,
          lokasiTemu: existing.lokasiHilang,
          tanggal: existing.tanggal,
          lostReportId: existing.id,
          statusFound: "CLAIMED",
        },
      });
    }

    return prisma.tb_lostReport.update({
      where: { id },
      data: { status },
    });
  },

  async deleteLostReport(id: number, userId: number) {
    const existing = await prisma.tb_lostReport.findUnique({ where: { id } });
    if (!existing) throw new Error("Laporan tidak ditemukan");
    if (existing.userId !== userId)
      throw new Error("Tidak bisa menghapus laporan milik orang lain");

    return prisma.tb_lostReport.delete({ where: { id } });
  },
};
