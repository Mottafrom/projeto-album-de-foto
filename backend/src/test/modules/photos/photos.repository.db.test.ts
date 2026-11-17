import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { pool } from "../../../lib/db.js";
import { PhotosRepository } from "../../../modules/photos/photos.repository.js";

vi.mock("../../../lib/supabase.js", () => ({
  supabaseAdmin: {
    storage: {
      from: () => ({
        upload: vi.fn(async () => ({ error: null })),
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `https://cdn.example/${path}` },
        }),
        remove: vi.fn(async () => ({ error: null })),
      }),
    },
  },
}));

describe("PhotosRepository (db)", () => {
  const repository = new PhotosRepository();

  beforeAll(async () => {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      CREATE TABLE IF NOT EXISTS photos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        storage_path TEXT NOT NULL UNIQUE,
        public_url TEXT NOT NULL,
        taken_on DATE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  });

  beforeEach(async () => {
    await pool.query(`DELETE FROM photos`);
  });

  afterAll(async () => {
    await pool.end();
  });

  it("inserts and lists photos ordered by taken_on desc", async () => {
    await repository.insert({
      title: "Older",
      storagePath: "photos/older.webp",
      publicUrl: "https://cdn.example/photos/older.webp",
      takenOn: new Date("2023-01-01T12:00:00.000Z"),
    });
    await repository.insert({
      title: "Newer",
      storagePath: "photos/newer.webp",
      publicUrl: "https://cdn.example/photos/newer.webp",
      takenOn: new Date("2024-01-01T12:00:00.000Z"),
    });

    const photos = await repository.list();
    expect(photos.map((photo) => photo.title)).toEqual(["Newer", "Older"]);
    expect(photos[0]?.takenOn).toBeInstanceOf(Date);
    expect(photos[0]?.createdAt).toBeInstanceOf(Date);
  });

  it("deletes photo metadata after storage delete", async () => {
    const created = await repository.insert({
      title: "Temp",
      storagePath: "photos/temp.webp",
      publicUrl: "https://cdn.example/photos/temp.webp",
      takenOn: new Date("2024-06-01T12:00:00.000Z"),
    });

    const deleted = await repository.deleteById(created.id);
    expect(deleted?.id).toBe(created.id);
    expect(await repository.findById(created.id)).toBeNull();
  });
});
