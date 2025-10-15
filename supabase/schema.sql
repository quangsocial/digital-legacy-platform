-- Digital Legacy Platform Database Schema

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipients table
CREATE TABLE IF NOT EXISTS recipients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    relationship TEXT, -- 'spouse', 'child', 'parent', 'friend', 'lawyer', etc.
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Legacy messages table
CREATE TABLE IF NOT EXISTS legacy_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('text', 'image', 'video', 'financial', 'document')),
    
    -- Content fields
    message_text TEXT,
    image_url TEXT,
    video_url TEXT, -- YouTube links
    financial_info JSONB, -- {"type": "bank", "account": "...", "notes": "..."}
    document_url TEXT,
    
    -- Scheduling
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reminder_days INTEGER DEFAULT 30, -- Days before to send reminder
    last_reminder_sent TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'sent', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    
    -- Metadata
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_private BOOLEAN DEFAULT false,
    requires_confirmation BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message recipients junction table (many-to-many)
CREATE TABLE IF NOT EXISTS message_recipients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES legacy_messages(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES recipients(id) ON DELETE CASCADE,
    custom_message TEXT, -- Optional personalized message for this recipient
    delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'bounced')),
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, recipient_id)
);

-- Notification logs
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message_id UUID REFERENCES legacy_messages(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('reminder', 'confirmation', 'delivery', 'cancellation')),
    sent_to TEXT NOT NULL, -- email or phone
    sent_via TEXT NOT NULL CHECK (sent_via IN ('email', 'sms')),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
    content TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID REFERENCES profiles(id) PRIMARY KEY,
    reminder_frequency INTEGER DEFAULT 30, -- Default reminder days
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    two_factor_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipients_user_id ON recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_legacy_messages_user_id ON legacy_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_legacy_messages_scheduled_date ON legacy_messages(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_legacy_messages_status ON legacy_messages(status);
CREATE INDEX IF NOT EXISTS idx_message_recipients_message_id ON message_recipients(message_id);
CREATE INDEX IF NOT EXISTS idx_message_recipients_recipient_id ON message_recipients(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_message_id ON notification_logs(message_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for recipients
CREATE POLICY "Users can manage own recipients" ON recipients
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for legacy_messages
CREATE POLICY "Users can manage own legacy messages" ON legacy_messages
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for message_recipients
CREATE POLICY "Users can manage message recipients" ON message_recipients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM legacy_messages 
            WHERE id = message_recipients.message_id 
            AND user_id = auth.uid()
        )
    );

-- RLS Policies for notification_logs
CREATE POLICY "Users can view own notifications" ON notification_logs
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for user_settings
CREATE POLICY "Users can manage own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

-- Functions for automated tasks

-- Function to get messages that need reminders
CREATE OR REPLACE FUNCTION get_messages_needing_reminders()
RETURNS TABLE (
    message_id UUID,
    user_id UUID,
    title TEXT,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    reminder_days INTEGER,
    user_email TEXT,
    user_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lm.id as message_id,
        lm.user_id,
        lm.title,
        lm.scheduled_date,
        lm.reminder_days,
        p.email as user_email,
        p.full_name as user_name
    FROM legacy_messages lm
    JOIN profiles p ON lm.user_id = p.id
    WHERE lm.status = 'scheduled'
    AND lm.scheduled_date <= NOW() + (lm.reminder_days || ' days')::INTERVAL
    AND (lm.last_reminder_sent IS NULL 
         OR lm.last_reminder_sent <= NOW() - '7 days'::INTERVAL);
END;
$$;

-- Function to get messages ready to send
CREATE OR REPLACE FUNCTION get_messages_ready_to_send()
RETURNS TABLE (
    message_id UUID,
    user_id UUID,
    title TEXT,
    content_type TEXT,
    message_text TEXT,
    image_url TEXT,
    video_url TEXT,
    financial_info JSONB,
    document_url TEXT,
    recipients JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lm.id as message_id,
        lm.user_id,
        lm.title,
        lm.content_type,
        lm.message_text,
        lm.image_url,
        lm.video_url,
        lm.financial_info,
        lm.document_url,
        COALESCE(
            json_agg(
                json_build_object(
                    'id', r.id,
                    'name', r.name,
                    'email', r.email,
                    'custom_message', mr.custom_message
                )
            ) FILTER (WHERE r.id IS NOT NULL),
            '[]'::json
        ) as recipients
    FROM legacy_messages lm
    LEFT JOIN message_recipients mr ON lm.id = mr.message_id
    LEFT JOIN recipients r ON mr.recipient_id = r.id
    WHERE lm.status = 'scheduled'
    AND lm.scheduled_date <= NOW()
    GROUP BY lm.id, lm.user_id, lm.title, lm.content_type, 
             lm.message_text, lm.image_url, lm.video_url, 
             lm.financial_info, lm.document_url;
END;
$$;

-- Function to mark message as sent
CREATE OR REPLACE FUNCTION mark_message_as_sent(message_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE legacy_messages 
    SET status = 'sent', sent_at = NOW(), updated_at = NOW()
    WHERE id = message_uuid;
    
    UPDATE message_recipients 
    SET delivery_status = 'sent', delivered_at = NOW()
    WHERE message_id = message_uuid;
END;
$$;

-- Function to update reminder sent timestamp
CREATE OR REPLACE FUNCTION update_reminder_sent(message_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE legacy_messages 
    SET last_reminder_sent = NOW(), updated_at = NOW()
    WHERE id = message_uuid;
END;
$$;

-- Function to create super admin user
CREATE OR REPLACE FUNCTION create_super_admin(admin_email TEXT, admin_password TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
    result json;
BEGIN
    -- Insert into auth.users (this would normally be done by Supabase Auth)
    -- In practice, you'll need to create the user through Supabase Auth first
    
    -- Insert or update profile with super_admin role
    INSERT INTO profiles (id, email, role, full_name, is_active)
    SELECT 
        auth.uid(),
        admin_email,
        'super_admin',
        'Super Administrator',
        true
    WHERE auth.uid() IS NOT NULL
    ON CONFLICT (id) DO UPDATE SET
        role = 'super_admin',
        is_active = true,
        updated_at = NOW();
    
    -- Create default admin settings
    INSERT INTO user_settings (user_id, email_notifications, sms_notifications)
    SELECT auth.uid(), true, false
    WHERE auth.uid() IS NOT NULL
    ON CONFLICT (user_id) DO NOTHING;
    
    result := json_build_object(
        'success', true,
        'message', 'Super admin profile created/updated',
        'email', admin_email
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM profiles
    WHERE id = user_id;
    
    RETURN user_role IN ('admin', 'super_admin');
END;
$$;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM profiles
    WHERE id = user_id;
    
    RETURN user_role = 'super_admin';
END;
$$;

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipients_updated_at BEFORE UPDATE ON recipients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legacy_messages_updated_at BEFORE UPDATE ON legacy_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();