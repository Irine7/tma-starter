import { Rocket } from 'lucide-react';

export function QuickStartCard() {
  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
        <Rocket className="w-6 h-6 text-primary" />
        Quick Start
      </h2>
      
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          This boilerplate includes everything you need to build a Telegram Mini App:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li><strong>Next.js 16</strong> with App Router & Turbopack</li>
          <li><strong>TON Connect</strong> wallet integration & transactions</li>
          <li><strong>Supabase</strong> database & authentication ready</li>
          <li><strong>Express API</strong> with Telegram validation</li>
          <li><strong>Tailwind CSS</strong> + shadcn/ui components</li>
          <li><strong>Mock Environment</strong> for browser development</li>
          <li><strong>Secure Tunneling</strong> via Cloudflare or Ngrok</li>
        </ul>
      </div>
    </section>
  );
}
