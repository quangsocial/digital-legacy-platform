-- =============================================
-- QUICK PATCH: Add Products & Variants ONLY
-- Dành cho người đã chạy migration_ecommerce.sql
-- =============================================

-- 1. CHECK IF PRODUCTS TABLE EXISTS
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    -- Create products table
    CREATE TABLE public.products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      short_description TEXT,
      features JSONB,
      category VARCHAR(100),
      status VARCHAR(50) DEFAULT 'active',
      image_url TEXT,
      is_featured BOOLEAN DEFAULT false,
      sort_order INTEGER DEFAULT 0,
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    RAISE NOTICE '✅ Created products table';
  ELSE
    RAISE NOTICE '⏭️  Products table already exists, skipping...';
  END IF;
END $$;

-- 2. CHECK IF PRODUCT_VARIANTS TABLE EXISTS
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_variants') THEN
    -- Create product_variants table
    CREATE TABLE public.product_variants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
      plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
      sku VARCHAR(100) UNIQUE,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL DEFAULT 0,
      compare_at_price DECIMAL(10,2),
      billing_period VARCHAR(50),
      storage_gb INTEGER,
      max_recipients INTEGER,
      max_messages INTEGER,
      features JSONB,
      is_popular BOOLEAN DEFAULT false,
      is_available BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    RAISE NOTICE '✅ Created product_variants table';
  ELSE
    RAISE NOTICE '⏭️  Product_variants table already exists, skipping...';
  END IF;
END $$;

