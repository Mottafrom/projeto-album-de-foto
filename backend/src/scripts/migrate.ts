import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { pool } from "../lib/db.js";

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const dir = join(process.cwd(), "migrations");
  const files = (await readdir(dir)).filter((name) => name.endsWith(".sql")).sort();

  for (const filename of files) {
    const already = await pool.query(`SELECT 1 FROM schema_migrations WHERE filename = $1`, [
      filename,
    ]);
    if (already.rowCount) {
      console.log(`skip ${filename}`);
      continue;
    }

    const sql = await readFile(join(dir, filename), "utf8");
    await pool.query("BEGIN");
    try {
      await pool.query(sql);
      await pool.query(`INSERT INTO schema_migrations (filename) VALUES ($1)`, [filename]);
      await pool.query("COMMIT");
      console.log(`applied ${filename}`);
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
  }
}

migrate()
  .then(async () => {
    await pool.end();
    console.log("Migrations complete");
  })
  .catch(async (error) => {
    console.error(error);
    await pool.end();
    process.exit(1);
  });
