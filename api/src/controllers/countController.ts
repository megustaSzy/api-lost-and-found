import { Response } from "express";
import { countService } from "../services/countService";
import { ResponseData } from "../utils/Response";
import { AuthRequest } from "../types/AuthRequest";

export const countController = {
  async getAdminDashboardCount(req: AuthRequest, res: Response) {
    try {
      const data = await countService.getAdminDashboardCount();
      return ResponseData.ok(res, data, "jumlah data");
    } catch (error) {
      return ResponseData.serverError(res, error);
    }
  },

  async getUserDashboardCount(req: AuthRequest, res: Response) {
    try {
      const data = await countService.getUserDashboardCount(req.user!.id);
      return ResponseData.ok(res, data);
    } catch (error) {
      return ResponseData.serverError(res, error);
    }
  },
};
