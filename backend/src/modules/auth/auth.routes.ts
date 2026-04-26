import type { FastifyInstance } from "fastify";
import { AuthService } from "./auth.service.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
} from "./auth.schema.js";
import { errorResponse } from "../../shared/schemas/common.js";

export default async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService(fastify.supabase, fastify.supabaseAdmin);

  // ── POST /auth/register ───────────────────────────────────────────
  fastify.post("/register", async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply
        .status(400)
        .send(
          errorResponse(400, "Validation Error", parsed.error.errors[0].message)
        );
    }

    try {
      const user = await authService.register(parsed.data);
      return reply.status(201).send(user);
    } catch (err: any) {
      return reply
        .status(err.statusCode ?? 500)
        .send(
          errorResponse(
            err.statusCode ?? 500,
            err.error ?? "Internal Server Error",
            err.message ?? "An unexpected error occurred"
          )
        );
    }
  });

  // ── POST /auth/login ──────────────────────────────────────────────
  fastify.post("/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply
        .status(400)
        .send(
          errorResponse(400, "Validation Error", parsed.error.errors[0].message)
        );
    }

    try {
      const session = await authService.login(parsed.data);
      return reply.send(session);
    } catch (err: any) {
      return reply
        .status(err.statusCode ?? 500)
        .send(
          errorResponse(
            err.statusCode ?? 500,
            err.error ?? "Internal Server Error",
            err.message ?? "An unexpected error occurred"
          )
        );
    }
  });

  // ── POST /auth/forgotpassword ─────────────────────────────────────
  fastify.post("/forgotpassword", async (request, reply) => {
    const parsed = forgotPasswordSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply
        .status(400)
        .send(
          errorResponse(400, "Validation Error", parsed.error.errors[0].message)
        );
    }

    try {
      const result = await authService.forgotPassword(parsed.data);
      return reply.send(result);
    } catch (err: any) {
      return reply
        .status(err.statusCode ?? 500)
        .send(
          errorResponse(
            err.statusCode ?? 500,
            err.error ?? "Internal Server Error",
            err.message ?? "An unexpected error occurred"
          )
        );
    }
  });

  // ── GET /auth/me ──────────────────────────────────────────────────
  fastify.get(
    "/me",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const profile = await authService.getProfile(request.authUser!.id);
        return reply.send(profile);
      } catch (err: any) {
        return reply
          .status(err.statusCode ?? 500)
          .send(
            errorResponse(
              err.statusCode ?? 500,
              err.error ?? "Internal Server Error",
              err.message ?? "An unexpected error occurred"
            )
          );
      }
    }
  );
}
