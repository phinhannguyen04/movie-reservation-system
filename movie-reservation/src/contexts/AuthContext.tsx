import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';

interface AuthUser {
  name: string;
  email: string;
  avatar: string | null;
  role: 'admin' | 'manager' | 'staff' | 'customer';
  permissions: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => void;
}

interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  permissions: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await api.post<AuthResponse>('/auth/login', { email, password });
      const authUser: AuthUser = {
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        role: data.role as AuthUser['role'],
        permissions: data.permissions,
      };
      setUser(authUser);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(authUser));
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    try {
      const data = await api.post<AuthResponse>('/auth/register', { name, email, password, phone });
      const authUser: AuthUser = {
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        role: data.role as AuthUser['role'],
        permissions: data.permissions,
      };
      setUser(authUser);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(authUser));
      return true;
    } catch (err) {
      console.error('Register failed:', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
