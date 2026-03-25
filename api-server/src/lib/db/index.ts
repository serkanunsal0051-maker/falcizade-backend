import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("⚠️  WARNING: DATABASE_URL not set. Database operations will fail.");
} else {
  console.log("✅ Database URL configured");
}

export const pool = new Pool({ 
  connectionString: databaseUrl || "postgresql://dummy:dummy@localhost:5432/dummy",
  // Reduce errors from failed connections
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL connection error:", err);
});

export const db = drizzle(pool, { schema });

export * from "./schema";
