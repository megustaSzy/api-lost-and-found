import { Request, Response } from "express";
import { authService } from "../services/authService";
import { ResponseData } from "../utils/Response";

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const user = await authService.registerUser(req.body);
      return ResponseData.created(res, user, "Berhasil membuat akun");
    } catch (error: any) {
      return ResponseData.badRequest(res, error.message);
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return ResponseData.badRequest(res, "Email dan password wajib diisi");
      }

      const { user, token, refreshToken } = await authService.loginUser(
        email,
        password
      );

      // ACCESS TOKEN (30 menit)
      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: true, // WAJIB HTTPS (Vercel)
        sameSite: "none", // WAJIB cross-domain
        maxAge: 30 * 60 * 1000,
        path: "/",
      });

      // REFRESH TOKEN (1 hari)
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });

      return ResponseData.ok(res, { user }, "Login berhasil");
    } catch (error: any) {
      return ResponseData.unauthorized(res, error.message);
    }
  },

  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return ResponseData.unauthorized(res, "Refresh token tidak ditemukan");
      }

      const newAccessToken = await authService.refreshAccessToken(refreshToken);

      // SET ULANG ACCESS TOKEN
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 30 * 60 * 1000,
        path: "/",
      });

      return ResponseData.ok(res, null, "Access token diperbarui");
    } catch (error: any) {
      return ResponseData.unauthorized(res, error.message);
    }
  },

  async logout(req: Request, res: Response) {
    try {
      const token = req.cookies.refreshToken;

      if (token) {
        await authService.logoutUser(token);
      }

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });

      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });

      return ResponseData.ok(res, null, "Logout berhasil");
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },
};
