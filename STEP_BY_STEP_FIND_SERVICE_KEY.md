# 🎯 HƯỚNG DẪN TÌM SERVICE ROLE KEY - TỪNG BƯỚC

## ⚠️ Bạn Đang Nhầm Key!

### Key Bạn Đã Gửi:
1. ❌ `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (205 ký tự)
   - **Loại**: Supabase Anon Key
   - **Vai trò**: public, client-side
   - **Đã có trong** `.env.local` rồi

2. ❌ `sb_publishable_AlUB4Pr-znEen0C5R5osEg_-FEvBbyj`
   - **Loại**: Stripe Publishable Key
   - **Vai trò**: Thanh toán Stripe
   - **Không liên quan** đến Supabase

### Key Bạn CẦN TÌM:
✅ **Supabase Service Role Key** (JWT format, 700-800 ký tự)

---

## 📱 TỪNG BƯỚC TÌM KEY (5 PHÚT)

### BƯỚC 1: Mở Trình Duyệt (Chrome/Edge/Firefox)
```
https://supabase.com/dashboard
```

### BƯỚC 2: Đăng Nhập Supabase
- Email: quangsocial@gmail.com (hoặc email bạn dùng)
- Password: (mật khẩu Supabase của bạn)

### BƯỚC 3: Chọn Project
- Click vào project **"digital-legacy-platform"**
- Hoặc project có ID: `skkhbzrvzbsqebujlwcu`

### BƯỚC 4: Vào Settings
- Sidebar bên trái, click icon ⚙️ **"Settings"** (ở cuối cùng)
- Hoặc URL: https://supabase.com/dashboard/project/skkhbzrvzbsqebujlwcu/settings

### BƯỚC 5: Click Tab "API"
- Trong Settings menu, click **"API"**
- Hoặc URL: https://supabase.com/dashboard/project/skkhbzrvzbsqebujlwcu/settings/api

### BƯỚC 6: Scroll Xuống Tìm "Project API keys"
Bạn sẽ thấy 2 keys:

```
┌──────────────────────────────────────────────────────────┐
│ Project API keys                                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ 📌 KEY 1: anon                              public 🔓   │
│ ┌────────────────────────────────────────────────────┐  │
│ │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...   │  │
│ │                                        [👁️] [📋]   │  │
│ └────────────────────────────────────────────────────┘  │
│ ↑ KEY NÀY ĐÃ CÓ TRONG .env.local (NEXT_PUBLIC_...)     │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ 🎯 KEY 2: service_role                     secret 🔒    │
│ ┌────────────────────────────────────────────────────┐  │
│ │ ••••••••••••••••••••••••••••••••••••••            │  │
│ │                                        [👁️] [📋]   │  │
│ └────────────────────────────────────────────────────┘  │
│ ↑ COPY KEY NÀY! (Click icon 📋)                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### BƯỚC 7: Copy Service Role Key
**2 cách:**

#### Cách A: Click Icon Copy 📋 (KHUYÊN DÙNG)
1. Tìm dòng có chữ **"service_role"** và icon 🔒
2. Bên phải key có 2 icons: 👁️ và 📋
3. **Click icon 📋 (copy)**
4. Key tự động copy vào clipboard
5. **Không cần nhìn thấy key**, nó đã copy rồi!

#### Cách B: Click Icon Mắt 👁️
1. Click icon **👁️ (eye)** để reveal key
2. Key sẽ hiển thị: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...` (dài lắm)
3. Click vào key để select
4. **Ctrl+C** để copy
5. Hoặc triple-click để select toàn bộ dòng

### BƯỚC 8: Verify Key Đã Copy
Mở Notepad và **Ctrl+V** để paste. Kiểm tra:

✅ **Key ĐÚNG** nếu:
- Bắt đầu: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...`
- Độ dài: **700-800 ký tự**
- Có 3 phần ngăn cách bởi `.`
- Phần 2 decode ra có `"role":"service_role"`

❌ **Key SAI** nếu:
- Dưới 300 ký tự → Đó là anon key
- Bắt đầu `sb_publishable_` → Đó là Stripe key
- Không phải JWT format

---

## 🔧 BƯỚC 9: Paste Vào .env.local

### A. Mở File
- VS Code: `Ctrl+P` → gõ `.env.local` → Enter
- Hoặc mở thủ công: `f:\DREAMDEV\digital-legacy-platform\.env.local`

### B. Tìm Dòng
```bash
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### C. Thay Thế
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...(paste key vừa copy, 700+ ký tự)
```

### D. Save File
**Ctrl+S**

---

## 🔄 BƯỚC 10: Khởi Động Lại Server

### A. Dừng Server Hiện Tại
```bash
# Trong terminal đang chạy npm run dev:
# Nhấn Ctrl+C
```

### B. Chạy Lại Server
```bash
npm run dev
```

### C. Đợi Server Chạy
```
✓ Ready in 3.2s
○ Local:        http://localhost:3000
```

---

## ✅ BƯỚC 11: Test Tạo User

### A. Mở Trang Admin Users
```
http://localhost:3000/admin/users
```

### B. Click Nút "Thêm người dùng"

