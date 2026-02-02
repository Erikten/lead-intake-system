import { PrismaClient } from "@prisma/client";

declare const global: Record<string, unknown>;

const prisma: PrismaClient =
  (global.prisma as PrismaClient) ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;