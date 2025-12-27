import prisma from "../lib/prisma";
import { FoundData, FoundStatusType, FoundUpdateData } from "../types/found";
import { createError } from "../utils/createError";
import { Pagination } from "../utils/Pagination";

export const foundService = {
  async createFound(data: FoundData) {
    return prisma.tb_foundReports.create({
      data: {
        namaBarang: data.namaBarang,
        deskripsi: data.deskripsi,
        lokasiTemu: data.lokasiTemu,
        tanggal: data.tanggal,
        imageUrl: data.imageUrl || null,
        lostReportId: null,
        statusFound: "PENDING", //
      },
    });
  },

  async createdAdminFound(data: FoundData, adminId: number) {
    if (!data.tanggal) throw createError("Tanggal harus diisi", 400);

    return prisma.tb_foundReports.create({
      data: {
        namaBarang: data.namaBarang,
        deskripsi: data.deskripsi,
        lokasiTemu: data.lokasiTemu,
        tanggal: new Date(data.tanggal).toISOString(),
        imageUrl: data.imageUrl || null,
        imagePublicId: data.imagePublicId,
        createdByAdmin: true,
        adminId,
        lostReportId: null,
        statusFound: "CLAIMED",
      },
    });
  },
  async getAdminFoundReport(page: number, limit: number) {
    const pagination = new Pagination(page, limit);

    const where = {
      createdByAdmin: true,
    };

    const [count, rows] = await Promise.all([
      prisma.tb_foundReports.count({ where }),
      prisma.tb_foundReports.findMany({
        where,
        include: {
          admin: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: pagination.offset,
        take: pagination.limit,
      }),
    ]);

    return pagination.paginate({ count, rows });
  },
  async getAllFound(page: number, limit: number) {
    const pagination = new Pagination(page, limit);

    const where = {};

    const [count, rows] = await Promise.all([
      prisma.tb_foundReports.count({ where }),
      prisma.tb_foundReports.findMany({
        where,
        include: {
          lostReport: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc", // lebih aman dari id
        },
        skip: pagination.offset,
        take: pagination.limit,
      }),
    ]);

    return pagination.paginate({ count, rows });
  },
  async getFoundById(id: number) {
    return prisma.tb_foundReports.findUnique({
      where: { id },
      include: { lostReport: true },
    });
  },

  async updateFound(foundId: number, data: FoundUpdateData) {
    let newStatus: FoundStatusType = "PENDING";

    if (data.lostReportId) {
      await prisma.tb_lostReport.update({
        where: { id: data.lostReportId },
        data: { status: "APPROVED" },
      });

      newStatus = "CLAIMED";
    }

    return prisma.tb_foundReports.update({
      where: { id: foundId },
      data: {
        namaBarang: data.namaBarang,
        deskripsi: data.deskripsi,
        lokasiTemu: data.lokasiTemu,
        tanggal: data.tanggal,
        imageUrl: data.imageUrl || null,
        lostReportId: data.lostReportId ?? null,
        statusFound: newStatus,
      },
    });
  },

  async updateFoundStatus(foundId: number, status: FoundStatusType) {
    const existing = await prisma.tb_foundReports.findUnique({
      where: { id: foundId },
      include: { lostReport: true },
    });

    if (!existing) throw new Error("Laporan ditemukan tidak ditemukan");

    if (status === "CLAIMED" && existing.lostReport) {
      await prisma.tb_lostReport.update({
        where: { id: existing.lostReport.id },
        data: { status: "APPROVED" },
      });
    }

    return prisma.tb_foundReports.update({
      where: { id: foundId },
      data: { statusFound: status },
    });
  },

  async deleteFound(id: number) {
    const existing = await prisma.tb_foundReports.findUnique({ where: { id } });
    if (!existing) throw new Error("Laporan ditemukan tidak ditemukan");

    return prisma.tb_foundReports.delete({ where: { id } });
  },

  async getFoundPendingForUser() {
    return prisma.tb_foundReports.findMany({
      where: { statusFound: "PENDING" },
      orderBy: { id: "desc" },
    });
  },

  async getFoundHistoryForUser() {
    return prisma.tb_foundReports.findMany({
      where: { statusFound: "CLAIMED" },
      orderBy: { id: "desc" },
    });
  },
};
