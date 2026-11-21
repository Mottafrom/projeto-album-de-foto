import { config } from "dotenv";
import { resolve } from "node:path";
import { z } from "zod";

config({ path: resolve(import.meta.dirname, "../../../.env") });

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  CLIENT_ORIGIN: z.url().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(16),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3001"),
  SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STORAGE_BUCKET: z.string().default("memories"),
  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD: z.string().min(8),
  MAX_UPLOAD_BYTES: z.coerce.number().default(5 * 1024 * 1024),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
