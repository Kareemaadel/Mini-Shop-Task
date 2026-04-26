/**
 * Shared infrastructure — plugins, common schemas, and utilities
 * used across all domain modules.
 */
export { default as supabasePlugin } from "./plugins/supabase.js";
export { default as authPlugin } from "./plugins/auth.js";
export { errorResponse, errorResponseSchema } from "./schemas/common.js";
export type { ErrorResponse } from "./schemas/common.js";
export type { AuthUser } from "./plugins/auth.js";
