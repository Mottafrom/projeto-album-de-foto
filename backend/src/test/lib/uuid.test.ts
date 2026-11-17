import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { uuidSchema } from "../../lib/uuid.js";

describe("uuidSchema (Zod)", () => {
  it("accepts a valid UUID", () => {
    const id = uuidSchema.parse("11111111-1111-4111-8111-111111111111");
    expect(id).toBe("11111111-1111-4111-8111-111111111111");
  });

  it("rejects an invalid UUID", () => {
    expect(() => uuidSchema.parse("abc")).toThrow(ZodError);
  });
});
