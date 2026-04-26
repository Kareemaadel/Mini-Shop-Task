import fp from "fastify-plugin";
import type {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from "fastify";

export interface AuthUser {
  id: string;
  email: string;
  role: "customer" | "admin";
}

declare module "fastify" {
  interface FastifyRequest {
    authUser?: AuthUser;
  }
}

/**
 * Authentication plugin — adds `authenticate` and `requireAdmin` decorators.
 * Reads the Bearer token from the Authorization header, verifies it with Supabase,
 * and fetches the user's role from the profiles table.
 */
export default fp(async (fastify: FastifyInstance) => {
  // ── Authenticate: any logged-in user ──────────────────────────────
  fastify.decorate(
    "authenticate",
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return reply.status(401).send({
            statusCode: 401,
            error: "Unauthorized",
            message: "Missing or invalid authorization header",
          });
        }

        const token = authHeader.replace("Bearer ", "");

        // Verify the JWT and get the user from Supabase
        const {
          data: { user },
          error,
        } = await fastify.supabaseAdmin.auth.getUser(token);

        if (error || !user) {
          return reply.status(401).send({
            statusCode: 401,
            error: "Unauthorized",
            message: "Invalid or expired token",
          });
        }

        // Fetch role from profiles table
        const { data: profile, error: profileError } = await fastify
          .supabaseAdmin
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError || !profile) {
          return reply.status(401).send({
            statusCode: 401,
            error: "Unauthorized",
            message: "User profile not found",
          });
        }

        request.authUser = {
          id: user.id,
          email: user.email!,
          role: profile.role as "customer" | "admin",
        };
      } catch (err) {
        return reply.status(401).send({
          statusCode: 401,
          error: "Unauthorized",
          message: "Authentication failed",
        });
      }
    }
  );

  // ── Require Admin ─────────────────────────────────────────────────
  fastify.decorate(
    "requireAdmin",
    async function (request: FastifyRequest, reply: FastifyReply) {
      // authenticate must run first
      await (fastify as any).authenticate(request, reply);
      if (reply.sent) return; // authenticate already replied with 401

      if (request.authUser?.role !== "admin") {
        return reply.status(403).send({
          statusCode: 403,
          error: "Forbidden",
          message: "Admin access required",
        });
      }
    }
  );
});

// Augment Fastify so TypeScript knows about the decorators
declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
    requireAdmin: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}
