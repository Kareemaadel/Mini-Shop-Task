import type { SupabaseClient } from "@supabase/supabase-js";
import type { RegisterInput, LoginInput, ForgotPasswordInput } from "./auth.schema.js";

export class AuthService {
  constructor(
    private supabase: SupabaseClient,
    private supabaseAdmin: SupabaseClient
  ) {}

  /**
   * Register a new user via Supabase Auth, then create a profiles row.
   */
  async register(input: RegisterInput) {
    const { name, email, password } = input;

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } =
      await this.supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      });

    if (authError) {
      throw { statusCode: 400, error: "Bad Request", message: authError.message };
    }

    // 2. Insert profile row (default role = 'customer')
    const { error: profileError } = await this.supabaseAdmin
      .from("profiles")
      .insert({
        id: authData.user.id,
        name,
        role: "customer",
      });

    if (profileError) {
      // Rollback: delete the auth user we just created
      await this.supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw { statusCode: 500, error: "Internal Server Error", message: "Failed to create profile" };
    }

    return {
      id: authData.user.id,
      email: authData.user.email,
      name,
      role: "customer",
    };
  }

  /**
   * Sign in with email & password → returns Supabase session with JWT.
   */
  async login(input: LoginInput) {
    const { email, password } = input;

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw { statusCode: 401, error: "Unauthorized", message: "Invalid email or password" };
    }

    const { data: profile } = await this.supabaseAdmin
      .from("profiles")
      .select("name, role")
      .eq("id", data.user.id)
      .single();

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || 'Unknown',
        role: profile?.role || 'customer',
      },
    };
  }

  /**
   * Trigger Supabase password-reset email.
   */
  async forgotPassword(input: ForgotPasswordInput) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(
      input.email
    );

    if (error) {
      throw { statusCode: 400, error: "Bad Request", message: error.message };
    }

    return { message: "Password reset email sent" };
  }

  /**
   * Fetch the authenticated user's profile.
   */
  async getProfile(userId: string) {
    const { data, error } = await this.supabaseAdmin
      .from("profiles")
      .select("id, name, role, created_at")
      .eq("id", userId)
      .single();

    if (error || !data) {
      throw { statusCode: 404, error: "Not Found", message: "Profile not found" };
    }

    // Since profiles doesn't have email, we get it from the user account
    const { data: userData } = await this.supabaseAdmin.auth.admin.getUserById(userId);

    return {
      id: data.id,
      name: data.name,
      role: data.role,
      created_at: data.created_at,
      email: userData.user?.email || '',
    };
  }
}
