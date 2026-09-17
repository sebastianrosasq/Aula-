import "server-only";

import mysql, { type Pool } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";

function createDatabase(pool: Pool) {
  return drizzle(pool, { schema, mode: "default" });
}

type Database = ReturnType<typeof createDatabase>;

const globalForDb = globalThis as unknown as {
  aulaEnlacePool?: Pool;
  aulaEnlaceDb?: Database;
};

function readConfig() {
  const host = process.env.DATABASE_HOST;
  const user = process.env.DATABASE_USER;
  const password = process.env.DATABASE_PASSWORD;
  const database = process.env.DATABASE_NAME;

  if (!host || !user || !password || !database) {
    throw new Error(
      "La base de datos no está configurada. Define DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD y DATABASE_NAME.",
    );
  }

  return { host, user, password, database };
}

export function getDb() {
  if (globalForDb.aulaEnlaceDb) return globalForDb.aulaEnlaceDb;

  const config = readConfig();
  const pool = mysql.createPool({
    ...config,
    port: Number(process.env.DATABASE_PORT ?? 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
  });

  const db = createDatabase(pool);
  globalForDb.aulaEnlacePool = pool;
  globalForDb.aulaEnlaceDb = db;
  return db;
}

export async function closeDatabaseConnection() {
  await globalForDb.aulaEnlacePool?.end();
  globalForDb.aulaEnlacePool = undefined;
  globalForDb.aulaEnlaceDb = undefined;
}
