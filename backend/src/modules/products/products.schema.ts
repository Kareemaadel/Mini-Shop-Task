import { z } from "zod";

// ── Create Product ──────────────────────────────────────────────────
export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z
    .number({ coerce: true })
    .positive("Price must be a positive number"),
  category_id: z.string().uuid("Invalid category ID"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

// ── Update Product ──────────────────────────────────────────────────
export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number({ coerce: true }).positive().optional(),
  category_id: z.string().uuid().optional(),
  is_active: z.boolean().optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// ── Query params ────────────────────────────────────────────────────
export const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;

// ── Route params ────────────────────────────────────────────────────
export const productParamsSchema = z.object({
  id: z.string().uuid("Invalid product ID"),
});

export type ProductParams = z.infer<typeof productParamsSchema>;
