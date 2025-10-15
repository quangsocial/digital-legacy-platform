# 🔍 Cách Tìm Service Role Key trong Supabase

## 📍 Vị Trí Trong Dashboard

### Bước 1: Vào Settings
1. Mở trình duyệt: https://supabase.com/dashboard
2. Chọn project **digital-legacy-platform**
3. Click vào **Settings** (icon ⚙️ ở sidebar bên trái)
4. Click vào **API** trong menu Settings

### Bước 2: Tìm Service Role Key
Trong trang API Settings, bạn sẽ thấy section **"Project API keys"** với 2 keys:

#### 1. **anon public** (đã có trong .env.local) ✅
```
Tên: anon
Vai trò: public
Icon: 🔓 (không có khóa)
Dùng cho: Client-side, public access
```

#### 2. **service_role secret** (CẦN KEY NÀY) 🔑
```
Tên: service_role
Vai trò: secret
Icon: 🔒 (có khóa đỏ)
Dùng cho: Server-side, admin operations
QUAN TRỌNG: Key này BÍ MẬT, không được public!
```

### Bước 3: Copy Key
- Key **service_role** mặc định bị ẩn (hiển thị dạng `••••••••••••`)
- Click vào icon **👁️ (mắt)** hoặc **📋 (copy)** bên cạnh key
- Copy toàn bộ key (dạng: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...`)

---

## 🖼️ Hình Ảnh Minh Họa

```
┌─────────────────────────────────────────────────────┐
│ Settings > API                                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Project API keys                                    │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 🔓 anon                            public    │   │
│ │ eyJhbGciOiJIUzI1NiIsInR5cCI6...   [👁️] [📋] │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 🔒 service_role                    secret 🔐 │   │
│ │ ••••••••••••••••••••••••••••••    [👁️] [📋] │ ← COPY KEY NÀY
│ └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Sau Khi Copy, Làm Gì?

### 1. Paste vào `.env.local`

Mở file `.env.local` và tìm dòng:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

Thay bằng:
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...(key vừa copy)
```

### 2. Khởi động lại server

```bash
# Trong terminal đang chạy npm run dev:
# Nhấn Ctrl+C để dừng server

# Chạy lại:
npm run dev
```

### 3. Kiểm tra key đã hoạt động

Vào http://localhost:3000/admin/users và thử tạo user mới.

---

## 🔗 Link Trực Tiếp

**Vào ngay trang API Settings của project bạn:**
https://supabase.com/dashboard/project/skkhbzrvzbsqebujlwcu/settings/api

*(Đã mở sẵn trong Simple Browser bên phải)*

---

## ⚠️ Lưu Ý Bảo Mật

### ✅ ĐÚNG:
- Lưu trong `.env.local` (file này trong .gitignore, không push lên Git)
- Chỉ dùng ở server-side (API routes trong `/api/`)
- Giữ bí mật, không share với ai

### ❌ SAI:
- ~~Đặt trong code client-side~~
- ~~Commit lên GitHub/public repo~~
- ~~Share trên Discord, Slack, email~~
- ~~Để trong `NEXT_PUBLIC_*` environment variables~~

---

## 🎯 Tại Sao Cần Key Này?

| Tính năng | Anon Key | Service Role Key |
|-----------|----------|------------------|
| Đọc dữ liệu public | ✅ | ✅ |
| Tạo user mới | ❌ | ✅ |
| Bypass RLS policies | ❌ | ✅ |
| Admin operations | ❌ | ✅ |
| Xóa dữ liệu bất kỳ | ❌ | ✅ |

**Tạo user cần Service Role Key** vì:
- Gọi Supabase Admin API
- Bypass Row Level Security
- Tự động confirm email (không cần user click link)

---

## ❓ Vẫn Không Tìm Thấy?

### Trường hợp 1: Không thấy tab "API" trong Settings
**Giải pháp**: 
- Đảm bảo bạn đã đăng nhập Supabase
- Kiểm tra bạn có quyền admin của project này không
- Refresh trang: Ctrl+Shift+R

### Trường hợp 2: Chỉ thấy 1 key (anon)
**Giải pháp**:
- Scroll xuống dưới, service_role key ở dưới anon key
- Đợi trang load xong (có thể mất vài giây)

### Trường hợp 3: Key bị ẩn hoàn toàn
**Giải pháp**:
- Click icon mắt 👁️ để reveal key
- Hoặc click icon copy 📋 để copy trực tiếp (không cần nhìn thấy)

---

## 📞 Cần Hỗ Trợ Thêm?

Nếu vẫn không tìm thấy, gửi cho tôi:
1. Screenshot trang API Settings của bạn
2. Vai trò của bạn trong project (Owner/Admin/Member)

Tôi sẽ giúp troubleshoot cụ thể hơn!
