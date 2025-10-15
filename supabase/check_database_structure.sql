-- Kiểm tra cấu trúc bảng orders
-- Copy và chạy trong Supabase SQL Editor

-- 1. Kiểm tra tất cả columns trong bảng orders
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'orders'
ORDER BY ordinal_position;

-- 2. Kiểm tra xem có cột amount không
SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'amount'
) as has_amount_column;

-- 3. Kiểm tra xem có cột product_variant_id không
SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'product_variant_id'
) as has_product_variant_id_column;

-- 4. Kiểm tra bảng products và product_variants có tồn tại không
SELECT 
    tablename,
    CASE 
        WHEN tablename IN ('products', 'product_variants', 'orders') THEN '✅ Exists'
        ELSE '❌ Not found'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('products', 'product_variants', 'orders');

-- 5. Nếu có bảng product_variants, đếm số variants
SELECT COUNT(*) as variant_count FROM public.product_variants;
