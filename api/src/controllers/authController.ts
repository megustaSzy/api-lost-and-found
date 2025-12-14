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

      //
      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 60 * 1000, // 30 menit
      });

     
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 hari
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

      // Set ulang access token (30 menit)
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 60 * 1000, // 30 menit
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

      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");

      return ResponseData.ok(res, null, "Logout berhasil");
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },
};
