'use client';

import { useLayoutEffect, type ReactNode } from 'react';

interface TelegramThemeProviderProps {
  children: ReactNode;
}

/**
 * Determine the current theme based on priority:
 * 1. Manual preference (localStorage)
 * 2. Telegram colorScheme
 * 3. System preference
 */
function determineTheme(): 'light' | 'dark' {
  // Check if we're in browser environment
  if (typeof window === 'undefined') return 'dark';

  // 1. Check manual preference
  const stored = localStorage.getItem('theme-preference');
  if (stored === 'light') return 'light';
  if (stored === 'dark') return 'dark';
  
  // 2. Check Telegram colorScheme
  const telegram = window.Telegram?.WebApp;
  if (telegram?.colorScheme) {
    return telegram.colorScheme;
  }
  
  // 3. Fallback to system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

/**
 * Apply theme to the document
 */
function applyTheme(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;

  const html = document.documentElement;
  
  if (theme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }

  console.log(`🎨 [Theme] Applied ${theme} theme`);
}

/**
 * Public API for Settings component to set theme preference
 */
export function setThemePreference(theme: 'light' | 'dark' | 'system') {
  if (typeof window === 'undefined') return;

  if (theme === 'system') {
    // Remove manual preference to fall back to Telegram/system
    localStorage.removeItem('theme-preference');
  } else {
    localStorage.setItem('theme-preference', theme);
  }

  // Dispatch custom event to notify all instances
  window.dispatchEvent(new Event('theme-preference-changed'));

  // Apply immediately
  const newTheme = determineTheme();
  applyTheme(newTheme);
}

/**
 * Get current theme preference setting
 */
export function getThemePreference(): 'light' | 'dark' | 'system' {
  if (typeof window === 'undefined') return 'system';
  
  const stored = localStorage.getItem('theme-preference');
  if (stored === 'light' || stored === 'dark') return stored;
  return 'system';
}

/**
 * TelegramThemeProvider
 * 
 * Synchronizes app theme with Telegram's colorScheme while supporting manual overrides.
 * 
 * Features:
 * - Reads Telegram.WebApp.colorScheme (light/dark)
 * - Listens to Telegram themeChanged events
 * - Supports manual theme preference via Settings
 * - Falls back to system preference outside Telegram
 * - Prevents FOUC using useLayoutEffect
 */
export function TelegramThemeProvider({ children }: TelegramThemeProviderProps) {
  useLayoutEffect(() => {
    // Apply initial theme
    const initialTheme = determineTheme();
    applyTheme(initialTheme);

    // Handler for Telegram theme changes
    const handleTelegramThemeChange = () => {
      // Only apply if there's no manual preference
      const stored = localStorage.getItem('theme-preference');
      if (!stored || stored === 'system') {
        const newTheme = determineTheme();
        applyTheme(newTheme);
      }
    };

    // Handler for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      // Only apply if there's no manual preference and not in Telegram
      const stored = localStorage.getItem('theme-preference');
      const telegram = window.Telegram?.WebApp;
      if (!stored && !telegram?.colorScheme) {
        const newTheme = determineTheme();
        applyTheme(newTheme);
      }
    };

    // Handler for manual preference changes (from Settings or other tabs)
    const handlePreferenceChange = () => {
      const newTheme = determineTheme();
      applyTheme(newTheme);
    };

    // Handler for storage events (changes from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme-preference') {
        const newTheme = determineTheme();
        applyTheme(newTheme);
      }
    };

    // Attach event listeners
    const telegram = window.Telegram?.WebApp;
    if (telegram) {
      telegram.onEvent('themeChanged', handleTelegramThemeChange);
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    window.addEventListener('theme-preference-changed', handlePreferenceChange);
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      if (telegram) {
        telegram.offEvent('themeChanged', handleTelegramThemeChange);
      }
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
      window.removeEventListener('theme-preference-changed', handlePreferenceChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return <>{children}</>;
}
