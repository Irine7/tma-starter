import { Response, NextFunction } from 'express';
import { TelegramRequest, TelegramInitData } from '../types/telegram';

/**
 * Middleware to validate Telegram WebApp initData
 *
 * IMPORTANT: This is a PLACEHOLDER implementation.
 * In production, you MUST validate the HMAC signature using your BOT_TOKEN.
 *
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * TODO: Implement proper HMAC-SHA256 validation:
 * 1. Extract the hash from initData
 * 2. Create data_check_string from sorted key=value pairs
 * 3. Generate secret_key = HMAC-SHA256(bot_token, "WebAppData")
 * 4. Compute hash = HMAC-SHA256(secret_key, data_check_string)
 * 5. Compare with the provided hash
 */
export const validateTelegramData = (
  req: TelegramRequest,
  res: Response,
  next: NextFunction
): void => {
  // Get initData from Authorization header or custom header
  const initData =
    req.headers.authorization?.replace('tma ', '') ||
    (req.headers['x-telegram-init-data'] as string);

  // If no initData provided
  if (!initData) {
    // In development, allow requests without initData
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '⚠️  [DEV MODE] Request without Telegram initData - allowing for development'
      );

      // Attach mock user for development
      req.telegramUser = {
        id: 123456789,
        first_name: 'Dev',
        last_name: 'User',
        username: 'devuser',
        language_code: 'en',
        is_premium: false,
      };

      return next();
    }

    res.status(401).json({
      success: false,
      error: {
        code: 'MISSING_INIT_DATA',
        message: 'Telegram initData is required',
      },
      timestamp: Date.now(),
    });
    return;
  }

  try {
    // Parse the initData query string
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
      throw new Error('Missing hash in initData');
    }

    // Parse user data if present
    const userParam = params.get('user');
    if (userParam) {
      const user = JSON.parse(decodeURIComponent(userParam));
      req.telegramUser = user;
    }

    req.telegramInitData = initData;

    // TODO: Implement actual HMAC validation here
    // For now, we just log a warning in production
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '⚠️  [SECURITY WARNING] initData validation not implemented!'
      );
    }

    next();
  } catch (error) {
    console.error('Failed to parse Telegram initData:', error);

    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_INIT_DATA',
        message: 'Failed to parse Telegram initData',
      },
      timestamp: Date.now(),
    });
  }
};

/**
 * Optional middleware - use when Telegram auth is not strictly required
 * Will attach user data if available, but won't block the request
 */
export const optionalTelegramData = (
  req: TelegramRequest,
  _res: Response,
  next: NextFunction
): void => {
  const initData =
    req.headers.authorization?.replace('tma ', '') ||
    (req.headers['x-telegram-init-data'] as string);

  if (initData) {
    try {
      const params = new URLSearchParams(initData);
      const userParam = params.get('user');

      if (userParam) {
        req.telegramUser = JSON.parse(decodeURIComponent(userParam));
      }

      req.telegramInitData = initData;
    } catch {
      // Silently ignore parsing errors for optional validation
    }
  }

  next();
};
