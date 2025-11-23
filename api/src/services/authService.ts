import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import { AuthData } from "../types/auth";

const JWT_SECRET: Secret = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export const authService = {

  async registerUser(data: AuthData) {

    const existingUser = await prisma.tb_user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) throw new Error("Email sudah digunakan");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return prisma.tb_user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || "User",
        notelp: data.notelp || ""
      }
    });
  },

  async loginUser(email: string, password: string) {

    const user = await prisma.tb_user.findUnique({ where: { email } });
    if (!user) throw new Error("Email tidak ditemukan");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Password salah");

    // Hapus refresh token lama
    await prisma.tb_refreshToken.deleteMany({ where: { userId: user.id } });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: parseJWTExpiry(JWT_EXPIRES_IN) }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: parseJWTExpiry(JWT_REFRESH_EXPIRES_IN) }
    );

    // Simpan refresh token ke DB
    await prisma.tb_refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + parseExpiryToMs(JWT_REFRESH_EXPIRES_IN))
      }
    });

    const { password: _, ...safeUser } = user;
    return { user: safeUser, token, refreshToken };
  },

  async refreshAccessToken(refreshToken: string) {
    let payload: any;

    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch {
      throw new Error("Refresh token invalid atau expired");
    }

    const user = await prisma.tb_user.findUnique({ where: { id: payload.id } });
    if (!user) throw new Error("User tidak ditemukan");

    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: parseJWTExpiry(JWT_EXPIRES_IN) }
    );
  },

  async logoutUser(refreshToken: string) {
    await prisma.tb_refreshToken.deleteMany({
      where: { token: refreshToken }
    });
  }
};

function parseJWTExpiry(exp: string): number {
  const n = parseInt(exp);
  if (exp.endsWith("d")) return n * 86400;
  if (exp.endsWith("h")) return n * 3600;
  if (exp.endsWith("m")) return n * 60;
  return n;
}

function parseExpiryToMs(exp: string): number {
  const n = parseInt(exp);
  if (exp.endsWith("d")) return n * 86400000;
  if (exp.endsWith("h")) return n * 3600000;
  if (exp.endsWith("m")) return n * 60000;
  return n * 1000;
}
