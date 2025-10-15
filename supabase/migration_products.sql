-- =============================================
-- MIGRATION: Products & Product Variants
-- Description: Thêm bảng sản phẩm và biến thể sản phẩm
-- Date: 2024-10-15
-- =============================================

-- 1. PRODUCTS TABLE (Sản phẩm)
-- =============================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  features JSONB, -- Các tính năng dạng array
  category VARCHAR(100), -- 'subscription', 'service', 'addon'
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, archived
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB, -- Thông tin bổ sung
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PRODUCT VARIANTS TABLE (Biến thể sản phẩm - tương ứng với Plans)
-- =============================================
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  sku VARCHAR(100) UNIQUE,
  name VARCHAR(255) NOT NULL, -- Free, Basic, Premium, Ultimate
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  compare_at_price DECIMAL(10,2), -- Giá gốc để hiện "giảm giá"
  billing_period VARCHAR(50), -- monthly, yearly, lifetime
  storage_gb INTEGER,
  max_recipients INTEGER,
  max_messages INTEGER,
  features JSONB, -- Tính năng riêng của variant
  is_popular BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_plan_id ON public.product_variants(plan_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);

-- 4. TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Public can view active products
CREATE POLICY "Anyone can view active products"
  ON public.products
  FOR SELECT
  USING (status = 'active');

-- Public can view available variants
CREATE POLICY "Anyone can view available variants"
  ON public.product_variants
  FOR SELECT
  USING (is_available = true);

-- Admin can do everything
CREATE POLICY "Admin full access to products"
  ON public.products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admin full access to product_variants"
  ON public.product_variants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- 6. INSERT SAMPLE DATA
-- =============================================

-- Insert main product: Digital Legacy Platform
INSERT INTO public.products (id, name, slug, description, short_description, category, status, is_featured, features, sort_order)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000', -- Fixed UUID for reference
  'Digital Legacy Platform',
  'digital-legacy-platform',
  'Nền tảng quản lý di sản số toàn diện, giúp bạn lưu trữ và chia sẻ thông điệp quan trọng với người thân trong tương lai.',
  'Quản lý di sản số của bạn một cách an toàn và dễ dàng',
  'subscription',
  'active',
  true,
  '["Lưu trữ tin nhắn", "Gửi tự động", "Bảo mật cao", "Hỗ trợ 24/7"]'::jsonb,
  1
) ON CONFLICT (id) DO NOTHING;

-- Link Product Variants to existing Plans
-- Get plan IDs first, then insert variants
DO $$
DECLARE
  v_product_id UUID := '550e8400-e29b-41d4-a716-446655440000';
  v_free_plan_id UUID;
  v_basic_plan_id UUID;
  v_premium_plan_id UUID;
  v_ultimate_plan_id UUID;
