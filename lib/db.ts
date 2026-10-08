import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    max: 5,
    min: 0,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 15000,
    maxLifetimeSeconds: 60,
  });

const adapter = new PrismaPg(pool);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool;
  globalForPrisma.prisma = db;
}