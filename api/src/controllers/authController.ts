import { Request, Response } from "express";
import { authService } from "../services/authService";
import { ResponseData } from "../utils/Response";
import { clearAuthCookies, setAuthCookies } from "../utils/cookies";

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

      const { user, accessToken, refreshToken } = await authService.loginUser(
        email,
        password
      );

      setAuthCookies(res, accessToken, refreshToken);

      return ResponseData.ok(res, { user }, "Login berhasil");
    } catch (error: any) {
      return ResponseData.unauthorized(res, error.message);
    }
  },

  async refreshToken(req: Request, res: Response) {
    try {
      const oldRefreshToken = req.cookies.refreshToken;

      if (!oldRefreshToken) {
        return ResponseData.unauthorized(res, "Refresh token tidak ditemukan");
      }

      const newAccessToken = await authService.refreshAccessToken(
        oldRefreshToken
      );

      setAuthCookies(res, newAccessToken, oldRefreshToken);

      return ResponseData.ok(res, null, "Access token diperbarui");
    } catch (error: any) {
      return ResponseData.unauthorized(res, error.message);
    }
  },

  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        await authService.logoutUser(refreshToken);
      }

      clearAuthCookies(res);

      return ResponseData.ok(res, null, "Logout berhasil");
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },

  async googleCallback(req: Request, res: Response) {
    try {
      console.log("\n--- [CONTROLLER GOOGLE CALLBACK HIT] ---");
      console.log("Full callback URL:", req.url);
      console.log("req.user from Passport:", req.user);

      const profile = req.user;
      if (!profile) {
        console.log("❌ req.user is EMPTY — Passport gagal mengisi user!");
        return ResponseData.unauthorized(res, "Profil Google tidak ditemukan");
      }

      const { user, accessToken, refreshToken } =
        await authService.loginWithGoogle(profile);

      console.log("User from service:", user);
      console.log("Generated JWT AccessToken:", accessToken);
      console.log("Generated JWT RefreshToken:", refreshToken);

      setAuthCookies(res, accessToken, refreshToken);

      const redirectUrl =
        user.role === "Admin"
          ? `${process.env.FRONTEND_URL}/dashboard/admin`
          : `${process.env.FRONTEND_URL}/dashboard/user`;

      console.log("Redirecting to FE:", redirectUrl);
      console.log("--- [REDIRECT SENT] ---\n");

      return res.redirect(redirectUrl);
    } catch (error: any) {
      console.log("🔥 Error in Controller:", error);
      return ResponseData.serverError(res, error.message);
    }
  },
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const result = await authService.requestForgotPassword(email);
      return ResponseData.ok(res, result, "Link reset password telah dikirim");
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },

  async verifyResetSession(req: Request, res: Response) {
    try {
      const sessionToken = req.query.sessionToken as string;
      const result = await authService.verifySession(sessionToken);
      return ResponseData.ok(res, result, "Token valid");
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { sessionToken, newPassword } = req.body;
      const result = await authService.resetPassword(sessionToken, newPassword);
      return ResponseData.ok(res, result, "Password berhasil direset");
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },
};
