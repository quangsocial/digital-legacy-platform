# 🔧 Fix User & Order Creation - 2 Phút

## ❌ Vấn đề Phát Hiện

### 1. Tạo User Lỗi
```
Error: AuthApiError: User not allowed
code: 'not_admin'
```
**Nguyên nhân**: Service Role Key chưa được cấu hình.

### 2. Tạo Order Lỗi
```
Error: Could not find the 'amount' column of 'orders'
```
**Nguyên nhân**: Chưa chạy migration để thêm columns mới.

---

## ✅ Giải Pháp (2 Bước)

### BƯỚC 1: Cấu hình Service Role Key (30 giây)

1. **Lấy Service Role Key từ Supabase**:
   - Vào: https://supabase.com/dashboard/project/skkhbzrvzbsqebujlwcu/settings/api
   - Tìm section **Project API keys**
   - Copy key có label **`service_role`** (có icon 🔒 secret)
   - ⚠️ **QUAN TRỌNG**: Đây là key BÍ MẬT, không được public

2. **Update file `.env.local`**:
   ```bash
   # Thay dòng này:
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   
   # Bằng:
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc....(key bạn vừa copy)
   ```

3. **Khởi động lại server**:
   ```bash
   # Dừng server hiện tại (Ctrl+C trong terminal)
   # Chạy lại:
   npm run dev
   ```

---

### BƯỚC 2: Chạy Migration (1 phút)

1. **Vào Supabase SQL Editor**:
   - https://supabase.com/dashboard/project/skkhbzrvzbsqebujlwcu/sql/new

2. **Copy toàn bộ nội dung file**:
   - `supabase/migration_products_patch.sql`

3. **Paste vào SQL Editor và nhấn RUN**

4. **Kết quả mong đợi**:
   ```
   ✅ Checking orders table...
   ✅ Adding amount column...
   ✅ Adding product_variant_id column...
   ✅ Products table created
   ✅ Product variants table created
   ✅ Free variant created/updated
   ✅ Basic variant created/updated
   ✅ Premium variant created/updated
   ✅ Enterprise variant created/updated
   🎉 MIGRATION COMPLETED SUCCESSFULLY!
   ```

---

## 🧪 Kiểm Tra Hoạt Động

### Test 1: Tạo User

1. Vào: http://localhost:3000/admin/users
2. Click nút **"Thêm người dùng"**
3. Điền form:
   ```
   Email: test@example.com
   Password: Test123456
   Họ tên: Nguyễn Văn Test
   Role: user
   ```
4. Click **"Tạo tài khoản"**
5. **Kết quả**: Alert "User created successfully", user xuất hiện trong bảng

### Test 2: Tạo Order

1. Vào: http://localhost:3000/admin/orders
2. Click nút **"Tạo đơn hàng"**
3. Chọn **Khách hàng**: Nguyễn Văn Test
4. Chọn **Gói Premium** (299,000₫) - có badge "Phổ biến"
5. Click **"Tạo đơn hàng"**
6. **Kết quả**: Alert "Order created successfully", order xuất hiện với status "Chờ xử lý"

---

## 🔍 Verify Dữ Liệu trong Database

### Check Users
```sql
SELECT id, email, full_name, role 
FROM profiles 
WHERE email = 'test@example.com';
```

### Check Orders
```sql
SELECT 
  o.order_number,
  o.amount,
  pv.name as variant_name,
  u.full_name as customer_name,
  o.status
FROM orders o
LEFT JOIN product_variants pv ON o.product_variant_id = pv.id
LEFT JOIN profiles u ON o.user_id = u.id
ORDER BY o.created_at DESC
LIMIT 5;
```

---

## 🎯 Tại Sao Cần Service Role Key?

| Key Type | Quyền | Dùng để |
|----------|-------|---------|
| **Anon Key** (public) | Người dùng bình thường | Client-side, public API |
| **Service Role Key** (secret) | Admin toàn quyền | Server-side, bypass RLS, admin operations |

**Tạo user** cần **Service Role Key** vì:
- Bypass RLS policies
- Access admin API của Supabase Auth
- Tự động confirm email mà không cần user click link

---

## ❓ Nếu Vẫn Lỗi

### Lỗi: "User not allowed" sau khi update key
**Giải pháp**: 
- Đảm bảo đã dừng và khởi động lại server
- Xóa cache: Ctrl+Shift+R trong browser
- Check key không có space thừa ở đầu/cuối

### Lỗi: "Table products not found"
**Giải pháp**:
- Chạy lại migration_products_patch.sql
- Verify bằng query:
  ```sql
  SELECT tablename FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename IN ('products', 'product_variants');
  ```

### Lỗi: "Duplicate key value violates..."
**Giải pháp**:
- Migration đã chạy thành công
- Kiểm tra xem data đã có chưa:
  ```sql
  SELECT COUNT(*) FROM product_variants;
  -- Kết quả phải là 4
  ```

---

## 📚 Tài Liệu Liên Quan

- **Chi tiết migration**: `supabase/migration_products_patch.sql`
- **Hướng dẫn nhanh**: `QUICK_START.md`
- **API documentation**: `PRODUCTS_ORDERS_GUIDE.md`
- **Summary đầy đủ**: `COMPLETION_SUMMARY.md`

---

## ✅ Checklist Hoàn Thành

- [ ] Service Role Key đã được cấu hình trong `.env.local`
- [ ] Server đã được khởi động lại
- [ ] Migration chạy thành công (4 variants created)
- [ ] Tạo user thành công
- [ ] Tạo order thành công
- [ ] Data hiển thị đúng trong UI

---

**Thời gian tổng cộng**: ~2 phút
**Độ khó**: ⭐ Dễ (chỉ cần copy/paste)
