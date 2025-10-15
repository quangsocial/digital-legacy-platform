-- Add payment_details JSONB to payments for method-specific info
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS payment_details JSONB DEFAULT '{}'::jsonb;

-- Optional: create GIN index for querying nested fields later
CREATE INDEX IF NOT EXISTS idx_payments_payment_details ON public.payments USING gin (payment_details);
