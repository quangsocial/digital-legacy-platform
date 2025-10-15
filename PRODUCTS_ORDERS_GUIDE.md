# 🛍️ Products & Orders Management Guide

## 📋 Tổng quan

Hệ thống quản lý sản phẩm và đơn hàng cho Digital Legacy Platform, bao gồm:
- Products (Sản phẩm)
- Product Variants (Biến thể sản phẩm - tương ứng với Plans)
- Orders (Đơn hàng)
- Admin UI để tạo Users và Orders

---

## 🗄️ Database Schema

### 1. **Products Table**
```sql
- id: UUID (Primary Key)
- name: Tên sản phẩm
- slug: URL-friendly name
- description: Mô tả chi tiết
- short_description: Mô tả ngắn
- features: JSONB (array tính năng)
- category: 'subscription' | 'service' | 'addon'
- status: 'active' | 'inactive' | 'archived'
- image_url: URL ảnh sản phẩm
- is_featured: Boolean (sản phẩm nổi bật)
- sort_order: Thứ tự hiển thị
- metadata: JSONB (dữ liệu bổ sung)
```

### 2. **Product Variants Table**
```sql
- id: UUID (Primary Key)
- product_id: UUID (Foreign Key → products)
- plan_id: UUID (Foreign Key → plans)
- sku: Mã SKU duy nhất
- name: Tên variant (Free, Basic, Premium, Ultimate)
- price: Giá bán
- compare_at_price: Giá gốc (để hiện "giảm giá")
- billing_period: 'monthly' | 'yearly' | 'lifetime'
- storage_gb: Dung lượng lưu trữ
- max_recipients: Số người nhận tối đa
- max_messages: Số tin nhắn tối đa
- features: JSONB (tính năng riêng)
- is_popular: Boolean (gói phổ biến)
- is_available: Boolean (còn bán không)
- sort_order: Thứ tự hiển thị
```

### 3. **Orders Table (Updated)**
```sql
- product_variant_id: UUID (Foreign Key → product_variants)
  → Liên kết order với variant cụ thể
```

---

## 🚀 Hướng dẫn Migration

### Bước 1: Chạy Migration trong Supabase

1. Mở Supabase Dashboard: https://app.supabase.com
2. Chọn project: `skkhbzrvzbsqebujlwcu`
3. Vào **SQL Editor** → **New Query**
4. Copy toàn bộ nội dung file `supabase/migration_products.sql`
5. Paste vào SQL Editor và click **Run**

### Bước 2: Xác nhận Migration thành công

Sau khi chạy, bạn sẽ thấy output:
```
Products created: 1
Product variants created: 4
```

Và bảng hiển thị 4 variants:
- Free Plan (0₫)
- Basic Plan (99,000₫)
- Premium Plan (299,000₫) ⭐ Popular
- Ultimate Plan (999,000₫)

### Bước 3: Kiểm tra Tables

Vào **Table Editor** và xác nhận 2 tables mới:
- ✅ `products` - 1 row
- ✅ `product_variants` - 4 rows

---

## 📡 API Endpoints

### 1. **GET /api/products**
Lấy danh sách tất cả sản phẩm với variants

**Response:**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Digital Legacy Platform",
      "slug": "digital-legacy-platform",
      "product_variants": [
        {
          "id": "uuid",
          "name": "Premium Plan",
          "price": 299000,
          "compare_at_price": 399000,
          "billing_period": "monthly",
          "is_popular": true,
          "plans": {
            "id": "uuid",
            "name": "Premium"
          }
        }
      ]
    }
  ]
}
```

### 2. **POST /api/admin/users**
Tạo người dùng mới (Admin only)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "Nguyễn Văn A",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "Nguyễn Văn A",
    "role": "user"
  },
  "message": "User created successfully"
}
```

### 3. **POST /api/admin/orders/create**
Tạo đơn hàng mới (Admin only)

**Request Body:**
```json
{
  "user_id": "uuid",
  "product_variant_id": "uuid",
  "plan_id": "uuid",
  "amount": 299000,
  "notes": "Đơn hàng test"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "orderNumber": "ORD-1234567890-ABC123",
    "customerName": "Nguyễn Văn A",
    "plan": "Premium",
    "amount": 299000,
    "status": "pending"
  },
  "message": "Order created successfully"
}
```

---

## 🎨 Admin UI Features

### 1. **Users Management** (`/admin/users`)

**Tính năng:**
- ✅ Hiển thị danh sách users từ database
- ✅ Filter theo: name, email, plan, status
- ✅ **Button "Thêm người dùng"** → Mở modal

**Modal "Tạo người dùng mới":**
- Email (required)
- Mật khẩu (required, min 6 ký tự)
- Họ và tên (optional)
- Vai trò: User / Admin / Super Admin
- Validation: email format, password length, role
- Auto-confirm email sau khi tạo

### 2. **Orders Management** (`/admin/orders`)

**Tính năng:**
- ✅ Hiển thị danh sách orders từ database
- ✅ Statistics cards: tổng đơn, chờ xử lý, hoàn thành, doanh thu
- ✅ Update status: pending → processing → completed
- ✅ **Button "Tạo đơn hàng"** → Mở modal

