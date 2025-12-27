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

    if (!user || !user.password) {
      throw createError("Email atau password salah", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw createError("Email atau password salah", 401);
    }

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
    if (!email) {
      throw createError("Email wajib diisi", 400);
    }

    // 1. Cek user
    const user = await prisma.tb_user.findUnique({
      where: { email },
    });

    if (!user) {
      throw createError("Email tidak ditemukan", 404);
    }

    // 2. Generate OTP & expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

    await prisma.tb_otp.create({
      data: {
        email,
        otp,
        expiresAt,
      },
    });

    // 3. Buat session token
    const sessionToken = createSessionToken({
      email,
      otp,
      expiresAt: expiresAt.toISOString(),
    });

    // 4. Buat reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?sessionToken=${sessionToken}`;

    // 5. Email template
    const emailHTML = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Password</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">

  <span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">
    Reset password akun Anda. Link hanya berlaku 5 menit.
  </span>

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fa;">
    <tr>
      <td align="center" style="padding:40px 20px;">

        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">

          <tr>
            <td align="center" style="padding:40px;background:#667eea;color:#ffffff;">
              <div style="font-size:36px;margin-bottom:12px;">🔐</div>
              <h1 style="margin:0;font-size:26px;font-weight:600;">Reset Password</h1>
            </td>
          </tr>

          <tr>
            <td style="padding:40px;color:#2d3748;">
              <p style="margin:0 0 16px;">Halo,</p>

              <p style="margin:0 0 24px;color:#4a5568;line-height:1.6;">
                Kami menerima permintaan untuk mereset password akun Anda.
                Klik tombol di bawah ini untuk melanjutkan.
              </p>

              <table align="center" style="margin-bottom:30px;">
                <tr>
                  <td style="background:#667eea;border-radius:8px;">
                    <a href="${resetLink}"
                      style="display:inline-block;padding:14px 36px;
                      color:#ffffff;text-decoration:none;font-weight:600;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <div style="background:#fef3c7;border-left:4px solid #f59e0b;
                padding:14px;border-radius:6px;margin-bottom:24px;">
                <p style="margin:0;font-size:14px;color:#92400e;">
                  ⏰ <strong>Link hanya berlaku 5 menit.</strong><br/>
                  Jika kadaluarsa, silakan lakukan permintaan ulang.
                </p>
              </div>

              <p style="margin:0 0 8px;font-size:14px;color:#4a5568;">
                Atau salin link berikut:
              </p>

              <div style="background:#f7fafc;border:1px solid #e2e8f0;
                padding:10px;border-radius:6px;word-break:break-all;">
                <a href="${resetLink}" style="font-size:13px;color:#667eea;">
                  ${resetLink}
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:30px 40px;background:#f7fafc;
              border-top:1px solid #e2e8f0;color:#718096;">
              <p style="margin:0 0 10px;font-size:13px;">
                🔒 <strong>Keamanan Akun</strong>
              </p>
              <ul style="margin:0;padding-left:18px;font-size:13px;">
                <li>Jika tidak meminta reset, abaikan email ini</li>
                <li>Jangan bagikan link kepada siapapun</li>
                <li>Gunakan password yang kuat</li>
              </ul>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px;font-size:12px;color:#a0aec0;">
              <p style="margin:0;">Email otomatis, mohon tidak membalas</p>
              <p style="margin:6px 0 0;">
                © ${new Date().getFullYear()} Your App Name
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

    // 6. Kirim email
    await sendEmail(email, "Reset Password Akun Anda", emailHTML);

    // 7. Response aman
    return {
      message: "Link reset password telah dikirim lewat email",
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
