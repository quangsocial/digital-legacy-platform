# Admin Route Structure - Route Groups

## 📁 Cấu trúc mới (Best Practice)

```
src/app/admin/
├── (auth)/                    // Route group cho authentication
│   └── login/
│       └── page.tsx          // /admin/login - Không có sidebar/header
│
└── (dashboard)/              // Route group cho admin dashboard
    ├── layout.tsx            // Layout với sidebar + header
    ├── page.tsx              // /admin - Dashboard
    ├── users/
    │   └── page.tsx          // /admin/users
    ├── orders/
    │   └── page.tsx          // /admin/orders
    ├── payments/
    │   └── page.tsx          // /admin/payments
    ├── payment-methods/
    │   └── page.tsx          // /admin/payment-methods
    ├── pages/
    │   └── page.tsx          // /admin/pages
    └── settings/
        └── page.tsx          // /admin/settings
```

## 🎯 Lợi ích của Route Groups

### 1. **Tách biệt Layout hoàn toàn**
- `(auth)` group: Không có layout → Trang login sạch sẽ, không có sidebar/header
- `(dashboard)` group: Có layout admin → Tất cả trang con đều có sidebar + header

### 2. **URL không thay đổi**
- Dấu `()` trong tên thư mục **không xuất hiện** trong URL
- `/admin/login` vẫn là `/admin/login` (không phải `/admin/(auth)/login`)
- `/admin` vẫn là `/admin` (không phải `/admin/(dashboard)`)

### 3. **Dễ mở rộng**
- Thêm trang forgot password → Đặt trong `(auth)` group
- Thêm trang admin mới → Đặt trong `(dashboard)` group
- Muốn tạo public admin page → Tạo group mới `(public)`

### 4. **Best Practice của Next.js**
- Theo đúng App Router conventions
- Dễ maintain và scale
- Code organization tốt hơn

## 🔒 Bảo mật

### Middleware Protection

File `middleware.ts` đã được cập nhật:

```typescript
if (request.nextUrl.pathname.startsWith('/admin')) {
  // Allow (auth) group without authentication
  if (request.nextUrl.pathname === '/admin/login') {
    return await updateSession(request)
  }

  // Protect (dashboard) group - require auth + admin role
  // ... check user authentication and role
}
```

### Layout Isolation

- **`(auth)` group:** Không có layout → Không render AdminSidebar/AdminHeader
- **`(dashboard)` group:** Có layout → Tự động render AdminSidebar/AdminHeader cho mọi trang con

## 📊 So sánh Trước và Sau

### ❌ Trước (Có vấn đề)

```
src/app/(admin)/admin/
├── layout.tsx        // Layout áp dụng cho TẤT CẢ routes con
├── page.tsx          // /admin
└── login/
    └── page.tsx      // /admin/login - Vẫn bị áp dụng layout admin ❌
```

**Vấn đề:** Trang login vẫn hiển thị sidebar/header vì kế thừa layout của parent.

### ✅ Sau (Đã fix)

```
src/app/admin/
├── (auth)/
│   └── login/
│       └── page.tsx  // /admin/login - Không có layout ✅
│
└── (dashboard)/
    ├── layout.tsx    // Layout chỉ áp dụng cho group này
    └── page.tsx      // /admin - Có layout ✅
```

**Giải pháp:** Route groups tách biệt hoàn toàn layout.

## 🧪 Testing

### Test 1: Login Page (Không có sidebar)
1. **Logout** nếu đang đăng nhập
2. Vào: `http://localhost:3000/admin/login`
3. ✅ **Kỳ vọng:** Chỉ thấy form login, KHÔNG có sidebar/header

### Test 2: Dashboard (Có sidebar)
1. **Login** với admin account
2. Vào: `http://localhost:3000/admin`
3. ✅ **Kỳ vọng:** Thấy sidebar bên trái + header trên cùng + dashboard content

### Test 3: Middleware Protection
1. **Logout**
2. Thử truy cập trực tiếp: `http://localhost:3000/admin`
3. ✅ **Kỳ vọng:** Tự động redirect về `/admin/login`

### Test 4: Non-admin User
1. **Login** với user thường (không phải admin)
2. Thử truy cập: `http://localhost:3000/admin`
3. ✅ **Kỳ vọng:** Redirect về `/admin/login` với error message

## 📚 Tài liệu tham khảo

- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Next.js Layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#layouts)

## 🚀 Kết luận

Route groups giúp:
- ✅ Tách biệt layout hoàn toàn
- ✅ Bảo mật tốt hơn
- ✅ Code dễ maintain
- ✅ Dễ mở rộng sau này
- ✅ Tuân theo Best Practice của Next.js
