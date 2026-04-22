-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    subscription_tier TEXT CHECK (subscription_tier IN ('free', 'pro')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create readings table
CREATE TABLE readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    birth_date DATE NOT NULL,
    birth_time TIME NOT NULL,
    birth_place TEXT NOT NULL,
    gender TEXT NOT NULL,
    chart_type TEXT CHECK (chart_type IN ('bazi', 'ziwei', 'western')),
    input_data JSONB,
    output_report JSONB,
    ai_model TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL,
    status TEXT NOT NULL,
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create feedback table
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reading_id UUID REFERENCES readings(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);