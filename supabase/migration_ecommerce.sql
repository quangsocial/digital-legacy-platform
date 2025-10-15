-- ============================================
-- MIGRATION: E-COMMERCE & ADMIN FEATURES
-- Digital Legacy Platform
-- Date: 2025-10-15
-- ============================================

-- 1. PLANS TABLE (Các gói dịch vụ)
CREATE TABLE IF NOT EXISTS plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL, -- 'Free', 'Basic', 'Premium', 'Enterprise'
    slug TEXT NOT NULL UNIQUE, -- 'free', 'basic', 'premium', 'enterprise'
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Giá tháng (VNĐ)
    yearly_price DECIMAL(10, 2), -- Giá năm (VNĐ) nếu có
    currency TEXT DEFAULT 'VND',
    
    -- Features (JSONB để linh hoạt)
    features JSONB, -- {"recipients": 5, "messages": 50, "storage_gb": 1, ...}
    
    -- Limits
    max_recipients INTEGER, -- null = unlimited
    max_messages INTEGER, -- null = unlimited
    storage_gb INTEGER, -- GB storage
    
    -- Display
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default plans
INSERT INTO plans (name, slug, description, price, yearly_price, max_recipients, max_messages, storage_gb, features, display_order) VALUES
('Free', 'free', 'Trải nghiệm cơ bản cho người dùng mới', 0, 0, 1, 5, 0, 
 '{"support": "email", "features": ["1 người nhận", "5 tin nhắn", "100MB lưu trữ", "Hỗ trợ email"]}', 1),
 
('Basic', 'basic', 'Phù hợp cho cá nhân và gia đình nhỏ', 99000, 990000, 5, 50, 1,
 '{"support": "priority", "features": ["5 người nhận", "50 tin nhắn", "1GB lưu trữ", "Đính kèm ảnh/video", "Lên lịch gửi"]}', 2),
 
('Premium', 'premium', 'Tối ưu cho gia đình lớn', 299000, 2990000, NULL, NULL, 10,
 '{"support": "24/7", "features": ["Không giới hạn người nhận", "Không giới hạn tin nhắn", "10GB lưu trữ", "Mã hóa nâng cao", "Sao lưu tự động"]}', 3),
 
('Enterprise', 'enterprise', 'Giải pháp tùy chỉnh cho tổ chức', 0, 0, NULL, NULL, 100,
 '{"support": "dedicated", "features": ["Tất cả Premium", "API riêng", "On-premise", "SLA 99.9%"]}', 4);

-- ============================================
-- 2. ORDERS TABLE (Đơn hàng)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL, -- Auto-generated: ORD-202510-0001
    
    -- User info
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    customer_address TEXT,
    
    -- Order details
    plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
    plan_name TEXT NOT NULL, -- Snapshot at time of order
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    
    -- Pricing
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'VND',
    
    -- Coupon
    coupon_code TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',      -- Chờ thanh toán
        'processing',   -- Đang xử lý
        'completed',    -- Hoàn thành
        'cancelled',    -- Đã hủy
        'refunded'      -- Đã hoàn tiền
    )),
    
    -- Dates
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    cancelled_date TIMESTAMP WITH TIME ZONE,
    
    -- Notes
    customer_notes TEXT,
    admin_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. PAYMENTS TABLE (Thanh toán)
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    payment_number TEXT UNIQUE NOT NULL, -- Auto-generated: PAY-202510-0001
    
    -- Order reference
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Payment info
    payment_method TEXT NOT NULL CHECK (payment_method IN (
        'bank_transfer',
        'momo',
        'paypal',
        'crypto'
    )),
    
    -- Amount
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'VND',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',      -- Chờ xác nhận
        'processing',   -- Đang xử lý
        'completed',    -- Thành công
        'failed',       -- Thất bại
        'refunded'      -- Đã hoàn tiền
    )),
    
    -- Payment details (flexible JSONB for different methods)
    payment_details JSONB, -- Bank info, transaction ID, etc.
    
    -- Transaction info
    transaction_id TEXT, -- From payment gateway
    gateway_response JSONB, -- Raw response from gateway
    
    -- Proof
    proof_url TEXT, -- Screenshot of transfer
    
    -- Dates
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_date TIMESTAMP WITH TIME ZONE,
    
    -- Notes
    notes TEXT,
    admin_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. PAYMENT_METHODS TABLE (Phương thức thanh toán)
