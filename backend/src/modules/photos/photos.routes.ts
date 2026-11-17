import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../plugins/auth-guard.js";
import { photoJsonSchema } from "../../plugins/swagger.js";
import { PhotosController } from "./photos.controller.js";

const errorResponse = {
  type: "object",
  properties: {
    error: { type: "string" },
    code: { type: "string" },
  },
} as const;

export async function photosRoutes(app: FastifyInstance) {
  const controller = new PhotosController();

  app.get(
    "/api/photos",
    {
      schema: {
        tags: ["photos"],
        summary: "List photos (public)",
        response: {
          200: {
            type: "object",
            properties: {
              photos: {
                type: "array",
                items: photoJsonSchema,
              },
            },
          },
        },
      },
    },
    controller.list,
  );

  app.post(
    "/api/photos",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["photos"],
        summary: "Upload photo (admin)",
        description:
          "Multipart: `file` (≤5 MB), opcional `title` e `takenOn` (YYYY-MM-DD). Converte para WebP.",
        security: [{ cookieAuth: [] }],
        response: {
          201: {
            type: "object",
            properties: {
              photo: photoJsonSchema,
            },
          },
          400: errorResponse,
          401: errorResponse,
        },
      },
    },
    controller.create,
  );

  app.delete(
    "/api/photos/:id",
    {
      preHandler: requireAuth,
      schema: {
        tags: ["photos"],
        summary: "Delete photo (admin)",
        security: [{ cookieAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
        response: {
          204: { type: "null", description: "Deleted" },
          401: errorResponse,
          404: errorResponse,
        },
      },
    },
    controller.remove,
  );
}
