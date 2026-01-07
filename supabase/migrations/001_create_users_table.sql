-- ============================================
-- TMA Boilerplate: Users Table Migration
-- Version: 1.0.0
-- Description: Creates the public.users table
--              mapped to Telegram user IDs
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Table: public.users
-- ============================================
-- We use telegram_id as primary key (BigInt)
-- because Telegram IDs can exceed 2^31-1
-- ============================================

CREATE TABLE IF NOT EXISTS public.users (
    -- Primary identifier from Telegram
    telegram_id BIGINT PRIMARY KEY,
    
    -- Telegram user data
    username TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT,
    language_code TEXT DEFAULT 'en',
    
    -- Telegram Premium status
    is_premium BOOLEAN DEFAULT FALSE,
    
    -- Application role (prepared for admin panel)
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ DEFAULT NOW(),
    
    -- Optional: photo URL from Telegram
    photo_url TEXT
);

-- ============================================
-- Indexes for common queries
-- ============================================

-- Index for username lookups
CREATE INDEX IF NOT EXISTS idx_users_username 
    ON public.users(username) 
    WHERE username IS NOT NULL;

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role 
    ON public.users(role);

-- Index for premium users
CREATE INDEX IF NOT EXISTS idx_users_premium 
    ON public.users(is_premium) 
    WHERE is_premium = TRUE;

-- ============================================
-- Triggers
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
-- Note: We'll use service_role key for upserts,
-- so we only need read policies for anon/authenticated
CREATE POLICY "Users can view own profile"
    ON public.users
    FOR SELECT
    USING (true);  -- For V1, allow all reads. Tighten later if needed.

-- Policy: Only service_role can insert/update
-- (handled automatically by using service_role key)

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON TABLE public.users IS 'Telegram Mini App users, mapped by telegram_id';
COMMENT ON COLUMN public.users.telegram_id IS 'Telegram user ID (BigInt to handle large IDs)';
COMMENT ON COLUMN public.users.role IS 'User role: user, admin, or moderator';
COMMENT ON COLUMN public.users.is_premium IS 'Telegram Premium subscription status';
