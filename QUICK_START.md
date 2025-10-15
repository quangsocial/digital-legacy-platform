# 🚀 HƯỚNG DẪN NHANH - TẠO USER & ORDER

## ✅ BƯỚC 1: CHẠY DATABASE MIGRATION

### 1. Mở Supabase Dashboard
- Truy cập: https://app.supabase.com
- Login và chọn project: `skkhbzrvzbsqebujlwcu`

### 2. Chạy Migration SQL
1. Click **SQL Editor** ở sidebar trái
2. Click **New Query** (nút xanh ở góc phải)
3. Mở file `supabase/migration_products.sql` trong VS Code
4. Copy **TOÀN BỘ** nội dung (Ctrl+A → Ctrl+C)
5. Paste vào SQL Editor trong Supabase
6. Click **Run** (hoặc Ctrl+Enter)

### 3. Xác nhận thành công
Bạn sẽ thấy output như sau:
```
Products created: 1
Product variants created: 4
```

Và bảng hiển thị 4 gói:
| name | sku | price | billing_period | is_popular |
|------|-----|-------|----------------|------------|
| Free Plan | DLP-FREE-001 | 0 | lifetime | false |
| Basic Plan | DLP-BASIC-001 | 99000 | monthly | false |
| Premium Plan | DLP-PREMIUM-001 | 299000 | monthly | **true** |
| Ultimate Plan | DLP-ULTIMATE-001 | 999000 | monthly | false |

✅ **Migration hoàn tất!**

---

## 🎯 BƯỚC 2: TEST TÍNH NĂNG

### A. Tạo User mới

1. Vào trang admin: `http://localhost:3000/admin/users`
2. Click nút **"+ Thêm người dùng"** (góc phải)
3. Điền thông tin:
   ```
   Email: testuser@example.com
   Mật khẩu: Test123456
   Họ và tên: Test User
   Vai trò: User (Người dùng)
   ```
4. Click **"Tạo người dùng"**
5. ✅ Thấy alert "User created successfully"
6. ✅ User mới xuất hiện trong bảng

### B. Tạo Order mới

1. Vào trang admin: `http://localhost:3000/admin/orders`
2. Click nút **"+ Tạo đơn hàng"** (góc phải)
3. Chọn thông tin:
   ```
   Khách hàng: Test User (testuser@example.com)
   Sản phẩm: Digital Legacy Platform
   Gói: Premium Plan (299,000₫) ⭐
   Số tiền: 299000 (auto-fill)
   Ghi chú: Đơn hàng test
   ```
4. Click **"Tạo đơn hàng"**
5. ✅ Thấy alert "Order created successfully"
6. ✅ Order mới xuất hiện trong bảng với status "Chờ xử lý"

### C. Update Order Status

1. Trong bảng orders, tìm order vừa tạo
2. Click **"Xử lý"** → Status chuyển sang "Đang xử lý"
3. Click **"Hoàn thành"** → Status chuyển sang "Hoàn thành"
4. ✅ Statistics cards update:
   - Hoàn thành: +1
   - Doanh thu: +299,000₫

---

## 📊 KẾT QUẢ MONG ĐỢI

### Dashboard (`/admin`)
- Tổng người dùng: **1** (hoặc nhiều hơn nếu đã có)
- Tổng đơn hàng: **1** (đơn vừa tạo)
- Doanh thu: **299,000₫** (nếu đã complete order)

### Users Page (`/admin/users`)
- Hiển thị user mới với:
  - Email: testuser@example.com
  - Role: user
  - Plan: Free (chưa có subscription)
  - Status: active

### Orders Page (`/admin/orders`)
- Hiển thị order mới với:
  - Mã đơn hàng: ORD-xxxxxxxxxx-XXXXX
  - Khách hàng: Test User
  - Gói: Premium
  - Số tiền: 299,000₫
  - Trạng thái: Hoàn thành (nếu đã update)

---

## 🔧 TROUBLESHOOTING

### ❌ Lỗi: "Cannot find module '@/lib/supabase/server'"
**Giải pháp:** Check file `src/lib/supabase/server.ts` có tồn tại không

### ❌ Modal không hiển thị
**Giải pháp:** 
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear cache và reload
3. Check Console (F12) có lỗi không

### ❌ Không tạo được User: "Failed to create user"
**Giải pháp:**
1. Vào Supabase Dashboard
2. **Authentication** → **Policies**
3. Check "Enable email signups" được bật

### ❌ Không có Products trong dropdown
**Giải pháp:**
1. Vào Supabase → **SQL Editor**
2. Chạy query kiểm tra:
   ```sql
   SELECT * FROM products;
   SELECT * FROM product_variants;
   ```
3. Nếu empty → Chạy lại migration

### ❌ Table không refresh sau khi tạo
**Giải pháp:**
1. Click nút "🔄 Refresh" trong table
2. Hoặc F5 reload trang

---

## 📝 NOTES QUAN TRỌNG

1. **Admin Authentication**: Chỉ admin/super_admin mới tạo được user và order
2. **Auto Email Confirm**: User được tạo sẽ auto-confirm email (không cần click link)
3. **Order Number**: Mã đơn hàng auto-generate duy nhất
4. **Price Override**: Admin có thể chỉnh giá khác với giá mặc định của variant
5. **Refresh**: Sau khi tạo thành công, table tự động refresh

---

## 🎉 XEM KẾT QUẢ

Sau khi hoàn thành các bước trên:

1. **Kiểm tra Database** (Supabase → Table Editor):
   - ✅ `profiles` table: +1 user mới
   - ✅ `orders` table: +1 order mới
   - ✅ `products` table: 1 product
   - ✅ `product_variants` table: 4 variants

2. **Kiểm tra Admin UI**:
   - ✅ `/admin` → Dashboard stats update
   - ✅ `/admin/users` → User mới xuất hiện
   - ✅ `/admin/orders` → Order mới xuất hiện

3. **Test Update**:
   - ✅ Update order status → Stats update real-time
   - ✅ Filter users/orders → Hoạt động tốt
   - ✅ Search → Tìm được data

---

## 🚀 NEXT STEPS

Sau khi test thành công, bạn có thể:

1. **Tạo nhiều users** để test các tính năng khác
2. **Tạo nhiều orders** với các gói khác nhau
3. **Test payment flow** (coming soon)
4. **Tạo subscription** cho user sau khi order completed

---

**Thời gian thực hiện:** ~5 phút
**Difficulty:** ⭐ Dễ

Good luck! 🎯
