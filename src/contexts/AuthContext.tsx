import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { api, ApiError } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();
      const refreshToken = api.getRefreshToken();

      if (token || refreshToken) {
        try {
          const currentUser = await api.getMe();
          setUser(currentUser);
        } catch (error) {
          // Only clear tokens if unauthorized or forbidden
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            api.clearTokens();
            localStorage.removeItem('currentUser');
          } else {
            // For other errors (network, 500), keep the token
            // We might want to show an error state, but for now just don't logout
            console.error('Session check failed:', error);
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.login({ email, password });
      api.setToken(response.accessToken);
      api.setRefreshToken(response.refreshToken);
      setUser(response.user);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Login failed:', error.message);
      }
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (error) {
      // Ignore logout errors
    }
    api.clearTokens();
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
