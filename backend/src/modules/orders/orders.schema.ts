import { z } from "zod";

// ── Order item inside create-order body ─────────────────────────────
const orderItemSchema = z.object({
  product_id: z.string().uuid("Invalid product ID"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

// ── Create Order ────────────────────────────────────────────────────
export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, "At least one item is required"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// ── Update Order Status ─────────────────────────────────────────────
export const updateOrderStatusSchema = z.object({
  status: z.enum(
    ["pending", "processing", "shipped", "delivered", "cancelled"],
    { message: "Invalid order status" }
  ),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

// ── Order params ────────────────────────────────────────────────────
export const orderParamsSchema = z.object({
  id: z.string().uuid("Invalid order ID"),
});

export type OrderParams = z.infer<typeof orderParamsSchema>;

// ── Admin list query ────────────────────────────────────────────────
export const ordersQuerySchema = z.object({
  page: z.number({ coerce: true }).int().min(1).default(1),
  limit: z.number({ coerce: true }).int().min(1).max(100).default(20),
  status: z
    .enum(["pending", "processing", "shipped", "delivered", "cancelled"])
    .optional(),
});

export type OrdersQuery = z.infer<typeof ordersQuerySchema>;
