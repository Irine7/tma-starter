/**
 * TelegramUser - Represents a Telegram user object
 * @see https://core.telegram.org/bots/webapps#webappuser
 */
export interface TelegramUser {
  /** Unique identifier for the user */
  id: number;

  /** User's first name */
  first_name: string;

  /** User's last name (optional) */
  last_name?: string;

  /** User's username (optional) */
  username?: string;

  /** User's profile photo URL (optional) */
  photo_url?: string;

  /** User's language code (IETF language tag, optional) */
  language_code?: string;

  /** True if the user is a Telegram Premium subscriber */
  is_premium?: boolean;

  /** True if the user added the bot to the attachment menu */
  added_to_attachment_menu?: boolean;

  /** True if the user allows writing to them from the bot */
  allows_write_to_pm?: boolean;
}

/**
 * TelegramWebAppUser - Extended user data from Telegram WebApp
 */
export interface TelegramWebAppUser extends TelegramUser {
  /** True if the user is a bot */
  is_bot?: boolean;
}

/**
 * TelegramChat - Represents a Telegram chat
 */
export interface TelegramChat {
  /** Unique identifier for the chat */
  id: number;

  /** Type of chat */
  type: 'group' | 'supergroup' | 'channel';

  /** Title of the chat */
  title: string;

  /** Username of the chat (optional) */
  username?: string;

  /** Chat photo URL (optional) */
  photo_url?: string;
}
