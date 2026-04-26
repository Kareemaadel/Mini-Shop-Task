import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

let BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Auto-resolve localhost for mobile testing
if (BASE_URL.includes('localhost') && Platform.OS !== 'web') {
  if (Platform.OS === 'android') {
    BASE_URL = BASE_URL.replace('localhost', '10.0.2.2');
  } else {
    const debuggerHost = Constants.expoConfig?.hostUri;
    if (debuggerHost) {
      BASE_URL = BASE_URL.replace('localhost', debuggerHost.split(':')[0]);
    }
  }
}

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT to every request
api.interceptors.request.use(
  async (config) => {
    let token = null;
    if (Platform.OS === 'web') {
      try { token = localStorage.getItem('jwt_token'); } catch (e) {}
    } else {
      token = await SecureStore.getItemAsync('jwt_token');
    }
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses — auto-logout on 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid → clear stored token so the auth guard kicks in
      if (Platform.OS === 'web') {
        try { localStorage.removeItem('jwt_token'); } catch (e) {}
      } else {
        await SecureStore.deleteItemAsync('jwt_token');
      }

      // Dynamically import the store to avoid circular dependency issues at module level
      const { useAuthStore } = require('../store/useAuthStore');
      useAuthStore.getState().logout();
    }

    // Return user-friendly error object
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject({ message: error.message || 'An unexpected error occurred' });
  }
);
