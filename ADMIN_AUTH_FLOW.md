# Admin Authentication Flow

## 🔐 Admin Login System

### URL Structure
- **User Login:** `/login` - Dành cho người dùng thông thường
- **Admin Login:** `/admin/login` - Dành riêng cho Admin & Super Admin

---

## 🔄 Authentication Flow

### 1. Admin Login (`/admin/login`)

**Steps:**
1. User nhập email & password
2. Gọi `supabase.auth.signInWithPassword()`
3. Check user role trong `profiles` table
4. Nếu role = `admin` hoặc `super_admin` → Redirect to `/admin`
5. Nếu role khác → Logout và hiển thị error

**Security:**
- ✅ Email/password authentication via Supabase Auth
- ✅ Role-based authorization check
- ✅ Automatic logout if unauthorized
- ✅ Error messages for failed attempts

---

### 2. Middleware Protection

**File:** `middleware.ts`

**Logic:**
```
/admin/login        → Allow access (no auth required)
/admin/*           → Require authentication + admin role
```

**Protection:**
1. Check if route starts with `/admin`
2. Allow `/admin/login` without authentication
3. For other `/admin/*` routes:
   - Check user authentication
   - Query `profiles.role`
   - Only allow `admin` or `super_admin`
   - Redirect to `/admin/login` if unauthorized

---

## 👥 User Roles

| Role | Access Level |
|------|-------------|
| `user` | User frontend only (`/`, `/dashboard`, `/pricing`, etc.) |
| `admin` | Admin panel access (`/admin/*`) |
| `super_admin` | Full admin access + user management |

---

## 🚀 Testing the Flow

### Test Case 1: Admin Login Success
1. Go to `http://localhost:3000/admin/login`
2. Login with: `quangsocial@gmail.com` (role = super_admin)
3. ✅ Should redirect to `/admin` dashboard

### Test Case 2: Regular User Login
1. Go to `http://localhost:3000/admin/login`
2. Login with regular user account (role = user)
3. ❌ Should show error: "Bạn không có quyền truy cập trang Admin"

### Test Case 3: Direct Admin Access (Not Logged In)
1. Go to `http://localhost:3000/admin`
2. ❌ Should redirect to `/admin/login`

### Test Case 4: Direct Admin Access (Logged In as User)
1. Login as regular user at `/login`
2. Try to access `http://localhost:3000/admin`
3. ❌ Should redirect to `/admin/login?error=unauthorized`

---

## 📊 Dashboard Data

### Real Data from Database
Dashboard (`/admin`) hiển thị:
- **Tổng người dùng** - `SELECT COUNT(*) FROM profiles`
- **Tổng đơn hàng** - `SELECT COUNT(*) FROM orders`
- **Doanh thu** - `SELECT SUM(total) FROM orders WHERE status='completed'`
- **Tin nhắn** - (0 nếu chưa có messages table)

### API Endpoints
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - All users list
- `GET /api/admin/orders` - All orders list
- `GET /api/admin/payments` - All payments list

---

## 🔧 Implementation Details

### Key Files
1. `src/app/(admin)/admin/login/page.tsx` - Admin login UI
2. `middleware.ts` - Route protection
3. `src/components/admin/DashboardStats.tsx` - Stats component
4. `src/app/api/admin/stats/route.ts` - Stats API

### Database Requirements
- `profiles` table must have `role` column (TEXT)
- Valid roles: `user`, `admin`, `super_admin`
- At least one user with `super_admin` role

---

## ⚠️ Security Notes

1. **Never expose admin credentials** in code or environment variables
2. **Always validate role server-side** (in middleware + API routes)
3. **Use RLS policies** in Supabase for additional security
4. **Log admin actions** for audit trails (future feature)
5. **Implement 2FA** for admin accounts (future feature)

---

## 🎯 Next Steps

### Pending Features:
- [ ] Add admin user management page
- [ ] Implement activity logs
- [ ] Add 2FA for admin login
- [ ] Create admin invite system
- [ ] Add session timeout for admin
- [ ] Implement IP whitelist for admin access
