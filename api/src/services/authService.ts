import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET!;

interface UserData {
    name: string,
    email: string,
    password: string,
    role: "Admin" | "User",
    notelp: string
}

export const authService = {

    // REGISTER
    async registerUser(data: UserData) {

        const existingUser = await prisma.tb_user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) throw new Error("email sudah digunakan");

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

        if (!user) throw new Error("email tidak ditemukan");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("password salah");

        // Hapus semua refresh token sebelumnya
        await prisma.tb_refreshToken.deleteMany({
            where: { userId: user.id }
        });

        // ==== ACCESS TOKEN (JWT, 1 jam) ====
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: "1h" } // ⚡ 1 JAM
        );

        // ==== REFRESH TOKEN (random UUID, expire 1 JAM) ====
        const refreshToken = crypto.randomUUID();

        await prisma.tb_refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000) // ⚡ EXPIRES 1 JAM
            }
        });

        const { password: _, ...safeUser } = user;

        return { user: safeUser, token, refreshToken };
    },

    // REFRESH ACCESS TOKEN
    async refreshAccessToken(refreshToken: string) {

        const storedToken = await prisma.tb_refreshToken.findFirst({
            where: { token: refreshToken }
        });

        if (!storedToken) throw new Error("invalid refresh token");

        if (storedToken.expiresAt < new Date()) throw new Error("refresh token expired");

        const user = await prisma.tb_user.findUnique({
            where: { id: storedToken.userId }
        });

        // Generate access token baru (1 jam)
        const newAccessToken = jwt.sign(
            {
                id: user!.id,
                email: user!.email,
                role: user!.role
            },
            JWT_SECRET,
            { expiresIn: "1h" } // ⚡ 1 JAM
        );

        return newAccessToken;
    },

    // LOGOUT
    async logoutUser(refreshToken: string) {
        await prisma.tb_refreshToken.deleteMany({
            where: { token: refreshToken }
        });
    }

};
