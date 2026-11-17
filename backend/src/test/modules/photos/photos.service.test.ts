import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../../lib/errors.js";
import { uuidSchema } from "../../../lib/uuid.js";
import { Photo } from "../../../modules/photos/domain/photo.js";
import { PhotosService } from "../../../modules/photos/photos.service.js";

vi.mock("../../../lib/image.js", () => ({
  convertToWebp: vi.fn(async (buffer: Buffer) => Buffer.from(`webp:${buffer.toString("utf8")}`)),
}));

describe("PhotosService", () => {
  const repository = {
    list: vi.fn(),
    findById: vi.fn(),
    uploadWebp: vi.fn(),
    insert: vi.fn(),
    deleteStorage: vi.fn(),
    deleteById: vi.fn(),
  };

  const service = new PhotosService(repository as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists photos from the repository", async () => {
    repository.list.mockResolvedValue([]);
    await expect(service.list()).resolves.toEqual([]);
  });

  it("creates a photo after converting to webp", async () => {
    const takenOn = new Date("2024-05-01T12:00:00.000Z");
    const created = new Photo({
      id: uuidSchema.parse("11111111-1111-4111-a111-111111111111"),
      title: "Sunset",
      storagePath: "photos/a.webp",
      publicUrl: "https://cdn.example/a.webp",
      takenOn,
      createdAt: new Date("2024-05-01T12:00:00.000Z"),
    });

    repository.uploadWebp.mockResolvedValue({
      storagePath: "photos/a.webp",
      publicUrl: "https://cdn.example/a.webp",
    });
    repository.insert.mockResolvedValue(created);

    const photo = await service.create({
      buffer: Buffer.from("raw"),
      mimeType: "image/png",
      originalName: "Sunset.png",
      takenOn,
    });

    expect(repository.uploadWebp).toHaveBeenCalledOnce();
    expect(repository.insert).toHaveBeenCalledWith({
      title: "Sunset",
      storagePath: "photos/a.webp",
      publicUrl: "https://cdn.example/a.webp",
      takenOn,
    });
    expect(photo.title).toBe("Sunset");
    expect(photo.takenOn).toBeInstanceOf(Date);
  });

  it("rolls back storage when insert fails", async () => {
    repository.uploadWebp.mockResolvedValue({
      storagePath: "photos/fail.webp",
      publicUrl: "https://cdn.example/fail.webp",
    });
    repository.insert.mockRejectedValue(new Error("db down"));
    repository.deleteStorage.mockResolvedValue(undefined);

    await expect(
      service.create({
        buffer: Buffer.from("raw"),
        mimeType: "image/jpeg",
        originalName: "x.jpg",
      }),
    ).rejects.toThrow("db down");

    expect(repository.deleteStorage).toHaveBeenCalledWith("photos/fail.webp");
  });

  it("throws when deleting a missing photo", async () => {
    repository.deleteById.mockResolvedValue(null);

    await expect(
      service.delete(uuidSchema.parse("11111111-1111-4111-a111-111111111111")),
    ).rejects.toBeInstanceOf(AppError);
  });
});
