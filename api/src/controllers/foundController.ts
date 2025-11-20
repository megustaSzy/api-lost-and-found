import { Request, Response } from "express";
import { AuthRequest } from "../types/AuthRequest";
import { foundService, FoundStatusType } from "../services/foundService";
import { saveFoundReportImage } from "../services/imageService";

export const foundController = {

    async createFound(req: AuthRequest, res: Response) {
    try {
      // Baca data dari form-data
      const { namaBarang, deskripsi, lokasiTemu } = req.body;

      if (!namaBarang || !deskripsi || !lokasiTemu)
        return res.status(400).json({ success: false, message: "Semua field wajib diisi" });

      // Create found report tanpa image dulu
      const report = await foundService.createFound({ namaBarang, deskripsi, lokasiTemu });

      // Kalau ada file image
      if (req.file) {
        const imageUrl = await saveFoundReportImage(req.file, report.id);
        report.imageUrl = imageUrl;
      }

      res.json({
        success: true,
        message: "Laporan penemuan berhasil dibuat",
        data: report,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Terjadi kesalahan" });
    }
  },


    async getAllFound(req: Request, res: Response) {
        try {
            const reports = await foundService.getAllFound();

            res.json({
                success: true,
                data: reports
            });

        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Terjadi kesalahan"
            });
        }
    },

    async getFoundById(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            const report = await foundService.getFoundById(id);

            if (!report) {
                return res.status(404).json({
                    success: false,
                    message: "Laporan penemuan tidak ditemukan"
                });
            }

            res.json({
                success: true,
                data: report
            });

        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Terjadi kesalahan"
            });
        }
    },

    async updateFound(req: AuthRequest, res: Response) {
        try {
            const id = Number(req.params.id);
            const data = req.body;

            const updated = await foundService.updateFound(id, data);

            res.json({
                success: true,
                message: "Laporan penemuan berhasil diperbarui",
                data: updated
            });

        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Terjadi kesalahan"
            });
        }
    },

    async updateFoundStatus(req: AuthRequest, res: Response) {
        try {
            const id = Number(req.params.id);
            const { status } = req.body as { status: FoundStatusType };

            if (!["PENDING", "CLAIMED", "REJECTED"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Status tidak valid"
                });
            }

            const updated = await foundService.updateFoundStatus(id, status);

            res.json({
                success: true,
                message: `Status laporan berhasil diupdate menjadi ${status}`,
                data: updated
            });

        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Terjadi kesalahan"
            });
        }
    },

    async deleteFound(req: AuthRequest, res: Response) {
        try {
            const id = Number(req.params.id);

            await foundService.deleteFound(id);

            res.json({
                success: true,
                message: "Laporan penemuan berhasil dihapus"
            });

        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Terjadi kesalahan"
            });
        }
    },

    async getFoundPendingForUser(req: AuthRequest, res: Response) {
        try {
            const data = await foundService.getFoundPendingForUser();
            res.json({ success: true, data });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async getFoundHistoryForUser(req: AuthRequest, res: Response) {
        try {
            const data = await foundService.getFoundHistoryForUser();
            res.json({ success: true, data });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

};