### C. Điền Form
```
Email: test123@example.com
Password: Test123456
Họ tên: Nguyễn Văn Test
Role: user
```

### D. Click "Tạo tài khoản"

### E. Kết Quả
✅ **THÀNH CÔNG** nếu:
- Thấy alert: "User created successfully"
- User xuất hiện trong bảng
- Không có lỗi trong console

❌ **VẪN LỖI** nếu:
- Thấy: "User not allowed" → Key vẫn sai, kiểm tra lại
- Thấy: "Unauthorized" → Chưa đăng nhập admin
- Server crash → Check terminal xem lỗi gì

---

## 🆘 TROUBLESHOOTING

### Vấn Đề 1: Không Thấy Key service_role

**Nguyên nhân có thể:**
1. Chưa đăng nhập Supabase
2. Không phải Owner/Admin của project
3. Trang chưa load xong

**Giải pháp:**
- Đảm bảo đã login: https://supabase.com/dashboard
- Kiểm tra vai trò: Settings > Team > Xem role của bạn
- Refresh trang: **Ctrl+Shift+R**
- Thử trình duyệt khác

### Vấn Đề 2: Key Bị Ẩn, Không Copy Được

**Giải pháp:**
- Dùng icon 📋 (copy) thay vì 👁️ (view)
- Thử browser khác (Chrome, Edge, Firefox)
- Disable extensions (ad blocker có thể chặn)

### Vấn Đề 3: Copy Rồi Nhưng Vẫn Lỗi "User not allowed"

**Kiểm tra:**
1. Key có đúng 700-800 ký tự không?
   ```bash
   # Trong terminal PowerShell:
   (Get-Content .env.local | Select-String "SUPABASE_SERVICE_ROLE_KEY").Length
   # Phải > 750
   ```

2. Key có format JWT không?
   ```bash
   # Phải có 3 phần ngăn cách bởi dấu .
   # eyJhbGc...PHẦN1.eyJpc3M...PHẦN2.a1b2c3...PHẦN3
   ```

3. Đã restart server chưa?
   ```bash
   # Ctrl+C trong terminal
   npm run dev
   ```

### Vấn Đề 4: Project Không Có service_role Key

**Cực kỳ hiếm, nhưng nếu xảy ra:**

1. **Tạo lại key:**
   - Settings > API > "Reset service_role key" button
   - Confirm reset
   - Copy key mới

2. **Liên hệ Supabase Support:**
   - https://supabase.com/dashboard/support
   - Mô tả: "Project missing service_role key"

---

## 📊 So Sánh Visual

### Anon Key (200 ký tự) - ĐÃ CÓ
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNra2hienJ2emJzcWVidWpsd2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjMyNjksImV4cCI6MjA3NjA5OTI2OX0.e5cZBssEwLEvekK2U3-9l0qGtgcYIz5ABLndgjtF-_E
```

### Service Role Key (700-800 ký tự) - CẦN TÌM
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNra2hienJ2emJzcWVidWpsd2N1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDUyMzI2OSwiZXhwIjoyMDc2MDk5MjY5fQ.a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2
```

**Nhìn thấy sự khác biệt chưa?** Service role key **dài gấp 3-4 lần**!

---

## 🔐 Bảo Mật Service Role Key

**⚠️ KEY NÀY CÓ QUYỀN ADMIN TOÀN BỘ DATABASE!**

### ✅ AN TOÀN:
- Lưu trong `.env.local` (file này trong .gitignore)
- Chỉ dùng trong server-side code (`/api/` routes)
- Không bao giờ gửi qua client
- Không commit lên Git

### ❌ NGUY HIỂM:
- Để trong code client-side
- Commit lên GitHub public repo
- Share qua email, chat, Discord
- Đặt trong `NEXT_PUBLIC_*` variables
- Deploy không dùng environment variables

**Nếu key bị lộ:**
1. Vào Settings > API
2. Click "Reset service_role key"
3. Update lại `.env.local`
4. Restart server

---

## ✅ Checklist Hoàn Thành

- [ ] Đã đăng nhập Supabase Dashboard
- [ ] Vào Settings > API
- [ ] Tìm thấy 2 keys (anon và service_role)
- [ ] Copy key service_role (700-800 ký tự, JWT format)
- [ ] Paste vào `.env.local` thay `your_supabase_service_role_key_here`
- [ ] Save file `.env.local`
- [ ] Restart server (`Ctrl+C` rồi `npm run dev`)
- [ ] Test tạo user thành công

---

## 📞 Vẫn Cần Giúp?

Nếu làm theo 11 bước trên mà vẫn không được:

1. **Screenshot trang API Settings** (che key đi)
2. **Copy nội dung `.env.local`** (che key đi, chỉ để độ dài)
3. **Copy lỗi trong terminal** khi tạo user
4. **Cho tôi biết vai trò** của bạn trong project (Owner/Admin/Member)

Tôi sẽ troubleshoot cụ thể cho trường hợp của bạn!

---

**Thời gian ước tính: 5 phút**
**Độ khó: ⭐⭐ (Trung bình - cần tìm đúng key)**
