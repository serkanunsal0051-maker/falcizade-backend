import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("Warning: DATABASE_URL not set. Database operations will not work.");
}

export const pool = new Pool({ connectionString: databaseUrl || "postgresql://dummy:dummy@localhost:5432/dummy" });
export const db = drizzle(pool, { schema });

export * from "./schema";
