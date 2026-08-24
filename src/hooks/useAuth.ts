import { useState, useEffect, useCallback } from 'react';

export interface User {
  email: string;
  nombre: string;
  rol: string;
}

interface AuthContextType {
  user: User | null;      // ✅
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;     // ✅
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  }, []);

  return { user, isAuthenticated, isLoading, login, logout };
};