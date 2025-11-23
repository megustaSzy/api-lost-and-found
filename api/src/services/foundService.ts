import prisma from "../lib/prisma";
import { FoundData, FoundStatusType, FoundUpdateData } from "../types/found";

export const foundService = {
  async createFound(data: FoundData) {
    return prisma.tb_foundReports.create({
      data: {
        namaBarang: data.namaBarang,
        deskripsi: data.deskripsi,
        lokasiTemu: data.lokasiTemu,
        imageUrl: data.imageUrl || null,
        lostReportId: null,
        statusFound: "PENDING",
      },
    });
  },

  async getAllFound() {
    return prisma.tb_foundReports.findMany({
      include: {
        lostReport: { include: { user: true } }
      },
      orderBy: { id: "desc" }
    });
  },

  async getFoundById(id: number) {
    return prisma.tb_foundReports.findUnique({
        where: { id },
        include: {
            lostReport: true
        }
    });
    },

  async updateFound(foundId: number, data: FoundUpdateData) {

  let newStatus: FoundStatusType = "PENDING";

  // Kalau admin menghubungkan dengan laporan hilang → lost report APPROVED
  if (data.lostReportId) {
    await prisma.tb_lostReport.update({
      where: { id: data.lostReportId },
      data: { status: "APPROVED" }
    });

    // Found report tidak boleh tetap pending
    newStatus = "CLAIMED"; 
  }

  return prisma.tb_foundReports.update({
    where: { id: foundId },
    data: {
      namaBarang: data.namaBarang,
      deskripsi: data.deskripsi,
      lokasiTemu: data.lokasiTemu,
      imageUrl: data.imageUrl || null,
      lostReportId: data.lostReportId || null,
      statusFound: newStatus,  // <-- INI WAJIB
    }
  });
},

  async updateFoundStatus(foundId: number, status: FoundStatusType) {
    const existing = await prisma.tb_foundReports.findUnique({
      where: { id: foundId },
      include: { lostReport: true }
    });

    if (!existing) throw new Error("Laporan ditemukan tidak ditemukan");

    // Bila status = CLAIMED dan ada LostReport → lostReport otomatis APPROVED
    if (status === "CLAIMED" && existing.lostReport) {
      await prisma.tb_lostReport.update({
        where: { id: existing.lostReport.id },
        data: { status: "APPROVED" }
      });
    }

    return prisma.tb_foundReports.update({
      where: { id: foundId },
      data: { statusFound: status }
    });
  },

  // Service
async deleteFound(id: number) {
  // 1️⃣ Validasi id
  if (!id || isNaN(id) || id <= 0) {
    throw new Error("ID tidak valid");
  }

  // 2️⃣ Cek apakah record ada
  const existing = await prisma.tb_foundReports.findUnique({
    where: { id }
  });

  if (!existing) {
    throw new Error(`Laporan ditemukan dengan id ${id} tidak ditemukan`);
  }

  // 3️⃣ Hapus record
  return prisma.tb_foundReports.delete({
    where: { id }
  });
},

  async getFoundPendingForUser() {
    return prisma.tb_foundReports.findMany({
      where: { statusFound: "PENDING" },
      orderBy: { id: "desc" }
    });
  },

  async getFoundHistoryForUser() {
    return prisma.tb_foundReports.findMany({
      where: { statusFound: "CLAIMED" },
      orderBy: { id: "desc" }
    });
  },

async createdAdminFoundReport(data: FoundData, adminId: number) {
  return prisma.tb_foundReports.create({
    data: {
      namaBarang: data.namaBarang,
      deskripsi: data.deskripsi,
      lokasiTemu: data.lokasiTemu,
      imageUrl: data.imageUrl || undefined, // gunakan undefined sesuai tipe
      createdByAdmin: true,
      adminId,
      lostReportId: null,
      statusFound: "CLAIMED", // langsung CLAIMED
    },
  });
},

async getAdminFoundReport() {
  return prisma.tb_foundReports.findMany({
    where: { createdByAdmin: true, statusFound: "CLAIMED" }, // filter langsung CLAIMED
    include: { admin: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
}




};