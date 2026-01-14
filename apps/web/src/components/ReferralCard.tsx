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

    const referralUrl = `https://t.me/tma_starter_bot/starter?startapp=${user.referral_code}`;
    const shareText = 'Присоединяйся и получи 1000 корон!';

    // Check if we're actually running inside Telegram WebApp
    const isInTelegram = typeof window !== 'undefined' && 
                         window.Telegram?.WebApp?.platform && 
                         window.Telegram.WebApp.platform !== 'unknown';

    // Use Telegram WebApp API to open native share dialog
    if (isInTelegram) {
      try {
        // Use openTelegramLink with t.me/share/url for native share dialog
        // This opens the Telegram share UI with chat picker
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(shareText)}`;
        window.Telegram!.WebApp.openTelegramLink(shareUrl);
        return;
      } catch (error) {
        console.warn('Failed to open Telegram share dialog:', error);
        // Fallback: copy to clipboard
        copyToClipboard(referralUrl);
      }
    }

    // Fallback for browser mode: copy to clipboard
    copyToClipboard(referralUrl);
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
          Invite Friends
        </h2>
        {/* <p className="text-sm text-muted-foreground">
          Your code:
          <code className="px-2 py-1 rounded font-mono text-foreground">
            {user.referral_code || 'Loading...'}
          </code>
        </p> */}
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-5 mb-5">
        <div className="flex flex-col items-center px-4 py-4 border rounded-lg min-w-[100px]">
          <span className="text-[32px] font-bold text-primary">
            {referrals.length}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            Friends Invited
          </span>
        </div>
      </div>

      {/* Toast Notification */}
      {copied && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-card border border-border rounded-full px-6 py-3 shadow-lg">
            <span className="text-sm font-medium text-foreground">Copied to clipboard</span>
          </div>
        </div>
      )}

      {/* Invite Button with Copy Button */}
      <div className="flex gap-2">
        <button 
          className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-lg text-base font-semibold transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleInviteFriend}
          disabled={!user.referral_code}
        >
          Invite Friend
        </button>
        <button 
          className="px-4 py-3.5 border border-border rounded-lg transition-all hover:bg-muted active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            if (user.referral_code) {
              const referralUrl = `https://t.me/tma_starter_bot/starter?startapp=${user.referral_code}`;
              copyToClipboard(referralUrl);
            }
          }}
          disabled={!user.referral_code}
          title="Copy link"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-foreground"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
        </button>
      </div>

      {/* Debug button for development */}
      {process.env.NODE_ENV === 'development' && (
        <button 
          className="w-full py-3 mt-2 border text-foreground border rounded-lg text-sm font-semibold transition-all hover:bg-muted hover:border-primary active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleDebugAddReferral}
          disabled={isCreatingDebugReferral || !user.referral_code}
        >
          {isCreatingDebugReferral ? 'Creating...' : 'Debug Add Ref'}
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
              className="bg-card flex items-center gap-3 p-3 border rounded-lg mb-2"
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {referral.photo_url ? (
                  <img 
                    src={referral.photo_url} 
                    alt={referral.first_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                    {referral.first_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Username/Name */}
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-foreground block truncate">
                  {referral.username ? `@${referral.username}` : referral.first_name}
                </span>
                {referral.username && (
                  <span className="text-sm text-muted-foreground truncate block">
                    {referral.first_name}{referral.last_name ? ` ${referral.last_name}` : ''}
                  </span>
                )}
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
