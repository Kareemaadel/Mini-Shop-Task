import api from './api';

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: {
    name: string;
    image_url: string | null;
  };
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  order_items?: OrderItem[];
  profile?: {
    name: string;
  };
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

export const ordersService = {
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<OrdersResponse> {
    const { data } = await api.get<OrdersResponse>('/orders', { params });
    return data;
  },

  async getOrder(id: string): Promise<Order> {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const { data } = await api.patch<Order>(`/orders/${id}/status`, { status });
    return data;
  },
};
