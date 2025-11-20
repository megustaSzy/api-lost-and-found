import { Request, Response } from "express";
import { lostService } from "../services/lostService";

interface AuthRequest extends Request {
    user?: {
        id: number;
        role: "Admin" | "User";
    };
}

export const lostController = {

    async createLost(req: AuthRequest, res: Response) {
        try {
            const data = req.body;
            const userId = req.user!.id;


            const report = await lostService.createLost(userId, data)

            res.status(201).json({
                message: "laporan berhasil dibuat",
                success: true,
                data: report
            })
        } catch (error: any) {
            res.status(400).json({
                message: error.message,
                success: false
            })
        }
    },

    async getMyLost(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;

            const reports = await lostService.getMyLostReports(userId);

            res.json({
                success: true,
                data: reports
            });

        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async getAllLost(req: AuthRequest, res: Response) {
        try {
            const reports = await lostService.getAllLost();

            res.json({
                success: true,
                data: reports
            });

        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async getLostById(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            const report = await lostService.getLostById(id);
            if (!report) return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

            res.json({ success: true, data: report });

        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async updateLost(req: AuthRequest, res: Response) {
        try {
            const id = Number(req.params.id);
            const userId = req.user!.id;

            const updated = await lostService.updateLostReport(id, userId, req.body);

            res.json({
                success: true,
                message: "Laporan berhasil diperbarui",
                data: updated
            });

        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async deleteLost(req: AuthRequest, res: Response) {
        try {
            const id = Number(req.params.id);
            const userId = req.user!.id;

            await lostService.deleteLostReport(id, userId);

            res.json({
                success: true,
                message: "Laporan berhasil dihapus"
            });

        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
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
            data: updated
        });

    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}


}
