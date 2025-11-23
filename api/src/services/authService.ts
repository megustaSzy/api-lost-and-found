import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";

// Ambil dari .env
const JWT_SECRET: Secret = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

interface UserData {
  name: string;
  email: string;
  password: string;
  role: "Admin" | "User";
  notelp: string;
}

export const authService = {
  // REGISTER
  async registerUser(data: UserData) {

    const existingUser = await prisma.tb_user.findUnique({ where: { email: data.email } });

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

  // LOGIN
  async loginUser(email: string, password: string) {

    const user = await prisma.tb_user.findUnique({ where: { email } });

    if (!user) throw new Error("Email tidak ditemukan");

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) throw new Error("Password salah");

    // Hapus refresh token lama
    await prisma.tb_refreshToken.deleteMany({ where: { userId: user.id } });

    // ACCESS TOKEN
    const accessPayload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(
      accessPayload,
      JWT_SECRET,
      { expiresIn: parseJWTExpiry(JWT_EXPIRES_IN) } // angka detik
    );

    // REFRESH TOKEN
    const refreshPayload = { id: user.id };
    const refreshToken = jwt.sign(
      refreshPayload,
      JWT_REFRESH_SECRET,
      { expiresIn: parseJWTExpiry(JWT_REFRESH_EXPIRES_IN) } // angka detik
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

  // REFRESH ACCESS TOKEN
  async refreshAccessToken(refreshToken: string) {
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch {
      throw new Error("Refresh token invalid atau expired");
    }

    const user = await prisma.tb_user.findUnique({ where: { id: payload.id } });
    if (!user) throw new Error("User tidak ditemukan");

    const newAccessPayload = { id: user.id, email: user.email, role: user.role };
    const newAccessToken = jwt.sign(
      newAccessPayload,
      JWT_SECRET,
      { expiresIn: parseJWTExpiry(JWT_EXPIRES_IN) }
    );

    return newAccessToken;
  },

  // LOGOUT
  async logoutUser(refreshToken: string) {
    await prisma.tb_refreshToken.deleteMany({ where: { token: refreshToken } });
  }
};

// Convert "1h", "7d" ke detik untuk jwt.sign
function parseJWTExpiry(exp: string): number {
  const num = parseInt(exp);
  if (exp.endsWith("d")) return num * 24 * 60 * 60;
  if (exp.endsWith("h")) return num * 60 * 60;
  if (exp.endsWith("m")) return num * 60;
  return num;
}

// Convert "1h", "7d" ke ms untuk simpan DB
function parseExpiryToMs(exp: string): number {
  const num = parseInt(exp);
  if (exp.endsWith("d")) return num * 24 * 60 * 60 * 1000;
  if (exp.endsWith("h")) return num * 60 * 60 * 1000;
  if (exp.endsWith("m")) return num * 60 * 1000;
  return num * 1000;
}
