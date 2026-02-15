import { Plug, Check, X } from 'lucide-react';

interface EnvironmentStatusCardProps {
  isInTelegram: boolean;
  isMockMode: boolean;
}

export function EnvironmentStatusCard({ isInTelegram, isMockMode }: EnvironmentStatusCardProps) {
  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
        <Plug className="w-6 h-6 text-primary" />
        Environment Status
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Running in Telegram</p>
          <p className="text-lg font-semibold mt-1">
            {isInTelegram ? (
              <span className="text-green-600 dark:text-green-400 flex items-center gap-1"><Check className="w-4 h-4" /> Yes</span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1"><X className="w-4 h-4" /> No</span>
            )}
          </p>
        </div>
        
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Mock Mode</p>
          <p className="text-lg font-semibold mt-1">
            {isMockMode ? (
              <span className="text-green-600 dark:text-green-400 flex items-center gap-1"><Check className="w-4 h-4" /> Active</span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1"><X className="w-4 h-4" /> Disabled</span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
