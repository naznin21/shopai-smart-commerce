import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthResponse } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: { name: string; email: string; password: string; phone?: string; address?: string }) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isCustomer: boolean;
  isStaff: boolean;
  isManager: boolean;
  isAdmin: boolean;
  isStaffOrAbove: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setIsLoading(false);
      return;
    }
    try {
      const userData = await authService.getMe();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const res = await authService.login({ email, password });
    localStorage.setItem('token', res.token);
    setToken(res.token);
    const userObj: User = {
      id: res.id,
      name: res.name,
      email: res.email,
      role: res.role,
      phone: res.phone,
      address: res.address,
    };
    localStorage.setItem('user', JSON.stringify(userObj));
    setUser(userObj);
    return res;
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string; address?: string }): Promise<AuthResponse> => {
    const res = await authService.register(data);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    const userObj: User = {
      id: res.id,
      name: res.name,
      email: res.email,
      role: res.role,
      phone: res.phone,
      address: res.address,
    };
    localStorage.setItem('user', JSON.stringify(userObj));
    setUser(userObj);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const isCustomer = user?.role === 'CUSTOMER';
  const isStaff = user?.role === 'STAFF';
  const isManager = user?.role === 'MANAGER';
  const isAdmin = user?.role === 'ADMIN';
  const isStaffOrAbove = isStaff || isManager || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        isCustomer,
        isStaff,
        isManager,
        isAdmin,
        isStaffOrAbove,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
