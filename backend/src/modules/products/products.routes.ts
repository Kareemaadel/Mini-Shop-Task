import type { FastifyInstance } from "fastify";
import { ProductService } from "./products.service.js";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  productParamsSchema,
} from "./products.schema.js";
import { errorResponse } from "../../shared/schemas/common.js";

export default async function productRoutes(fastify: FastifyInstance) {
  const productService = new ProductService(fastify.supabaseAdmin);

  // ── GET /products ─────────────────────────────────────────────────
  fastify.get("/", async (request, reply) => {
    const parsed = productQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply
        .status(400)
        .send(
          errorResponse(400, "Validation Error", parsed.error.errors[0].message)
        );
    }

    // Optionally authenticate to check admin status
    let isAdmin = false;
    try {
      const authHeader = request.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await fastify.supabaseAdmin.auth.getUser(token);
        if (user) {
          const { data: profile } = await fastify.supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
          if (profile?.role === "admin") isAdmin = true;
        }
      }
    } catch {
      // Not authenticated — that's fine for a public route
    }

    try {
      const products = await productService.listProducts(parsed.data, isAdmin);
      return reply.send(products);
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

  // ── GET /products/:id ─────────────────────────────────────────────
  fastify.get("/:id", async (request, reply) => {
    const parsed = productParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      return reply
        .status(400)
        .send(
          errorResponse(400, "Validation Error", parsed.error.errors[0].message)
        );
    }

    let isAdmin = false;
    try {
      const authHeader = request.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await fastify.supabaseAdmin.auth.getUser(token);
        if (user) {
          const { data: profile } = await fastify.supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
          if (profile?.role === "admin") isAdmin = true;
        }
      }
    } catch {
      // ok
    }

    try {
      const product = await productService.getProduct(parsed.data.id, isAdmin);
      return reply.send(product);
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

  // ── POST /products (Admin) ────────────────────────────────────────
  fastify.post(
    "/",
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      try {
        // Handle multipart data
        const parts = request.parts();
        const fields: Record<string, string> = {};
        let imageBuffer: Buffer | null = null;
        let imageFilename = "";
        let imageMimetype = "";

        for await (const part of parts) {
          if (part.type === "file") {
            imageBuffer = await part.toBuffer();
            imageFilename = part.filename;
            imageMimetype = part.mimetype;
          } else {
            fields[part.fieldname] = (part as any).value;
          }
        }

        // Parse + validate with Zod
        const bodyToValidate = {
          ...fields,
          price: fields.price ? Number(fields.price) : undefined,
        };

        const parsed = createProductSchema.safeParse(bodyToValidate);
        if (!parsed.success) {
          return reply
            .status(400)
            .send(
              errorResponse(
                400,
                "Validation Error",
                parsed.error.errors[0].message
              )
            );
        }

        // Upload image if provided
        let imageUrl: string | null = null;
        if (imageBuffer) {
          imageUrl = await productService.uploadImage(
            imageBuffer,
            imageFilename,
            imageMimetype
          );
        }

        const product = await productService.createProduct(
          parsed.data,
          imageUrl
        );
        return reply.status(201).send(product);
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

  // ── PATCH /products/:id (Admin) ───────────────────────────────────
  fastify.patch(
    "/:id",
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const paramsParsed = productParamsSchema.safeParse(request.params);
      if (!paramsParsed.success) {
        return reply
          .status(400)
          .send(
            errorResponse(
              400,
              "Validation Error",
              paramsParsed.error.errors[0].message
            )
          );
      }

      try {
        const parts = request.parts();
        const fields: Record<string, string> = {};
        let imageBuffer: Buffer | null = null;
        let imageFilename = "";
        let imageMimetype = "";

        for await (const part of parts) {
          if (part.type === "file") {
            imageBuffer = await part.toBuffer();
            imageFilename = part.filename;
            imageMimetype = part.mimetype;
          } else {
            fields[part.fieldname] = (part as any).value;
          }
        }

        // Build body for validation
        const bodyToValidate: Record<string, unknown> = { ...fields };
        if (fields.price) bodyToValidate.price = Number(fields.price);
        if (fields.is_active)
          bodyToValidate.is_active = fields.is_active === "true";

        const parsed = updateProductSchema.safeParse(bodyToValidate);
        if (!parsed.success) {
          return reply
            .status(400)
            .send(
              errorResponse(
                400,
                "Validation Error",
                parsed.error.errors[0].message
              )
            );
        }

        // Upload new image if provided — delete old one
        let imageUrl: string | undefined;
        if (imageBuffer) {
          // Delete old image
          const existing = await productService.getProduct(
            paramsParsed.data.id,
            true
          );
          if (existing.image_url) {
            await productService.deleteImage(existing.image_url);
          }

          imageUrl = await productService.uploadImage(
            imageBuffer,
            imageFilename,
            imageMimetype
          );
        }

        const product = await productService.updateProduct(
          paramsParsed.data.id,
          parsed.data,
          imageUrl
        );
        return reply.send(product);
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

  // ── DELETE /products/:id (Admin — soft delete) ────────────────────
  fastify.delete(
    "/:id",
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const parsed = productParamsSchema.safeParse(request.params);
      if (!parsed.success) {
        return reply
          .status(400)
          .send(
            errorResponse(
              400,
              "Validation Error",
              parsed.error.errors[0].message
            )
          );
      }

      try {
        const product = await productService.deleteProduct(parsed.data.id);
        return reply.send(product);
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
