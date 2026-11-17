import sharp from "sharp";

export async function convertToWebp(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer).rotate().webp({ quality: 82 }).toBuffer();
}
