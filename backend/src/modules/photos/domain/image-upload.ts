import { AppError } from "../../../lib/errors.js";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export class ImageUpload {
  readonly buffer: Buffer;
  readonly mimeType: string;
  readonly originalName: string;
  readonly maxBytes: number;

  constructor(input: { buffer: Buffer; mimeType: string; originalName: string; maxBytes: number }) {
    this.buffer = input.buffer;
    this.mimeType = input.mimeType;
    this.originalName = input.originalName;
    this.maxBytes = input.maxBytes;
    this.assertValid();
  }

  private assertValid() {
    if (!ALLOWED_MIME_TYPES.has(this.mimeType)) {
      throw new AppError(
        "Unsupported file type. Use JPG, PNG, WEBP or GIF.",
        400,
        "INVALID_IMAGE_TYPE",
      );
    }

    if (this.buffer.byteLength <= 0) {
      throw new AppError("Empty file", 400, "EMPTY_FILE");
    }

    if (this.buffer.byteLength > this.maxBytes) {
      const mb = Math.round(this.maxBytes / (1024 * 1024));
      throw new AppError(`Image exceeds the ${mb} MB limit`, 400, "FILE_TOO_LARGE");
    }
  }

  deriveTitle(): string {
    const base = this.originalName.replace(/\.[^.]+$/, "").trim();
    return base || "Untitled memory";
  }
}