BEGIN
  -- Get plan IDs (họ tên hơi khác: Free/Basic/Premium/Enterprise trong migration cũ)
  SELECT id INTO v_free_plan_id FROM public.plans WHERE slug = 'free' LIMIT 1;
  SELECT id INTO v_basic_plan_id FROM public.plans WHERE slug = 'basic' LIMIT 1;
  SELECT id INTO v_premium_plan_id FROM public.plans WHERE slug = 'premium' LIMIT 1;
  SELECT id INTO v_ultimate_plan_id FROM public.plans WHERE slug = 'enterprise' LIMIT 1;

  -- Insert Free Variant
  IF v_free_plan_id IS NOT NULL THEN
    INSERT INTO public.product_variants (
      product_id, plan_id, sku, name, price, billing_period,
      storage_gb, max_recipients, max_messages, is_available, sort_order,
      features
    ) VALUES (
      v_product_id, v_free_plan_id, 'DLP-FREE-001', 'Free Plan',
      0, 'lifetime',
      1, 3, 10, true, 1,
      '[
        "1GB lưu trữ",
        "Tối đa 3 người nhận",
        "Tối đa 10 tin nhắn",
        "Gửi email cơ bản",
        "Hỗ trợ qua email"
      ]'::jsonb
    ) ON CONFLICT (sku) DO NOTHING;
  END IF;

  -- Insert Basic Variant
  IF v_basic_plan_id IS NOT NULL THEN
    INSERT INTO public.product_variants (
      product_id, plan_id, sku, name, price, compare_at_price, billing_period,
      storage_gb, max_recipients, max_messages, is_available, sort_order,
      features
    ) VALUES (
      v_product_id, v_basic_plan_id, 'DLP-BASIC-001', 'Basic Plan',
      99000, 149000, 'monthly',
      5, 10, 50, true, 2,
      '[
        "5GB lưu trữ",
        "Tối đa 10 người nhận",
        "Tối đa 50 tin nhắn",
        "Gửi email nâng cao",
        "Lên lịch gửi",
        "Hỗ trợ ưu tiên"
      ]'::jsonb
    ) ON CONFLICT (sku) DO NOTHING;
  END IF;

  -- Insert Premium Variant (POPULAR)
  IF v_premium_plan_id IS NOT NULL THEN
    INSERT INTO public.product_variants (
      product_id, plan_id, sku, name, price, compare_at_price, billing_period,
      storage_gb, max_recipients, max_messages, is_popular, is_available, sort_order,
      features
    ) VALUES (
      v_product_id, v_premium_plan_id, 'DLP-PREMIUM-001', 'Premium Plan',
      299000, 399000, 'monthly',
      20, 50, 200, true, true, 3,
      '[
        "20GB lưu trữ",
        "Tối đa 50 người nhận",
        "Tối đa 200 tin nhắn",
        "Email + SMS",
        "Video messages",
        "Lên lịch nâng cao",
        "Phân tích chi tiết",
        "Hỗ trợ 24/7"
      ]'::jsonb
    ) ON CONFLICT (sku) DO NOTHING;
  END IF;

  -- Insert Ultimate/Enterprise Variant
  IF v_ultimate_plan_id IS NOT NULL THEN
    INSERT INTO public.product_variants (
      product_id, plan_id, sku, name, price, compare_at_price, billing_period,
      storage_gb, max_recipients, max_messages, is_available, sort_order,
      features
    ) VALUES (
      v_product_id, v_ultimate_plan_id, 'DLP-ULTIMATE-001', 'Enterprise Plan',
      999000, 1299000, 'monthly',
      100, -1, -1, true, 4,
      '[
        "100GB lưu trữ",
        "Không giới hạn người nhận",
        "Không giới hạn tin nhắn",
        "Tất cả tính năng Premium",
        "API access",
        "Custom domain",
        "White-label option",
        "Dedicated support",
        "Legal document storage"
      ]'::jsonb
    ) ON CONFLICT (sku) DO NOTHING;
  END IF;
  
  -- Log results
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Product ID: %', v_product_id;
  RAISE NOTICE 'Free Plan ID: %', v_free_plan_id;
  RAISE NOTICE 'Basic Plan ID: %', v_basic_plan_id;
  RAISE NOTICE 'Premium Plan ID: %', v_premium_plan_id;
  RAISE NOTICE 'Enterprise Plan ID: %', v_ultimate_plan_id;
END $$;

-- 7. ADD VARIANT REFERENCE TO ORDERS
-- =============================================
-- Add product_variant_id to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS product_variant_id UUID REFERENCES public.product_variants(id);

-- Add index
CREATE INDEX IF NOT EXISTS idx_orders_product_variant_id 
ON public.orders(product_variant_id);

-- 8. GRANT PERMISSIONS
-- =============================================
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
GRANT ALL ON public.product_variants TO service_role;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Verify data
SELECT 'Products created:' as info, COUNT(*) as count FROM public.products;
SELECT 'Product variants created:' as info, COUNT(*) as count FROM public.product_variants;

-- Show all variants with prices
SELECT 
  pv.name,
  pv.sku,
  pv.price,
  pv.billing_period,
  pv.is_popular,
  p.name as product_name
FROM public.product_variants pv
JOIN public.products p ON p.id = pv.product_id
ORDER BY pv.sort_order;
