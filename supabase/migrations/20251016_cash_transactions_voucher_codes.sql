-- =============================================
-- Add voucher_number with auto sequence codes for cash_transactions
-- Formats: IN-0000001, OUT-0000001
-- =============================================

-- Add column if not exists
ALTER TABLE public.cash_transactions ADD COLUMN IF NOT EXISTS voucher_number TEXT;

-- Unique index to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS ux_cash_transactions_voucher_number ON public.cash_transactions(voucher_number);

-- Create sequences if not exist (separate for IN and OUT)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind='S' AND relname='cash_in_seq') THEN
    CREATE SEQUENCE public.cash_in_seq;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind='S' AND relname='cash_out_seq') THEN
    CREATE SEQUENCE public.cash_out_seq;
  END IF;
END $$;

-- Trigger function to set voucher_number before insert when null
CREATE OR REPLACE FUNCTION public.set_cash_voucher_number()
RETURNS TRIGGER AS $$
DECLARE
  next_no BIGINT;
  prefix TEXT;
BEGIN
  IF NEW.voucher_number IS NULL OR length(trim(NEW.voucher_number)) = 0 THEN
    IF NEW.txn_type = 'in' THEN
      next_no := nextval('public.cash_in_seq');
      prefix := 'IN-';
    ELSE
      next_no := nextval('public.cash_out_seq');
      prefix := 'OUT-';
    END IF;
    NEW.voucher_number := prefix || lpad(next_no::text, 7, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_cash_voucher_number ON public.cash_transactions;
CREATE TRIGGER trg_set_cash_voucher_number
  BEFORE INSERT ON public.cash_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_cash_voucher_number();
