import { describe, expect, it } from "vitest";
import { uuidSchema } from "../../../../lib/uuid.js";
import { Photo } from "../../../../modules/photos/domain/photo.js";

describe("Photo", () => {
  it("keeps typed fields and serializes dates in toJSON", () => {
    const takenOn = new Date("2024-01-02T12:00:00.000Z");
    const createdAt = new Date("2024-01-03T10:00:00.000Z");

    const photo = new Photo({
      id: uuidSchema.parse("11111111-1111-4111-a111-111111111111"),
      title: "Beach",
      storagePath: "photos/a.webp",
      publicUrl: "https://cdn.example/a.webp",
      takenOn,
      createdAt,
    });

    expect(photo.id).toBe("11111111-1111-4111-a111-111111111111");
    expect(photo.takenOn).toBeInstanceOf(Date);
    expect(photo.createdAt).toBeInstanceOf(Date);

    expect(photo.toJSON()).toEqual({
      id: "11111111-1111-4111-a111-111111111111",
      title: "Beach",
      storagePath: "photos/a.webp",
      publicUrl: "https://cdn.example/a.webp",
      takenOn: "2024-01-02",
      createdAt: "2024-01-03T10:00:00.000Z",
    });
  });
});
