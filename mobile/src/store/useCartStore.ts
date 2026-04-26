import { create } from 'zustand';

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  
  addItem: (newItem) => {
    set((state) => {
      const existingItem = state.items.find((i) => i.product_id === newItem.product_id);
      if (existingItem) {
        return {
          items: state.items.map((i) => 
            i.product_id === newItem.product_id 
              ? { ...i, quantity: i.quantity + newItem.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, newItem] };
    });
  },
  
  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.product_id !== productId),
    }));
  },
  
  updateQuantity: (productId, delta) => {
    set((state) => {
      return {
        items: state.items.map((i) => {
          if (i.product_id === productId) {
            const newQuantity = Math.max(1, i.quantity + delta);
            return { ...i, quantity: newQuantity };
          }
          return i;
        }),
      };
    });
  },
  
  clearCart: () => set({ items: [] }),
  
  getCartTotal: () => {
    const { items } = get();
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
}));
