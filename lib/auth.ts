import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE_NAME = "lead-system-auth";
const TOKEN_TTL_SECONDS = 60 * 60 * 24;

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) {
    throw new Error("JWT_SECRET env var not set");
  }
  return s;
}

export interface JwtPayload {
  username: string;
}

// Creates token
export function signToken(username: string): string {
  return jwt.sign({ username } as JwtPayload, secret(), {
    expiresIn: TOKEN_TTL_SECONDS,
  });
}

// Verifies token
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, secret()) as JwtPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_TTL_SECONDS,
    path: "/",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getAuthenticatedUser(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token)?.username ?? null;
}

export function checkCredentials(username: string, password: string): boolean {
  const validUser = process.env.DASHBOARD_USERNAME ?? "admin";
  const validPass = process.env.DASHBOARD_PASSWORD ?? "admin123";
  return username === validUser && password === validPass;
}