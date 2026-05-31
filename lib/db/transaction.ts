import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

// ws is listed in next.config.mjs serverExternalPackages so webpack does not
// bundle it — Node.js loads the pure-JS module natively at runtime.
neonConfig.webSocketConstructor = ws;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function withTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const txDb = drizzle(pool, { schema });
  try {
    return await txDb.transaction(fn);
  } finally {
    await pool.end();
  }
}
