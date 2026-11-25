import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), "../.env.test"), quiet: true });
config({ path: resolve(process.cwd(), "../.env"), quiet: true });

process.env.PORT ??= "3001";
process.env.CLIENT_ORIGIN ??= "http://localhost:5173";
process.env.DATABASE_URL ??= "postgresql://memories:memories@localhost:5432/memories";
process.env.BETTER_AUTH_SECRET ??= "test-secret-at-least-16-chars";
process.env.BETTER_AUTH_URL ??= "http://localhost:3001";
process.env.SUPABASE_URL ??= "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-role-key";
process.env.STORAGE_BUCKET ??= "memories";
process.env.ADMIN_EMAIL ??= "admin@memories.local";
process.env.ADMIN_PASSWORD ??= "test-password-123";
process.env.MAX_UPLOAD_BYTES ??= String(5 * 1024 * 1024);
