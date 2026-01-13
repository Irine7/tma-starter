'use client';

/**
 * Auth Context
 *
 * Provides global authentication state for the application.
 * Handles login with Telegram initData and stores user profile.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { api, User } from '@/lib/api';

// ===========================================
// Types
// ===========================================

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  login: (initData: string) => Promise<boolean>;
  logout: () => void;
  refresh: () => Promise<void>;
  updateUser: (user: User) => void;
}

// ===========================================
// Context
// ===========================================

const AuthContext = createContext<AuthContextValue | null>(null);

// ===========================================
// Provider
// ===========================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = user !== null;

  /**
   * Login with Telegram initData
   */
  const login = useCallback(
    async (initData: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.login(initData);

        if (response.success && response.data) {
          setUser(response.data.user);

          // Store in localStorage for persistence
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              'tma_user',
              JSON.stringify(response.data.user)
            );
          }

          console.log(
            `✅ Logged in as ${response.data.user.first_name}`,
            response.data.isNewUser ? '(new user)' : ''
          );

          if (response.data.referralApplied) {
            console.log('🎉 Referral applied successfully!');
          }

          return true;
        } else {
          const errorMessage = response.error?.message || 'Login failed';
          setError(errorMessage);
          console.error('❌ Login failed:', errorMessage);
          return false;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('❌ Login error:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Logout - clear user state
   */
  const logout = useCallback(() => {
    setUser(null);
    setError(null);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tma_user');
    }
    
    console.log('👋 Logged out');
  }, []);

  /**
   * Refresh - re-authenticate with current initData
   */
  const refresh = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const webApp = window.Telegram?.WebApp;
    const initData = webApp?.initData;

    if (initData) {
      await login(initData);
    }
  }, [login]);

  /**
   * Update user - update user state with new data
   */
  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('tma_user', JSON.stringify(updatedUser));
    }
    
    console.log('✅ User updated:', updatedUser.first_name);
  }, []);

  /**
   * Initial authentication on mount
   */
  useEffect(() => {
    async function initAuth() {
      // First, try to restore from localStorage
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('tma_user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser) as User;
            setUser(parsedUser);
            console.log('📦 Restored user from cache:', parsedUser.first_name);
          } catch {
            localStorage.removeItem('tma_user');
          }
        }
      }

      // Then, authenticate with Telegram
      if (typeof window !== 'undefined') {
        const webApp = window.Telegram?.WebApp;
        
        if (webApp?.initData) {
          // Real Telegram environment
          console.log('🔐 Authenticating with Telegram...');
          
          // ✅ SECURITY: Send only initData
          // Server will extract start_param from validated initData
          await login(webApp.initData);
        } else if (process.env.NODE_ENV === 'development') {
          // Development mock mode
          console.log('🔓 Development mode: using mock authentication');
          await login('mock_data');
        } else {
          // No Telegram, no dev mode
          console.log('⚠️ No Telegram WebApp detected');
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }

    initAuth();
  }, [login]);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      error,
      login,
      logout,
      refresh,
      updateUser,
    }),
    [user, isLoading, isAuthenticated, error, login, logout, refresh, updateUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ===========================================
// Hook
// ===========================================

/**
 * Use Auth Context
 *
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * Use optional Auth Context
 * Returns null if outside of AuthProvider (doesn't throw)
 */
export function useOptionalAuth(): AuthContextValue | null {
  return useContext(AuthContext);
}
