'use client';

import { ReferralCard } from '@/components/ReferralCard';

export default function FriendsPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Friends</h1>
          <p className="text-muted-foreground">Invite friends and grow your network</p>
        </div>

        {/* Referral System */}
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <ReferralCard />
        </section>
      </div>
    </main>
  );
}
