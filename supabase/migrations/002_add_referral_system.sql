-- ============================================
-- TMA Boilerplate: Referral System Migration
-- Version: 2.0.0
-- Description: Adds referral tracking to users table
--              with short hash-based referral codes
-- ============================================

-- ============================================
-- Step 1: Add new columns
-- ============================================

-- Add referrer_id to track who invited this user
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS referrer_id BIGINT REFERENCES public.users(telegram_id) ON DELETE SET NULL;

-- Add referral_code for short unique invite links
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS referral_code TEXT NOT NULL DEFAULT '';

-- ============================================
-- Step 2: Create function to generate referral codes
-- ============================================

CREATE OR REPLACE FUNCTION generate_referral_code(telegram_id BIGINT)
RETURNS TEXT AS $$
DECLARE
    hash_value TEXT;
    short_code TEXT;
BEGIN
    -- Create MD5 hash of telegram_id with a salt
    hash_value := md5('tma_ref_' || telegram_id::TEXT || '_salt');
    
    -- Take first 15 characters and prefix with 'r'
    short_code := 'r' || substring(hash_value, 1, 15);
    
    RETURN short_code;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Step 3: Generate referral codes for existing users
-- ============================================

UPDATE public.users
SET referral_code = generate_referral_code(telegram_id)
WHERE referral_code = '' OR referral_code IS NULL;

-- ============================================
-- Step 4: Add constraints
-- ============================================

-- Make referral_code unique
ALTER TABLE public.users 
ADD CONSTRAINT unique_referral_code UNIQUE (referral_code);

-- Prevent self-referrals
ALTER TABLE public.users
ADD CONSTRAINT no_self_referral CHECK (referrer_id != telegram_id);

-- ============================================
-- Step 5: Create trigger to auto-generate codes
-- ============================================

CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate if not provided
    IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
        NEW.referral_code := generate_referral_code(NEW.telegram_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_referral_code
    BEFORE INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_referral_code();

-- ============================================
-- Step 6: Create indexes for performance
-- ============================================

-- Index for finding users by referral code
CREATE INDEX IF NOT EXISTS idx_users_referral_code 
    ON public.users(referral_code);

-- Index for finding users referred by someone
CREATE INDEX IF NOT EXISTS idx_users_referrer_id 
    ON public.users(referrer_id)
    WHERE referrer_id IS NOT NULL;

-- ============================================
-- Step 7: Comments for documentation
-- ============================================

COMMENT ON COLUMN public.users.referrer_id IS 'Telegram ID of the user who referred this user';
COMMENT ON COLUMN public.users.referral_code IS 'Short unique hash code for referral links (e.g., r117561fadd8cbef)';
COMMENT ON FUNCTION generate_referral_code(BIGINT) IS 'Generates a short MD5-based referral code from telegram_id';
