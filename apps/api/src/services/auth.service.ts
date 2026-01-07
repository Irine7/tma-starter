/**
 * Auth Service
 *
 * Handles Telegram initData validation and user management.
 */

import crypto from 'crypto';
import { supabaseAdmin, isSupabaseConfigured } from '../lib/supabase';

// ===========================================
// Types
// ===========================================

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface ParsedInitData {
  user: TelegramUser;
  auth_date: number;
  hash: string;
  query_id?: string;
  chat_instance?: string;
  chat_type?: string;
  start_param?: string;
}

export interface DbUser {
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
}

// ===========================================
// Telegram Data Validation
// ===========================================

/**
 * Validates Telegram WebApp initData signature.
 *
 * Algorithm:
 * 1. Parse the URL-encoded initData string
 * 2. Extract and remove the hash parameter
 * 3. Sort remaining parameters alphabetically
 * 4. Create data-check-string (key=value pairs joined by \n)
 * 5. Create HMAC-SHA256 of "WebAppData" with BOT_TOKEN as key
 * 6. Use that as key to create HMAC-SHA256 of data-check-string
 * 7. Compare with provided hash
 *
 * @param initData - The initData string from Telegram WebApp
 * @returns true if valid, false otherwise
 */
export function validateTelegramData(initData: string): boolean {
  // Mock mode for development
  if (
    process.env.NODE_ENV === 'development' &&
    (initData === 'mock_data' || initData.startsWith('mock_'))
  ) {
    console.log('🔓 Mock mode: Telegram validation bypassed');
    return true;
  }

  const botToken = process.env.BOT_TOKEN;

  if (!botToken) {
    console.error('❌ BOT_TOKEN is not configured');
    return false;
  }

  try {
    // Parse the URL-encoded string
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
      console.error('❌ No hash found in initData');
      return false;
    }

    // Remove hash from params for validation
    params.delete('hash');

    // Sort parameters alphabetically and create data-check-string
    const dataCheckString = [...params.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key: HMAC-SHA256 of bot token with "WebAppData"
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Create signature: HMAC-SHA256 of data-check-string with secret key
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(hash)
    );

    if (!isValid) {
      console.error('❌ Telegram signature validation failed');
    }

    return isValid;
  } catch (error) {
    console.error('❌ Error validating Telegram data:', error);
    return false;
  }
}

/**
 * Parse initData string into structured object.
 * Call this AFTER validation.
 *
 * @param initData - The validated initData string
 * @returns Parsed data with user info
 */
export function parseInitData(initData: string): ParsedInitData | null {
  try {
    // Handle mock data
    if (initData === 'mock_data' || initData.startsWith('mock_')) {
      return getMockParsedData();
    }

    const params = new URLSearchParams(initData);

    const userJson = params.get('user');
    if (!userJson) {
      console.error('❌ No user data in initData');
      return null;
    }

    const user: TelegramUser = JSON.parse(userJson);
    const authDate = parseInt(params.get('auth_date') || '0', 10);
    const hash = params.get('hash') || '';

    return {
      user,
      auth_date: authDate,
      hash,
      query_id: params.get('query_id') || undefined,
      chat_instance: params.get('chat_instance') || undefined,
      chat_type: params.get('chat_type') || undefined,
      start_param: params.get('start_param') || undefined,
    };
  } catch (error) {
    console.error('❌ Error parsing initData:', error);
    return null;
  }
}

/**
 * Returns mock user data for development
 */
function getMockParsedData(): ParsedInitData {
  return {
    user: {
      id: 123456789,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      language_code: 'en',
      is_premium: false,
    },
    auth_date: Math.floor(Date.now() / 1000),
    hash: 'mock_hash',
  };
}

// ===========================================
// User Management
// ===========================================

/**
 * Upsert user to database.
 * Creates new user or updates existing one based on telegram_id.
 *
 * @param telegramUser - User data from Telegram
 * @returns Database user record
 */
export async function upsertUser(
  telegramUser: TelegramUser
): Promise<DbUser | null> {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️  Supabase not configured, returning mock user');
    return getMockDbUser(telegramUser);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          telegram_id: telegramUser.id,
          username: telegramUser.username || null,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name || null,
          language_code: telegramUser.language_code || 'en',
          is_premium: telegramUser.is_premium || false,
          photo_url: telegramUser.photo_url || null,
          last_login: new Date().toISOString(),
        },
        {
          onConflict: 'telegram_id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('❌ Error upserting user:', error);
      return null;
    }

    console.log(`✅ User upserted: ${data.telegram_id} (@${data.username})`);
    return data as DbUser;
  } catch (error) {
    console.error('❌ Unexpected error upserting user:', error);
    return null;
  }
}

/**
 * Returns mock database user for development without DB
 */
function getMockDbUser(telegramUser: TelegramUser): DbUser {
  const now = new Date().toISOString();
  return {
    telegram_id: telegramUser.id,
    username: telegramUser.username || null,
    first_name: telegramUser.first_name,
    last_name: telegramUser.last_name || null,
    language_code: telegramUser.language_code || 'en',
    is_premium: telegramUser.is_premium || false,
    role: 'user',
    created_at: now,
    updated_at: now,
    last_login: now,
    photo_url: telegramUser.photo_url || null,
  };
}

/**
 * Get user by Telegram ID
 */
export async function getUserByTelegramId(
  telegramId: number
): Promise<DbUser | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('❌ Error fetching user:', error);
      return null;
    }

    return data as DbUser;
  } catch (error) {
    console.error('❌ Unexpected error fetching user:', error);
    return null;
  }
}
