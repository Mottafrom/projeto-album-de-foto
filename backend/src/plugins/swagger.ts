import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env.js";

export async function registerSwagger(app: FastifyInstance) {
  await app.register(swagger, {
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "MEMORIES. API",
        description: "Galeria pública; upload/delete exigem sessão better-auth (`/api/auth/*`).",
        version: "1.0.0",
      },
      servers: [{ url: env.BETTER_AUTH_URL, description: "API" }],
      tags: [
        { name: "health", description: "Health check" },
        { name: "photos", description: "Fotos" },
      ],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "better-auth.session_token",
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list", deepLinking: true },
  });
}

export const photoJsonSchema = {
  type: "object",
  required: ["id", "title", "storagePath", "publicUrl", "takenOn", "createdAt"],
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string" },
    storagePath: { type: "string" },
    publicUrl: { type: "string" },
    takenOn: { type: "string", format: "date" },
    createdAt: { type: "string", format: "date-time" },
  },
} as const;
