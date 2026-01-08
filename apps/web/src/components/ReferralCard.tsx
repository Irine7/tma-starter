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

    const referralUrl = `https://t.me/tma_boilerplate_bot?startapp=${user.referral_code}`;

    // Try to use Telegram WebApp API
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.openTelegramLink(referralUrl);
        return;
      } catch (error) {
        console.warn('Failed to open Telegram link:', error);
      }
    }

    // Fallback: Open in new window (browser mode)
    if (typeof window !== 'undefined') {
      window.open(referralUrl, '_blank', 'noopener,noreferrer');
      // Also copy to clipboard
      copyToClipboard(referralUrl);
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
      <div className={`referral-card ${className}`}>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    console.log('ReferralCard: No user available');
    return (
      <div className={`referral-card ${className}`}>
        <div className="empty-state">
          <p>Please login to view referral information</p>
        </div>
      </div>
    );
  }

  console.log('ReferralCard: User loaded', { telegram_id: user.telegram_id, referral_code: user.referral_code });

  return (
    <div className={`referral-card ${className}`}>
      <div className="referral-header">
        <h2>🎁 Invite Friends</h2>
        <p className="referral-code">
          Your code: <code>{user.referral_code || 'Loading...'}</code>
        </p>
      </div>

      <div className="referral-stats">
        <div className="stat-item">
          <span className="stat-value">{referrals.length}</span>
          <span className="stat-label">Friends Invited</span>
        </div>
      </div>

      <button 
        className="invite-button" 
        onClick={handleInviteFriend}
        disabled={!user.referral_code}
      >
        {copied ? '✅ Link Copied!' : '📤 Invite Friend'}
      </button>

      {/* Debug button for development */}
      {process.env.NODE_ENV === 'development' && (
        <button 
          className="debug-button" 
          onClick={handleDebugAddReferral}
          disabled={isCreatingDebugReferral || !user.referral_code}
        >
          {isCreatingDebugReferral ? '⏳ Creating...' : '🧪 Debug Add Ref'}
        </button>
      )}

      {isLoadingReferrals && (
        <div className="referrals-loading">Loading referrals...</div>
      )}

      {error && <div className="referrals-error">Error: {error}</div>}

      {!isLoadingReferrals && referrals.length > 0 && (
        <div className="referrals-list">
          <h3>Your Referrals</h3>
          {referrals.map((referral) => (
            <div key={referral.telegram_id} className="referral-item">
              <div className="referral-info">
                <span className="referral-name">
                  {referral.first_name}
                  {referral.last_name ? ` ${referral.last_name}` : ''}
                </span>
                {referral.username && (
                  <span className="referral-username">@{referral.username}</span>
                )}
              </div>
              <div className="referral-date">
                {new Date(referral.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoadingReferrals && referrals.length === 0 && (
        <div className="empty-state">
          <p>No referrals yet. Share your link to get started!</p>
        </div>
      )}

      <style jsx>{`
        .referral-card {
          background: var(--tg-theme-bg-color, #ffffff);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .referral-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .referral-header h2 {
          margin: 0 0 8px 0;
          color: var(--tg-theme-text-color, #000000);
          font-size: 24px;
        }

        .referral-code {
          margin: 0;
          color: var(--tg-theme-hint-color, #999999);
          font-size: 14px;
        }

        .referral-code code {
          background: var(--tg-theme-secondary-bg-color, #f0f0f0);
          padding: 4px 8px;
          border-radius: 4px;
          font-family: monospace;
          color: var(--tg-theme-text-color, #000000);
        }

        .referral-stats {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          background: var(--tg-theme-secondary-bg-color, #f7f7f7);
          border-radius: 8px;
          min-width: 100px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: var(--tg-theme-button-color, #3390ec);
        }

        .stat-label {
          font-size: 12px;
          color: var(--tg-theme-hint-color, #999999);
          margin-top: 4px;
        }

        .invite-button {
          width: 100%;
          padding: 14px;
          background: var(--tg-theme-button-color, #3390ec);
          color: var(--tg-theme-button-text-color, #ffffff);
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .invite-button:hover {
          opacity: 0.9;
        }

        .invite-button:active {
          opacity: 0.8;
        }
        
        .invite-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .debug-button {
          width: 100%;
          padding: 12px;
          margin-top: 8px;
          background: var(--tg-theme-secondary-bg-color, #f0f0f0);
          color: var(--tg-theme-text-color, #000000);
          border: 2px dashed var(--tg-theme-hint-color, #999999);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .debug-button:hover {
          background: var(--tg-theme-hint-color, #e0e0e0);
          border-color: var(--tg-theme-button-color, #3390ec);
        }

        .debug-button:active {
          transform: scale(0.98);
        }

        .debug-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .referrals-loading,
        .referrals-error {
          text-align: center;
          padding: 12px;
          margin-top: 16px;
          border-radius: 6px;
        }

        .referrals-loading {
          color: var(--tg-theme-hint-color, #999999);
        }

        .referrals-error {
          color: #ff3b30;
          background: rgba(255, 59, 48, 0.1);
        }

        .referrals-list {
          margin-top: 24px;
        }

        .referrals-list h3 {
          margin: 0 0 12px 0;
          color: var(--tg-theme-text-color, #000000);
          font-size: 18px;
        }

        .referral-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: var(--tg-theme-secondary-bg-color, #f7f7f7);
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .referral-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .referral-name {
          font-weight: 600;
          color: var(--tg-theme-text-color, #000000);
        }

        .referral-username {
          font-size: 14px;
          color: var(--tg-theme-hint-color, #999999);
        }

        .referral-date {
          font-size: 12px;
          color: var(--tg-theme-hint-color, #999999);
        }

        .empty-state {
          text-align: center;
          padding: 32px 16px;
          color: var(--tg-theme-hint-color, #999999);
        }

        .empty-state p {
          margin: 0;
        }

        .loading {
          text-align: center;
          padding: 32px;
          color: var(--tg-theme-hint-color, #999999);
        }
      `}</style>
    </div>
  );
}
