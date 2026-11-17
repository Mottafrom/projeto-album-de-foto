import { randomUUID } from "node:crypto";
import { env } from "../../config/env.js";
import { pool } from "../../lib/db.js";
import { AppError } from "../../lib/errors.js";
import { supabaseAdmin } from "../../lib/supabase.js";
import { uuidSchema, type UUID } from "../../lib/uuid.js";
import { Photo } from "./domain/photo.js";

type PhotoRow = {
  id: string;
  title: string;
  storage_path: string;
  public_url: string;
  taken_on: Date | string;
  created_at: Date | string;
};

function mapRow(row: PhotoRow): Photo {
  return new Photo({
    id: uuidSchema.parse(row.id),
    title: row.title,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
    takenOn: parseDateOnly(row.taken_on),
    createdAt: new Date(row.created_at),
  });
}

// Noon UTC evita drift de fuso em colunas DATE.
function parseDateOnly(value: Date | string): Date {
  if (value instanceof Date) {
    return new Date(
      Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate(), 12, 0, 0),
    );
  }
  return new Date(`${String(value).slice(0, 10)}T12:00:00.000Z`);
}

export class PhotosRepository {
  async list(): Promise<Photo[]> {
    const result = await pool.query<PhotoRow>(
      `SELECT id, title, storage_path, public_url, taken_on, created_at
       FROM photos
       ORDER BY taken_on DESC, created_at DESC`,
    );
    return result.rows.map(mapRow);
  }

  async findById(id: UUID): Promise<Photo | null> {
    const result = await pool.query<PhotoRow>(
      `SELECT id, title, storage_path, public_url, taken_on, created_at
       FROM photos
       WHERE id = $1`,
      [id],
    );
    const row = result.rows[0];
    return row ? mapRow(row) : null;
  }

  async uploadWebp(buffer: Buffer): Promise<{ storagePath: string; publicUrl: string }> {
    const storagePath = `photos/${randomUUID()}.webp`;
    const { error } = await supabaseAdmin.storage
      .from(env.STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: "image/webp",
        upsert: false,
      });

    if (error) {
      throw new AppError(`Storage upload failed: ${error.message}`, 502, "STORAGE_UPLOAD_FAILED");
    }

    const { data } = supabaseAdmin.storage.from(env.STORAGE_BUCKET).getPublicUrl(storagePath);

    return { storagePath, publicUrl: data.publicUrl };
  }

  async insert(input: {
    title: string;
    storagePath: string;
    publicUrl: string;
    takenOn: Date;
  }): Promise<Photo> {
    const result = await pool.query<PhotoRow>(
      `INSERT INTO photos (title, storage_path, public_url, taken_on)
       VALUES ($1, $2, $3, $4::date)
       RETURNING id, title, storage_path, public_url, taken_on, created_at`,
      [input.title, input.storagePath, input.publicUrl, input.takenOn.toISOString().slice(0, 10)],
    );

    return mapRow(result.rows[0]);
  }

  async deleteStorage(storagePath: string): Promise<void> {
    const { error } = await supabaseAdmin.storage.from(env.STORAGE_BUCKET).remove([storagePath]);

    if (error) {
      throw new AppError(`Storage delete failed: ${error.message}`, 502, "STORAGE_DELETE_FAILED");
    }
  }

  async deleteById(id: UUID): Promise<Photo | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    await this.deleteStorage(existing.storagePath);
    await pool.query(`DELETE FROM photos WHERE id = $1`, [id]);
    return existing;
  }
}