-- 3. CREATE INDEXES (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_plan_id ON public.product_variants(plan_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);

-- 4. ADD amount COLUMN TO ORDERS (IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'amount'
  ) THEN
    ALTER TABLE public.orders 
    ADD COLUMN amount DECIMAL(10, 2) NOT NULL DEFAULT 0;
    
    RAISE NOTICE '✅ Added amount column to orders table';
  ELSE
    RAISE NOTICE '⏭️  Column amount already exists in orders table';
  END IF;
END $$;

-- 5. ADD product_variant_id TO ORDERS (IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'product_variant_id'
  ) THEN
    ALTER TABLE public.orders 
    ADD COLUMN product_variant_id UUID REFERENCES public.product_variants(id);
    
    CREATE INDEX IF NOT EXISTS idx_orders_product_variant_id 
    ON public.orders(product_variant_id);
    
    RAISE NOTICE '✅ Added product_variant_id to orders table';
  ELSE
    RAISE NOTICE '⏭️  Column product_variant_id already exists in orders table';
  END IF;
END $$;

-- 6. ENABLE RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- 7. CREATE RLS POLICIES (DROP IF EXISTS FIRST)
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (status = 'active');

DROP POLICY IF EXISTS "Admin full access to products" ON public.products;
CREATE POLICY "Admin full access to products"
  ON public.products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Anyone can view available variants" ON public.product_variants;
CREATE POLICY "Anyone can view available variants"
  ON public.product_variants FOR SELECT
  USING (is_available = true);

DROP POLICY IF EXISTS "Admin full access to product_variants" ON public.product_variants;
CREATE POLICY "Admin full access to product_variants"
  ON public.product_variants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- 8. CREATE TRIGGERS (DROP IF EXISTS FIRST)
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. INSERT PRODUCT (ON CONFLICT DO NOTHING)
INSERT INTO public.products (
  id, name, slug, description, short_description, 
  category, status, is_featured, features, sort_order
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Digital Legacy Platform',
  'digital-legacy-platform',
  'Nền tảng quản lý di sản số toàn diện, giúp bạn lưu trữ và chia sẻ thông điệp quan trọng với người thân trong tương lai.',
  'Quản lý di sản số của bạn một cách an toàn và dễ dàng',
  'subscription',
  'active',
  true,
  '["Lưu trữ tin nhắn", "Gửi tự động", "Bảo mật cao", "Hỗ trợ 24/7"]'::jsonb,
  1
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 10. INSERT PRODUCT VARIANTS
DO $$
DECLARE
  v_product_id UUID := '550e8400-e29b-41d4-a716-446655440000';
  v_free_plan_id UUID;
  v_basic_plan_id UUID;
  v_premium_plan_id UUID;
  v_enterprise_plan_id UUID;
BEGIN
  -- Get plan IDs by SLUG (đảm bảo chính xác)
  SELECT id INTO v_free_plan_id FROM public.plans WHERE slug = 'free' LIMIT 1;
  SELECT id INTO v_basic_plan_id FROM public.plans WHERE slug = 'basic' LIMIT 1;
  SELECT id INTO v_premium_plan_id FROM public.plans WHERE slug = 'premium' LIMIT 1;
  SELECT id INTO v_enterprise_plan_id FROM public.plans WHERE slug = 'enterprise' LIMIT 1;

  -- Insert Free Variant
  IF v_free_plan_id IS NOT NULL THEN
    INSERT INTO public.product_variants (
      product_id, plan_id, sku, name, price, billing_period,
      storage_gb, max_recipients, max_messages, is_available, sort_order, features
    ) VALUES (
      v_product_id, v_free_plan_id, 'DLP-FREE-001', 'Free Plan',
      0, 'lifetime', 0, 1, 5, true, 1,
      '["100MB lưu trữ", "1 người nhận", "5 tin nhắn", "Gửi email cơ bản", "Hỗ trợ qua email"]'::jsonb
    ) ON CONFLICT (sku) DO UPDATE SET
      price = EXCLUDED.price,
      features = EXCLUDED.features,
      updated_at = NOW();
    RAISE NOTICE '✅ Free variant created/updated';
  END IF;

  -- Insert Basic Variant
  IF v_basic_plan_id IS NOT NULL THEN
    INSERT INTO public.product_variants (
      product_id, plan_id, sku, name, price, compare_at_price, billing_period,
      storage_gb, max_recipients, max_messages, is_available, sort_order, features
    ) VALUES (
      v_product_id, v_basic_plan_id, 'DLP-BASIC-001', 'Basic Plan',
      99000, 149000, 'monthly', 1, 5, 50, true, 2,
      '["1GB lưu trữ", "5 người nhận", "50 tin nhắn", "Gửi email nâng cao", "Lên lịch gửi", "Hỗ trợ ưu tiên"]'::jsonb
    ) ON CONFLICT (sku) DO UPDATE SET
      price = EXCLUDED.price,
      compare_at_price = EXCLUDED.compare_at_price,
      features = EXCLUDED.features,
      updated_at = NOW();
    RAISE NOTICE '✅ Basic variant created/updated';
  END IF;

  -- Insert Premium Variant (POPULAR)
  IF v_premium_plan_id IS NOT NULL THEN
    INSERT INTO public.product_variants (
      product_id, plan_id, sku, name, price, compare_at_price, billing_period,
      storage_gb, max_recipients, max_messages, is_popular, is_available, sort_order, features
    ) VALUES (
      v_product_id, v_premium_plan_id, 'DLP-PREMIUM-001', 'Premium Plan',
      299000, 399000, 'monthly', 10, NULL, NULL, true, true, 3,
      '["10GB lưu trữ", "Không giới hạn người nhận", "Không giới hạn tin nhắn", "Email + SMS", "Video messages", "Lên lịch nâng cao", "Phân tích chi tiết", "Hỗ trợ 24/7"]'::jsonb
    ) ON CONFLICT (sku) DO UPDATE SET
      price = EXCLUDED.price,
      compare_at_price = EXCLUDED.compare_at_price,
      is_popular = EXCLUDED.is_popular,
      features = EXCLUDED.features,
      updated_at = NOW();
    RAISE NOTICE '✅ Premium variant created/updated (POPULAR)';
  END IF;

  -- Insert Enterprise Variant (set unavailable by default)
  IF v_enterprise_plan_id IS NOT NULL THEN
    INSERT INTO public.product_variants (
      product_id, plan_id, sku, name, price, compare_at_price, billing_period,
      storage_gb, max_recipients, max_messages, is_available, sort_order, features
    ) VALUES (
      v_product_id, v_enterprise_plan_id, 'DLP-ENTERPRISE-001', 'Enterprise Plan',
      0, 0, 'custom', 100, NULL, NULL, false, 4,
      '["100GB lưu trữ", "Không giới hạn", "Tất cả tính năng Premium", "API access", "Custom domain", "White-label", "Dedicated support", "SLA 99.9%"]'::jsonb
    ) ON CONFLICT (sku) DO UPDATE SET
      is_available = false,
      features = EXCLUDED.features,
      updated_at = NOW();
    RAISE NOTICE '✅ Enterprise variant created/updated';
  END IF;

  -- Summary
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 MIGRATION COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Product ID: %', v_product_id;
  RAISE NOTICE 'Free Plan ID: %', v_free_plan_id;
  RAISE NOTICE 'Basic Plan ID: %', v_basic_plan_id;
  RAISE NOTICE 'Premium Plan ID: %', v_premium_plan_id;
  RAISE NOTICE 'Enterprise Plan ID: %', v_enterprise_plan_id;
END $$;

-- 11. GRANT PERMISSIONS
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
GRANT ALL ON public.product_variants TO service_role;

-- 12. VERIFY DATA
SELECT 'Products:' as info, COUNT(*) as count FROM public.products;
SELECT 'Product Variants:' as info, COUNT(*) as count FROM public.product_variants;

-- Show variants with details
SELECT 
  pv.name as variant_name,
  pv.sku,
  pv.price,
  pv.billing_period,
  pv.is_popular,
  p.name as product_name,
  pl.name as plan_name
FROM public.product_variants pv
JOIN public.products p ON p.id = pv.product_id
JOIN public.plans pl ON pl.id = pv.plan_id
ORDER BY pv.sort_order;

-- ✅ DONE! You can now use CreateOrderModal

-- Extra cleanup: ensure Enterprise 0đ variant is hidden if it already exists
UPDATE public.product_variants
SET is_available = false
WHERE sku = 'DLP-ENTERPRISE-001';

-- If you want to remove it entirely (as requested), delete by SKU
DELETE FROM public.product_variants
WHERE sku = 'DLP-ENTERPRISE-001';
