import { Request, Response } from "express";
import { countService } from "../services/countService";
import { ResponseData } from "../utils/Response";

export const countController = {
  async getAdminDashboardCount(req: Request, res: Response) {
    try {
      const data = await countService.getAdminDashboardCount();
      return ResponseData.ok(res, data, "jumlah data");
    } catch (error) {
      return ResponseData.serverError(res, error);
    }
  },

  async getUserDashboardCount(req: Request, res: Response) {
    try {
      if (!req.user) {
        return ResponseData.unauthorized(res, "Unauthorized");
      }

      const data = await countService.getUserDashboardCount(req.user.id);
      return ResponseData.ok(res, data);
    } catch (error) {
      return ResponseData.serverError(res, error);
    }
  },
};
