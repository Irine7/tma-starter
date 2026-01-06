'use client';

import { createContext, useContext } from 'react';
import type { TelegramUser } from '@tma/shared';
import type { TelegramWebApp } from '@/types/telegram.d';

/**
 * Telegram Context Value
 */
export interface TelegramContextValue {
  /** The current Telegram user data */
  user: TelegramUser | null;
  
  /** Raw initData string for API calls */
  initData: string | null;
  
  /** Whether the app is running inside Telegram */
  isInTelegram: boolean;
  
  /** Whether mock data is being used (development mode) */
  isMockMode: boolean;
  
  /** Whether the context is still loading */
  isLoading: boolean;
  
  /** Access to Telegram WebApp API (null if not in Telegram) */
  webApp: TelegramWebApp | null;
}

/**
 * Default context value
 */
const defaultContextValue: TelegramContextValue = {
  user: null,
  initData: null,
  isInTelegram: false,
  isMockMode: false,
  isLoading: true,
  webApp: null,
};

/**
 * Telegram Context
 */
export const TelegramContext = createContext<TelegramContextValue>(defaultContextValue);

/**
 * Hook to access Telegram context
 * @throws Error if used outside of TelegramProvider
 */
export function useTelegramContext(): TelegramContextValue {
  const context = useContext(TelegramContext);
  
  if (context === undefined) {
    throw new Error('useTelegramContext must be used within a TelegramProvider');
  }
  
  return context;
}
