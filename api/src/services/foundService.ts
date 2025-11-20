import prisma from "../lib/prisma";

export interface FoundData {
  namaBarang: string;
  deskripsi: string;
  lokasiTemu: string;
  imageUrl?: string;
}

export interface FoundUpdateData extends FoundData {
  lostReportId?: number | null;
}

export type FoundStatusType = "PENDING" | "CLAIMED" | "REJECTED";

export const foundService = {

  // ================================
  // 📌 1. ADMIN MEMBUAT LAPORAN PENEMUAN
  // ================================
  async createFound(data: FoundData) {
    return prisma.tb_foundReports.create({
      data: {
        namaBarang: data.namaBarang,
        deskripsi: data.deskripsi,
        lokasiTemu: data.lokasiTemu,
        imageUrl: data.imageUrl || null,
        lostReportId: null,          // FIX: admin tidak menghubungkan ke laporan hilang
        statusFound: "PENDING",      // FIX: status awal
      }
    });
  },


  // ================================
  // 📌 2. GET semua laporan untuk admin
  // ================================
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



  // ================================
  // 📌 3. Update laporan penemuan oleh admin
  // ================================
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




  // ================================
  // 📌 4. Update status found
  // ================================
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


  // ================================
  // 📌 5. Hapus laporan ditemukan
  // ================================
  async deleteFound(id: number) {
    return prisma.tb_foundReports.delete({
      where: { id }
    });
  },


  // ================================
  // 📌 6. User – get pending
  // ================================
  async getFoundPendingForUser() {
    return prisma.tb_foundReports.findMany({
      where: { statusFound: "PENDING" },
      orderBy: { id: "desc" }
    });
  },


  // ================================
  // 📌 7. User – get history
  // ================================
  async getFoundHistoryForUser() {
    return prisma.tb_foundReports.findMany({
      where: { statusFound: "CLAIMED" },
      orderBy: { id: "desc" }
    });
  }

};
