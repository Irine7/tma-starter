'use client';

import { useState } from 'react';
import { Heart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { HealthResponse } from '@tma/shared';

export function ApiHealthCard() {
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

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
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
              <Check className="w-5 h-5" />
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
  );
}
