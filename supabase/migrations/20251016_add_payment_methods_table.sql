-- =============================================
-- Add payment_methods table for dynamic configuration
-- =============================================

-- Ensure required extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='payment_methods'
  ) THEN
    CREATE TABLE public.payment_methods (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      details JSONB DEFAULT '{}'::jsonb,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  END IF;
END $$;

-- Idempotently add columns if table existed with a different schema
ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS active BOOLEAN;
ALTER TABLE public.payment_methods ALTER COLUMN active SET DEFAULT TRUE;
ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;
ALTER TABLE public.payment_methods ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
ALTER TABLE public.payment_methods ALTER COLUMN updated_at SET DEFAULT now();

-- Ensure unique index on code
CREATE UNIQUE INDEX IF NOT EXISTS ux_payment_methods_code ON public.payment_methods(code);

-- auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_timestamp_methods ON public.payment_methods;
CREATE TRIGGER trg_update_timestamp_methods
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

-- Handle legacy schemas: if column method_type exists with NOT NULL, relax it to avoid seed failures
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='payment_methods' AND column_name='method_type'
  ) THEN
    BEGIN
      ALTER TABLE public.payment_methods ALTER COLUMN method_type DROP NOT NULL;
    EXCEPTION WHEN undefined_column THEN
      -- Column removed between runs; ignore
      NULL;
    END;
  END IF;
END $$;

-- Seed common methods
INSERT INTO public.payment_methods (code, name, details)
VALUES
  ('bank_transfer', 'Chuyển khoản ngân hàng', '{"fields": ["bank_name","account_number","account_holder","bank_branch"]}' ),
  ('momo', 'Ví MoMo', '{"fields": ["momo_number","momo_account"]}' ),
  ('paypal', 'PayPal', '{"fields": ["paypal_email"]}' ),
  ('crypto', 'Tiền điện tử', '{"fields": ["crypto_currency","crypto_network","crypto_address","crypto_qr_url"]}' )
ON CONFLICT (code) DO NOTHING;

-- If legacy column method_type exists, backfill it from code to keep older apps compatible
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='payment_methods' AND column_name='method_type'
  ) THEN
    UPDATE public.payment_methods
    SET method_type = code
    WHERE method_type IS NULL AND code IS NOT NULL;
  END IF;
END $$;