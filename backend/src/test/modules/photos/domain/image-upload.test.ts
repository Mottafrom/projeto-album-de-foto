import { describe, expect, it } from "vitest";
import { AppError } from "../../../../lib/errors.js";
import { ImageUpload } from "../../../../modules/photos/domain/image-upload.js";

const maxBytes = 5 * 1024 * 1024;

describe("ImageUpload", () => {
  it("accepts a valid image under the size limit", () => {
    const upload = new ImageUpload({
      buffer: Buffer.from("fake-image"),
      mimeType: "image/jpeg",
      originalName: "trip.jpg",
      maxBytes,
    });

    expect(upload.deriveTitle()).toBe("trip");
  });

  it("rejects unsupported mime types", () => {
    expect(
      () =>
        new ImageUpload({
          buffer: Buffer.from("x"),
          mimeType: "application/pdf",
          originalName: "doc.pdf",
          maxBytes,
        }),
    ).toThrow(AppError);
  });

  it("rejects empty files", () => {
    expect(
      () =>
        new ImageUpload({
          buffer: Buffer.alloc(0),
          mimeType: "image/png",
          originalName: "empty.png",
          maxBytes,
        }),
    ).toThrow(/Empty file/);
  });

  it("rejects files over the max size", () => {
    expect(
      () =>
        new ImageUpload({
          buffer: Buffer.alloc(maxBytes + 1),
          mimeType: "image/png",
          originalName: "big.png",
          maxBytes,
        }),
    ).toThrow(/5 MB/);
  });

  it("falls back to Untitled memory when name has no stem", () => {
    const upload = new ImageUpload({
      buffer: Buffer.from("x"),
      mimeType: "image/webp",
      originalName: ".webp",
      maxBytes,
    });

    expect(upload.deriveTitle()).toBe("Untitled memory");
  });
});
