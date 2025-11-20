import prisma from "../lib/prisma";

interface LostData {
    namaBarang: string
    deskripsi: string
    lokasiHilang: string
    imageUrl?: string
}

export const lostService = {
    async createLost(userId: number, data: LostData) {
        return prisma.tb_lostReport.create({
            data: {
                namaBarang: data.namaBarang,
                deskripsi: data.deskripsi,
                lokasiHilang: data.lokasiHilang,
                imageUrl: data.imageUrl || "",
                userId
            }
        });
    },

    async getMyLostReports(userId: number) {
        return prisma.tb_lostReport.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
    },

    // GET ALL REPORT
    async getAllLost() {
        return prisma.tb_lostReport.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        notelp: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
    },

    async getLostById(id: number) {
        return prisma.tb_lostReport.findUnique({
            where: {
                id
            },
            include: {
                user: true,
                foundReport: true
            }
        })
    },

    async updateLostReport(id: number, userId: number, data: LostData) {
        const existingUser = await prisma.tb_lostReport.findUnique({
            where: {
                id
            }
        });

        if(!existingUser) throw new Error("laporan tidak ditemukan");

        if(existingUser.id == userId) throw new Error("tidak bisa mengedit laporan milik orang lain");

        return prisma.tb_lostReport.update({
            where: {
                id
            },
            data
        })
    },

    async deleteLostReport(id: number, userId: number) {

        const existing = await prisma.tb_lostReport.findUnique({ 

            where: { 
                id 
            } 
        });

        if (!existing) throw new Error("laporan tidak ditemukan");

        if (existing.userId !== userId) throw new Error("tidak bisa menghapus laporan milik orang lain");

        return prisma.tb_lostReport.delete({
            where: {
                 id 
            }
        });
    },

    async updateLostStatus(id: number, status: "APPROVED" | "REJECTED") {
  const existing = await prisma.tb_lostReport.findUnique({
    where: { id },
    include: { foundReport: true }
  });

  if (!existing) throw new Error("Laporan tidak ditemukan");

  if (status === "APPROVED") {
    // Jika sudah ada found report → klaim
    if (existing.foundReport) {
      await prisma.tb_foundReports.update({
        where: { id: existing.foundReport.id },
        data: { statusFound: "CLAIMED" }
      });

    // Jika belum ada → buat otomatis, status CLAIMED
    } else {
      await prisma.tb_foundReports.create({
        data: {
          namaBarang: existing.namaBarang,
          deskripsi: existing.deskripsi,
          lokasiTemu: existing.lokasiHilang,
          lostReportId: existing.id,
          statusFound: "CLAIMED"
        }
      });
    }
  }

  return prisma.tb_lostReport.update({
    where: { id },
    data: { status }
  });
}


}
