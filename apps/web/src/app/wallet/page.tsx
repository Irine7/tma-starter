'use client';

import { useEffect, useCallback, useRef } from 'react';
import { TonConnectButton, useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import { useAuth } from '@/contexts/AuthContext';
import { api, WalletConnectionData } from '@/lib/api';
import { Check } from 'lucide-react';

export default function WalletPage() {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const { user, updateUser } = useAuth();
  
  // Use a ref for user to avoid effect re-execution loops that cause crashes
  const userRef = useRef(user);
  
  // Update ref when user changes
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  /**
   * Sync wallet connection state with database
   */
  const syncWalletToDatabase = useCallback(async (walletData: WalletConnectionData) => {
    const currentUser = userRef.current;
    
    if (!currentUser) {
      console.log('⚠️ No user, skipping wallet sync');
      return;
    }

    try {
      const response = await api.connectWallet(currentUser.telegram_id, walletData);
      
      if (response.success && response.data) {
        updateUser(response.data);
        console.log('✅ Wallet synced to database');
      } else {
        console.error('❌ Failed to sync wallet:', response.error?.message);
      }
    } catch (error) {
      console.error('❌ Error syncing wallet:', error);
    }
  }, [updateUser]);

  /**
   * Handle wallet disconnection
   */
  const handleDisconnect = useCallback(async () => {
    const currentUser = userRef.current;
    if (!currentUser) return;

    try {
      const response = await api.disconnectWallet(currentUser.telegram_id);
      
      if (response.success && response.data) {
        updateUser(response.data);
        console.log('✅ Wallet disconnected from database');
      } else {
        console.error('❌ Failed to disconnect wallet:', response.error?.message);
      }
    } catch (error) {
      console.error('❌ Error disconnecting wallet:', error);
    }
  }, [updateUser]);

  /**
   * Helper to get chain ID as number (TonConnect may return string)
   */
  const getChainId = (chain: string | number): number => {
    if (typeof chain === 'number') return chain;
    const parsed = parseInt(chain, 10);
    return isNaN(parsed) ? -239 : parsed;
  };

  /**
   * Helper to format address
   */
  const formatAddress = (rawAddress: string, chain: number): string => {
    try {
      // chain: -239 = Mainnet, -3 = Testnet
      const isTestnet = chain === -3;
      return Address.parse(rawAddress).toString({
        urlSafe: true,
        bounceable: false,
        testOnly: isTestnet
      });
    } catch (e) {
      console.error('Error formatting address:', e);
      return rawAddress;
    }
  };

  /**
   * Listen for wallet connection/disconnection events
   */
  useEffect(() => {
    if (!tonConnectUI) return;

    const unsubscribe = tonConnectUI.onStatusChange((walletInfo) => {
      if (walletInfo) {
        // Wallet connected
        const chainId = getChainId(walletInfo.account.chain);
        const walletData: WalletConnectionData = {
          address: walletInfo.account.address,
          addressFriendly: formatAddress(walletInfo.account.address, chainId),
          chain: chainId,
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
    // We only want to run this once on mount/wallet init, basically check consistency
    // But be careful not to trigger infinite loops.
    // userRef check is safer.
    const currentUser = userRef.current;
    
    if (wallet && currentUser && !currentUser.wallet_connected) {
      const chainId = getChainId(wallet.account.chain);
      const walletData: WalletConnectionData = {
        address: wallet.account.address,
        addressFriendly: formatAddress(wallet.account.address, chainId),
        chain: chainId,
        appName: wallet.device?.appName,
      };
      
      syncWalletToDatabase(walletData);
    }
  }, [wallet, syncWalletToDatabase]); // user removed from dep to avoid re-trigger loop

  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-2xl px-6 pt-24 pb-12">
        <h1 className="text-3xl font-bold text-foreground mb-4">Wallet</h1>
        <p className="text-muted-foreground mb-8">Manage your TON wallet connection</p>
        
        <div className="flex flex-col items-center justify-center p-8 bg-card rounded-xl border border-border shadow-sm">
          {(wallet || user?.wallet_connected) ? (
            <>
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-6 ring-1 ring-green-500/20">
                <Check className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold mb-2">Wallet Connected</h3>
              
              <div className="flex flex-col items-center gap-1 mb-8">
                <p className="text-muted-foreground text-center">
                  Connected to <span className="font-medium text-foreground">{wallet?.device.appName || user?.wallet_app_name || 'TON Wallet'}</span>
                </p>
                
                <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-muted rounded-full">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-mono text-sm">
                    {(() => {
                      const addr = user?.wallet_address_friendly || wallet?.account.address || user?.wallet_address;
                      if (!addr) return 'Unknown Address';
                      // If it looks like a raw address (contains :), try to format it for display
                      if (addr.includes(':') && wallet?.account.chain) {
                         const chainId = getChainId(wallet.account.chain);
                         return formatAddress(addr, chainId);
                      }
                      return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
                    })()}
                  </span>
                </div>
                
                <span className="text-xs text-muted-foreground mt-1">
                  {(wallet?.account.chain ?? user?.wallet_chain) === -239 ? 'Mainnet' : 'Testnet'}
                </span>
              </div>

              {!wallet && (
                <div className="mb-6 p-3 border text-black dark:text-white text-sm rounded-lg text-center max-w-xs">
                  Session disconnected locally. <br/>Reconnect to sign transactions.
                </div>
              )}
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <img 
                   src="/icons/ton-wallet.svg"
                   alt="Wallet"
                   className="w-10 h-10"
                   onError={(e) => {
                     e.currentTarget.style.display = 'none';
                     e.currentTarget.parentElement!.innerHTML = '<svg class="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>';
                   }}
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Wallet</h3>
              <p className="text-muted-foreground mb-8 text-center max-w-[280px]">
                Connect your TON wallet to access premium features and manage your assets
              </p>
            </>
          )}
          
          <div className="w-full flex justify-center transform scale-100 origin-top">
             <TonConnectButton className="my-ton-connect-button" />
          </div>
        </div>
      </div>
    </main>
  );
}
