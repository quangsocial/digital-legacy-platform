# Hướng dẫn thiết lập Digital Legacy Platform

## Bước 1: Truy cập Supabase Dashboard
1. Đăng nhập vào [https://supabase.com](https://supabase.com)
2. Chọn project: `skkhbzrvzbsqebujlwcu`
3. Vào tab **SQL Editor**

## Bước 2: Chạy SQL Script
1. Trong SQL Editor, copy và paste toàn bộ nội dung từ file `supabase/schema.sql`
2. Click **Run** để thực thi script
3. Kiểm tra kết quả - sẽ thấy thông báo thành công

## Bước 3: Kiểm tra Tables đã được tạo
Vào tab **Table Editor**, sẽ thấy các tables:

### profiles
- Mở rộng thông tin user từ auth.users
- Lưu profile, avatar, phone

### recipients  
- Danh sách người nhận di chúc
- Quan hệ, email, phone, ghi chú

### legacy_messages
- Tin nhắn di chúc chính
- Hỗ trợ text, image, video, financial info
- Scheduling và status management

### message_recipients
- Quan hệ nhiều-nhiều giữa message và recipient
- Custom message cho từng người nhận

### notification_logs
- Log tất cả notifications đã gửi
- Reminder, confirmation, delivery

### user_settings
- Cài đặt cá nhân của user
- Timezone, language, notification preferences

## Bước 4: Kiểm tra RLS Policies
1. Vào tab **Authentication** > **Policies**
2. Sẽ thấy policies cho tất cả tables với user-based security

## Bước 5: Thiết lập Authentication
1. Vào tab **Authentication** > **Settings**
2. Trong **Site URL**, thêm: `http://localhost:3000`
3. Trong **Redirect URLs**, thêm: `http://localhost:3000/auth/callback`
4. Enable **Email confirmations** nếu muốn

## Bước 6: Test ứng dụng
1. Chạy ứng dụng: `npm run dev`
2. Truy cập `http://localhost:3000`
3. Click "Đăng nhập" và test đăng ký/đăng nhập
4. Kiểm tra dashboard sau khi đăng nhập

## Cấu trúc Database hoàn chỉnh

### Tables chính:
- **profiles**: Thông tin user
- **recipients**: Người nhận di chúc  
- **legacy_messages**: Nội dung di chúc
- **message_recipients**: Liên kết message-recipient
- **notification_logs**: Log thông báo
- **user_settings**: Cài đặt user

### Functions hữu ích:
- `get_messages_needing_reminders()`: Lấy messages cần nhắc nhở
- `get_messages_ready_to_send()`: Lấy messages sẵn sàng gửi
- `mark_message_as_sent()`: Đánh dấu đã gửi
- `update_reminder_sent()`: Cập nhật thời gian nhắc nhở

## Tính năng đã implement:
✅ User authentication với Supabase Auth
✅ Database schema hoàn chỉnh
✅ Row Level Security (RLS)
✅ Basic dashboard
✅ Login/logout functionality

## Tính năng cần phát triển:
🔄 Tạo legacy messages
🔄 Quản lý recipients
🔄 Scheduling system
🔄 Email notifications
🔄 File upload (images/documents)
🔄 Automated reminder system