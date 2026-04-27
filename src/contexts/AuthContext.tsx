import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { api, ApiError, ApiErrorType } from '@/lib/api';

export interface LoginResult {
  success: boolean;
  error?: {
    type: ApiErrorType;
    message: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
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
          console.log('Checking auth with existing tokens...');
          const currentUser = await api.getMe();
          console.log('Auth check successful, user:', currentUser.email);
          setUser(currentUser);
        } catch (error) {
          console.error('Auth check failed:', error);
          // Only clear tokens if unauthorized or forbidden
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            console.log('Clearing tokens due to 401/403');
            api.clearTokens();
            localStorage.removeItem('currentUser');
          } else {
            // For other errors (network, 500), keep the token
            // We might want to show an error state, but for now just don't logout
            console.error('Session check failed:', error);
          }
        }
      } else {
        console.log('No tokens found, user is not logged in.');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      const response = await api.login({ email, password });
      api.setToken(response.accessToken);
      api.setRefreshToken(response.refreshToken);
      setUser(response.user);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        // Map API errors to user-friendly messages
        let message: string;
        switch (error.type) {
          case 'network':
            message = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
            break;
          case 'unauthorized':
            // Check if it's a deactivated account or invalid credentials
            if (error.message.toLowerCase().includes('deactivat') ||
              error.message.toLowerCase().includes('désactivé')) {
              message = 'Votre compte a été désactivé. Contactez un administrateur.';
            } else {
              message = 'Email ou mot de passe incorrect.';
            }
            break;
          case 'rate_limited':
            message = 'Trop de tentatives de connexion. Réessayez dans quelques minutes.';
            break;
          case 'server_error':
            message = 'Une erreur serveur est survenue. Réessayez plus tard.';
            break;
          default:
            message = error.message || 'Une erreur est survenue lors de la connexion.';
        }
        return {
          success: false,
          error: { type: error.type, message }
        };
      }
      // Unknown error
      return {
        success: false,
        error: {
          type: 'server_error',
          message: 'Une erreur inattendue est survenue.'
        }
      };
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
    // Avoid throwing — during Vite HMR the AuthContext identity can momentarily
    // change, which would otherwise crash the whole tree with a blank screen.
    // Fall back to a logged-out state; the next render (with the real provider)
    // will restore the correct context value.
    console.warn('useAuth was called outside AuthProvider. Falling back to logged-out state.');


    const fallback: AuthContextType = {
      user: null,
      isLoading: false,
      login: async () => ({
        success: false,
        error: {
          type: 'server_error',
          message: "Erreur de configuration: AuthProvider manquant.",
        },
      }),
      logout: () => {
        // no-op
      },
      isAdmin: false,
    };
    return fallback;
  }
  return context;
};
