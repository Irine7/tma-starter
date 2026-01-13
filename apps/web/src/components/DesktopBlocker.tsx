'use client';

import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';

/**
 * DesktopBlocker Component
 * 
 * Shows a blocking screen when the app is opened from Telegram Desktop.
 * Encourages users to open the app on their mobile device.
 */
export function DesktopBlocker({ botUsername }: { botUsername?: string }) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    
    if (telegram && telegram.platform) {
      // Check if running on desktop platforms
      const desktopPlatforms = ['tdesktop', 'macos', 'weba', 'webk', 'web'];
      const platform = telegram.platform.toLowerCase();
      
      const isDesktopPlatform = desktopPlatforms.some(p => platform.includes(p));
      setIsDesktop(isDesktopPlatform);
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return null;
  }

  if (!isDesktop) {
    return null;
  }

  const botLink = botUsername ? `https://t.me/${botUsername}` : null;
  
  // Generate QR code URL using a free QR code API
  const qrCodeUrl = botLink 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(botLink)}&bgcolor=000000&color=ffffff`
    : null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-8 text-white">
      <div className="text-center max-w-md space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Smartphone className="w-10 h-10" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight uppercase">
            Open on your mobile
          </h1>
          <p className="text-gray-400 text-sm">
            This app is designed for mobile devices only
          </p>
        </div>

        {/* QR Code */}
        {qrCodeUrl && (
          <div className="flex justify-center">
            <div className="bg-white p-3 rounded-2xl">
              <img 
                src={qrCodeUrl} 
                alt="QR Code to open bot" 
                className="w-48 h-48"
              />
            </div>
          </div>
        )}

        {/* Bot username */}
        {botUsername && (
          <p className="text-lg font-semibold text-gray-300">
            @{botUsername}
          </p>
        )}

        {/* Instructions */}
        <p className="text-gray-500 text-xs">
          Scan the QR code with your phone camera or open Telegram on your mobile device
        </p>
      </div>
    </div>
  );
}