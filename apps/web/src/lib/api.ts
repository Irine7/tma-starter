import type { ApiResponse, HealthResponse } from '@tma/shared';

/**
 * API Client for TMA Boilerplate
 * Handles communication with the backend API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Get the current Telegram initData for API authorization
 */
function getInitData(): string | null {
  if (typeof window === 'undefined') return null;
  
  // First, try to get from Telegram WebApp
  const webApp = window.Telegram?.WebApp;
  if (webApp?.initData) {
    return webApp.initData;
  }
  
  return null;
}

/**
 * Fetch wrapper with Telegram authorization
 */
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const initData = getInitData();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add Telegram initData to headers if available
  if (initData) {
    (headers as Record<string, string>)['Authorization'] = `tma ${initData}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `API error: ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * API Client
 */
export const api = {
  /**
   * Check API health status
   */
  health: async (): Promise<HealthResponse> => {
    return fetchWithAuth<HealthResponse>('/health');
  },
  
  /**
   * Generic GET request
   */
  get: async <T>(endpoint: string): Promise<T> => {
    return fetchWithAuth<T>(endpoint);
  },
  
  /**
   * Generic POST request
   */
  post: async <T>(endpoint: string, data?: unknown): Promise<T> => {
    return fetchWithAuth<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  /**
   * Generic PUT request
   */
  put: async <T>(endpoint: string, data?: unknown): Promise<T> => {
    return fetchWithAuth<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  /**
   * Generic DELETE request
   */
  delete: async <T>(endpoint: string): Promise<T> => {
    return fetchWithAuth<T>(endpoint, {
      method: 'DELETE',
    });
  },
};

export { API_BASE_URL };
