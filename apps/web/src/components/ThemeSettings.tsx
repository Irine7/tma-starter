'use client';

import { useState, useEffect } from 'react';
import { setThemePreference, getThemePreference } from '@/components/providers/TelegramThemeProvider';
import { Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeSettings() {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    setCurrentTheme(getThemePreference());
  }, []);

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setThemePreference(theme);
    setCurrentTheme(theme);
  };

  const themes = [
    { value: 'system', icon: Monitor },
    { value: 'light', icon: Sun },
    { value: 'dark', icon: Moon },
  ] as const;

  return (
    <div className="flex w-fit items-center rounded-full border p-0.5 ring-1 ring-border">
      {themes.map((theme) => {
        const Icon = theme.icon;
        const isActive = currentTheme === theme.value;
        return (
          <button
            key={theme.value}
            onClick={() => handleThemeChange(theme.value)}
            className={cn(
              "rounded-full p-2.5 transition-all duration-200",
              isActive 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={`Select ${theme.value} theme`}
          >
            <Icon className="size-5" />
          </button>
        );
      })}
    </div>
  );
}

