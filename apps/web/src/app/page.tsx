'use client';

import { useState } from 'react';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { HealthResponse } from '@tma/shared';
import { ReferralCard } from '@/components/ReferralCard';

export default function Home() {
  const { user, isLoading, isMockMode, isInTelegram } = useTelegramUser();
  const [healthStatus, setHealthStatus] = useState<HealthResponse | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    setError(null);
    
    try {
      const health = await api.health();
      setHealthStatus(health);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check health');
    } finally {
      setIsCheckingHealth(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20 dark:from-blue-500/10 dark:via-purple-500/5 dark:to-pink-500/10" />
        <div className="relative px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              TMA Boilerplate
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Production-ready Telegram Mini App starter template
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-6 py-12 space-y-8">
        {/* User Card */}
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <span className="text-2xl">👤</span>
            User Information
          </h2>
          
          {user ? (
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                {user.photo_url ? (
                  <img
                    src={user.photo_url}
                    alt={user.first_name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                    {user.first_name[0]}
                  </div>
                )}
                {user.is_premium && (
                  <span className="absolute -top-1 -right-1 text-lg">⭐</span>
                )}
              </div>
              
              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {user.first_name} {user.last_name}
                </p>
                {user.username && (
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                )}
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                    ID: {user.id}
                  </span>
                  {user.language_code && (
                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      🌐 {user.language_code.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No user data available</p>
          )}
        </section>

        {/* Environment Status */}
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <span className="text-2xl">🔌</span>
            Environment Status
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-secondary/50 p-4">
              <p className="text-sm text-muted-foreground">Running in Telegram</p>
              <p className="text-lg font-semibold mt-1">
                {isInTelegram ? (
                  <span className="text-green-600 dark:text-green-400">✓ Yes</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">✗ No</span>
                )}
              </p>
            </div>
            
            <div className="rounded-xl bg-secondary/50 p-4">
              <p className="text-sm text-muted-foreground">Mock Mode</p>
              <p className="text-lg font-semibold mt-1">
                {isMockMode ? (
                  <span className="text-green-600 dark:text-green-400">✓ Active</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">✗ Disabled</span>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* API Health Check */}
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <span className="text-2xl">❤️</span>
            API Health Check
          </h2>
          
          <div className="space-y-4">
            <Button
              onClick={checkHealth}
              disabled={isCheckingHealth}
              className="w-full"
            >
              {isCheckingHealth ? 'Checking...' : 'Check API Health'}
            </Button>
            
            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-destructive text-sm">
                <p className="font-medium">Error</p>
                <p className="mt-1">{error}</p>
              </div>
            )}
            
            {healthStatus && !error && (
              <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-green-700 dark:text-green-400">
                <p className="font-medium flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  API is {healthStatus.status}
                </p>
                <div className="mt-2 text-sm space-y-1">
                  <p>Version: {healthStatus.version}</p>
                  <p>Uptime: {healthStatus.uptime}s</p>
                  <p>Timestamp: {new Date(healthStatus.timestamp).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </section>

				{/* Referral System */}
				<section className="rounded-2xl border bg-card p-6 shadow-sm">
					<h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
						<span className="text-2xl">🔗</span>
						Referral System
					</h2>
					<ReferralCard />
				</section>

        {/* Quick Links */}
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            Quick Start
          </h2>
          
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              This boilerplate includes everything you need to build a Telegram Mini App:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Next.js 16</strong> with App Router & Turbopack</li>
              <li><strong>TypeScript</strong> for type safety</li>
              <li><strong>Tailwind CSS</strong> + shadcn/ui components</li>
              <li><strong>Express API</strong> with Telegram validation</li>
              <li><strong>Mock Environment</strong> for browser development</li>
              <li><strong>Shared Types</strong> between frontend and backend</li>
            </ul>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground py-8">
          <p>TMA Boilerplate • Built with ❤️</p>
        </footer>
      </div>
    </main>
  );
}
