import { createClient, SupabaseClient } from "@supabase/supabase-js";
import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    supabase: SupabaseClient;
    supabaseAdmin: SupabaseClient;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables. Check your .env file."
    );
  }

  // Public client (respects RLS)
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Admin client (bypasses RLS — use for server-side operations)
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  fastify.decorate("supabase", supabase);
  fastify.decorate("supabaseAdmin", supabaseAdmin);
});
