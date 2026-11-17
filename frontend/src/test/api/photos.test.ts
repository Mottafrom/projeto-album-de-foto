import { describe, expect, it, vi } from "vitest";
import { MAX_UPLOAD_BYTES, uploadPhoto } from "../../api/photos";

describe("uploadPhoto", () => {
  it("rejects files larger than 5 MB before calling fetch", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const big = new File([new Uint8Array(MAX_UPLOAD_BYTES + 1)], "big.png", {
      type: "image/png",
    });

    await expect(uploadPhoto(big)).rejects.toThrow(/5 MB/);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("rejects non-image files before calling fetch", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const pdf = new File([new Uint8Array(10)], "doc.pdf", {
      type: "application/pdf",
    });

    await expect(uploadPhoto(pdf)).rejects.toThrow(/imagem/);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
