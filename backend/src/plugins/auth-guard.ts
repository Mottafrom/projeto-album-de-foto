import type { FastifyReply, FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth/auth.js";
import { AppError } from "../lib/errors.js";

export async function requireAuth(request: FastifyRequest, _reply: FastifyReply) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session) {
    throw new AppError("Authentication required", 401, "UNAUTHORIZED");
  }

  request.session = session;
}

declare module "fastify" {
  interface FastifyRequest {
    session?: Awaited<ReturnType<typeof auth.api.getSession>>;
  }
}
