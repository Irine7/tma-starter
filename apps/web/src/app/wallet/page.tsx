'use client';

import { useEffect, useCallback } from 'react';
import { TonConnectButton, useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { useAuth } from '@/contexts/AuthContext';
import { api, WalletConnectionData } from '@/lib/api';

export default function WalletPage() {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const { user, updateUser } = useAuth();

  /**
   * Sync wallet connection state with database
   */
  const syncWalletToDatabase = useCallback(async (walletData: WalletConnectionData) => {
    if (!user) {
      console.log('⚠️ No user, skipping wallet sync');
      return;
    }

    try {
      const response = await api.connectWallet(user.telegram_id, walletData);
      
      if (response.success && response.data) {
        updateUser(response.data);
        console.log('✅ Wallet synced to database');
      } else {
        console.error('❌ Failed to sync wallet:', response.error?.message);
      }
    } catch (error) {
      console.error('❌ Error syncing wallet:', error);
    }
  }, [user, updateUser]);

  /**
   * Handle wallet disconnection
   */
  const handleDisconnect = useCallback(async () => {
    if (!user) return;

    try {
      const response = await api.disconnectWallet(user.telegram_id);
      
      if (response.success && response.data) {
        updateUser(response.data);
        console.log('✅ Wallet disconnected from database');
      } else {
        console.error('❌ Failed to disconnect wallet:', response.error?.message);
      }
    } catch (error) {
      console.error('❌ Error disconnecting wallet:', error);
    }
  }, [user, updateUser]);

  /**
   * Listen for wallet connection/disconnection events
   */
  useEffect(() => {
    if (!tonConnectUI) return;

    const unsubscribe = tonConnectUI.onStatusChange((walletInfo) => {
      if (walletInfo) {
        // Wallet connected
        const walletData: WalletConnectionData = {
          address: walletInfo.account.address,
          addressFriendly: walletInfo.account.address, // TonConnect returns user-friendly by default
          chain: typeof walletInfo.account.chain === 'number' ? walletInfo.account.chain : -239,
          appName: walletInfo.device?.appName,
        };
        
        syncWalletToDatabase(walletData);
      } else {
        // Wallet disconnected
        handleDisconnect();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI, syncWalletToDatabase, handleDisconnect]);

  /**
   * Sync on initial load if wallet is already connected
   */
  useEffect(() => {
    if (wallet && user && !user.wallet_connected) {
      const walletData: WalletConnectionData = {
        address: wallet.account.address,
        addressFriendly: wallet.account.address,
        chain: typeof wallet.account.chain === 'number' ? wallet.account.chain : -239,
        appName: wallet.device?.appName,
      };
      
      syncWalletToDatabase(walletData);
    }
  }, [wallet, user, syncWalletToDatabase]);

  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-2xl px-6 pt-24 pb-12">
        <h1 className="text-3xl font-bold text-foreground mb-4">Wallet</h1>
        <p className="text-muted-foreground mb-8">Manage your TON wallet connection</p>
        
        <div className="flex flex-col items-center justify-center p-8 bg-card rounded-xl border border-border">
          {wallet ? (
            <>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-green-500 font-medium mb-2">Wallet Connected</p>
              <p className="text-xs text-muted-foreground mb-4 font-mono break-all text-center">
                {wallet.account.address.slice(0, 8)}...{wallet.account.address.slice(-8)}
              </p>
              {wallet.device?.appName && (
                <p className="text-xs text-muted-foreground mb-4">
                  via {wallet.device.appName}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground mb-4">Connect your TON wallet to continue</p>
          )}
          
          <TonConnectButton />
        </div>

        {/* Wallet Status from Database */}
        {user?.wallet_connected && (
          <div className="mt-6 p-4 bg-card/50 rounded-lg border border-border">
            <h3 className="text-sm font-medium text-foreground mb-2">Database Status</h3>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Address: <span className="font-mono">{user.wallet_address_friendly?.slice(0, 12)}...</span></p>
              <p>Chain: {user.wallet_chain === -239 ? 'Mainnet' : 'Testnet'}</p>
              {user.wallet_app_name && <p>App: {user.wallet_app_name}</p>}
              {user.wallet_connected_at && (
                <p>Connected: {new Date(user.wallet_connected_at).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
