import { authService } from "../services/authService";
import { Request, Response } from "express";

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const user = await authService.registerUser(req.body);

      return res.status(201).json({
        success: true,
        message: "berhasil membuat akun",
        user
      });

    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "email dan password wajib diisi"
        });
      }

      const { user, token, refreshToken } = 
        await authService.loginUser(email, password);

      // SIMPAN token (ACCESS TOKEN) DI COOKIE
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000 // 1 jam
      });

      // SIMPAN refreshToken DI COOKIE
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 hari
      });

      return res.status(200).json({
        success: true,
        message: "login berhasil",
        user
      });

    } catch (error: any) {
      return res.status(401).json({
        success: false,
        message: error.message
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

      const newToken = await authService.refreshAccessToken(refreshToken);

      // OVERWRITE COOKIE token yg lama
      res.cookie("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000
      });

      return res.json({
        success: true,
        message: "token diperbarui"
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
      const refreshToken = req.cookies.refreshToken;

      // ⚠️ WAJIB: hapus refresh token dari DB
      if (refreshToken) {
        await authService.logoutUser(refreshToken);
      }

      // Hapus cookie
      res.clearCookie("token");
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
