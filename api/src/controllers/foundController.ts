import { Request, Response } from "express";
import { foundService } from "../services/foundService";
import { FoundStatusType } from "../types/found";
import { ResponseData } from "../utils/Response";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";

export const foundController = {
  async createFound(req: Request, res: Response) {
    try {
      const { namaBarang, deskripsi, lokasiTemu } = req.body;

      if (!namaBarang || !deskripsi || !lokasiTemu) {
        return ResponseData.badRequest(res, "Semua field wajib diisi");
      }

      const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

      const report = await foundService.createFound({
        namaBarang,
        deskripsi,
        lokasiTemu,
        imageUrl,
      });

      return ResponseData.created(res, report, "Laporan berhasil dibuat");
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },

  async createAdminFoundReport(req: Request, res: Response) {
    try {
      if (!req.file) {
        return ResponseData.badRequest(res, "Image wajib diupload");
      }

      const result: any = await uploadToCloudinary(req.file.buffer);

      const adminId = req.user!.id; // req.user dijamin ada oleh middleware

      const adminCreate = await foundService.createdAdminFound(
        {
          ...req.body,
          imageUrl: result.secure_url,
          imagePublicId: result.public_id,
        },
        adminId
      );

      return ResponseData.ok(res, adminCreate);
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },

  async getAdminFoundReports(req: Request, res: Response) {
    try {
      const data = await foundService.getAdminFoundReport();
      return ResponseData.ok(res, data);
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },

  async getAllFound(req: Request, res: Response) {
    try {
      const reports = await foundService.getAllFound();
      return ResponseData.ok(res, reports);
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },

  async getFoundById(req: Request, res: Response) {
    try {
      const report = await foundService.getFoundById(Number(req.params.id));

      if (!report) return ResponseData.notFound(res, "Laporan tidak ditemukan");

      return ResponseData.ok(res, report);
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },

  async updateFound(req: Request, res: Response) {
    try {
      const updated = await foundService.updateFound(
        Number(req.params.id),
        req.body
      );
      return ResponseData.ok(res, updated, "Laporan berhasil diperbarui");
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },

  async updateFoundStatus(req: Request, res: Response) {
    try {
      const { status } = req.body as { status: FoundStatusType };

      if (!["PENDING", "CLAIMED", "REJECTED"].includes(status)) {
        return ResponseData.badRequest(res, "Status tidak valid");
      }

      const updated = await foundService.updateFoundStatus(
        Number(req.params.id),
        status
      );

      return ResponseData.ok(res, updated, "Status berhasil diupdate");
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },

  async deleteFound(req: Request, res: Response) {
    try {
      await foundService.deleteFound(Number(req.params.id));
      return ResponseData.ok(res, null, "Laporan berhasil dihapus");
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },

  async getFoundPendingForUser(req: Request, res: Response) {
    try {
      const data = await foundService.getFoundPendingForUser();
      return ResponseData.ok(res, data);
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },

  async getFoundHistoryForUser(req: Request, res: Response) {
    try {
      const data = await foundService.getFoundHistoryForUser();
      return ResponseData.ok(res, data);
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },
};
