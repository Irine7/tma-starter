'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { TelegramContext, type TelegramContextValue } from './TelegramContext';
import type { TelegramUser } from '@tma/shared';

/**
 * Mock user data for development
 */
const MOCK_USER: TelegramUser = {
  id: 123456789,
  first_name: 'Dev',
  last_name: 'User',
  username: 'devuser',
  photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=telegram-dev',
  language_code: 'en',
  is_premium: false,
};

/**
 * Generate mock initData string for development
 */
function generateMockInitData(user: TelegramUser): string {
  const userString = encodeURIComponent(JSON.stringify(user));
  const authDate = Math.floor(Date.now() / 1000);
  const hash = 'mock_hash_for_development_only';
  
  return `user=${userString}&auth_date=${authDate}&hash=${hash}`;
}

interface MockTelegramProviderProps {
  children: ReactNode;
}

/**
 * MockTelegramProvider
 * 
 * Provides Telegram user data to the app. Automatically detects if running
 * inside Telegram or in a browser for development.
 * 
 * In development mode (when window.Telegram is not available):
 * - Injects mock user data
 * - Shows a development mode banner
 * - Allows testing without deploying to Telegram
 */
export function MockTelegramProvider({ children }: MockTelegramProviderProps) {
  const [contextValue, setContextValue] = useState<TelegramContextValue>({
    user: null,
    initData: null,
    isInTelegram: false,
    isMockMode: false,
    isLoading: true,
    webApp: null,
  });

  useEffect(() => {
    // Check if running inside Telegram
    const telegram = window.Telegram;
    const webApp = telegram?.WebApp;

    if (webApp && webApp.initData) {
      // Running inside Telegram - use real data
      const user = webApp.initDataUnsafe?.user;
      
      setContextValue({
        user: user ? {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url,
          language_code: user.language_code,
          is_premium: user.is_premium,
        } : null,
        initData: webApp.initData,
        isInTelegram: true,
        isMockMode: false,
        isLoading: false,
        webApp: webApp,
      });

      // Signal to Telegram that the app is ready
      webApp.ready();
      webApp.expand();
    } else {
      // Development mode - use mock data
      console.log('🔧 [TMA] Running in development mode with mock Telegram data');
      
      setContextValue({
        user: MOCK_USER,
        initData: generateMockInitData(MOCK_USER),
        isInTelegram: false,
        isMockMode: true,
        isLoading: false,
        webApp: null,
      });
    }
  }, []);

  return (
    <TelegramContext.Provider value={contextValue}>
      {/* Development Mode Banner */}
      {contextValue.isMockMode && !contextValue.isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 text-center py-1.5 text-sm font-medium shadow-md">
          <span className="mr-2">🔧</span>
          Development Mode — Using mock Telegram data
        </div>
      )}
      
      {/* Add padding when banner is visible */}
      <div className={contextValue.isMockMode ? 'pt-9' : ''}>
        {children}
      </div>
    </TelegramContext.Provider>
  );
}
