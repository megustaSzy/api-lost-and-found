import { Request, Response } from "express";
import { AuthRequest } from "../types/AuthRequest";
import { foundService } from "../services/foundService";
import { saveFoundReportImage } from "../services/imageService";
import { FoundStatusType } from "../types/found";
import { ResponseData } from "../utils/Response";

export const foundController = {
  async createFound(req: AuthRequest, res: Response) {
    try {
      const { namaBarang, deskripsi, lokasiTemu } = req.body;

      if (!namaBarang || !deskripsi || !lokasiTemu) {
        return ResponseData.badRequest(res, "semua field wajib diisi");
      }

      const report = await foundService.createFound({ namaBarang, deskripsi, lokasiTemu });

      if (req.file) {
        const imageUrl = await saveFoundReportImage(req.file, report.id);
        report.imageUrl = imageUrl;
      }

      return ResponseData.created(res, report, "laporan berhasil dibuat");
    } catch (err: any) {
      return ResponseData.serverError(res, err.message);
    }
  },

  async createAdminFoundReport(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) return ResponseData.unauthorized(res, "unauthorized");

      const { namaBarang, deskripsi, lokasiTemu } = req.body;

      const report = await foundService.createdAdminFoundReport(
        { namaBarang, deskripsi, lokasiTemu },
        req.user.id
      );

      if (req.file) {
        const imageUrl = await saveFoundReportImage(req.file, report.id);

        await foundService.updateFound(report.id, {
          namaBarang,
          deskripsi,
          lokasiTemu,
          imageUrl,
        });

        report.imageUrl = imageUrl;
      }

      return ResponseData.created(res, report, "laporan berhasil ditambahkan");
    } catch (err: any) {
      return ResponseData.serverError(res, err.message);
    }
  },

  async getAdminFoundReports(req: AuthRequest, res: Response) {
    try {
      const data = await foundService.getAdminFoundReport();
      return ResponseData.ok(res, data);
    } catch (err: any) {
      return ResponseData.serverError(res, err.message);
    }
  },

  async getAllFound(req: Request, res: Response) {
    try {
      const reports = await foundService.getAllFound();
      return ResponseData.ok(res, reports);
    } catch (err: any) {
      return ResponseData.serverError(res, err.message);
    }
  },

  async getFoundById(req: Request, res: Response) {
    try {
      const report = await foundService.getFoundById(Number(req.params.id));

      if (!report) return ResponseData.notFound(res, "laporan tidak ditemukan");

      return ResponseData.ok(res, report);
    } catch (err: any) {
      return ResponseData.serverError(res, err.message);
    }
  },

  async updateFound(req: AuthRequest, res: Response) {
    try {
      const updated = await foundService.updateFound(Number(req.params.id), req.body);
      return ResponseData.ok(res, updated, "laporan berhasil diperbarui");
    } catch (err: any) {
      return ResponseData.serverError(res, err.message);
    }
  },

  async updateFoundStatus(req: AuthRequest, res: Response) {
    try {
      const { status } = req.body as { status: FoundStatusType };

      if (!["PENDING", "CLAIMED", "REJECTED"].includes(status)) {
        return ResponseData.badRequest(res, "status tidak valid");
      }

      const updated = await foundService.updateFoundStatus(Number(req.params.id), status);

      return ResponseData.ok(res, updated, `status berhasil diupdate`);
    } catch (err: any) {
      return ResponseData.serverError(res, err.message);
    }
  },

  async deleteFound(req: AuthRequest, res: Response) {
    try {
      await foundService.deleteFound(Number(req.params.id));
      return ResponseData.ok(res, null, "laporan berhasil dihapus");
    } catch (err: any) {
      return ResponseData.serverError(res, err.message);
    }
  },

  async getFoundPendingForUser(req: AuthRequest, res: Response) {
    try {
      const data = await foundService.getFoundPendingForUser();
      return ResponseData.ok(res, data);
    } catch (err: any) {
      return ResponseData.serverError(res, err.message);
    }
  },

  async getFoundHistoryForUser(req: AuthRequest, res: Response) {
    try {
      const data = await foundService.getFoundHistoryForUser();
      return ResponseData.ok(res, data);
    } catch (err: any) {
      return ResponseData.serverError(res, err.message);
    }
  },
};
