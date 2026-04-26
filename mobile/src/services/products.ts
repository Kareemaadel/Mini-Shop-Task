import { api } from './api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: string;
  is_active: boolean;
  categories: {
    name: string;
    slug: string;
  } | null;
}

export const productsService = {
  getProducts: async (params?: { search?: string; category?: string }) => {
    const response = await api.get<Product[]>('/products', { params });
    return response.data;
  },
  
  getProductById: async (id: string) => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  }
};
