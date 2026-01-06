import { TelegramUser } from '@tma/shared';
import { Request } from 'express';

/**
 * Extended Express Request with Telegram user data
 */
export interface TelegramRequest extends Request {
  telegramUser?: TelegramUser;
  telegramInitData?: string;
}

/**
 * Parsed Telegram initData parameters
 */
export interface TelegramInitData {
  query_id?: string;
  user?: TelegramUser;
  receiver?: TelegramUser;
  chat?: {
    id: number;
    type: string;
    title?: string;
    username?: string;
    photo_url?: string;
  };
  chat_type?: 'sender' | 'private' | 'group' | 'supergroup' | 'channel';
  chat_instance?: string;
  start_param?: string;
  can_send_after?: number;
  auth_date: number;
  hash: string;
}
