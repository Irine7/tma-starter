'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface TonConnectProviderProps {
	children: ReactNode;
}

export function TonConnectProvider({ children }: TonConnectProviderProps) {
	// Ensure we have a valid manifest URL.
	// In development, you might want to point this to your local server if testing on a real device,
	// but for now we'll use the public path which works for relative fetches in some contexts,
	// or better, a full URL.
	// Using a relative path often works if the app is hosted, but for local dev with a tunnel, a full URL is strictly better.
	// We'll trust the manifest we created.

	// Note: TonConnect usually requires a full absolute URL for the manifest.
	// We will assume window.location.origin is available since this is a client component.
	const manifestUrl = typeof window !== 'undefined'
		? `${window.location.origin}/tonconnect-manifest.json`
		: '';

	return (
		<ErrorBoundary fallback={<div className="p-4 text-center text-muted-foreground">Wallet connection unavailable</div>}>
			<TonConnectUIProvider
				manifestUrl={manifestUrl}
				actionsConfiguration={{
					twaReturnUrl: 'tg://resolve?domain=tma_starter_bot'
				}}
			>
				{children}
			</TonConnectUIProvider>
		</ErrorBoundary>
	);
}
