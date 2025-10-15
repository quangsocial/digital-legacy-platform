# 🏠 HƯỚNG DẪN SETUP KHI VỀ NHÀ

## 📥 Bước 1: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/digital-legacy-platform.git
cd digital-legacy-platform
```

## 📦 Bước 2: Cài đặt Dependencies

```bash
npm install
```

## 🔐 Bước 3: Cấu hình Environment Variables

### Tạo file `.env.local`:

```bash
# Copy file mẫu
cp .env.example .env.local
```

### Điền thông tin vào `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://skkhbzrvzbsqebujlwcu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNra2hienJ2emJzcWVidWpsd2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjMyNjksImV4cCI6MjA3NjA5OTI2OX0.e5cZBssEwLEvekK2U3-9l0qGtgcYIz5ABLndgjtF-_E
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Resend Email API
RESEND_API_KEY=re_FNSGUZJj_Psoy3AUG5qKNyRTD4hyZ6h9c

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Lấy Supabase Service Role Key (nếu cần):
1. Vào https://supabase.com/dashboard/project/skkhbzrvzbsqebujlwcu/settings/api
2. Copy **Service Role Key** (secret)
3. Paste vào `SUPABASE_SERVICE_ROLE_KEY` trong `.env.local`

## 🗄️ Bước 4: Kiểm tra Database

Database đã được setup sẵn trên Supabase với các bảng:
- ✅ `profiles` - Thông tin người dùng
- ✅ `recipients` - Người nhận
- ✅ `legacy_messages` - Tin nhắn di sản
- ✅ `message_recipients` - Liên kết tin nhắn - người nhận
- ✅ `notification_logs` - Log thông báo
- ✅ `user_settings` - Cài đặt người dùng

**Nếu cần chạy lại schema:**
1. Vào https://supabase.com/dashboard/project/skkhbzrvzbsqebujlwcu/sql
2. Copy nội dung file `supabase/schema.sql`
3. Paste và Run trong SQL Editor

## 🚀 Bước 5: Chạy Development Server

```bash
npm run dev
```

Server sẽ chạy tại: http://localhost:3000 (hoặc 3001 nếu 3000 bị chiếm)

## 👤 Bước 6: Đăng nhập

### Tài khoản Super Admin đã có sẵn:
- **Email**: quangsocial@gmail.com
- **Role**: super_admin

### Đăng nhập lần đầu:
1. Vào http://localhost:3000/login
2. Nhập email: quangsocial@gmail.com
3. Check email để lấy magic link
4. Click link để đăng nhập

## 📚 Các trang chính

- **Dashboard**: http://localhost:3000/dashboard
- **Tạo tin nhắn**: http://localhost:3000/messages/create
- **Quản lý người nhận**: http://localhost:3000/recipients
- **Xem tin nhắn**: http://localhost:3000/messages
- **Admin Setup**: http://localhost:3000/admin-setup

## 🛠️ Troubleshooting

### Lỗi "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Lỗi "Invalid API key"
- Kiểm tra lại các keys trong `.env.local`
- Đảm bảo không có khoảng trắng thừa

### Port 3000 bị chiếm
- Next.js sẽ tự động chuyển sang port 3001
- Hoặc dừng process đang dùng port 3000

### Database connection error
- Kiểm tra Supabase URL và Anon Key
- Đảm bảo project Supabase đang active

## 📝 Ghi chú quan trọng

### ⚠️ File KHÔNG được commit lên Git:
- `.env.local` - Chứa API keys nhạy cảm
- `node_modules/` - Dependencies
- `.next/` - Build files

### ✅ Đã commit lên Git:
- Source code
- Database schema
- README và documentation
- `.env.example` - File mẫu (không có keys thật)

## 🔄 Pull Updates từ GitHub

Nếu có thay đổi từ máy khác:

```bash
git pull origin main
npm install  # Nếu có dependencies mới
```

## 📤 Push Changes lên GitHub

Sau khi code tại nhà:

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

## 🎯 Tính năng đang hoạt động

✅ Authentication với Supabase Auth  
✅ Tạo và quản lý tin nhắn di sản  
✅ Quản lý người nhận  
✅ Lên lịch gửi tin nhắn  
✅ Dashboard với thống kê realtime  
✅ Admin panel cho super admin  
✅ Responsive design cho mobile  

## 🚧 Tính năng có thể thêm sau

- 📧 Email notifications với Resend
- 🔔 Reminder system với cron jobs
- 📱 SMS notifications
- 📊 Advanced analytics
- 🗂️ File upload cho images/documents
- ✏️ Edit messages
- 👁️ Preview messages

## 💡 Tips

1. **Development**: Sử dụng `npm run dev` để có hot reload
2. **Production Build**: Chạy `npm run build` để test production
3. **Logs**: Check terminal và browser console để debug
4. **Database**: Sử dụng Supabase Dashboard để xem data trực tiếp

## 📞 Hỗ trợ

Nếu gặp vấn đề, check:
1. Terminal logs
2. Browser console (F12)
3. Supabase Dashboard logs
4. `.env.local` configuration

---

**Happy Coding! 🎉**
