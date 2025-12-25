import { Response } from "express";

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
) {
  // ACCESS TOKEN (30 menit)
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true, // wajib HTTPS
    sameSite: "none", // cross-domain
    maxAge: 30 * 60 * 1000, // 30 menit
    path: "/",
  });

  // REFRESH TOKEN (1 hari)
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000, // 1 hari
    path: "/",
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
}
