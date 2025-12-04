import { Request, Response } from "express";
import { countService } from "../services/countService";
import { ResponseData } from "../utils/Response";


export const countController = {

    async getCount(req: Request, res: Response) {
        try {
            
            const count = await countService.getCount();

            return ResponseData.ok(res, count, "jumlah data");

        } catch (error) {
            return ResponseData.serverError(res, error)
        }
    }

}