import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateOrderInput,
  UpdateOrderStatusInput,
  OrdersQuery,
} from "./orders.schema.js";

export class OrderService {
  constructor(private supabaseAdmin: SupabaseClient) {}

  /**
   * Create an order with items.
   * Validates product existence and calculates totals.
   */
  async createOrder(userId: string, input: CreateOrderInput) {
    const { items } = input;

    // 1. Fetch all referenced products
    const productIds = items.map((i) => i.product_id);
    const { data: products, error: prodError } = await this.supabaseAdmin
      .from("products")
      .select("id, name, price, is_active")
      .in("id", productIds);

    if (prodError) {
      throw { statusCode: 500, error: "Internal Server Error", message: prodError.message };
    }

    // Validate all products exist and are active
    const productMap = new Map(products?.map((p) => [p.id, p]));
    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        throw {
          statusCode: 400,
          error: "Bad Request",
          message: `Product ${item.product_id} not found`,
        };
      }
      if (!product.is_active) {
        throw {
          statusCode: 400,
          error: "Bad Request",
          message: `Product "${product.name}" is no longer available`,
        };
      }
    }

    // 2. Calculate total amount
    let totalAmount = 0;
    const orderItems = items.map((item) => {
      const product = productMap.get(item.product_id)!;
      const unitPrice = Number(product.price);
      totalAmount += unitPrice * item.quantity;
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: unitPrice,
      };
    });

    // 3. Create order
    const { data: order, error: orderError } = await this.supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        status: "pending",
        total_amount: totalAmount,
      })
      .select()
      .single();

    if (orderError || !order) {
      throw { statusCode: 500, error: "Internal Server Error", message: "Failed to create order" };
    }

    // 4. Insert order items
    const itemsToInsert = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await this.supabaseAdmin
      .from("order_items")
      .insert(itemsToInsert);

    if (itemsError) {
      // Rollback order
      await this.supabaseAdmin.from("orders").delete().eq("id", order.id);
      throw { statusCode: 500, error: "Internal Server Error", message: "Failed to create order items" };
    }

    // 5. Return order with items
    return this.getOrderById(order.id);
  }

  /**
   * Fetch a single order with its items.
   */
  async getOrderById(orderId: string) {
    const { data, error } = await this.supabaseAdmin
      .from("orders")
      .select(
        `
        *,
        order_items(
          id, product_id, quantity, unit_price,
          products(name, image_url)
        )
      `
      )
      .eq("id", orderId)
      .single();

    if (error || !data) {
      throw { statusCode: 404, error: "Not Found", message: "Order not found" };
    }

    return data;
  }

  /**
   * Get all orders belonging to a specific user, most recent first.
   */
  async getMyOrders(userId: string) {
    const { data, error } = await this.supabaseAdmin
      .from("orders")
      .select(
        `
        *,
        order_items(
          id, product_id, quantity, unit_price,
          products(name, image_url)
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw { statusCode: 500, error: "Internal Server Error", message: error.message };
    }

    return data;
  }

  /**
   * Admin: paginated list of all orders with user info and item count.
   */
  async listOrders(query: OrdersQuery) {
    const { page, limit, status } = query;
    const offset = (page - 1) * limit;

    let qb = this.supabaseAdmin
      .from("orders")
      .select(
        `
        *,
        profiles(id, name, role),
        order_items(id)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      qb = qb.eq("status", status);
    }

    const { data, error, count } = await qb;

    if (error) {
      throw { statusCode: 500, error: "Internal Server Error", message: error.message };
    }

    // Transform: add item_count, flatten user info
    const orders = (data ?? []).map((order: any) => ({
      id: order.id,
      user_id: order.user_id,
      status: order.status,
      total_amount: order.total_amount,
      created_at: order.created_at,
      user: order.profiles,
      item_count: order.order_items?.length ?? 0,
    }));

    return {
      orders,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        total_pages: Math.ceil((count ?? 0) / limit),
      },
    };
  }

  /**
   * Admin: update order status.
   */
  async updateOrderStatus(orderId: string, input: UpdateOrderStatusInput) {
    const { data, error } = await this.supabaseAdmin
      .from("orders")
      .update({ status: input.status })
      .eq("id", orderId)
      .select()
      .single();

    if (error || !data) {
      throw { statusCode: 404, error: "Not Found", message: "Order not found" };
    }

    return data;
  }
}
