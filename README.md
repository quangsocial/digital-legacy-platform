# Digital Legacy Platform

Nền tảng di chúc số cho phép người dùng tạo và lên lịch gửi tin nhắn, hình ảnh, video và thông tin quan trọng đến người thân trong tương lai.

## Tính năng chính

### 📝 Tạo Di chúc số
- **Tin nhắn văn bản**: Lời nhắn, thư tình, lời xin lỗi
- **Hình ảnh**: Ảnh kỷ niệm, tài liệu quan trọng
- **Video**: Link YouTube với video cá nhân
- **Thông tin tài chính**: Tài khoản ngân hàng, ví crypto, mật khẩu

### ⏰ Lên lịch gửi thông minh
- **Đặt ngày gửi**: Chọn thời điểm cụ thể trong tương lai
- **Nhiều người nhận**: Gửi nội dung khác nhau cho từng người
- **Nhắc nhở định kỳ**: Thông báo trước X ngày để có thể hủy

### 🛡️ Hệ thống bảo mật
- **Xác thực người dùng**: Đăng ký/đăng nhập an toàn
- **Mã hóa dữ liệu**: Tất cả nội dung được bảo vệ
- **Quyền riêng tư**: Chỉ người tạo và người nhận mới xem được

### 🔄 Quản lý linh hoạt
- **Hủy bất cứ lúc nào**: Người dùng có thể hủy tin nhắn đã lên lịch
- **Chỉnh sửa nội dung**: Cập nhật thông tin trước khi gửi
- **Theo dõi trạng thái**: Dashboard quản lý tất cả tin nhắn

## Công nghệ sử dụng

- **Frontend**: Next.js 14 với TypeScript và Tailwind CSS
- **Backend**: Supabase (database, authentication, storage)
- **Email**: Resend API cho thông báo email
- **Deployment**: Vercel

## Cách hoạt động

1. **Đăng ký tài khoản** và xác thực email
2. **Tạo di chúc số** với các loại nội dung khác nhau
3. **Thêm người nhận** và thông tin liên hệ
4. **Đặt lịch gửi** với ngày giờ cụ thể
5. **Nhận nhắc nhở** định kỳ để có thể hủy nếu cần
6. **Tự động gửi** khi đến hạn (nếu không bị hủy)

## Cài đặt

1. Clone repository
2. Cài đặt dependencies:
   ```bash
   npm install
   ```

3. Cấu hình environment variables trong `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   RESEND_API_KEY=your_resend_api_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Thiết lập database Supabase:
   - Chạy SQL script trong `supabase/schema.sql` trên Supabase dashboard
   - Script sẽ tạo bảng `secret_messages` và các policy cần thiết

5. Chạy development server:
   ```bash
   npm run dev
   ```

6. Mở [http://localhost:3000](http://localhost:3000) trong browser

## API Endpoints

### POST /api/messages
Tạo tin nhắn bí mật mới

**Body:**
```json
{
  "message": "Nội dung tin nhắn",
  "expirationHours": 24,
  "recipientEmail": "email@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "uuid",
  "messageUrl": "http://localhost:3000/message/uuid",
  "expiresAt": "2025-10-16T10:00:00Z"
}
```

### GET /api/messages/[id]
Đọc tin nhắn bí mật (tin nhắn sẽ bị xóa sau khi đọc)

**Response:**
```json
{
  "success": true,
  "message": "Nội dung tin nhắn",
  "createdAt": "2025-10-15T10:00:00Z"
}
```

## Database Schema

```sql
CREATE TABLE secret_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    recipient_email TEXT
);
```

## Deployment

### Vercel
1. Connect GitHub repository với Vercel
2. Thêm environment variables trong Vercel dashboard
3. Deploy tự động khi push code

### Environment Variables cần thiết:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL`

## Bảo mật

- Sử dụng Supabase Row Level Security (RLS)
- Tin nhắn tự động xóa sau khi đọc
- Environment variables được bảo mật
- HTTPS cho tất cả connections

## Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run start` - Chạy production server
- `npm run lint` - Chạy ESLint

## Contribute

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request