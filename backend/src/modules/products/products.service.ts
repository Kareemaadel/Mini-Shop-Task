import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateProductInput,
  UpdateProductInput,
  ProductQuery,
} from "./products.schema.js";

export class ProductService {
  constructor(private supabaseAdmin: SupabaseClient) {}

  /**
   * List products with optional search and category filters.
   * Non-admins only see is_active=true.
   */
  async listProducts(query: ProductQuery, isAdmin: boolean) {
    let qb = this.supabaseAdmin
      .from("products")
      .select("*, categories(name, slug)")
      .order("created_at", { ascending: false });

    // Non-admins only see active products
    if (!isAdmin) {
      qb = qb.eq("is_active", true);
    }

    // Search by name or description (case-insensitive)
    if (query.search) {
      qb = qb.or(
        `name.ilike.%${query.search}%,description.ilike.%${query.search}%`
      );
    }

    // Filter by category slug
    if (query.category) {
      // First, find the category id by slug
      const { data: cat } = await this.supabaseAdmin
        .from("categories")
        .select("id")
        .eq("slug", query.category)
        .single();

      if (cat) {
        qb = qb.eq("category_id", cat.id);
      } else {
        // No matching category → return empty
        return [];
      }
    }

    const { data, error } = await qb;
    if (error) {
      throw { statusCode: 500, error: "Internal Server Error", message: error.message };
    }

    return data;
  }

  /**
   * Get a single product by ID.
   */
  async getProduct(id: string, isAdmin: boolean) {
    let qb = this.supabaseAdmin
      .from("products")
      .select("*, categories(name, slug)")
      .eq("id", id);

    if (!isAdmin) {
      qb = qb.eq("is_active", true);
    }

    const { data, error } = await qb.single();

    if (error || !data) {
      throw { statusCode: 404, error: "Not Found", message: "Product not found" };
    }

    return data;
  }

  /**
   * Upload an image to the "product-images" Storage bucket and return its public URL.
   */
  async uploadImage(
    fileBuffer: Buffer,
    filename: string,
    mimetype: string
  ): Promise<string> {
    const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const { error: uploadError } = await this.supabaseAdmin.storage
      .from("product-images")
      .upload(safeName, fileBuffer, {
        contentType: mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw {
        statusCode: 500,
        error: "Internal Server Error",
        message: `Image upload failed: ${uploadError.message}`,
      };
    }

    const { data } = this.supabaseAdmin.storage
      .from("product-images")
      .getPublicUrl(safeName);

    return data.publicUrl;
  }

  /**
   * Delete an image from the bucket (used when replacing).
   */
  async deleteImage(imageUrl: string) {
    try {
      // Extract the path after /product-images/
      const url = new URL(imageUrl);
      const parts = url.pathname.split("/product-images/");
      if (parts.length === 2) {
        await this.supabaseAdmin.storage
          .from("product-images")
          .remove([parts[1]]);
      }
    } catch {
      // Ignore deletion errors for old images
    }
  }

  /**
   * Create a product. Image URL must be provided separately after upload.
   */
  async createProduct(input: CreateProductInput, imageUrl: string | null) {
    const { data, error } = await this.supabaseAdmin
      .from("products")
      .insert({
        name: input.name,
        description: input.description,
        price: input.price,
        category_id: input.category_id,
        image_url: imageUrl,
      })
      .select("*, categories(name, slug)")
      .single();

    if (error) {
      throw { statusCode: 400, error: "Bad Request", message: error.message };
    }

    return data;
  }

  /**
   * Partial update of a product. Optionally replace its image.
   */
  async updateProduct(
    id: string,
    input: UpdateProductInput,
    imageUrl?: string
  ) {
    const updateData: Record<string, unknown> = { ...input };
    if (imageUrl !== undefined) {
      updateData.image_url = imageUrl;
    }

    const { data, error } = await this.supabaseAdmin
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select("*, categories(name, slug)")
      .single();

    if (error) {
      throw { statusCode: 400, error: "Bad Request", message: error.message };
    }

    if (!data) {
      throw { statusCode: 404, error: "Not Found", message: "Product not found" };
    }

    return data;
  }

  /**
   * Hard-delete a product.
   */
  async deleteProduct(id: string) {
    const { data, error } = await this.supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id)
      .select("id, name, is_active")
      .single();

    if (error || !data) {
      throw { statusCode: 404, error: "Not Found", message: "Product not found or could not be deleted" };
    }

    return data;
  }
}
