'use client';

import { TonConnectButton } from '@tonconnect/ui-react';

export default function WalletPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-4">Wallet</h1>
        <p className="text-muted-foreground mb-8">Manage your balance and transactions.</p>
        
        <div className="flex flex-col items-center justify-center p-8 bg-card rounded-xl border border-border">
            <p className="text-sm text-muted-foreground mb-4">Connect your TON wallet to continue</p>
            <TonConnectButton />
        </div>
      </div>
    </main>
  );
}
