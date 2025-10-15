-- =============================================
-- Cash transactions (receipts/expenses) table
-- =============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='cash_transactions'
  ) THEN
    CREATE TABLE public.cash_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      txn_type TEXT NOT NULL CHECK (txn_type IN ('in','out')),
      category TEXT NOT NULL,
      amount NUMERIC(14,2) NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'VND',
      txn_date TIMESTAMPTZ NOT NULL DEFAULT now(),
      notes TEXT,
      order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  END IF;
END $$;

-- Idempotent add/alter columns in case table pre-existed
ALTER TABLE public.cash_transactions ADD COLUMN IF NOT EXISTS txn_type TEXT;
ALTER TABLE public.cash_transactions ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.cash_transactions ADD COLUMN IF NOT EXISTS amount NUMERIC(14,2);
ALTER TABLE public.cash_transactions ALTER COLUMN amount SET DEFAULT 0;
ALTER TABLE public.cash_transactions ADD COLUMN IF NOT EXISTS currency TEXT;
ALTER TABLE public.cash_transactions ALTER COLUMN currency SET DEFAULT 'VND';
ALTER TABLE public.cash_transactions ADD COLUMN IF NOT EXISTS txn_date TIMESTAMPTZ;
ALTER TABLE public.cash_transactions ALTER COLUMN txn_date SET DEFAULT now();
ALTER TABLE public.cash_transactions ADD COLUMN IF NOT EXISTS notes TEXT;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='cash_transactions' AND column_name='order_id'
  ) THEN
    ALTER TABLE public.cash_transactions ADD COLUMN order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table THEN NULL; END $$;
ALTER TABLE public.cash_transactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;
ALTER TABLE public.cash_transactions ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.cash_transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
ALTER TABLE public.cash_transactions ALTER COLUMN updated_at SET DEFAULT now();

-- Ensure type constraint exists (best effort)
DO $$ BEGIN
  PERFORM 1 FROM pg_constraint 
  WHERE conname = 'cash_transactions_txn_type_check';
  IF NOT FOUND THEN
    BEGIN
      ALTER TABLE public.cash_transactions
        ADD CONSTRAINT cash_transactions_txn_type_check CHECK (txn_type IN ('in','out'));
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

-- Update trigger on updated_at
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_timestamp_cash_txn ON public.cash_transactions;
CREATE TRIGGER trg_update_timestamp_cash_txn
  BEFORE UPDATE ON public.cash_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();
