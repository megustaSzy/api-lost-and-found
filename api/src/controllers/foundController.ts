import { Request, response, Response } from "express";
import { AuthRequest } from "../types/AuthRequest";
import { foundService } from "../services/foundService";
import { saveFoundReportImage } from "../services/imageService";
import { FoundStatusType } from "../types/found";
import { ResponseData } from "../utils/Response";
import { resolveObjectURL } from "buffer";

export const foundController = {
  async createFound(req: AuthRequest, res: Response) {
    try {
      const { namaBarang, deskripsi, lokasiTemu } = req.body;

      if (!namaBarang || !lokasiTemu || !deskripsi) {
        return ResponseData.notFound(res, "semua field wajib diisi");
      }

      // create found report tanpa image dulu
      const report = await foundService.createFound({ namaBarang, deskripsi, lokasiTemu });

      // simpan image kalau ada
      if (req.file) {
        const imageUrl = await saveFoundReportImage(req.file, report.id);
        report.imageUrl = imageUrl;
      }

      return ResponseData.created(res, report, "laporan berhasil dibuat");

    } catch (err: any) {
      return ResponseData.serverError(res, err)
    }
  },

  async createAdminFoundReport(req: AuthRequest, res: Response) {
    try {
      const { namaBarang, deskripsi, lokasiTemu } = req.body;

      if (!req.user?.id) return ResponseData.unauthorized(res, "unauthorized");

      const adminId = req.user.id;

      const report = await foundService.createdAdminFoundReport(
        { namaBarang, deskripsi, lokasiTemu },
        adminId
      );

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

      return ResponseData.created(res, report, "data berhasil ditambahkan");

    } catch (err: any) {
      return ResponseData.serverError(res, err)
    }
  },

  async getAdminFoundReports(req: AuthRequest, res: Response) {
    try {
      const data = await foundService.getAdminFoundReport();

      return ResponseData.ok(res, data)

    } catch (err: any) {
      return ResponseData.serverError(res, err)
    }
  },

  async getAllFound(req: Request, res: Response) {
    try {

      const reports = await foundService.getAllFound();

      return ResponseData.ok(res, reports);

    } catch (err: any) {
      return ResponseData.serverError(res, err)
    }
  },

  async getFoundById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const report = await foundService.getFoundById(id);

      if (!report) return ResponseData.notFound(res, "laporan tidak ditemukan")

      return ResponseData.ok(res, report);

    } catch (err: any) {
      return ResponseData.serverError(res, err)
    }
  },

  async updateFound(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);

      const updated = await foundService.updateFound(id, req.body);

      return ResponseData.ok(res, updated, "laporan berhasil diperbarui")

    } catch (err: any) {
      return ResponseData.serverError(res, err)
    }
  },

  async updateFoundStatus(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);

      const { status } = req.body as { status: FoundStatusType };

      if (!["PENDING", "CLAIMED", "REJECTED"].includes(status)) {
        return ResponseData.badRequest(res, "status tidak valid");
      }
      const updated = await foundService.updateFoundStatus(id, status);

      res.json({ success: true, message: `Status diupdate menjadi ${status}`, data: updated });

    } catch (err: any) {
      return ResponseData.serverError(res, err)
    }
  },

  async deleteFound(req: AuthRequest, res: Response) {

    try {

      const id = Number(req.params.id);

      await foundService.deleteFound(id);

      return ResponseData.ok(res, "laporan berhasl dihapus");

    } catch (err: any) {
      return ResponseData.serverError(res, err)
    }
  },

  async getFoundPendingForUser(req: AuthRequest, res: Response) {

    try {
      const data = await foundService.getFoundPendingForUser();

      return ResponseData.ok(res, data)

    } catch (err: any) {

      return ResponseData.serverError(res, err)
    }
  },

  async getFoundHistoryForUser(req: AuthRequest, res: Response) {
    try {
      const data = await foundService.getFoundHistoryForUser();

      return ResponseData.ok(res, data)

    } catch (err: any) {
      return ResponseData.serverError(res, err)
    }
  },
};