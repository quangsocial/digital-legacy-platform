-- =============================================
-- Products extras: base_price, images; Variant label
-- Idempotent migration
-- =============================================

-- Add base_price to products (giá gốc)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS base_price DECIMAL(12,2);

-- Add images (array/json) to products for multiple images
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS images JSONB;

-- Add label to product_variants: HOT, BEST CHOICE, VIP (free text for flexibility)
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS label VARCHAR(50);

-- Helpful index on products.sort_order already exists; no change needed

-- Ensure RLS policies remain valid (no change)
