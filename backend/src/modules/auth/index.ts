/**
 * Auth Module
 *
 * Handles user registration, login, password reset, and profile retrieval.
 * Integrates with Supabase Auth and the `profiles` table.
 */
export { default as authRoutes } from "./auth.routes.js";
export { AuthService } from "./auth.service.js";
export * from "./auth.schema.js";
