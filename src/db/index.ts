import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add it to your .env.local (local dev) or your Vercel project's Environment Variables (production)."
  );
}

// Standard Postgres wire-protocol driver — works with any Postgres provider
// (Supabase, Neon, Vercel Postgres, Railway, a self-hosted instance, etc.),
// not just one specific vendor's proprietary connector.
const client = postgres(connectionString, { prepare: false, max: 1 });

export const db = drizzle(client, { schema });
