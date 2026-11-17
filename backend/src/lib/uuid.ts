import { z } from "zod";

export const uuidSchema = z.uuid().brand<"UUID">();
export type UUID = z.infer<typeof uuidSchema>;
