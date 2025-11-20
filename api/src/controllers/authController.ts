import { authService } from "../services/authService";
import { Request, Response } from "express";

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const user = await authService.registerUser(req.body);

      return res.status(201).json({
        message: "berhasil membuat akun",
        success: true,
        user
      });

    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
        success: false
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "email dan password wajib diisi",
          success: false
        });
      }

      const { user, token, refreshToken } =
        await authService.loginUser(email, password);

      // simpan ACCESS TOKEN di cookie
      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000 // 1 jam
      });

      // simpan REFRESH TOKEN di cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 hari
      });

      return res.status(200).json({
        message: "login berhasil",
        success: true,
        user
      });

    } catch (error: any) {
      return res.status(401).json({
        message: error.message,
        success: false
      });
    }
  },

  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "refresh token tidak ditemukan"
        });
      }

      const newAccessToken = await authService.refreshAccessToken(refreshToken);

      // overwrite accessToken cookie
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000
      });

      return res.json({
        success: true,
        message: "access token diperbarui"
      });

    } catch (error: any) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
  },

  async logout(req: Request, res: Response) {
    try {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      return res.json({
        success: true,
        message: "logout berhasil"
      });

    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};
