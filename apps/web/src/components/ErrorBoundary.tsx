'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
	children?: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false
	};

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('Uncaught error:', error, errorInfo);
	}

	public render() {
		if (this.state.hasError) {
			return this.props.fallback || (
				<div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
					<h2 className="font-semibold mb-1">Something went wrong</h2>
					<p>{this.state.error?.message || 'Unknown error'}</p>
				</div>
			);
		}

		return this.props.children;
	}
}