**Modal "Tạo đơn hàng mới":**
- Chọn khách hàng (dropdown từ danh sách users)
- Chọn sản phẩm (hiện tại: Digital Legacy Platform)
- Chọn gói (4 variants hiển thị dạng cards):
  - Free (0₫)
  - Basic (99,000₫)
  - Premium (299,000₫) ⭐ Popular
  - Ultimate (999,000₫)
- Số tiền (auto-fill từ variant, có thể chỉnh)
- Ghi chú (optional)
- Validation: cần chọn customer và variant

---

## 🔧 Technical Details

### Component Structure

```
src/
├── app/
│   ├── api/
│   │   ├── products/
│   │   │   └── route.ts                    # GET products
│   │   └── admin/
│   │       ├── users/
│   │       │   └── route.ts                # GET users, POST create user
│   │       └── orders/
│   │           └── create/
│   │               └── route.ts            # POST create order
│   └── admin/
│       └── (dashboard)/
│           ├── users/
│           │   └── page.tsx                # Users management with modal
│           └── orders/
│               └── page.tsx                # Orders management with modal
└── components/
    └── admin/
        ├── CreateUserModal.tsx             # Modal tạo user
        ├── CreateOrderModal.tsx            # Modal tạo order
        ├── UsersTable.tsx                  # Table hiển thị users
        └── OrdersTable.tsx                 # Table hiển thị orders
```

### Key Features

1. **Real-time Refresh**: Sau khi tạo user/order, table tự động refresh
2. **Validation**: Frontend + Backend validation
3. **Error Handling**: Alert thông báo lỗi rõ ràng
4. **Loading States**: Spinner khi đang tải/submit
5. **Responsive Design**: Modal responsive, scroll được khi content dài
6. **RLS Policies**: Public có thể xem products/variants, Admin full access

---

## 📊 Sample Data

Migration tự động tạo sẵn:

### Product
- **Name**: Digital Legacy Platform
- **Category**: subscription
- **Status**: active
- **Featured**: true

### Product Variants (4 gói)

| Variant | SKU | Price | Compare Price | Billing | Popular |
|---------|-----|-------|--------------|---------|---------|
| Free Plan | DLP-FREE-001 | 0₫ | - | lifetime | - |
| Basic Plan | DLP-BASIC-001 | 99,000₫ | 149,000₫ | monthly | - |
| Premium Plan | DLP-PREMIUM-001 | 299,000₫ | 399,000₫ | monthly | ⭐ Yes |
| Ultimate Plan | DLP-ULTIMATE-001 | 999,000₫ | 1,299,000₫ | monthly | - |

---

## 🧪 Testing Guide

### Test 1: Tạo User mới
1. Vào `/admin/users`
2. Click "Thêm người dùng"
3. Fill form:
   - Email: `test@example.com`
   - Password: `Test123456`
   - Full name: `Test User`
   - Role: `user`
4. Click "Tạo người dùng"
5. ✅ Alert "User created successfully"
6. ✅ User xuất hiện trong table

### Test 2: Tạo Order mới
1. Vào `/admin/orders`
2. Click "Tạo đơn hàng"
3. Chọn customer: `test@example.com`
4. Chọn gói: **Premium Plan** (299,000₫)
5. Click "Tạo đơn hàng"
6. ✅ Alert "Order created successfully"
7. ✅ Order xuất hiện trong table với status "Chờ xử lý"

### Test 3: Update Order Status
1. Trong table orders, click "Xử lý" ở order vừa tạo
2. ✅ Status → "Đang xử lý"
3. Click "Hoàn thành"
4. ✅ Status → "Hoàn thành"
5. ✅ Statistics cards update (Hoàn thành +1, Doanh thu +299,000₫)

---

## 🎯 Next Steps

Sau khi migration và test thành công, bạn có thể:

1. **Tạo thêm Products**: 
   - Thêm sản phẩm Add-ons
   - Thêm Services (tư vấn, setup, v.v.)

2. **Tạo Payments**:
   - Khi order được tạo → Tạo payment tương ứng
   - Link order với payment

3. **Auto-create Subscription**:
   - Khi order completed → Auto-create subscription cho user
   - Update user's plan

4. **Email Notifications**:
   - Send email khi order được tạo
   - Send email khi order completed

5. **Invoice Generation**:
   - Tạo PDF invoice cho order
   - Download/send invoice

---

## ⚠️ Important Notes

1. **Admin API**: Cần authentication + role check
2. **Supabase Admin**: POST `/api/admin/users` dùng `supabase.auth.admin.createUser()`
3. **Order Number**: Auto-generate dạng `ORD-{timestamp}-{random}`
4. **Price Override**: Admin có thể chỉnh giá khác variant price
5. **RLS Policies**: Products public read, Admin full access

---

## 🐛 Troubleshooting

### Lỗi: "Cannot find module '@/lib/supabase/server'"
→ Check file `src/lib/supabase/server.ts` exists

### Lỗi: "Failed to create user"
→ Check Supabase project settings → Auth → Allow new user signups

### Lỗi: "Product variant not found"
→ Chạy lại migration, check table `product_variants` có data

### Modal không hiển thị
→ Check z-index, clear browser cache

### Table không refresh sau create
→ Check `key` prop được truyền vào component

---

## 📞 Support

Nếu có vấn đề, check:
1. Browser Console (F12) → Errors
2. Supabase Logs → Database → Check queries
3. Network Tab → Check API responses

**Created:** October 15, 2024
**Version:** 1.0.0
