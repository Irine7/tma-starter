'use client';

import { useEffect } from 'react';

/**
 * Component to enable the Telegram WebApp closing confirmation popup.
 * This will show a native confirmation dialog when the user tries to close the Mini App.
 */
export function ClosingConfirmation() {
  useEffect(() => {
    // Check if running in browser environment and Telegram WebApp is available
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      // Enable closing confirmation
      window.Telegram.WebApp.enableClosingConfirmation();
      console.log('🔒 Closing confirmation enabled');

      // Cleanup on unmount (optional for root layout, but good practice)
      return () => {
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.disableClosingConfirmation();
          console.log('🔓 Closing confirmation disabled');
        }
      };
    }
  }, []);

  // This component doesn't render anything
  return null;
}
