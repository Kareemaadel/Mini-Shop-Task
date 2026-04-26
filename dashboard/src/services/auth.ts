import api from './api';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface AdminProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  created_at: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
    return data;
  },

  async getProfile(): Promise<AdminProfile> {
    const { data } = await api.get<AdminProfile>('/auth/me');
    return data;
  },

  storeSession(token: string, user: LoginResponse['user']) {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('admin_user');
  },

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  },

  getUser(): LoginResponse['user'] | null {
    const raw = localStorage.getItem('admin_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
