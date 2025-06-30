-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'medium',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price alerts table
CREATE TABLE price_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    campsite_id UUID REFERENCES campsites(id) ON DELETE CASCADE,
    target_price DECIMAL(10,2) NOT NULL,
    equipment_type equipment_type NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Availability alerts table
CREATE TABLE availability_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    campsite_id UUID REFERENCES campsites(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    equipment_type equipment_type NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_price_alerts_user_active ON price_alerts(user_id, active);
CREATE INDEX idx_availability_alerts_user_active ON availability_alerts(user_id, active);

-- Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_alerts ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY notifications_policy ON notifications
    FOR ALL USING (auth.uid() = user_id);

-- Price alerts policies
CREATE POLICY price_alerts_policy ON price_alerts
    FOR ALL USING (auth.uid() = user_id);

-- Availability alerts policies
CREATE POLICY availability_alerts_policy ON availability_alerts
    FOR ALL USING (auth.uid() = user_id);