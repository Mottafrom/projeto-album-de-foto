import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import Fastify from "fastify";
import { authRoutes } from "./auth/auth.routes.js";
import { env } from "./config/env.js";
import { photosRoutes } from "./modules/photos/photos.routes.js";
import { registerErrorHandler } from "./plugins/error-handler.js";
import { registerSwagger } from "./plugins/swagger.js";

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  registerErrorHandler(app);

  await registerSwagger(app);

  await app.register(cors, {
    origin: env.CLIENT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });

  await app.register(multipart, {
    limits: {
      fileSize: env.MAX_UPLOAD_BYTES,
      files: 1,
    },
  });

  app.get(
    "/health",
    {
      schema: {
        tags: ["health"],
        summary: "Health check",
        response: {
          200: {
            type: "object",
            properties: {
              ok: { type: "boolean" },
            },
          },
        },
      },
    },
    async () => ({ ok: true }),
  );

  await app.register(authRoutes);
  await app.register(photosRoutes);

  return app;
}
