/**
 * Products Module
 *
 * Handles product CRUD, image upload to Supabase Storage,
 * and search / category filtering. Admins can manage all
 * products; public users only see active ones.
 */
export { default as productRoutes } from "./products.routes.js";
export { ProductService } from "./products.service.js";
export * from "./products.schema.js";
