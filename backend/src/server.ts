import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";

// Shared infrastructure
import { supabasePlugin, authPlugin } from "./shared/index.js";

// Domain modules
import { authRoutes } from "./modules/auth/index.js";
import { productRoutes } from "./modules/products/index.js";
import { orderRoutes } from "./modules/orders/index.js";

async function main() {
  const fastify = Fastify({
    logger: {
      level: "info",
      transport: {
        target: "pino-pretty",
        options: { translateTime: "HH:MM:ss Z", ignore: "pid,hostname" },
      },
    },
  });

  // ── Global plugins ────────────────────────────────────────────────
  await fastify.register(cors, { origin: true });
  await fastify.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB

  // ── Shared plugins ────────────────────────────────────────────────
  await fastify.register(supabasePlugin);
  await fastify.register(authPlugin);

  // ── Domain modules ────────────────────────────────────────────────
  await fastify.register(authRoutes, { prefix: "/auth" });
  await fastify.register(productRoutes, { prefix: "/products" });
  await fastify.register(orderRoutes, { prefix: "/orders" });

  // ── Health check ──────────────────────────────────────────────────
  fastify.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  // ── Global error handler ──────────────────────────────────────────
  fastify.setErrorHandler((error: Error & { statusCode?: number }, _request, reply) => {
    fastify.log.error(error);
    const statusCode = error.statusCode ?? 500;
    reply.status(statusCode).send({
      statusCode,
      error: error.name ?? "Internal Server Error",
      message: error.message ?? "An unexpected error occurred",
    });
  });

  // ── Start ─────────────────────────────────────────────────────────
  const port = Number(process.env.PORT) || 3000;
  try {
    await fastify.listen({ port, host: "0.0.0.0" });
    fastify.log.info(`Mini Shop API running on http://localhost:${port}`);
  } catch (err: unknown) {
    fastify.log.error(err as Error);
    process.exit(1);
  }
}

main();
