import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN!;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN!;

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

        // Hapus refresh token lama dari DB
        await prisma.tb_refreshToken.deleteMany({ where: { userId: user.id } });

        // === TOKEN (JWT)
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN } as SignOptions
        );

        // === REFRESH TOKEN (JWT)
        const refreshToken = jwt.sign(
            { id: user.id },
            JWT_REFRESH_SECRET,
            { expiresIn: JWT_REFRESH_EXPIRES_IN } as SignOptions
        );

        // Simpan di database
        await prisma.tb_refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });

        const { password: _, ...safeUser } = user;

        return {
            user: safeUser,
            token,          // <= nama variabel sesuai request
            refreshToken
        };
    },

    // REFRESH TOKEN
    async refreshAccessToken(refreshToken: string) {

        const storedToken = await prisma.tb_refreshToken.findFirst({
            where: { token: refreshToken }
        });

        if (!storedToken) throw new Error("invalid refresh token");
        if (storedToken.expiresAt < new Date()) throw new Error("refresh token expired");

        let decoded: any;
        try {
            decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        } catch {
            throw new Error("refresh token tidak valid");
        }

        const user = await prisma.tb_user.findUnique({
            where: { id: decoded.id }
        });

        if (!user) throw new Error("user tidak ditemukan");

        // buat token baru
        const newToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN } as SignOptions
        );

        return newToken;
    },

    // LOGOUT
    async logoutUser(refreshToken: string) {
        await prisma.tb_refreshToken.deleteMany({
            where: { token: refreshToken }
        });
    }
};
