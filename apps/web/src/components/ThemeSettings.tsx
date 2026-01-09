/**
 * Theme Settings Component
 * Allows users to manually select light, dark, or system theme
 */

'use client';

import { useState, useEffect } from 'react';
import { setThemePreference, getThemePreference } from '@/components/providers/TelegramThemeProvider';

export function ThemeSettings() {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    setCurrentTheme(getThemePreference());
  }, []);

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setThemePreference(theme);
    setCurrentTheme(theme);
  };

  const themes: Array<{ value: 'light' | 'dark' | 'system'; label: string; icon: string }> = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '🔄' },
  ];

  return (
    <div className="space-y-2">
      {themes.map((theme) => (
        <button
          key={theme.value}
          onClick={() => handleThemeChange(theme.value)}
          className={`
            w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-all
            ${currentTheme === theme.value
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-secondary border-border hover:border-primary/50 hover:bg-secondary/80'
            }
          `}
        >
          <span className="text-xl">{theme.icon}</span>
          <div className="flex-1">
            <div className="font-medium">{theme.label}</div>
            {currentTheme === theme.value && (
              <div className="text-xs opacity-80">Active</div>
            )}
          </div>
          {currentTheme === theme.value && (
            <span className="text-lg">✓</span>
          )}
        </button>
      ))}
    </div>
  );
}

