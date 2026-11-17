import { z } from "zod";
import { uuidSchema } from "../../lib/uuid.js";

export const photoIdParamsSchema = z.object({
  id: uuidSchema,
});

export const uploadFieldsSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  takenOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "takenOn must be YYYY-MM-DD")
    .optional(),
});
