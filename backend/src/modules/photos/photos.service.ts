import { env } from "../../config/env.js";
import { AppError } from "../../lib/errors.js";
import { convertToWebp } from "../../lib/image.js";
import type { UUID } from "../../lib/uuid.js";
import { ImageUpload } from "./domain/image-upload.js";
import type { Photo } from "./domain/photo.js";
import { PhotosRepository } from "./photos.repository.js";

export class PhotosService {
  constructor(private readonly repository = new PhotosRepository()) {}

  list(): Promise<Photo[]> {
    return this.repository.list();
  }

  async create(input: {
    buffer: Buffer;
    mimeType: string;
    originalName: string;
    title?: string;
    takenOn?: Date;
  }): Promise<Photo> {
    const upload = new ImageUpload({
      buffer: input.buffer,
      mimeType: input.mimeType,
      originalName: input.originalName,
      maxBytes: env.MAX_UPLOAD_BYTES,
    });

    const webp = await convertToWebp(upload.buffer);
    const { storagePath, publicUrl } = await this.repository.uploadWebp(webp);

    try {
      return await this.repository.insert({
        title: input.title?.trim() || upload.deriveTitle(),
        storagePath,
        publicUrl,
        takenOn: input.takenOn ?? new Date(),
      });
    } catch (error) {
      await this.repository.deleteStorage(storagePath).catch(() => undefined);
      throw error;
    }
  }

  async delete(id: UUID): Promise<void> {
    const deleted = await this.repository.deleteById(id);
    if (!deleted) {
      throw new AppError("Photo not found", 404, "PHOTO_NOT_FOUND");
    }
  }
}
