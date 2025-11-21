import { Request, Response } from "express";
import { lostService } from "../services/lostService";
import { saveLostReportImage } from "../services/imageService";

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: "Admin" | "User";
  };
}

export const lostController = {
  // Create Lost Report (user)
  async createLost(req: AuthRequest, res: Response) {
    try {
      const { namaBarang, deskripsi, lokasiHilang } = req.body;

      if (!namaBarang || !lokasiHilang) {
        return res.status(400).json({
          success: false,
          message: "Nama barang dan lokasi wajib diisi",
        });
      }

      // Buat laporan tanpa image dulu
      const report = await lostService.createLost(req.user!.id, {
        namaBarang,
        deskripsi: deskripsi || "",
        lokasiHilang,
        imageUrl: undefined, // awalnya undefined
      });

      // Kalau ada file image, simpan dan update imageUrl
      if (req.file) {
        const imageUrl = await saveLostReportImage(req.file, report.id);
        report.imageUrl = imageUrl;
      }

      res.status(201).json({ success: true, data: report });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getMyLost(req: AuthRequest, res: Response) {
    try {
      const reports = await lostService.getMyLostReports(req.user!.id);
      res.json({ success: true, data: reports });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getAllLost(req: AuthRequest, res: Response) {
    try {
      const reports = await lostService.getAllLost();
      res.json({ success: true, data: reports });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getLostById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const report = await lostService.getLostById(id);
      if (!report) return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
      res.json({ success: true, data: report });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async updateLost(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const updated = await lostService.updateLostReport(id, req.user!.id, req.body);
      res.json({ success: true, message: "Laporan berhasil diperbarui", data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async deleteLost(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      await lostService.deleteLostReport(id, req.user!.id);
      res.json({ success: true, message: "Laporan berhasil dihapus" });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateLostStatus(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body; // "APPROVED" | "REJECTED"

      if (req.user!.role !== "Admin") {
        return res.status(403).json({ success: false, message: "Hanya admin yang bisa melakukan ini" });
      }

      const updated = await lostService.updateLostStatus(id, status);
      res.json({
        success: true,
        message: `Laporan berhasil ${status === "APPROVED" ? "disetujui" : "ditolak"}`,
        data: updated,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  },
};
