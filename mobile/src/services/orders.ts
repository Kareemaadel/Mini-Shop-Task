import { api } from './api';

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  products: {
    name: string;
    image_url: string | null;
  };
}

export interface Order {
  id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  created_at: string;
  order_items: OrderItem[];
}

export const ordersService = {
  createOrder: async (items: { product_id: string; quantity: number }[]) => {
    const response = await api.post<Order>('/orders', { items });
    return response.data;
  },
  
  getMyOrders: async () => {
    const response = await api.get<Order[]>('/orders/my');
    return response.data;
  },
  
  getOrderById: async (id: string) => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  }
};