-- ============================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    method_type TEXT NOT NULL UNIQUE CHECK (method_type IN (
        'bank_transfer',
        'momo',
        'paypal',
        'crypto'
    )),
    
    -- Display info
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT, -- Emoji or icon name
    
    -- Status
    is_enabled BOOLEAN DEFAULT true,
    
    -- Configuration (JSONB for flexibility)
    config JSONB NOT NULL, -- Bank account, API keys, addresses, etc.
    -- Example for bank: {"bank_name": "Vietcombank", "account_number": "...", "account_name": "...", "branch": "..."}
    -- Example for crypto: {"wallet_address": "...", "coin_type": "BTC"}
    
    -- Instructions for users
    instructions TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default payment methods
INSERT INTO payment_methods (method_type, display_name, description, icon, is_enabled, config, instructions) VALUES
('bank_transfer', 'Chuyển khoản ngân hàng', 'Thanh toán qua chuyển khoản ngân hàng', '🏦', true,
 '{"bank_name": "Vietcombank", "account_number": "1234567890", "account_name": "NGUYEN VAN A", "branch": "Ha Noi"}',
 'Vui lòng chuyển khoản với nội dung: DLP [Số điện thoại]'),

('momo', 'Ví MoMo', 'Thanh toán qua ví điện tử MoMo', '📱', true,
 '{"phone": "0123456789", "name": "NGUYEN VAN A"}',
 'Quét mã QR hoặc chuyển tiền đến số điện thoại'),

('paypal', 'PayPal', 'Thanh toán qua PayPal', '💳', true,
 '{"email": "payment@digitallegacy.com", "client_id": "", "secret": ""}',
 'Sẽ được chuyển đến trang PayPal để thanh toán'),

('crypto', 'Cryptocurrency', 'Thanh toán bằng tiền mã hóa', '₿', false,
 '{"btc_address": "", "eth_address": "", "usdt_address": ""}',
 'Chuyển tiền đến địa chỉ ví tương ứng');

-- ============================================
-- 5. COUPONS TABLE (Mã giảm giá)
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    
    -- Discount
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL, -- 10 = 10% or 10,000 VND
    
    -- Limits
    max_uses INTEGER, -- null = unlimited
    max_uses_per_user INTEGER DEFAULT 1,
    min_order_amount DECIMAL(10, 2), -- Minimum order to use coupon
    
    -- Valid period
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Usage tracking
    times_used INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. SUBSCRIPTIONS TABLE (Gói đăng ký của user)
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    
    -- Plan snapshot
    plan_name TEXT NOT NULL,
    billing_cycle TEXT NOT NULL,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
        'active',       -- Đang hoạt động
        'expired',      -- Hết hạn
        'cancelled',    -- Đã hủy
        'suspended'     -- Tạm ngưng
    )),
    
    -- Dates
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    cancelled_date TIMESTAMP WITH TIME ZONE,
    
    -- Auto-renewal
    auto_renew BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, status) -- User can only have one active subscription
);

-- ============================================
-- INDEXES for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date DESC);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- PLANS: Everyone can read active plans
CREATE POLICY "Plans are viewable by everyone" ON plans
    FOR SELECT USING (is_active = true);

-- PLANS: Only admins can modify
CREATE POLICY "Only admins can modify plans" ON plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- ORDERS: Users can view their own orders
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (user_id = auth.uid());

-- ORDERS: Users can create orders
CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ORDERS: Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- ORDERS: Admins can update orders
CREATE POLICY "Admins can update orders" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- PAYMENTS: Similar policies for payments
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create payments" ON payments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can update payments" ON payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- PAYMENT_METHODS: Everyone can read enabled methods
CREATE POLICY "Payment methods are viewable by everyone" ON payment_methods
    FOR SELECT USING (is_enabled = true);

-- PAYMENT_METHODS: Only admins can modify
CREATE POLICY "Only admins can modify payment methods" ON payment_methods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- SUBSCRIPTIONS: Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (user_id = auth.uid());

-- SUBSCRIPTIONS: Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO counter FROM orders 
    WHERE order_date >= DATE_TRUNC('month', CURRENT_DATE);
    
    new_number := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || LPAD(counter::TEXT, 4, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate payment number
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO counter FROM payments 
    WHERE payment_date >= DATE_TRUNC('month', CURRENT_DATE);
    
    new_number := 'PAY-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || LPAD(counter::TEXT, 4, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order number
CREATE OR REPLACE FUNCTION auto_generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_order_number();

-- Trigger to auto-generate payment number
CREATE OR REPLACE FUNCTION auto_generate_payment_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_number IS NULL THEN
        NEW.payment_number := generate_payment_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_payment_number
    BEFORE INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_payment_number();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMPLETED! 
-- ============================================
-- Run this script in Supabase SQL Editor
-- All tables, indexes, RLS policies, and functions are now created!
