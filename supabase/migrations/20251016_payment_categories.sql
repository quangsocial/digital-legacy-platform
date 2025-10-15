-- Payment categories tables allowing multiple entries per category

-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Bank accounts
CREATE TABLE IF NOT EXISTS public.payment_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  bank_branch TEXT,
  currency TEXT DEFAULT 'VND',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) PayPal accounts
CREATE TABLE IF NOT EXISTS public.payment_paypal_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paypal_email TEXT NOT NULL,
  display_name TEXT,
  currency TEXT DEFAULT 'USD',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) MoMo wallets
CREATE TABLE IF NOT EXISTS public.payment_momo_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  momo_number TEXT NOT NULL,
  momo_account TEXT NOT NULL,
  qr_image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) Crypto wallets
CREATE TABLE IF NOT EXISTS public.payment_crypto_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL DEFAULT 'USDT',
  network TEXT NOT NULL DEFAULT 'BSC',
  address TEXT NOT NULL,
  qr_image_url TEXT,
  memo_tag TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shared updated_at trigger
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_timestamp_bank ON public.payment_bank_accounts;
CREATE TRIGGER trg_update_timestamp_bank BEFORE UPDATE ON public.payment_bank_accounts FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
DROP TRIGGER IF EXISTS trg_update_timestamp_paypal ON public.payment_paypal_accounts;
CREATE TRIGGER trg_update_timestamp_paypal BEFORE UPDATE ON public.payment_paypal_accounts FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
DROP TRIGGER IF EXISTS trg_update_timestamp_momo ON public.payment_momo_accounts;
CREATE TRIGGER trg_update_timestamp_momo BEFORE UPDATE ON public.payment_momo_accounts FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
DROP TRIGGER IF EXISTS trg_update_timestamp_crypto ON public.payment_crypto_wallets;
CREATE TRIGGER trg_update_timestamp_crypto BEFORE UPDATE ON public.payment_crypto_wallets FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
