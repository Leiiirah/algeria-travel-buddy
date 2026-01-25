import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { api, ApiError } from '@/lib/api';
import { mockUsers } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if API is available
const API_URL = import.meta.env.VITE_API_URL;
const isApiConfigured = !!API_URL;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isApiConfigured) {
        // Real API mode
        const token = api.getToken();
        if (token) {
          try {
            const currentUser = await api.getMe();
            setUser(currentUser);
          } catch (error) {
            api.setToken(null);
            localStorage.removeItem('currentUser');
          }
        }
      } else {
        // Mock mode - check localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            localStorage.removeItem('currentUser');
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (isApiConfigured) {
      // Real API mode
      try {
        const response = await api.login({ email, password });
        api.setToken(response.accessToken);
        setUser(response.user);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        return true;
      } catch (error) {
        if (error instanceof ApiError) {
          console.error('Login failed:', error.message);
        }
        return false;
      }
    } else {
      // Mock mode - for development without backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const foundUser = mockUsers.find(u => u.email === email && u.isActive);
      
      if (foundUser && password === 'password123') {
        setUser(foundUser);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        return true;
      }
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    if (isApiConfigured) {
      try {
        await api.logout();
      } catch (error) {
        // Ignore logout errors
      }
      api.setToken(null);
    }
    setUser(null);
    localStorage.removeItem('currentUser');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
