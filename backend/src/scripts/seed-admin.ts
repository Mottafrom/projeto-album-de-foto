import { auth } from "../auth/auth.js";
import { env } from "../config/env.js";
import { pool } from "../lib/db.js";

async function seedAdmin() {
  const ctx = await auth.$context;
  const existing = await ctx.internalAdapter.findUserByEmail(env.ADMIN_EMAIL);

  if (existing?.user) {
    console.log(`Admin already exists: ${env.ADMIN_EMAIL}`);
    return;
  }

  const user = await ctx.internalAdapter.createUser(
    {
      email: env.ADMIN_EMAIL,
      name: "Admin",
      emailVerified: true,
    },
    { method: "email-password" },
  );

  if (!user) {
    throw new Error("Failed to create admin user");
  }

  const passwordHash = await ctx.password.hash(env.ADMIN_PASSWORD);
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: passwordHash,
  });

  console.log(`Admin created: ${env.ADMIN_EMAIL}`);
}

seedAdmin()
  .then(async () => {
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await pool.end();
    process.exit(1);
  });
