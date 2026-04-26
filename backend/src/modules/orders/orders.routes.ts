import type { FastifyInstance } from "fastify";
import { OrderService } from "./orders.service.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderParamsSchema,
  ordersQuerySchema,
} from "./orders.schema.js";
import { errorResponse } from "../../shared/schemas/common.js";

export default async function orderRoutes(fastify: FastifyInstance) {
  const orderService = new OrderService(fastify.supabaseAdmin);

  // ── POST /orders (Authenticated customer) ─────────────────────────
  fastify.post(
    "/",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = createOrderSchema.safeParse(request.body);
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
        const order = await orderService.createOrder(
          request.authUser!.id,
          parsed.data
        );
        return reply.status(201).send(order);
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

  // ── GET /orders/my (Authenticated customer) ───────────────────────
  fastify.get(
    "/my",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const orders = await orderService.getMyOrders(request.authUser!.id);
        return reply.send(orders);
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

  // ── GET /orders (Admin — paginated) ───────────────────────────────
  fastify.get(
    "/",
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const parsed = ordersQuerySchema.safeParse(request.query);
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
        const result = await orderService.listOrders(parsed.data);
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
    }
  );

  // ── GET /orders/:id (Authenticated customer) ────────────────────────
  fastify.get(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const paramsParsed = orderParamsSchema.safeParse(request.params);
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
        const order = await orderService.getOrderById(paramsParsed.data.id);
        
        // Ensure the order belongs to the user or user is admin
        if (order.user_id !== request.authUser!.id && request.authUser!.role !== 'admin') {
          return reply.status(403).send(errorResponse(403, "Forbidden", "You do not have access to this order"));
        }
        
        return reply.send(order);
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

  // ── PATCH /orders/:id/status (Admin) ──────────────────────────────
  fastify.patch(
    "/:id/status",
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const paramsParsed = orderParamsSchema.safeParse(request.params);
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

      const bodyParsed = updateOrderStatusSchema.safeParse(request.body);
      if (!bodyParsed.success) {
        return reply
          .status(400)
          .send(
            errorResponse(
              400,
              "Validation Error",
              bodyParsed.error.errors[0].message
            )
          );
      }

      try {
        const order = await orderService.updateOrderStatus(
          paramsParsed.data.id,
          bodyParsed.data
        );
        return reply.send(order);
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
