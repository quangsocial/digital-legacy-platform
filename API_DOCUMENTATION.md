# API Routes Documentation

## Admin API Routes

Tất cả các routes đều yêu cầu authentication và role `admin` hoặc `super_admin`.

### 1. Statistics API

**Endpoint:** `GET /api/admin/stats`

**Description:** Lấy thống kê tổng quan hệ thống

**Response:**
```json
{
  "totalUsers": 10,
  "totalOrders": 5,
  "totalRevenue": 1485000,
  "totalMessages": 0
}
```

---

### 2. Users API

**Endpoint:** `GET /api/admin/users`

**Description:** Lấy danh sách tất cả người dùng với thông tin subscription

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "plan": "Premium",
    "status": "active",
    "joinedAt": "15/10/2025"
  }
]
```

---

### 3. Orders API

**Endpoint:** `GET /api/admin/orders`

**Description:** Lấy danh sách tất cả đơn hàng

**Response:**
```json
[
  {
    "id": "uuid",
    "orderNumber": "ORD-202510-0001",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "plan": "Premium",
    "billingCycle": "Tháng",
    "amount": "299,000đ",
    "status": "completed",
    "date": "15/10/2025"
  }
]
```

**Endpoint:** `PATCH /api/admin/orders`

**Description:** Cập nhật trạng thái đơn hàng

**Request Body:**
```json
{
  "orderId": "uuid",
  "status": "completed" // pending | processing | completed | cancelled | refunded
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated order */ }
}
```

---

### 4. Payments API

**Endpoint:** `GET /api/admin/payments`

**Description:** Lấy danh sách tất cả thanh toán

**Response:**
```json
[
  {
    "id": "uuid",
    "paymentNumber": "PAY-202510-0001",
    "orderNumber": "ORD-202510-0001",
    "customerName": "John Doe",
    "amount": "299,000đ",
    "method": "bank_transfer",
    "status": "completed",
    "transactionId": "TX123456",
    "date": "15/10/2025"
  }
]
```

**Endpoint:** `PATCH /api/admin/payments`

**Description:** Cập nhật trạng thái thanh toán

**Request Body:**
```json
{
  "paymentId": "uuid",
  "status": "completed" // pending | processing | completed | failed | refunded
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated payment */ }
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden"
}
```

### 400 Bad Request
```json
{
  "error": "Missing orderId or status"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Authentication

Tất cả API routes sử dụng Supabase Auth với middleware check:

1. Check user authentication (`auth.getUser()`)
2. Check user role trong `profiles` table
3. Chỉ cho phép `admin` hoặc `super_admin` truy cập

---

## Next Steps

### Còn thiếu API:
- `POST /api/admin/users` - Tạo user mới
- `PATCH /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Xóa user
- `GET /api/admin/plans` - Lấy danh sách plans
- `POST /api/admin/plans` - Tạo plan mới
- `PATCH /api/admin/plans/:id` - Update plan
- `GET /api/admin/payment-methods` - Lấy payment methods
- `PATCH /api/admin/payment-methods/:id` - Update payment method

### UI cần update:
- ✅ Dashboard - Stats (đã có)
- ⏳ Users page - Kết nối với `/api/admin/users`
- ⏳ Orders page - Kết nối với `/api/admin/orders`
- ⏳ Payments page - Kết nối với `/api/admin/payments`
