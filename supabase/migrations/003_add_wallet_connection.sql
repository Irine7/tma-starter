-- ============================================
-- TMA Boilerplate: Wallet Connection Migration
-- Version: 1.0.0
-- Description: Adds TON wallet connection fields
--              to the users table
-- ============================================

-- ============================================
-- Step 1: Add wallet connection columns
-- ============================================

-- Wallet address (raw format from TON)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- Friendly wallet address (user-friendly format with bounce flags)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS wallet_address_friendly TEXT;

-- Whether wallet is currently connected
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS wallet_connected BOOLEAN DEFAULT FALSE;

-- Timestamp of wallet connection
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS wallet_connected_at TIMESTAMPTZ;

-- Wallet chain information (mainnet: -239, testnet: -3)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS wallet_chain INTEGER;

-- Wallet app name (e.g., 'Tonkeeper', 'TonHub', 'OpenMask')
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS wallet_app_name TEXT;

-- ============================================
-- Step 2: Create indexes for wallet queries
-- ============================================

-- Index for wallet address lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet_address 
    ON public.users(wallet_address) 
    WHERE wallet_address IS NOT NULL;

-- Index for connected wallet queries
CREATE INDEX IF NOT EXISTS idx_users_wallet_connected 
    ON public.users(wallet_connected) 
    WHERE wallet_connected = TRUE;

-- ============================================
-- Step 3: Add unique constraint on wallet address
-- ============================================
-- Ensures one wallet can only be connected to one user

ALTER TABLE public.users 
ADD CONSTRAINT unique_wallet_address UNIQUE (wallet_address);

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON COLUMN public.users.wallet_address IS 'TON wallet address in raw format';
COMMENT ON COLUMN public.users.wallet_address_friendly IS 'TON wallet address in user-friendly format (with bounce flags)';
COMMENT ON COLUMN public.users.wallet_connected IS 'Whether a TON wallet is currently connected';
COMMENT ON COLUMN public.users.wallet_connected_at IS 'Timestamp when the wallet was connected';
COMMENT ON COLUMN public.users.wallet_chain IS 'TON chain ID (mainnet: -239, testnet: -3)';
COMMENT ON COLUMN public.users.wallet_app_name IS 'Name of the wallet app used (e.g., Tonkeeper, TonHub)';
