/**
 * Orders Module
 *
 * Handles order creation (with product validation & total calculation),
 * customer order history, admin order listing with pagination,
 * and order status updates.
 */
export { default as orderRoutes } from "./orders.routes.js";
export { OrderService } from "./orders.service.js";
export * from "./orders.schema.js";
