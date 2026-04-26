import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { api } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isHydrated: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isHydrated: false,
  
  setAuth: async (user, token) => {
    if (Platform.OS === 'web') {
      try { localStorage.setItem('jwt_token', token); } catch (e) {}
    } else {
      await SecureStore.setItemAsync('jwt_token', token);
    }
    set({ user, token });
  },
  
  logout: async () => {
    if (Platform.OS === 'web') {
      try { localStorage.removeItem('jwt_token'); } catch (e) {}
    } else {
      await SecureStore.deleteItemAsync('jwt_token');
    }
    set({ user: null, token: null });
  },
  
  hydrate: async () => {
    set({ isLoading: true });
    try {
      let token = null;
      if (Platform.OS === 'web') {
        try { token = localStorage.getItem('jwt_token'); } catch (e) {}
      } else {
        token = await SecureStore.getItemAsync('jwt_token');
      }

      if (token) {
        // Verify token by getting profile
        const response = await api.get('/auth/me');
        set({ user: response.data, token, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch (error) {
      // Token invalid or expired
      if (Platform.OS === 'web') {
        try { localStorage.removeItem('jwt_token'); } catch (e) {}
      } else {
        await SecureStore.deleteItemAsync('jwt_token');
      }
      set({ user: null, token: null, isHydrated: true });
    } finally {
      set({ isLoading: false });
    }
  },
}));
