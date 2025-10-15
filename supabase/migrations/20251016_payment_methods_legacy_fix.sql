-- Legacy compatibility fix for payment_methods.method_type NOT NULL constraint
-- This migration is safe to run multiple times.

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

-- Backfill method_type from code when missing
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

-- Idempotent seed to ensure the four base codes exist
INSERT INTO public.payment_methods (code, name, details)
VALUES
  ('bank_transfer', 'Chuyển khoản ngân hàng', '{"fields": ["bank_name","account_number","account_holder","bank_branch"]}' ),
  ('momo', 'Ví MoMo', '{"fields": ["momo_number","momo_account"]}' ),
  ('paypal', 'PayPal', '{"fields": ["paypal_email"]}' ),
  ('crypto', 'Tiền điện tử', '{"fields": ["crypto_currency","crypto_network","crypto_address","crypto_qr_url"]}' )
ON CONFLICT (code) DO NOTHING;
