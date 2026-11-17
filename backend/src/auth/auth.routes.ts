import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";
import { auth } from "./auth.js";

export async function authRoutes(app: FastifyInstance) {
  app.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    async handler(request, reply) {
      const url = new URL(request.url, envBaseUrl(request.headers.host));
      const headers = fromNodeHeaders(request.headers);
      const hasBody = request.method !== "GET" && request.method !== "HEAD";

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(hasBody && request.body != null ? { body: JSON.stringify(request.body) } : {}),
      });

      const response = await auth.handler(req);

      reply.status(response.status);
      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });

      const text = response.body ? await response.text() : null;
      if (text === null) {
        return reply.send();
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        return reply.send(JSON.parse(text));
      }

      return reply.send(text);
    },
  });
}

function envBaseUrl(hostHeader: string | string[] | undefined): string {
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;
  return `http://${host ?? "localhost:3001"}`;
}
