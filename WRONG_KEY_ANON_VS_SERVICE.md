# ❌ Key Sai! Đây Là Anon Key

## 🔍 Key Bạn Vừa Gửi

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNra2hienJ2emJzcWVidWpsd2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjMyNjksImV4cCI6MjA3NjA5OTI2OX0.e5cZBssEwLEvekK2U3-9l0qGtgcYIz5ABLndgjtF-_E
```

**Decode:**
```json
{
  "role": "anon"  ← ĐÚNG LÀ ANON KEY (đã có trong .env.local)
}
```

---

## ✅ Key Cần Tìm

**Service Role Key** phải:
- ✅ Dài hơn (600-800 ký tự thay vì 200)
- ✅ Có `"role": "service_role"` khi decode
- ✅ Bên cạnh có icon 🔒 (khóa đỏ) và chữ **"secret"**
- ✅ Mặc định bị ẩn thành `••••••••••••`

---

## 📸 Hình Ảnh Trong Supabase Dashboard

Khi vào https://supabase.com/dashboard/project/skkhbzrvzbsqebujlwcu/settings/api

Bạn sẽ thấy:

```
┌─────────────────────────────────────────────────────┐
│ Project API keys                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ anon                                      public 🔓 │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6...         [👁️] [📋] │
│ ↑ KEY NÀY BẠN VỪA GỬI (200 ký tự)                  │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ service_role                             secret 🔒 │
│ ••••••••••••••••••••••••••••••          [👁️] [📋] │
│ ↑ COPY KEY NÀY (600-800 ký tự, BỊ ẨN)             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 3 Cách Lấy Service Role Key

### Cách 1: Click Icon Copy 📋 (NHANH NHẤT)
1. Vào: https://supabase.com/dashboard/project/skkhbzrvzbsqebujlwcu/settings/api
2. Tìm key thứ 2 có chữ **"service_role"** và icon 🔒
3. Click icon **📋 (copy)** bên phải
4. Key tự động copy vào clipboard (không cần nhìn thấy)

### Cách 2: Click Icon Mắt 👁️
1. Tìm key **service_role**
2. Click icon **👁️ (mắt)** để reveal key
3. Select toàn bộ và Ctrl+C

### Cách 3: Dùng Supabase CLI (Nếu Có)
```bash
# Trong terminal
supabase status --local=false

# Sẽ hiển thị:
# service_role key: eyJhbGc...
```

---

## ✋ Chờ Đã! Không Thấy Key Thứ 2?

### Kiểm tra:
1. **Đã login Supabase chưa?**
   - Phải đăng nhập tài khoản có quyền admin project

2. **Đúng project chưa?**
   - URL phải là: `...project/skkhbzrvzbsqebujlwcu/...`

3. **Đã load xong chưa?**
   - Đợi trang load hết (có thể mất 2-3 giây)
   - Scroll xuống xem key service_role có ở dưới không

4. **Có quyền xem không?**
   - Cần role Owner hoặc Admin của project
   - Nếu bạn là Member, không thấy service_role key

---

## 🆘 Nếu Thật Sự Không Tìm Thấy

### Giải pháp 1: Reset Service Role Key
1. Vào Settings > API
2. Scroll xuống tìm **"Reset service_role key"** button
3. Click reset, key mới sẽ hiện ra

### Giải pháp 2: Dùng Supabase Support
- Vào: https://supabase.com/dashboard/support
- Mô tả: "Cannot find service_role key in API settings"

### Giải pháp 3: Tạo Project Mới (Nếu Cần)
- Service role key được tạo tự động khi tạo project
- Nếu project cũ có vấn đề, có thể tạo project test mới

---

## 📊 So Sánh Độ Dài Key

**Key bạn vừa gửi (Anon):**
```
Length: 205 characters
```

**Service Role Key thật:**
```
Length: 700-800 characters (GẤP 3-4 LẦN)
```

Nếu key bạn copy có độ dài ~200 ký tự → Đó là anon key
Nếu key bạn copy có độ dài ~700+ ký tự → Đúng rồi!

---

## 🔐 Bảo Mật Quan Trọng

**Service Role Key**:
- ⚠️ BÍ MẬT TUYỆT ĐỐI
- ⚠️ CÓ QUYỀN ADMIN TOÀN BỘ DATABASE
- ⚠️ BYPASS MỌI RLS POLICIES
- ⚠️ CÓ THỂ XÓA/SỬA BẤT KỲ DỮ LIỆU NÀO

👉 **KHÔNG BAO GIỜ**:
- ❌ Commit lên Git
- ❌ Share trên chat/email
- ❌ Để trong code client-side
- ❌ Deploy lên public

✅ **CHỈ LƯU TRONG**:
- `.env.local` (không commit)
- Biến môi trường server

---

## ✅ Sau Khi Có Key Đúng

1. **Paste vào `.env.local`:**
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNra2hienJ2emJzcWVidWpsd2N1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSI... (700+ ký tự)
   ```

2. **Khởi động lại server:**
   ```bash
   # Ctrl+C trong terminal
   npm run dev
   ```

3. **Test tạo user:**
   - Vào http://localhost:3000/admin/users
   - Click "Thêm người dùng"
   - Điền form và submit
   - Nếu thành công → Key đúng! ✅
   - Nếu vẫn lỗi "User not allowed" → Key vẫn sai ❌

---

## 📞 Cần Giúp?

Nếu vẫn không tìm thấy, hãy:
1. Screenshot trang API Settings
2. Kiểm tra vai trò của bạn trong project (Owner/Admin?)
3. Cho tôi biết để troubleshoot cụ thể hơn
