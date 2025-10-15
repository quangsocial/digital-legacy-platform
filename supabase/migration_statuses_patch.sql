-- =============================================
-- PATCH: Update status enums for orders & payments
-- - Orders statuses: new, draft, pending_payment, confirmed, completed, cancelled
-- - Default orders.status = 'new'
-- - Payments statuses: new, pending, confirmed, processing, completed, failed, refunded, cancelled
-- - Default payments.status = 'new'
-- - Migrate legacy statuses: pending -> pending_payment, processing -> confirmed
-- =============================================

-- 1) Update orders.status default
ALTER TABLE public.orders
  ALTER COLUMN status SET DEFAULT 'new';

-- 2) Normalize legacy/unknown order statuses BEFORE adding constraint
-- Map old values to new set
UPDATE public.orders SET status = 'pending_payment' WHERE status = 'pending';
UPDATE public.orders SET status = 'confirmed'        WHERE status = 'processing';
UPDATE public.orders SET status = 'cancelled'        WHERE status = 'refunded';
-- Catch-all: any NULL or unknown -> 'new'
UPDATE public.orders SET status = 'new'
WHERE status IS NULL OR status NOT IN ('new','draft','pending_payment','confirmed','completed','cancelled');

-- 3) Replace orders.status CHECK constraint to new set (idempotent)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('new','draft','pending_payment','confirmed','completed','cancelled'));

-- (Migration mapping already applied above)

-- 4) Update payments.status default
ALTER TABLE public.payments
  ALTER COLUMN status SET DEFAULT 'new';

-- 4b) Allow NULL payment_method for auto-created bills
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='payments' AND column_name='payment_method' AND is_nullable='NO'
  ) THEN
    ALTER TABLE public.payments ALTER COLUMN payment_method DROP NOT NULL;
  END IF;
END $$;

-- 5) Normalize legacy/unknown payment statuses BEFORE adding tighter constraint
-- Map previous values to the new compact set: new | paid | refunded
UPDATE public.payments SET status = 'new'      WHERE status IN ('pending','processing','failed') OR status IS NULL;
UPDATE public.payments SET status = 'paid'     WHERE status IN ('confirmed','completed');
UPDATE public.payments SET status = 'refunded' WHERE status IN ('refunded','cancelled');

-- Catch-all: any unknown -> 'new'
UPDATE public.payments SET status = 'new'
WHERE status NOT IN ('new','paid','refunded');

-- 6) Replace payments.status CHECK constraint to new compact set (idempotent)
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_status_check
  CHECK (status IN ('new','paid','refunded'));

-- Verify
SELECT 'orders.status default' AS info, column_default FROM information_schema.columns
WHERE table_schema='public' AND table_name='orders' AND column_name='status';

SELECT 'payments.status default' AS info, column_default FROM information_schema.columns
WHERE table_schema='public' AND table_name='payments' AND column_name='status';

-- 7) Add DB-level normalization trigger for orders.status (idempotent)
CREATE OR REPLACE FUNCTION public.normalize_order_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS NULL OR NEW.status NOT IN ('new','draft','pending_payment','confirmed','completed','cancelled') THEN
    IF NEW.status = 'pending' THEN
      NEW.status := 'pending_payment';
    ELSIF NEW.status = 'processing' THEN
      NEW.status := 'confirmed';
    ELSIF NEW.status = 'refunded' THEN
      NEW.status := 'cancelled';
    ELSE
      NEW.status := 'new';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_normalize_order_status_ins ON public.orders;
CREATE TRIGGER trg_normalize_order_status_ins
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_order_status();

DROP TRIGGER IF EXISTS trg_normalize_order_status_upd ON public.orders;
CREATE TRIGGER trg_normalize_order_status_upd
  BEFORE UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_order_status();

  -- 8) Add DB-level normalization trigger for payments.status (idempotent)
  CREATE OR REPLACE FUNCTION public.normalize_payment_status()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.status IS NULL OR NEW.status NOT IN ('new','paid','refunded') THEN
      IF NEW.status IN ('confirmed','completed') THEN
        NEW.status := 'paid';
      ELSIF NEW.status IN ('refunded','cancelled') THEN
        NEW.status := 'refunded';
      ELSE
        NEW.status := 'new';
      END IF;
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  DROP TRIGGER IF EXISTS trg_normalize_payment_status_ins ON public.payments;
  CREATE TRIGGER trg_normalize_payment_status_ins
    BEFORE INSERT ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.normalize_payment_status();

  DROP TRIGGER IF EXISTS trg_normalize_payment_status_upd ON public.payments;
  CREATE TRIGGER trg_normalize_payment_status_upd
    BEFORE UPDATE OF status ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.normalize_payment_status();
