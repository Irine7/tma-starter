'use client';

import { useTelegramContext } from '@/components/providers/TelegramContext';
import { Button } from '@/components/ui/button';
import { Vibrate, Zap, Bell, Check, AlertTriangle, X } from 'lucide-react';

type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type NotificationType = 'success' | 'warning' | 'error';

/**
 * Demo component for Telegram Haptic Feedback
 * Shows different types of haptic feedback available in Telegram Mini Apps
 */
export function HapticFeedback() {
  const { webApp, isInTelegram } = useTelegramContext();

  const triggerImpact = (style: ImpactStyle) => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred(style);
    }
  };

  const triggerNotification = (type: NotificationType) => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.notificationOccurred(type);
    }
  };

  const triggerSelectionChanged = () => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.selectionChanged();
    }
  };

  const impactStyles: { style: ImpactStyle; label: string; description: string }[] = [
    { style: 'light', label: 'Light', description: 'Легкая вибрация' },
    { style: 'medium', label: 'Medium', description: 'Средняя вибрация' },
    { style: 'heavy', label: 'Heavy', description: 'Сильная вибрация' },
    { style: 'rigid', label: 'Rigid', description: 'Жёсткая вибрация' },
    { style: 'soft', label: 'Soft', description: 'Мягкая вибрация' },
  ];

  const notificationTypes: { type: NotificationType; label: string; icon: typeof Check; color: string }[] = [
    { type: 'success', label: 'Success', icon: Check, color: 'text-green-500' },
    { type: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-yellow-500' },
    { type: 'error', label: 'Error', icon: X, color: 'text-red-500' },
  ];

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
        <Vibrate className="w-6 h-6 text-primary" />
        Haptic Feedback
      </h2>

      {!isInTelegram && (
        <div className="rounded-xl bg-card border p-4 text-muted-foreground text-sm mb-4">
          <p className="font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Haptic Feedback is available only in Telegram
          </p>
          <p className="mt-1">Open the app through Telegram to test vibrations.</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Impact Feedback */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Impact Vibration
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {impactStyles.map(({ style, label }) => (
              <Button
                key={style}
                variant="outline"
                size="sm"
                onClick={() => triggerImpact(style)}
                disabled={!isInTelegram}
                className="w-full"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Notification Feedback */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notification Vibration
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {notificationTypes.map(({ type, label, icon: Icon, color }) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => triggerNotification(type)}
                disabled={!isInTelegram}
                className="w-full"
              >
                <Icon className={`w-4 h-4 mr-1 ${color}`} />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Selection Changed */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Selection Changed
          </h3>
          <Button
            variant="outline"
            onClick={triggerSelectionChanged}
            disabled={!isInTelegram}
            className="w-full"
          >
            Trigger Selection Vibration
          </Button>
        </div>
      </div>
    </section>
  );
}
