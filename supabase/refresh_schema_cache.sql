-- ⚡ REFRESH SCHEMA CACHE - Chạy ngay trong SQL Editor
-- Copy và RUN để Supabase nhận biết cột amount mới

-- 1. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- 2. Verify column exists
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'orders'
AND column_name IN ('amount', 'product_variant_id')
ORDER BY column_name;

-- Expected result:
-- amount              | numeric | NO  | 0
-- product_variant_id  | uuid    | YES | NULL

-- 3. Test query to ensure PostgREST can see it
SELECT 
    id, 
    order_number, 
    amount,
    product_variant_id,
    status
FROM public.orders
LIMIT 1;

-- ✅ Nếu chạy thành công → Schema cache đã refresh!
-- ✅ Sau đó test tạo order tại http://localhost:3001/admin/orders
