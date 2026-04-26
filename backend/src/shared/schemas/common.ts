import { z } from "zod";

/**
 * Consistent error response shape used across the API.
 */
export const errorResponseSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

/**
 * Helper to build a consistent error response object.
 */
export function errorResponse(
  statusCode: number,
  error: string,
  message: string
): ErrorResponse {
  return { statusCode, error, message };
}
