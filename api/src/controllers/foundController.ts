import { Request, Response } from "express";
import { AuthRequest } from "../types/AuthRequest";
import { foundService, FoundStatusType } from "../services/foundService";
import { saveFoundReportImage } from "../services/imageService";

export const foundController = {
  // ==================== User Create ====================
  async createFound(req: AuthRequest, res: Response) {
    try {
      const { namaBarang, deskripsi, lokasiTemu } = req.body;

      if (!namaBarang || !lokasiTemu || !deskripsi) {
        return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
      }

      // create found report tanpa image dulu
      const report = await foundService.createFound({ namaBarang, deskripsi, lokasiTemu });

      // simpan image kalau ada
      if (req.file) {
        const imageUrl = await saveFoundReportImage(req.file, report.id);
        report.imageUrl = imageUrl;
      }

      res.status(201).json({ success: true, message: "Laporan berhasil dibuat", data: report });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Terjadi kesalahan" });
    }
  },

  // ==================== Admin Create ====================
  async createAdminFoundReport(req: AuthRequest, res: Response) {
    try {
      const { namaBarang, deskripsi, lokasiTemu } = req.body;

      if (!req.user?.id) return res.status(401).json({ success: false, message: "Unauthorized" });

      const adminId = req.user.id;

      // ✅ buat report dulu tanpa image
      const report = await foundService.createdAdminFoundReport(
        { namaBarang, deskripsi, lokasiTemu },
        adminId
      );

      // ✅ simpan image kalau ada
      if (req.file) {
        const imageUrl = await saveFoundReportImage(req.file, report.id);

        // update report sekaligus semua field supaya type cocok
        await foundService.updateFound(report.id, {
          namaBarang: report.namaBarang,
          deskripsi: report.deskripsi,
          lokasiTemu: report.lokasiTemu,
          imageUrl,
        });
        // ambil report terbaru
        report.imageUrl = imageUrl;
      }

      res.status(201).json({ success: true, data: report });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },


  // ==================== Admin Get Reports ====================
  async getAdminFoundReports(req: AuthRequest, res: Response) {
    try {
      const data = await foundService.getAdminFoundReport();
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Terjadi kesalahan" });
    }
  },

  // ==================== Other Controller Functions ====================
  async getAllFound(req: Request, res: Response) {
    try {
      const reports = await foundService.getAllFound();
      res.json({ success: true, data: reports });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Terjadi kesalahan" });
    }
  },

  async getFoundById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const report = await foundService.getFoundById(id);
      if (!report) return res.status(404).json({ success: false, message: "Laporan tidak ditemukan" });
      res.json({ success: true, data: report });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Terjadi kesalahan" });
    }
  },

  async updateFound(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const updated = await foundService.updateFound(id, req.body);
      res.json({ success: true, message: "Laporan diperbarui", data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Terjadi kesalahan" });
    }
  },

  async updateFoundStatus(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body as { status: FoundStatusType };
      if (!["PENDING", "CLAIMED", "REJECTED"].includes(status)) {
        return res.status(400).json({ success: false, message: "Status tidak valid" });
      }
      const updated = await foundService.updateFoundStatus(id, status);
      res.json({ success: true, message: `Status diupdate menjadi ${status}`, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Terjadi kesalahan" });
    }
  },

  async deleteFound(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      await foundService.deleteFound(id);
      res.json({ success: true, message: "Laporan berhasil dihapus" });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || "Terjadi kesalahan" });
    }
  },

  async getFoundPendingForUser(req: AuthRequest, res: Response) {
    try {
      const data = await foundService.getFoundPendingForUser();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getFoundHistoryForUser(req: AuthRequest, res: Response) {
    try {
      const data = await foundService.getFoundHistoryForUser();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
