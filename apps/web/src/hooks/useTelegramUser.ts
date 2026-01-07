'use client';

import { useTelegramContext } from '@/components/providers/TelegramContext';
import { useOptionalAuth } from '@/contexts/AuthContext';
import type { TelegramUser } from '@tma/shared';
import type { User } from '@/lib/api';

/**
 * Hook to access the current Telegram user (from TelegramContext)
 * 
 * @deprecated Use useAuthUser() for database-backed user or useTelegramContext() directly
 * 
 * @example
 * ```tsx
 * function UserProfile() {
 *   const { user, isLoading, isMockMode } = useTelegramUser();
 * 
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!user) return <div>No user data available</div>;
 * 
 *   return (
 *     <div>
 *       <h1>Hello, {user.first_name}!</h1>
 *       {isMockMode && <span>(Mock Mode)</span>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTelegramUser(): {
  /** Current Telegram user data */
  user: TelegramUser | null;
  /** Whether the data is still loading */
  isLoading: boolean;
  /** Whether mock data is being used */
  isMockMode: boolean;
  /** Whether the app is running inside Telegram */
  isInTelegram: boolean;
} {
  const { user, isLoading, isMockMode, isInTelegram } = useTelegramContext();

  return {
    user,
    isLoading,
    isMockMode,
    isInTelegram,
  };
}

/**
 * Hook to access the authenticated user from the database
 * 
 * This hook provides the user profile after authentication via /auth/login.
 * It includes database fields like role, created_at, etc.
 * 
 * @example
 * ```tsx
 * function UserProfile() {
 *   const { user, isLoading, isAuthenticated } = useAuthUser();
 * 
 *   if (isLoading) return <div>Authenticating...</div>;
 *   if (!isAuthenticated) return <div>Please open in Telegram</div>;
 * 
 *   return (
 *     <div>
 *       <h1>Hello, {user?.first_name}!</h1>
 *       <p>Role: {user?.role}</p>
 *       {user?.is_premium && <span>⭐ Premium</span>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuthUser(): {
  /** Authenticated user from database */
  user: User | null;
  /** Whether authentication is in progress */
  isLoading: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Authentication error if any */
  error: string | null;
} {
  const auth = useOptionalAuth();

  // If AuthContext is not available, return defaults
  if (!auth) {
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    };
  }

  return {
    user: auth.user,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    error: auth.error,
  };
}

