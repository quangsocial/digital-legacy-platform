import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Provide SQL commands for manual execution
    const sqlCommands = [
      `-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`,

      `-- 2. Create recipients table
CREATE TABLE IF NOT EXISTS recipients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    relationship TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`,

      `-- 3. Create legacy_messages table
CREATE TABLE IF NOT EXISTS legacy_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('text', 'image', 'video', 'financial', 'document')),
    message_text TEXT,
    image_url TEXT,
    video_url TEXT,
    financial_info JSONB,
    document_url TEXT,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reminder_days INTEGER DEFAULT 30,
    last_reminder_sent TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'sent', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_private BOOLEAN DEFAULT false,
    requires_confirmation BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`,

      `-- 4. Create message_recipients table
CREATE TABLE IF NOT EXISTS message_recipients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES legacy_messages(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES recipients(id) ON DELETE CASCADE,
    custom_message TEXT,
    delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'bounced')),
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, recipient_id)
);`,

      `-- 5. Create notification_logs table
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message_id UUID REFERENCES legacy_messages(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('reminder', 'confirmation', 'delivery', 'cancellation')),
    sent_to TEXT NOT NULL,
    sent_via TEXT NOT NULL CHECK (sent_via IN ('email', 'sms')),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
    content TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`,

      `-- 6. Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID REFERENCES profiles(id) PRIMARY KEY,
    reminder_frequency INTEGER DEFAULT 30,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    two_factor_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`,

      `-- 7. Create indexes
CREATE INDEX IF NOT EXISTS idx_recipients_user_id ON recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_legacy_messages_user_id ON legacy_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_legacy_messages_scheduled_date ON legacy_messages(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_legacy_messages_status ON legacy_messages(status);
CREATE INDEX IF NOT EXISTS idx_message_recipients_message_id ON message_recipients(message_id);
CREATE INDEX IF NOT EXISTS idx_message_recipients_recipient_id ON message_recipients(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_message_id ON notification_logs(message_id);`,

      `-- 8. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;`,

      `-- 9. Create RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);`,

      `-- 10. Create RLS Policies for recipients
CREATE POLICY "Users can manage own recipients" ON recipients
    FOR ALL USING (auth.uid() = user_id);`,

      `-- 11. Create RLS Policies for legacy_messages
CREATE POLICY "Users can manage own legacy messages" ON legacy_messages
    FOR ALL USING (auth.uid() = user_id);`,

      `-- 12. Create RLS Policies for message_recipients
CREATE POLICY "Users can manage message recipients" ON message_recipients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM legacy_messages 
            WHERE id = message_recipients.message_id 
            AND user_id = auth.uid()
        )
    );`,

      `-- 13. Create RLS Policies for notification_logs
CREATE POLICY "Users can view own notifications" ON notification_logs
    FOR SELECT USING (auth.uid() = user_id);`,

      `-- 14. Create RLS Policies for user_settings
CREATE POLICY "Users can manage own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);`
    ]

    return NextResponse.json({
      message: 'SQL commands ready for manual execution',
      instructions: [
        '1. Đăng nhập vào Supabase Dashboard',
        '2. Vào tab SQL Editor',
        '3. Copy từng command bên dưới và chạy tuần tự',
        '4. Hoặc copy toàn bộ script từ file supabase/schema.sql'
      ],
      sqlCommands,
      totalCommands: sqlCommands.length,
      alternativeMethod: 'Bạn có thể copy toàn bộ nội dung từ file supabase/schema.sql và chạy một lần trong Supabase SQL Editor'
    })

  } catch (error) {
    console.error('Setup preparation error:', error)
    return NextResponse.json({ 
      error: 'Failed to prepare setup commands', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}