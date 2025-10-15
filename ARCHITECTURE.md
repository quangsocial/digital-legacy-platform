# Digital Legacy Platform - Cấu trúc mới

## 📁 Cấu trúc Project

Project đã được tái cấu trúc thành 2 phần riêng biệt:

### 🔐 **Admin Panel** (`/admin`)
Giao diện quản trị dành cho Super Admin

**URL:** `http://localhost:3000/admin`

**Các trang:**
- `/admin` - Dashboard tổng quan
- `/admin/users` - Quản lý người dùng
- `/admin/orders` - Quản lý đơn hàng (các gói đăng ký)
- `/admin/payments` - Quản lý bill thanh toán
- `/admin/payment-methods` - Setup phương thức thanh toán (Bank, PayPal, Crypto, Momo)
- `/admin/pages` - Quản lý giao diện các trang website
- `/admin/settings` - Cài đặt hệ thống

**Components:**
- `AdminSidebar` - Menu điều hướng bên trái
- `AdminHeader` - Header với thông tin admin và logout
- `AdminLayout` - Layout chung cho tất cả trang admin

**Bảo mật:**
- Middleware kiểm tra authentication
- TODO: Thêm role-based authorization từ Supabase

---

### 👤 **User Frontend** (Root routes)
Giao diện cho người dùng cuối

**URL:** `http://localhost:3000/`

**Các trang:**
- `/` - Trang chủ (Hero + Features)
- `/pricing` - Bảng giá các gói dịch vụ
- `/cart` - Giỏ hàng
- `/checkout` - Thanh toán
- `/login` - Đăng nhập (sử dụng trang cũ)
- `/dashboard` - Dashboard người dùng (sử dụng trang cũ)

**Components:**
- `UserHeader` - Header với navigation và cart
- `UserFooter` - Footer với links và social
- `UserLayout` - Layout chung cho tất cả trang user

**Tính năng:**
- Responsive design
- Shopping cart
- Multiple payment methods
- Pricing plans

---

## 🚀 Cách sử dụng

### Chạy development server:
```bash
npm run dev
```

### Truy cập:
- **User Frontend:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin
- **Pricing:** http://localhost:3000/pricing
- **Cart:** http://localhost:3000/cart

---

## 🔧 Cấu trúc thư mục

```
src/
├── app/
│   ├── (admin)/              # Admin route group
│   │   └── admin/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── users/
│   │       ├── orders/
│   │       ├── payments/
│   │       ├── payment-methods/
│   │       ├── pages/
│   │       └── settings/
│   │
│   ├── (user)/               # User route group
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── pricing/
│   │   ├── cart/
│   │   └── checkout/
│   │
│   ├── login/                # Shared authentication
│   ├── dashboard/            # User dashboard (legacy)
│   └── ...                   # Other legacy routes
│
├── components/
│   ├── admin/
│   │   ├── AdminSidebar.tsx
│   │   └── AdminHeader.tsx
│   │
│   └── user/
│       ├── UserHeader.tsx
│       └── UserFooter.tsx
│
└── lib/
    └── supabase/
```

---

## 📝 TODO - Các bước tiếp theo

### Ngay lập tức:
1. ✅ Tách riêng Admin và User interface
2. ✅ Tạo các trang Admin cơ bản
3. ✅ Tạo các trang User cơ bản
4. ✅ Setup middleware cho admin routes

### Tiếp theo:
1. **Database Schema:**
   - Thêm bảng `orders` (đơn hàng)
   - Thêm bảng `payments` (thanh toán)
   - Thêm bảng `payment_methods` (phương thức thanh toán)
   - Thêm trường `role` vào `profiles` (admin/user)
   - Thêm bảng `plans` (các gói dịch vụ)

2. **Admin Features:**
   - Kết nối với Supabase để lấy dữ liệu thực
   - Implement CRUD cho users
   - Implement quản lý orders
   - Implement payment tracking
   - Implement page editor
   - Add charts và analytics

3. **User Features:**
   - Shopping cart functionality
   - Payment integration (Bank, PayPal, Crypto, Momo)
   - Order history
   - User profile management
   - Di chuyển dashboard cũ vào route group user

4. **Security:**
   - Role-based access control (RBAC)
   - Admin role check trong middleware
   - API route protection
   - Audit logging

5. **UI/UX:**
   - Dark mode
   - Responsive optimization
   - Loading states
   - Error handling
   - Toast notifications

---

## 🔐 Phân quyền

### Admin:
- Truy cập toàn bộ `/admin/*`
- Quản lý users, orders, payments
- Cấu hình hệ thống

### User:
- Truy cập public pages và dashboard riêng
- Mua gói dịch vụ
- Quản lý di chúc của mình
- Không truy cập được `/admin/*`

---

## 💡 Tips

1. **Route Groups:** Sử dụng `(admin)` và `(user)` để tách routing mà không ảnh hưởng URL
2. **Middleware:** Kiểm tra authentication và role trước khi vào admin
3. **Layouts:** Mỗi route group có layout riêng với header/footer khác nhau
4. **Components:** Tách biệt admin và user components để dễ maintain

---

## 📞 Support

Nếu cần hỗ trợ, vui lòng liên hệ team development.
