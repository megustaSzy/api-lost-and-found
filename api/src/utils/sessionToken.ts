import { createError } from "./createError";

export function createSessionToken(payload: any) {
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export function decodeSessionToken(token: string) {
  try {
    return JSON.parse(Buffer.from(token, "base64").toString());
  } catch (error) {
    throw createError("session token tidak valid", 400);
  }
}
