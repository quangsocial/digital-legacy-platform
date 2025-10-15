# 🗄️ Hướng dẫn Setup Database - E-commerce Features

## Bước 1: Truy cập Supabase Dashboard

1. Đăng nhập vào [https://supabase.com](https://supabase.com)
2. Chọn project của bạn: `skkhbzrvzbsqebujlwcu`
3. Vào tab **SQL Editor**

---

## Bước 2: Chạy Migration Script

### 2.1. Kiểm tra Schema hiện tại
Đầu tiên, đảm bảo bạn đã chạy `schema.sql` cơ bản (nếu chưa):

```sql
-- Kiểm tra xem bảng profiles đã có chưa
SELECT * FROM profiles LIMIT 1;
```

Nếu báo lỗi "table doesn't exist", chạy file `supabase/schema.sql` trước.

### 2.2. Chạy Migration E-commerce
1. Mở file `supabase/migration_ecommerce.sql`
2. Copy toàn bộ nội dung
3. Paste vào SQL Editor
4. Click **Run** (hoặc Ctrl+Enter)
5. Đợi ~5-10 giây để hoàn thành

### 2.3. Kiểm tra kết quả
Nếu thành công, bạn sẽ thấy:
```
Success. No rows returned
```

---

## Bước 3: Kiểm tra Tables đã được tạo

Vào tab **Table Editor**, bạn sẽ thấy các tables mới:

### ✅ E-commerce Tables

#### 📦 **plans** - Các gói dịch vụ
- Free (0đ)
- Basic (99,000đ/tháng)
- Premium (299,000đ/tháng)  
- Enterprise (Liên hệ)

#### 🛒 **orders** - Đơn hàng
- Order number tự động: `ORD-202510-0001`
- Tracking: pending → processing → completed
- Lưu thông tin khách hàng và sản phẩm

#### 💰 **payments** - Thanh toán
- Payment number tự động: `PAY-202510-0001`
- Hỗ trợ: Bank Transfer, MoMo, PayPal, Crypto
- Status tracking và proof upload

#### 💳 **payment_methods** - Phương thức thanh toán
- Cấu hình 4 phương thức sẵn có
- Enable/disable từng phương thức
- Lưu config linh hoạt (JSONB)

#### 🎟️ **coupons** - Mã giảm giá
- Giảm theo % hoặc số tiền cố định
- Giới hạn số lần dùng
- Thời gian hiệu lực

#### 📅 **subscriptions** - Gói đăng ký
- Track active subscriptions của users
- Auto-renewal support
- Expiry management

---

## Bước 4: Kiểm tra dữ liệu mẫu

### Xem Plans đã được tạo:
```sql
SELECT * FROM plans ORDER BY display_order;
```

Kết quả sẽ hiển thị 4 gói: Free, Basic, Premium, Enterprise

### Xem Payment Methods:
```sql
SELECT method_type, display_name, is_enabled FROM payment_methods;
```

Kết quả:
- 🏦 Bank Transfer (enabled)
- 📱 MoMo (enabled)
- 💳 PayPal (enabled)
- ₿ Crypto (disabled)

---

## Bước 5: Test RLS Policies

### Kiểm tra ai có thể xem plans:
```sql
-- Everyone can see active plans (no authentication needed)
SELECT * FROM plans WHERE is_active = true;
```

### Test admin policies (sau khi login):
```sql
-- Check your role
SELECT id, email, role FROM profiles WHERE id = auth.uid();

-- If you're admin, you can see all orders
SELECT * FROM orders;
```

---

## Bước 6: Tạo Admin User (QUAN TRỌNG!)

### Cách 1: Update user hiện có thành admin
```sql
-- Thay YOUR_EMAIL bằng email của bạn
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'YOUR_EMAIL';
```

### Cách 2: Tạo admin mới
```sql
-- Sau khi đăng ký tài khoản mới, chạy:
UPDATE profiles 
SET role = 'super_admin' 
WHERE id = 'USER_ID_FROM_AUTH';
```

### Kiểm tra:
```sql
SELECT email, role FROM profiles WHERE role IN ('admin', 'super_admin');
```

---

## Bước 7: Test tạo Order mẫu

```sql
-- Tạo order test (thay USER_ID bằng ID của bạn)
INSERT INTO orders (
    user_id,
    customer_name,
    customer_email,
    plan_id,
    plan_name,
    billing_cycle,
    subtotal,
    tax,
    total,
    status
) VALUES (
    'YOUR_USER_ID',
    'Nguyễn Văn A',
    'test@example.com',
    (SELECT id FROM plans WHERE slug = 'premium'),
    'Premium',
    'monthly',
    299000,
    29900,
    328900,
    'pending'
);

-- Xem order vừa tạo
SELECT order_number, plan_name, total, status FROM orders ORDER BY created_at DESC LIMIT 1;
```

---

## 🎯 Cấu trúc Database hoàn chỉnh

### Tables hiện có:
#### Legacy System (từ schema.sql):
- ✅ `profiles` - User profiles + **role field**
- ✅ `recipients` - Người nhận di chúc
- ✅ `legacy_messages` - Nội dung di chúc
- ✅ `message_recipients` - Liên kết
- ✅ `notification_logs` - Logs
- ✅ `user_settings` - Cài đặt

#### E-commerce System (mới):
- ✅ `plans` - Gói dịch vụ (4 plans)
- ✅ `orders` - Đơn hàng
- ✅ `payments` - Thanh toán
- ✅ `payment_methods` - Phương thức TT (4 methods)
- ✅ `coupons` - Mã giảm giá
- ✅ `subscriptions` - Gói đăng ký users

### Functions:
- ✅ `generate_order_number()` - Tạo mã đơn hàng
- ✅ `generate_payment_number()` - Tạo mã thanh toán
- ✅ Auto-generate triggers
- ✅ Updated_at triggers

### Security:
- ✅ Row Level Security (RLS) enabled
- ✅ User can view own orders/payments
- ✅ Admin can view/modify all
- ✅ Everyone can view active plans

---

## 🔧 Troubleshooting

### Lỗi: "permission denied for table profiles"
**Giải pháp:** Kiểm tra RLS policies:
```sql
-- Enable RLS nếu chưa có
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Tạo policy để users có thể đọc profile của mình
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
```

### Lỗi: "function generate_order_number() does not exist"
**Giải pháp:** Chạy lại phần FUNCTIONS trong migration_ecommerce.sql

### Lỗi: "duplicate key value violates unique constraint"
**Giải pháp:** Order/payment number bị trùng. Xóa và tạo lại:
```sql
DELETE FROM orders WHERE order_number = 'ORD-202510-0001';
-- Rồi insert lại
```

---

## ✅ Checklist hoàn thành

- [ ] Đã chạy `schema.sql` (legacy system)
- [ ] Đã chạy `migration_ecommerce.sql` 
- [ ] Thấy 6 tables mới trong Table Editor
- [ ] Có 4 plans trong bảng `plans`
- [ ] Có 4 payment methods trong bảng `payment_methods`
- [ ] Đã tạo ít nhất 1 super_admin user
- [ ] Test tạo order thành công
- [ ] RLS policies hoạt động đúng

---

## 📚 Tài liệu tham khảo

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [Database Triggers](https://www.postgresql.org/docs/current/plpgsql-trigger.html)

---

## 🚀 Bước tiếp theo

Sau khi database setup xong:

1. ✅ Test truy cập `/admin` với admin account
2. ✅ Test xem plans ở `/pricing`
3. ⏭️ Implement API routes để CRUD data
4. ⏭️ Connect frontend với Supabase
5. ⏭️ Implement payment integration

---

**Cần hỗ trợ?** Hãy check error logs trong Supabase Dashboard > Logs
