-- =============================================
-- Payment Category: Quét QR Ngân Hàng (Sepay/VietQR)
-- Create table to manage QR-enabled bank accounts with templates
-- Idempotent migration
-- =============================================

-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.payment_qr_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_code TEXT NOT NULL,            -- e.g. VCB, TCB, MBB, BIDV (compatible with img.vietqr.io)
  bank_name TEXT NOT NULL,            -- Human-readable name
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  qr_template TEXT NOT NULL DEFAULT 'compact2',     -- vietqr template: compact, compact2, etc.
  description_template TEXT NOT NULL DEFAULT 'DH {order_number}', -- addInfo template with placeholders
  include_amount BOOLEAN NOT NULL DEFAULT TRUE,     -- include order amount in QR
  -- No Sepay API fields needed for dynamic QR only
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_timestamp_qr_bank ON public.payment_qr_bank_accounts;
CREATE TRIGGER trg_update_timestamp_qr_bank
BEFORE UPDATE ON public.payment_qr_bank_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Basic RLS (mirror existing payment tables behavior if any are enabled); keep open to admins via service role
ALTER TABLE public.payment_qr_bank_accounts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  -- Simple policy to allow anon read if needed for public options (optional; you can tighten later)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payment_qr_bank_accounts' AND policyname = 'Allow read for all'
  ) THEN
    CREATE POLICY "Allow read for all" ON public.payment_qr_bank_accounts FOR SELECT USING (true);
  END IF;
END $$;
