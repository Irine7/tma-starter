'use client';

import { useTelegramContext } from '@/components/providers/TelegramContext';
import type { TelegramUser } from '@tma/shared';

/**
 * Hook to access the current Telegram user
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
