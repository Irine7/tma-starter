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
  DbUser,
} from '../services/auth.service';
import { ApiResponse } from '@tma/shared';

const router: IRouter = Router();

// ===========================================
// Types
// ===========================================

interface LoginRequest {
  initData: string;
}

interface LoginResponse {
  user: DbUser;
  isNewUser: boolean;
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

    // Validate Telegram signature
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

    // Upsert user to database
    const dbUser = await upsertUser(parsed.user);

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

    // Success response
    const response: ApiResponse<LoginResponse> = {
      success: true,
      data: {
        user: dbUser,
        isNewUser,
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

export default router;
