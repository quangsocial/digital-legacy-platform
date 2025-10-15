# 🔧 LỖI: Schema Cache Chưa Refresh

## ❌ Vấn Đề

Sau khi chạy migration thành công, vẫn gặp lỗi:
```
Could not find the 'amount' column of 'orders' in the schema cache
```

**Nguyên nhân**: Supabase PostgREST cần refresh schema cache sau khi thêm cột mới.

---

## ✅ GIẢI PHÁP: Refresh Schema Cache (30 giây)

### CÁCH 1: Restart Connection Pooler (NHANH NHẤT)

1. **Vào Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/skkhbzrvzbsqebujlwcu/settings/database
   ```

2. **Scroll xuống "Connection Pooling"**

3. **Click nút "Restart"** (hoặc "Refresh Schema")

4. **Đợi 10-15 giây** để pooler restart

5. **Test lại:** Vào http://localhost:3001/admin/orders → Tạo order

---

### CÁCH 2: Chạy SQL Command (BACKUP)

Nếu cách 1 không có nút Restart, chạy query này trong SQL Editor:

```sql
-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- Verify column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'orders'
AND column_name = 'amount';
```

---

### CÁCH 3: Đợi Auto-Refresh (1-2 phút)

PostgREST tự động refresh cache mỗi 10 seconds khi phát hiện thay đổi schema. Bạn có thể:

1. Đợi 1-2 phút
2. Hard refresh browser: **Ctrl+Shift+R**
3. Test lại tạo order

---

## 🔍 Verify Schema Đã Có Cột

Chạy query này để confirm:

```sql
-- List all columns in orders table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'orders'
ORDER BY ordinal_position;

-- Should include:
-- ...
-- amount          | numeric       | NO  | 0
-- product_variant_id | uuid       | YES | NULL
```

Nếu thấy 2 cột này → Migration thành công, chỉ cần refresh cache!

---

## 🎯 SAU KHI REFRESH:

1. **Hard refresh browser:** Ctrl+Shift+R
2. **Vào:** http://localhost:3001/admin/orders
3. **Click:** "Tạo đơn hàng"
4. **Chọn:** Customer + Variant (e.g., Premium Plan)
5. **Click:** "Tạo đơn hàng"
6. **Kết quả:** ✅ "Order created successfully!"

---

## 💡 TẠI SAO XẢY RA?

Supabase sử dụng **PostgREST** để expose database qua REST API. PostgREST cache database schema để tăng performance.

Khi bạn **ALTER TABLE** (thêm cột), PostgREST không biết ngay lập tức → Cần refresh cache.

**2 cách PostgREST biết schema thay đổi:**
1. **Auto-detect**: Kiểm tra mỗi 10s (slow)
2. **Manual reload**: NOTIFY pgrst hoặc restart pooler (fast)

---

## ✅ Checklist

- [ ] Chạy migration thành công (có message "✅ Added amount column")
- [ ] Verify cột amount tồn tại trong database (chạy SELECT query)
- [ ] Refresh Supabase schema cache (restart pooler hoặc NOTIFY)
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Test tạo order thành công
