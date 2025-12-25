import { Response, Request } from "express";
import { lostService } from "../services/lostService";
import { ResponseData } from "../utils/Response";

declare global {
  namespace Express {
    interface User {
      id: number;
      role?: string;
    }
  }
}

export const lostController = {
  async createLost(req: Request, res: Response) {
    try {
      const { namaBarang, deskripsi, lokasiHilang, tanggal } = req.body;
      if (!namaBarang || !lokasiHilang)
        return ResponseData.badRequest(
          res,
          "nama barang dan lokasi wajib diisi"
        );

      const report = await lostService.createLost(req.user!.id, {
        namaBarang,
        deskripsi: deskripsi || "",
        lokasiHilang,
        tanggal
      });

      return ResponseData.created(res, report, "data berhasil dibuat");
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },

  async getMyLost(req: Request, res: Response) {
    try {
      const reports = await lostService.getMyLostReports(req.user!.id);
      return ResponseData.ok(res, reports);
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },

  async getAllLost(req: Request, res: Response) {
    try {
      const reports = await lostService.getAllLost();
      return ResponseData.ok(res, reports);
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },

  async getLostById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const report = await lostService.getLostById(id);
      if (!report) return ResponseData.notFound(res, "data tidak ditemukan");
      return ResponseData.ok(res, report);
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },

  async updateLost(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const updated = await lostService.updateLostReport(
        id,
        req.user!.id,
        req.body
      );
      return ResponseData.ok(res, updated, "laporan berhasil diperbarui");
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },

  async deleteLost(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await lostService.deleteLostReport(id, req.user!.id);
      return ResponseData.ok(res, null, "Laporan berhasil dihapus");
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },

  async updateLostStatus(req: Request, res: Response) {
    try {
      if (req.user!.role !== "Admin")
        return ResponseData.forbidden(
          res,
          "hanya admin yang bisa melakukan ini"
        );

      const id = Number(req.params.id);
      const { status } = req.body;
      const updated = await lostService.updateLostStatus(id, status);

      return ResponseData.ok(
        res,
        updated,
        `Laporan berhasil ${status === "APPROVED" ? "disetujui" : "ditolak"}`
      );
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },
};
