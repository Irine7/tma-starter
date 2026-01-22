'use client';

import { useState } from 'react';
import { useTonConnectUI, UserRejectsError } from '@tonconnect/ui-react';
import { toNano } from '@ton/core';
import { toast } from 'sonner';
import { Heart, Gift, Copy, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DeveloperDonation() {
  const [tonConnectUI] = useTonConnectUI();
  const [isOpen, setIsOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const presets = [1, 3, 5, 10];
  const devWallet = process.env.NEXT_PUBLIC_DEV_WALLET;
  const evmWallet = process.env.NEXT_PUBLIC_EVM_WALLET;

  const handleCopy = () => {
    if (!evmWallet) return;
    navigator.clipboard.writeText(evmWallet);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.success('Address copied to clipboard!');
  };

  const handleSend = async () => {
    if (!devWallet) {
      toast.error('Developer wallet not configured');
      return;
    }

    const amount = selectedAmount || Number(customAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      if (!tonConnectUI.connected) {
        await tonConnectUI.openModal();
        return;
      }

      // Log payment info for debugging
      const currentChain = tonConnectUI.account?.chain;
      const isTestnet = currentChain === '-3';
      
      console.log('Payment Debug:', {
        chain: currentChain,
        devWallet,
        isTestnet,
        network: isTestnet ? 'Testnet' : 'Mainnet'
      });

      await tonConnectUI.sendTransaction({
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: [
          {
            address: devWallet,
            amount: toNano(amount).toString(),
          },
        ],
      });

      toast.success('Thank you for your support! 💖');
      setIsOpen(false);
      setCustomAmount('');
      setSelectedAmount(null);
    } catch (e) {
      // Check if user cancelled the transaction or it wasn't sent
      // Check if user cancelled the transaction or it wasn't sent
      const isCancelled = 
        e instanceof UserRejectsError || 
        (e instanceof Error && (
          e.name === 'UserRejectsError' || 
          e.name === 'TonConnectUIError' ||
          e.message?.includes('reject') || 
          e.message?.includes('cancel') ||
          e.message?.includes('Transaction was not sent')
        )) ||
        // Fallback for non-Error objects that might be strings
        String(e).includes('reject') ||
        String(e).includes('cancel') ||
        String(e).includes('Transaction was not sent');

      if (isCancelled) {
         toast.info('Payment cancelled');
         return;
      }
      
      console.error(e);
      toast.error('Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="mx-auto max-w-2xl px-6 pt-8 mb-8">
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-primary/20" />
            Support Development
          </h2>
          
          <p className="text-sm text-muted-foreground mb-4">
            Help me build more amazing features. Your support keeps this project alive! ☕
          </p>
          
          <Button
            onClick={() => setIsOpen(true)}
            className="w-full bg-gradient-to-r from-primary to-ring hover:from-primary/80 hover:to-ring/80 text-white shadow-lg shadow-primary/20"
          >
            <Gift className="w-5 h-5 mr-2" />
            Make a Donation
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-background rounded-lg shadow-2xl overflow-hidden border border-border/50 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-ring/10 p-6 text-center border-b border-border/50">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-ring rounded-full flex items-center justify-center mb-3 shadow-lg">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-ring bg-clip-text text-transparent">
            Support Development
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Build with love. Buy me a coffee! ☕
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Presets */}
          <div className="grid grid-cols-4 gap-3">
            {presets.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount('');
                }}
                className={cn(
                  "p-3 rounded-lg border transition-all duration-200 font-medium text-sm flex flex-col items-center gap-1",
                  selectedAmount === amount
                    ? "border-primary/80 bg-primary/5 text-primary shadow-sm scale-105"
                    : "border-border hover:border-primary/80 hover:bg-primary/50"
                )}
              >
                <span className="text-lg font-bold">{amount}</span>
                <span className="text-[10px] opacity-70">TON</span>
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="relative">
            <input
              type="number"
              placeholder="Custom amount"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
              }}
              className="w-full h-12 rounded-lg border border-input bg-background px-4 text-center text-lg font-medium shadow-sm transition-colors focus:border-primary/80 focus:outline-none focus:ring-1 focus:ring-primary/80 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
              TON
            </span>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleSend}
            disabled={isLoading || (!selectedAmount && !customAmount && tonConnectUI.connected)}
            className="w-full h-12 rounded-xl text-lg font-semibold bg-gradient-to-r from-primary to-ring hover:from-primary/80 hover:to-ring/80 text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              "Processing..."
            ) : !tonConnectUI.connected ? (
              "Connect Wallet"
            ) : (
              <span className="flex items-center gap-2">
                Send Donation <Heart className="w-5 h-5 fill-white/20" />
              </span>
            )}
          </Button>

          {/* Crypto Address */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
              <Info className="w-3 h-3" />
              <span>Support in other currencies (ETH/BSC)</span>
            </div>
            
            <button
              onClick={handleCopy}
              className="w-full group relative overflow-hidden rounded-lg border border-input bg-background p-3 text-left transition-colors  border-border hover:border-primary/80 hover:bg-primary/50"
            >
              <div className="flex items-center justify-between gap-3">
                <code className="text-xs text-muted-foreground font-mono truncate">
                  {evmWallet || '0x...'}
                </code>
                {isCopied ? (
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                )}
              </div>
              <span className="sr-only">Copy address</span>
            </button>
          </div>
        </div>
          {/* Debug Info Toggle */}
          <div className="pt-2 text-center">
             <button 
               onClick={() => setShowDebug(!showDebug)}
               className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground underline"
             >
               {showDebug ? 'Hide Debug Info' : 'Debug Info'}
             </button>
             
             {showDebug && (
               <div className="mt-2 text-[10px] text-left p-2 bg-muted/50 rounded border font-mono break-all">
                 <p><strong>Env:</strong> {process.env.NODE_ENV}</p>
                 <p><strong>Chain:</strong> {tonConnectUI.account?.chain ?? 'N/A'}</p>
                 <p><strong>Wallet:</strong> {tonConnectUI.wallet?.device.appName ?? 'N/A'}</p>
                 <p><strong>Dev Addr:</strong> {devWallet?.slice(0, 10)}...</p>
                 <p><strong>Manifest:</strong> {(tonConnectUI as any).walletConnectCheckout?.manifestUrl ?? 'N/A'}</p>
               </div>
             )}
          </div>
      </div>
    </div>
  );
}
