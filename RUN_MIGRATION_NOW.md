# 🚀 CHẠY MIGRATION NGAY BÂY GIỜ!

## ⚠️ Bạn đã chạy `migration_ecommerce.sql` rồi?

### ✅ Nếu ĐÃ chạy → Dùng file này:
```
📁 supabase/migration_products_patch.sql
```

### ❌ Nếu CHƯA chạy → Chạy 2 files:
```
1. supabase/migration_ecommerce.sql (trước)
2. supabase/migration_products_patch.sql (sau)
```

---

## 📋 HƯỚNG DẪN NHANH (2 PHÚT)

### Bước 1: Mở Supabase
```
🌐 https://app.supabase.com
→ Chọn project: skkhbzrvzbsqebujlwcu
→ Click "SQL Editor" (sidebar trái)
→ Click "New Query" (nút xanh)
```

### Bước 2: Copy & Paste
```
📂 Mở file: supabase/migration_products_patch.sql
📋 Copy TOÀN BỘ (Ctrl+A → Ctrl+C)
📝 Paste vào Supabase SQL Editor
▶️  Click "Run" (hoặc Ctrl+Enter)
```

### Bước 3: Xem Kết quả
```
✅ Thấy các dòng:
   - "Created products table" HOẶC "already exists, skipping"
   - "Created product_variants table" HOẶC "already exists, skipping"
   - "Free variant created/updated"
   - "Basic variant created/updated"
   - "Premium variant created/updated (POPULAR)"
   - "Enterprise variant created/updated"
   - "MIGRATION COMPLETED SUCCESSFULLY!"

📊 Thấy bảng với 4 variants:
   | variant_name | sku | price | plan_name |
   |--------------|-----|-------|-----------|
   | Free Plan | DLP-FREE-001 | 0 | Free |
   | Basic Plan | DLP-BASIC-001 | 99000 | Basic |
   | Premium Plan | DLP-PREMIUM-001 | 299000 | Premium |
   | Enterprise Plan | DLP-ENTERPRISE-001 | 0 | Enterprise |
```

---

## 🎯 XEM KẾT QUẢ TRONG DATABASE

Sau khi chạy xong, vào **Table Editor**:

### 1. Table `products`
```sql
SELECT * FROM products;
```
Kết quả: **1 row** (Digital Legacy Platform)

### 2. Table `product_variants`
```sql
SELECT * FROM product_variants;
```
Kết quả: **4 rows** (Free, Basic, Premium, Enterprise)

### 3. Table `orders` (kiểm tra column mới)
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'product_variant_id';
```
Kết quả: **product_variant_id** (column đã được thêm)

---

## ✅ TEST NGAY SAU KHI CHẠY

### 1. Test API Products
```bash
# Mở browser console (F12) hoặc dùng curl
fetch('http://localhost:3000/api/products')
  .then(r => r.json())
  .then(console.log)

# Kết quả mong đợi:
{
  "products": [
    {
      "id": "...",
      "name": "Digital Legacy Platform",
      "product_variants": [
        { "name": "Free Plan", "price": 0, ... },
        { "name": "Basic Plan", "price": 99000, ... },
        { "name": "Premium Plan", "price": 299000, "is_popular": true, ... },
        { "name": "Enterprise Plan", "price": 0, ... }
      ]
    }
  ]
}
```

### 2. Test Tạo User
```
🌐 http://localhost:3000/admin/users
→ Click "Thêm người dùng"
→ Fill: test@example.com / Test123456 / Test User / User
→ Click "Tạo người dùng"
→ ✅ Alert "User created successfully"
```

### 3. Test Tạo Order
```
🌐 http://localhost:3000/admin/orders
→ Click "Tạo đơn hàng"
→ Chọn: Test User / Premium Plan (299,000₫) ⭐
→ Click "Tạo đơn hàng"
→ ✅ Alert "Order created successfully"
→ ✅ Order xuất hiện với status "Chờ xử lý"
```

---

## 🐛 TROUBLESHOOTING

### ❌ Lỗi: "duplicate key value violates unique constraint"
**Nguyên nhân:** Đã chạy migration rồi, đang chạy lại lần 2.  
**Giải pháp:** Không sao! Script đã handle `ON CONFLICT DO UPDATE`, data sẽ được update thay vì tạo mới.

### ❌ Lỗi: "relation 'plans' does not exist"
**Nguyên nhân:** Chưa chạy `migration_ecommerce.sql`.  
**Giải pháp:** Chạy file đó trước, sau đó chạy lại `migration_products_patch.sql`.

### ❌ Lỗi: "function update_updated_at_column() does not exist"
**Nguyên nhân:** Chưa chạy `migration_ecommerce.sql` (function này được define ở đó).  
**Giải pháp:** Chạy `migration_ecommerce.sql` trước.

### ✅ Không có error nhưng không thấy variants?
**Kiểm tra:** 
```sql
-- Check plans có tồn tại không
SELECT slug, name FROM plans;

-- Nếu KHÔNG có plans → Chạy migration_ecommerce.sql trước
-- Nếu CÓ plans → Chạy lại migration_products_patch.sql
```

---

## 📊 KẾT QUẢ CUỐI CÙNG

Sau khi migration thành công:

### Database Tables
| Table | Rows | Description |
|-------|------|-------------|
| `products` | 1 | Digital Legacy Platform |
| `product_variants` | 4 | Free, Basic, Premium, Enterprise |
| `orders` | 0+ | Orders (+ column `product_variant_id`) |
| `plans` | 4 | From migration_ecommerce.sql |
| `payment_methods` | 4 | From migration_ecommerce.sql |

### Admin UI Ready
- ✅ `/admin/users` - Nút "Thêm người dùng" hoạt động
- ✅ `/admin/orders` - Nút "Tạo đơn hàng" hiển thị 4 variants
- ✅ Modal CreateOrder - Chọn được customer và variants
- ✅ API `/api/products` - Trả về products với variants

---

## ⏱️ TỔNG THỜI GIAN

- **Copy & Paste:** 30 giây
- **Run migration:** 5 giây
- **Verify data:** 30 giây
- **Test UI:** 2 phút

**TỔNG:** ~3 phút ⚡

---

## 🎉 XONG RỒI!

Bây giờ bạn có thể:
1. ✅ Tạo users mới
2. ✅ Tạo orders với 4 gói (Free/Basic/Premium/Enterprise)
3. ✅ Xem data real-time trong admin UI
4. ✅ Update order status
5. ✅ Xem statistics dashboard

**Next step:** Đọc `QUICK_START.md` để test đầy đủ workflow! 🚀
