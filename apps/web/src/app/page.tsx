'use client';

import { useTelegramUser } from '@/hooks/useTelegramUser';
import { HapticFeedback } from '@/components/HapticFeedback';
import { DeveloperDonation } from '@/components/features/donation/DeveloperDonation';
import { UserInfoCard } from '@/components/features/home/UserInfoCard';
import { EnvironmentStatusCard } from '@/components/features/home/EnvironmentStatusCard';
import { ApiHealthCard } from '@/components/features/home/ApiHealthCard';
import { QuickStartCard } from '@/components/features/home/QuickStartCard';

export default function Home() {
  const { user, isLoading, isMockMode, isInTelegram } = useTelegramUser();

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
        <div className="absolute inset-0 bg-background" />
        <div className="relative px-6 pt-24">
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

      {/* Developer Donation */}
      <DeveloperDonation />

      {/* Content */}
      <div className="mx-auto max-w-2xl px-6 pb-12 space-y-8">
        {/* User Card */}
        <UserInfoCard user={user} />

        {/* Environment Status */}
        <EnvironmentStatusCard isInTelegram={isInTelegram} isMockMode={isMockMode} />

        {/* API Health Check */}
        <ApiHealthCard />

        {/* Haptic Feedback Demo */}
        <HapticFeedback />

        {/* Quick Links */}
        <QuickStartCard />
      </div>
    </main>
  );
}
