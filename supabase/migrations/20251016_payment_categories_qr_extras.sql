-- Add QR link and parameters to payment category tables
ALTER TABLE public.payment_bank_accounts
  ADD COLUMN IF NOT EXISTS qr_image_url TEXT,
  ADD COLUMN IF NOT EXISTS qr_url TEXT,
  ADD COLUMN IF NOT EXISTS qr_params JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.payment_momo_accounts
  ADD COLUMN IF NOT EXISTS qr_image_url TEXT,
  ADD COLUMN IF NOT EXISTS qr_url TEXT,
  ADD COLUMN IF NOT EXISTS qr_params JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.payment_crypto_wallets
  ADD COLUMN IF NOT EXISTS qr_image_url TEXT,
  ADD COLUMN IF NOT EXISTS qr_url TEXT,
  ADD COLUMN IF NOT EXISTS qr_params JSONB DEFAULT '{}'::jsonb;
