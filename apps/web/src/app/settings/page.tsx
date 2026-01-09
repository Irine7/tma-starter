'use client';

import { ThemeSettings } from '@/components/ThemeSettings';

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and app preferences</p>
        </div>

        {/* Appearance Section */}
        <section className="mb-8">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-card-foreground mb-1 flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              Appearance
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Customize how the app looks
            </p>
            <ThemeSettings />
          </div>
        </section>

        {/* Account Section - Placeholder */}
        <section className="mb-8">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-card-foreground mb-1 flex items-center gap-2">
              <span className="text-2xl">👤</span>
              Account
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your profile and account settings
            </p>
            <div className="text-sm text-muted-foreground italic">
              Coming soon...
            </div>
          </div>
        </section>

        {/* Notifications Section - Placeholder */}
        <section className="mb-8">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-card-foreground mb-1 flex items-center gap-2">
              <span className="text-2xl">🔔</span>
              Notifications
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Configure notification preferences
            </p>
            <div className="text-sm text-muted-foreground italic">
              Coming soon...
            </div>
          </div>
        </section>

        {/* Privacy Section - Placeholder */}
        <section className="mb-8">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-card-foreground mb-1 flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              Privacy & Security
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Control your privacy and security settings
            </p>
            <div className="text-sm text-muted-foreground italic">
              Coming soon...
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground py-8">
          <p>TMA Boilerplate v1.0.0</p>
        </footer>
      </div>
    </main>
  );
}
