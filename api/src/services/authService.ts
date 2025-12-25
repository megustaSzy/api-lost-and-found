import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "../utils/sendEmail";
import { createError } from "../utils/createError";
import { createSessionToken, decodeSessionToken } from "../utils/sessionToken";
import { AuthData } from "../types/auth";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const authService = {
  async registerUser(data: AuthData, createRole?: "Admin" | "User") {
    const roleSave =
      data.role === "Admin" && createRole === "Admin" ? "Admin" : "User";
    const existing = await prisma.tb_user.findUnique({
      where: { email: data.email },
    });

    if (existing) throw createError("Email sudah digunakan", 409);

    const hash = await bcrypt.hash(data.password, 10);

    return prisma.tb_user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hash,
        role: roleSave,
        notelp: data.notelp || "",
      },
    });
  },

  async createTokens(userId: number) {
    const user = await prisma.tb_user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) throw createError("User tidak ditemukan", 404);

    const accessTokenId = uuidv4();
    const refreshTokenId = uuidv4();

    const accessToken = jwt.sign(
      {
        id: userId,
        name: user.name,
        email: user.email,
        tokenId: accessTokenId,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: userId, email: user.email, tokenId: refreshTokenId },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    await prisma.tb_accessToken.create({
      data: {
        token: accessToken,
        tokenId: accessTokenId,
        userId,
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
      },
    });

    await prisma.tb_refreshToken.create({
      data: {
        token: refreshToken,
        tokenId: refreshTokenId,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  },

  async loginUser(email: string, password: string) {
    const user = await prisma.tb_user.findUnique({ where: { email } });
    if (!user) throw createError("Email tidak ditemukan", 404);

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) throw createError("Password salah", 400);

    // Hapus token lama
    await prisma.tb_accessToken.deleteMany({ where: { userId: user.id } });
    await prisma.tb_refreshToken.deleteMany({ where: { userId: user.id } });

    const { accessToken, refreshToken } = await this.createTokens(user.id);
    const { password: _, ...safeUser } = user;

    return { user: safeUser, accessToken, refreshToken };
  },

  async refreshAccessToken(refreshToken: string) {
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch {
      throw createError("Refresh token tidak valid", 401);
    }

    const stored = await prisma.tb_refreshToken.findUnique({
      where: { tokenId: payload.tokenId },
    });

    if (!stored) throw createError("Refresh token tidak terdaftar", 401);
    if (stored.expiresAt < new Date())
      throw createError("Refresh token kadaluarsa", 401);

    const newAccessTokenId = uuidv4();
    const newAccessToken = jwt.sign(
      { id: payload.id, tokenId: newAccessTokenId },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    await prisma.tb_accessToken.create({
      data: {
        token: newAccessToken,
        tokenId: newAccessTokenId,
        userId: payload.id,
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
      },
    });

    return newAccessToken;
  },

  async logoutUser(refreshToken: string) {
    try {
      const payload: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      await prisma.tb_accessToken.deleteMany({ where: { userId: payload.id } });
      await prisma.tb_refreshToken.deleteMany({
        where: { userId: payload.id },
      });
    } catch {
      // abaikan token invalid
    }

    return "Logout berhasil";
  },

  async loginWithGoogle(profile: any) {
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName;
    const providerId = profile.id;

    if (!email) throw createError("Email Google tidak ditemukan", 404);

    let user = await prisma.tb_user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.tb_user.create({
        data: {
          name,
          email,
          provider: "google",
          providerId,
          password: null,
          notelp: null,
          role: "User",
        },
      });
    }

    const tokens = await this.createTokens(user.id);
    return { user, ...tokens };
  },
  async requestForgotPassword(email: string) {
    if (!email) throw createError("Email wajib diisi", 400);

    const user = await prisma.tb_user.findUnique({ where: { email } });
    if (!user) throw createError("Email tidak ditemukan", 404);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.tb_otp.create({ data: { email, otp, expiresAt } });

    const sessionToken = createSessionToken({
      email,
      otp,
      expiresAt: expiresAt.toISOString(),
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?sessionToken=${sessionToken}`;

    await sendEmail(
      email,
      "Reset Password Akun Anda",
      `<p>Halo, klik link berikut untuk reset password Anda: <a href="${resetLink}">Reset Password</a></p>`
    );

    return {
      message: "Link reset password telah dikirim lewat email",
      resetLink,
    };
  },

  async verifySession(sessionToken: string) {
    if (!sessionToken) throw createError("Token tidak ditemukan", 404);

    const decoded = decodeSessionToken(sessionToken);
    const { email, otp } = decoded;

    const record = await prisma.tb_otp.findFirst({
      where: { email, otp },
      orderBy: { createdAt: "desc" },
    });

    if (!record) throw createError("Token tidak valid", 400);
    if (record.expiresAt < new Date()) throw createError("Token expired", 400);

    return { valid: true, email };
  },

  async resetPassword(sessionToken: string, newPassword: string) {
    if (!sessionToken) throw createError("Token tidak ditemukan", 404);
    if (!newPassword) throw createError("Password wajib diisi", 400);

    const decoded = decodeSessionToken(sessionToken);
    const { email, otp } = decoded;

    const record = await prisma.tb_otp.findFirst({
      where: { email, otp },
      orderBy: { createdAt: "desc" },
    });

    if (!record) throw createError("Token tidak valid", 400);
    if (record.expiresAt < new Date()) throw createError("Token expired", 400);

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.tb_user.update({
      where: { email },
      data: { password: hashed },
    });
    await prisma.tb_otp.deleteMany({ where: { email } });

    return { message: "Password berhasil direset" };
  },
};
