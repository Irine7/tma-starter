/**
 * Auth Routes
 *
 * Handles Telegram WebApp authentication.
 */

import { Router, Request, Response, IRouter } from 'express';
import {
  validateTelegramData,
  parseInitData,
  upsertUser,
  getUserByTelegramId,
  getReferrals,
  connectWallet,
  disconnectWallet,
  DbUser,
  WalletConnectionData,
} from '../services/auth.service';
import { ApiResponse } from '@tma/shared';

const router: IRouter = Router();

// ===========================================
// Types
// ===========================================

interface LoginRequest {
  initData: string;
  // NOTE: referralCode is NOT accepted here for security reasons
  // It must be extracted from validated initData.start_param on server
}

interface LoginResponse {
  user: DbUser;
  isNewUser: boolean;
  referralApplied: boolean;
}

// ===========================================
// Routes
// ===========================================

/**
 * POST /auth/login
 *
 * Authenticates a user using Telegram WebApp initData.
 *
 * Flow:
 * 1. Validate initData signature
 * 2. Parse user data
 * 3. Upsert user to database
 * 4. Return user profile
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { initData } = req.body as LoginRequest;

    // Validate input
    if (!initData) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'MISSING_INIT_DATA',
          message: 'initData is required',
        },
        timestamp: Date.now(),
      };
      res.status(400).json(response);
      return;
    }

    // Validate Telegram signature FIRST
    const isValid = validateTelegramData(initData);

    if (!isValid) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Telegram data validation failed',
        },
        timestamp: Date.now(),
      };
      res.status(401).json(response);
      return;
    }

    // Parse the validated data
    const parsed = parseInitData(initData);

    if (!parsed || !parsed.user) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: 'Failed to parse user data',
        },
        timestamp: Date.now(),
      };
      res.status(400).json(response);
      return;
    }

    // ✅ SECURITY: Extract referral code from VALIDATED initData
    // Never trust client-provided referralCode as separate parameter
    const referralCode = parsed.start_param;
    
    if (referralCode) {
      console.log(`🔗 Referral code from validated initData: ${referralCode}`);
    }

    // Check if user exists before upsert
    const existingUser = await getUserByTelegramId(parsed.user.id);
    const wasNewUser = !existingUser;

    // Upsert user to database with referral code from validated initData
    const dbUser = await upsertUser(parsed.user, referralCode);

    if (!dbUser) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to save user',
        },
        timestamp: Date.now(),
      };
      res.status(500).json(response);
      return;
    }

    // Determine if this is a new user (created_at === updated_at within 1 second)
    const createdAt = new Date(dbUser.created_at).getTime();
    const updatedAt = new Date(dbUser.updated_at).getTime();
    const isNewUser = Math.abs(updatedAt - createdAt) < 1000;

    // Check if referral was applied
    const referralApplied = wasNewUser && !!referralCode && !!dbUser.referrer_id;

    // Success response
    const response: ApiResponse<LoginResponse> = {
      success: true,
      data: {
        user: dbUser,
        isNewUser,
        referralApplied,
      },
      timestamp: Date.now(),
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Login error:', error);

    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message:
          process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : (error as Error).message,
      },
      timestamp: Date.now(),
    };

    res.status(500).json(response);
  }
});

/**
 * GET /auth/me
 *
 * Returns current user profile.
 * Requires authenticated request (via middleware).
 */
router.get('/me', (req: Request, res: Response) => {
  // This will be used with validateTelegramData middleware
  // For now, return a placeholder
  const response: ApiResponse<null> = {
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Use /auth/login to authenticate',
    },
    timestamp: Date.now(),
  };

  res.status(501).json(response);
});

/**
 * GET /auth/referrals
 *
 * Returns list of users referred by the authenticated user.
 * For now, expects telegram_id as query parameter.
 * TODO: Add proper authentication middleware
 */
router.get('/referrals', async (req: Request, res: Response) => {
  try {
    const telegramId = req.query.telegram_id as string;

    if (!telegramId) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'MISSING_TELEGRAM_ID',
          message: 'telegram_id query parameter is required',
        },
        timestamp: Date.now(),
      };
      res.status(400).json(response);
      return;
    }

    const referrals = await getReferrals(parseInt(telegramId, 10));

    const response: ApiResponse<DbUser[]> = {
      success: true,
      data: referrals,
      timestamp: Date.now(),
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Error fetching referrals:', error);

    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message:
          process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : (error as Error).message,
      },
      timestamp: Date.now(),
    };

    res.status(500).json(response);
  }
});

// ===========================================
// Wallet Routes
// ===========================================

/**
 * POST /auth/wallet/connect
 *
 * Connects a TON wallet to the authenticated user.
 * Requires telegram_id and wallet data.
 */
router.post('/wallet/connect', async (req: Request, res: Response) => {
  try {
    const { telegram_id, wallet } = req.body as {
      telegram_id: number;
      wallet: WalletConnectionData;
    };

    // Validate input
    if (!telegram_id) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'MISSING_TELEGRAM_ID',
          message: 'telegram_id is required',
        },
        timestamp: Date.now(),
      };
      res.status(400).json(response);
      return;
    }

    if (!wallet || !wallet.address || !wallet.addressFriendly) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'MISSING_WALLET_DATA',
          message: 'wallet data with address and addressFriendly is required',
        },
        timestamp: Date.now(),
      };
      res.status(400).json(response);
      return;
    }

    const updatedUser = await connectWallet(telegram_id, wallet);

    if (!updatedUser) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'WALLET_CONNECT_FAILED',
          message: 'Failed to connect wallet. It may already be connected to another user.',
        },
        timestamp: Date.now(),
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<DbUser> = {
      success: true,
      data: updatedUser,
      timestamp: Date.now(),
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Error connecting wallet:', error);

    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message:
          process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : (error as Error).message,
      },
      timestamp: Date.now(),
    };

    res.status(500).json(response);
  }
});

/**
 * POST /auth/wallet/disconnect
 *
 * Disconnects a TON wallet from the authenticated user.
 * Requires telegram_id.
 */
router.post('/wallet/disconnect', async (req: Request, res: Response) => {
  try {
    const { telegram_id } = req.body as { telegram_id: number };

    // Validate input
    if (!telegram_id) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'MISSING_TELEGRAM_ID',
          message: 'telegram_id is required',
        },
        timestamp: Date.now(),
      };
      res.status(400).json(response);
      return;
    }

    const updatedUser = await disconnectWallet(telegram_id);

    if (!updatedUser) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'WALLET_DISCONNECT_FAILED',
          message: 'Failed to disconnect wallet',
        },
        timestamp: Date.now(),
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<DbUser> = {
      success: true,
      data: updatedUser,
      timestamp: Date.now(),
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Error disconnecting wallet:', error);

    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message:
          process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : (error as Error).message,
      },
      timestamp: Date.now(),
    };

    res.status(500).json(response);
  }
});

export default router;
