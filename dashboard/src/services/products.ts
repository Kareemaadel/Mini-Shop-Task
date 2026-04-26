import api from './api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  categories?: { name: string; slug: string } | null;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category_id: string;
  image?: File;
}

export const productsService = {
  async getProducts(params?: { search?: string; category?: string }): Promise<Product[]> {
    const { data } = await api.get<Product[]>('/products', { params });
    return data;
  },

  async getProduct(id: string): Promise<Product> {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },

  async createProduct(productData: CreateProductData): Promise<Product> {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', String(productData.price));
    formData.append('category_id', productData.category_id);
    if (productData.image) {
      formData.append('image', productData.image);
    }
    const { data } = await api.post<Product>('/products', formData);
    return data;
  },

  async updateProduct(id: string, productData: Partial<CreateProductData> & { is_active?: boolean }): Promise<Product> {
    const formData = new FormData();
    if (productData.name !== undefined) formData.append('name', productData.name);
    if (productData.description !== undefined) formData.append('description', productData.description);
    if (productData.price !== undefined) formData.append('price', String(productData.price));
    if (productData.category_id !== undefined) formData.append('category_id', productData.category_id);
    if (productData.is_active !== undefined) formData.append('is_active', String(productData.is_active));
    if (productData.image) formData.append('image', productData.image);
    const { data } = await api.patch<Product>(`/products/${id}`, formData);
    return data;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async toggleActive(id: string, is_active: boolean): Promise<Product> {
    const formData = new FormData();
    formData.append('is_active', String(is_active));
    const { data } = await api.patch<Product>(`/products/${id}`, formData);
    return data;
  },
};
