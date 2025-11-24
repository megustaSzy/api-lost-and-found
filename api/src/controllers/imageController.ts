import { Request, Response } from "express";
import { saveLostReportImage, saveFoundReportImage } from "../services/imageService";
import { ResponseData } from "../utils/Response";

export const uploadController = {

  // Upload gambar Lost Report
  async uploadLostReportImage(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        return ResponseData.badRequest(res, "Tidak ada file yang diupload");
      }

      const reportId = Number(req.params.id);
      if (!reportId) {
        return ResponseData.badRequest(res, "Report ID wajib diisi");
      }

      const imageUrl = await saveLostReportImage(file, reportId);

      return ResponseData.ok(res, { imageUrl }, "Gambar lost report berhasil diupload");

    } catch (err: any) {
      return ResponseData.serverError(res, err.message);
    }
  },

  // Upload gambar Found Report
  async uploadFoundReportImage(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        return ResponseData.badRequest(res, "Tidak ada file yang diupload");
      }

      const reportId = Number(req.params.id);
      if (!reportId) {
        return ResponseData.badRequest(res, "Report ID wajib diisi");
      }

      const imageUrl = await saveFoundReportImage(file, reportId);

      return ResponseData.ok(res, { imageUrl }, "Gambar found report berhasil diupload");

    } catch (err: any) {
      return ResponseData.serverError(res, err.message);
    }
  },

};
