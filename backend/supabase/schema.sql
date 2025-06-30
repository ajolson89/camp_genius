-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE equipment_type AS ENUM ('tent', 'rv', 'cabin', 'glamping');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE trip_status AS ENUM ('upcoming', 'completed', 'cancelled');
CREATE TYPE campsite_source AS ENUM ('recreation_gov', 'private', 'unique_stay');

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    preferences JSONB DEFAULT '{"equipmentType": "tent", "campingStyle": [], "favoriteActivities": [], "dietaryRestrictions": [], "budgetRange": {"min": 0, "max": 500}}',
    saved_campsites UUID[] DEFAULT ARRAY[]::UUID[],
    accessibility_needs JSONB DEFAULT '{"mobility": false, "visual": false, "hearing": false, "cognitive": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pets table
CREATE TABLE pets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    breed VARCHAR(255),
    size VARCHAR(50) NOT NULL,
    special_needs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campsites table
CREATE TABLE campsites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location JSONB NOT NULL,
    coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    pricing JSONB NOT NULL,
    amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
    accessibility JSONB NOT NULL,
    policies JSONB NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    source campsite_source NOT NULL,
    external_id VARCHAR(255),
    vector_embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for campsites
CREATE INDEX idx_campsites_coordinates ON campsites USING GIST (coordinates);
CREATE INDEX idx_campsites_source ON campsites(source);
CREATE INDEX idx_campsites_vector ON campsites USING ivfflat (vector_embedding vector_cosine_ops);

-- Availability table
CREATE TABLE availability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campsite_id UUID REFERENCES campsites(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    tent BOOLEAN DEFAULT true,
    rv BOOLEAN DEFAULT true,
    cabin BOOLEAN DEFAULT false,
    glamping BOOLEAN DEFAULT false,
    UNIQUE(campsite_id, date)
);

-- Bookings table
CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    campsite_id UUID REFERENCES campsites(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INTEGER NOT NULL,
    equipment_type equipment_type NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status booking_status DEFAULT 'pending',
    contact_info JSONB NOT NULL,
    special_requests TEXT,
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trips table
CREATE TABLE trips (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    campsites UUID[] DEFAULT ARRAY[]::UUID[],
    status trip_status DEFAULT 'upcoming',
    total_distance DECIMAL(10,2),
    estimated_driving_time INTEGER,
    route_polyline TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    campsite_id UUID REFERENCES campsites(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(booking_id)
);

-- Chat messages table
CREATE TABLE chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    suggested_actions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI recommendations table
CREATE TABLE ai_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    campsite_id UUID REFERENCES campsites(id) ON DELETE CASCADE,
    score DECIMAL(3,2) NOT NULL,
    reasons TEXT[] DEFAULT ARRAY[]::TEXT[],
    match_percentage INTEGER NOT NULL,
    suggested_activities TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campsites_updated_at BEFORE UPDATE ON campsites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update campsite rating
CREATE OR REPLACE FUNCTION update_campsite_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE campsites
    SET rating = (
        SELECT AVG(rating)::DECIMAL(3,2)
        FROM reviews
        WHERE campsite_id = NEW.campsite_id
    ),
    review_count = (
        SELECT COUNT(*)
        FROM reviews
        WHERE campsite_id = NEW.campsite_id
    )
    WHERE id = NEW.campsite_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating campsite rating
CREATE TRIGGER update_campsite_rating_on_review
AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_campsite_rating();

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can only view and update their own profile
CREATE POLICY users_policy ON users
    FOR ALL USING (auth.uid() = id);

-- Users can only manage their own pets
CREATE POLICY pets_policy ON pets
    FOR ALL USING (auth.uid() = user_id);

-- Users can only view their own bookings
CREATE POLICY bookings_policy ON bookings
    FOR ALL USING (auth.uid() = user_id);

-- Users can only manage their own trips
CREATE POLICY trips_policy ON trips
    FOR ALL USING (auth.uid() = user_id);

-- Users can view all reviews but only create/update their own
CREATE POLICY reviews_select_policy ON reviews
    FOR SELECT USING (true);

CREATE POLICY reviews_insert_policy ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY reviews_update_policy ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only access their own chat messages
CREATE POLICY chat_messages_policy ON chat_messages
    FOR ALL USING (auth.uid() = user_id);

-- Users can only view their own AI recommendations
CREATE POLICY ai_recommendations_policy ON ai_recommendations
    FOR ALL USING (auth.uid() = user_id);