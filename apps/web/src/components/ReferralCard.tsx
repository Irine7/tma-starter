'use client';

import { useEffect, useState } from 'react';
import { api, User } from '@/lib/api';
import { useAuthUser } from '@/hooks/useTelegramUser';

interface ReferralCardProps {
  className?: string;
}

export function ReferralCard({ className = '' }: ReferralCardProps) {
  const { user, isLoading: authLoading } = useAuthUser();
  const [referrals, setReferrals] = useState<User[]>([]);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCreatingDebugReferral, setIsCreatingDebugReferral] = useState(false);

  // Fetch referrals when user is available
  useEffect(() => {
    if (user?.telegram_id) {
      fetchReferrals();
    }
  }, [user?.telegram_id]);

  const fetchReferrals = async () => {
    if (!user) return;

    setIsLoadingReferrals(true);
    setError(null);

    try {
      const response = await api.getReferrals(user.telegram_id);
      if (response.success && response.data) {
        setReferrals(response.data);
      } else {
        setError(response.error?.message || 'Failed to load referrals');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoadingReferrals(false);
    }
  };

  const handleInviteFriend = () => {
    if (!user) return;

    // Check if referral_code is available
    if (!user.referral_code) {
      alert('Referral code not yet generated. Please refresh the page.');
      return;
    }

    const referralUrl = `https://t.me/tma_boilerplate_bot/tma_boilerplate?startapp=${user.referral_code}`;

    // Check if we're actually running inside Telegram WebApp
    const isInTelegram = typeof window !== 'undefined' && 
                         window.Telegram?.WebApp?.platform && 
                         window.Telegram.WebApp.platform !== 'unknown';

    // Try to use Telegram WebApp API if we're in Telegram
    if (isInTelegram) {
      try {
        window.Telegram!.WebApp.openTelegramLink(referralUrl);
        return;
      } catch (error) {
        console.warn('Failed to open Telegram link:', error);
      }
    }

    // Fallback: Open in new window (browser mode)
    if (typeof window !== 'undefined') {
      const newWindow = window.open(referralUrl, '_blank', 'noopener,noreferrer');
      
      // If popup was blocked, copy to clipboard and notify user
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        copyToClipboard(referralUrl);
        alert('Please enable popups or use the copied link from your clipboard!');
      } else {
        // Also copy to clipboard for convenience
        copyToClipboard(referralUrl);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        },
        (err) => {
          console.error('Failed to copy:', err);
        }
      );
    }
  };

  /**
   * Debug function to create a mock referred user
   * This simulates a new user signing up with the current user's referral code
   */
  const handleDebugAddReferral = async () => {
    if (!user || !user.referral_code) {
      alert('User or referral code not available');
      return;
    }

    setIsCreatingDebugReferral(true);
    setError(null);

    try {
      // Generate a unique identifier for the new mock user
      const timestamp = Date.now();
      const randomId = Math.floor(Math.random() * 1000);
      const mockIdentifier = `mock_ref_${timestamp}_${randomId}`;
      
      // Format: mock_identifier|referral_code
      // This tells the backend to create a user with this identifier and apply the referral
      const mockInitData = `${mockIdentifier}|${user.referral_code}`;
      
      console.log('🧪 Creating debug referral with initData:', mockInitData);

      // Call the login endpoint with mock data
      const response = await api.login(mockInitData);

      if (response.success && response.data) {
        console.log('✅ Debug referral created:', response.data);
        
        if (response.data.referralApplied) {
          alert(`✅ Success! New user "${response.data.user.first_name}" was referred by you!`);
          // Refresh the referrals list
          await fetchReferrals();
        } else {
          alert('⚠️ User created but referral was not applied. Check console for details.');
        }
      } else {
        const errorMsg = response.error?.message || 'Failed to create debug referral';
        setError(errorMsg);
        alert(`❌ Error: ${errorMsg}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      alert(`❌ Error: ${errorMsg}`);
      console.error('❌ Debug referral creation failed:', err);
    } finally {
      setIsCreatingDebugReferral(false);
    }
  };

  if (authLoading) {
    return (
      <div className={className}>
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    console.log('ReferralCard: No user available');
    return (
      <div className={className}>
        <div className="text-center py-8 px-4 text-muted-foreground">
          <p>Please login to view referral information</p>
        </div>
      </div>
    );
  }

  console.log('ReferralCard: User loaded', { telegram_id: user.telegram_id, referral_code: user.referral_code });

  return (
    <div className={className}>
      {/* Header */}
      <div className="text-center mb-5">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          🎁 Invite Friends
        </h2>
        <p className="text-sm text-muted-foreground">
          Your code:{' '}
          <code className="bg-secondary px-2 py-1 rounded font-mono text-foreground">
            {user.referral_code || 'Loading...'}
          </code>
        </p>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-5 mb-5">
        <div className="flex flex-col items-center px-4 py-4 bg-secondary rounded-lg min-w-[100px]">
          <span className="text-[32px] font-bold text-primary">
            {referrals.length}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            Friends Invited
          </span>
        </div>
      </div>

      {/* Invite Button */}
      <button 
        className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg text-base font-semibold transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleInviteFriend}
        disabled={!user.referral_code}
      >
        {copied ? '✅ Link Copied!' : '📤 Invite Friend'}
      </button>

      {/* Debug button for development */}
      {process.env.NODE_ENV === 'development' && (
        <button 
          className="w-full py-3 mt-2 bg-secondary text-foreground border-2 border-dashed border-muted-foreground rounded-lg text-sm font-semibold transition-all hover:bg-muted hover:border-primary active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleDebugAddReferral}
          disabled={isCreatingDebugReferral || !user.referral_code}
        >
          {isCreatingDebugReferral ? '⏳ Creating...' : '🧪 Debug Add Ref'}
        </button>
      )}

      {/* Loading State */}
      {isLoadingReferrals && (
        <div className="text-center py-3 mt-4 rounded-md text-muted-foreground">
          Loading referrals...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-3 mt-4 rounded-md bg-destructive/10 text-destructive">
          Error: {error}
        </div>
      )}

      {/* Referrals List */}
      {!isLoadingReferrals && referrals.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Your Referrals
          </h3>
          {referrals.map((referral) => (
            <div 
              key={referral.telegram_id} 
              className="flex justify-between items-center p-3 bg-secondary rounded-lg mb-2"
            >
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-foreground">
                  {referral.first_name}
                  {referral.last_name ? ` ${referral.last_name}` : ''}
                </span>
                {referral.username && (
                  <span className="text-sm text-muted-foreground">
                    @{referral.username}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(referral.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoadingReferrals && referrals.length === 0 && (
        <div className="text-center py-8 px-4 text-muted-foreground">
          <p>No referrals yet. Share your link to get started!</p>
        </div>
      )}
    </div>
  );
}
