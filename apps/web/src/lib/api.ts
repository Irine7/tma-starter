import type { ApiResponse, HealthResponse } from '@tma/shared';

/**
 * API Client for TMA Boilerplate
 * Handles communication with the backend API
 */

/**
 * Get the correct API base URL based on environment
 * - In Telegram WebApp: use NEXT_PUBLIC_API_URL (ngrok)
 * - In browser (mock mode): use localhost
 */
function getApiBaseUrl(): string {
  // Check if we're in Telegram Mini App
  if (typeof window !== 'undefined') {
    const webApp = window.Telegram?.WebApp;
    if (webApp?.initData) {
      // Real Telegram environment - use ngrok URL
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    }
  }
  
  // Browser/mock mode - always use localhost
  return 'http://localhost:3001';
}

// ===========================================
// Types
// ===========================================

export interface User {
  telegram_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  language_code: string;
  is_premium: boolean;
  role: string;
  created_at: string;
  updated_at: string;
  last_login: string;
  photo_url: string | null;
  referrer_id: number | null;
  referral_code?: string; // Optional as it might not be in all responses
}

export interface LoginResponse {
  user: User;
  isNewUser: boolean;
  referralApplied: boolean;
}

// ===========================================
// Helpers
// ===========================================

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
    // Skip ngrok browser warning page
    'ngrok-skip-browser-warning': 'true',
    ...options.headers,
  };
  
  // Add Telegram initData to headers if available
  if (initData) {
    (headers as Record<string, string>)['Authorization'] = `tma ${initData}`;
  }
  
  const apiBaseUrl = getApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
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
 * Fetch wrapper that returns ApiResponse structure
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    // Skip ngrok browser warning page
    'ngrok-skip-browser-warning': 'true',
    ...options.headers,
  };

  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to server',
      },
      timestamp: Date.now(),
    };
  }
}

// ===========================================
// API Client
// ===========================================

export const api = {
  /**
   * Login with Telegram initData
   * 
   * Security Note: referralCode is extracted from initData.start_param on server
   * after validation. Never send it as a separate parameter.
   * 
   * @param initData - The initData string from Telegram WebApp
   */
  login: async (initData: string): Promise<ApiResponse<LoginResponse>> => {
    return fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ initData }),
    });
  },

  /**
   * Check API health status
   */
  health: async (): Promise<HealthResponse> => {
    return fetchWithAuth<HealthResponse>('/health');
  },

  /**
   * Get list of users referred by a user
   * @param telegramId - Telegram ID of the user
   */
  getReferrals: async (telegramId: number): Promise<ApiResponse<User[]>> => {
    return fetchApi<User[]>(`/auth/referrals?telegram_id=${telegramId}`);
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

export { getApiBaseUrl };

