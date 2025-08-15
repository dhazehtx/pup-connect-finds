-- Provider Onboarding Migration
-- Created: 2025-08-14

-- Providers table
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    legal_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    photo_url TEXT,
    service_types TEXT[] DEFAULT '{}',
    radius_km INTEGER DEFAULT 10,
    status TEXT CHECK (status IN ('pending', 'verified', 'pro', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider verifications table
CREATE TABLE provider_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    vendor TEXT DEFAULT 'internal',
    id_status TEXT CHECK (id_status IN ('pending', 'passed', 'failed')) DEFAULT 'pending',
    liveness_passed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider background checks table
CREATE TABLE provider_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    check_status TEXT CHECK (check_status IN ('pending', 'passed', 'failed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider payouts table
CREATE TABLE provider_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    stripe_account_id TEXT UNIQUE,
    account_type TEXT CHECK (account_type IN ('individual', 'business')) DEFAULT 'individual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_providers_status ON providers(status);
CREATE INDEX idx_providers_created_at ON providers(created_at);

CREATE INDEX idx_provider_verifications_provider_id ON provider_verifications(provider_id);
CREATE INDEX idx_provider_verifications_created_at ON provider_verifications(created_at);

CREATE INDEX idx_provider_checks_provider_id ON provider_checks(provider_id);
CREATE INDEX idx_provider_checks_created_at ON provider_checks(created_at);

CREATE INDEX idx_provider_payouts_provider_id ON provider_payouts(provider_id);
CREATE INDEX idx_provider_payouts_stripe_account_id ON provider_payouts(stripe_account_id);
CREATE INDEX idx_provider_payouts_created_at ON provider_payouts(created_at);

-- Update trigger for providers table
CREATE OR REPLACE FUNCTION update_providers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_providers_updated_at_trigger
    BEFORE UPDATE ON providers
    FOR EACH ROW
    EXECUTE FUNCTION update_providers_updated_at();

-- Update trigger for provider_verifications table
CREATE TRIGGER update_provider_verifications_updated_at_trigger
    BEFORE UPDATE ON provider_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_providers_updated_at();

-- Update trigger for provider_checks table
CREATE TRIGGER update_provider_checks_updated_at_trigger
    BEFORE UPDATE ON provider_checks
    FOR EACH ROW
    EXECUTE FUNCTION update_providers_updated_at();

-- Update trigger for provider_payouts table
CREATE TRIGGER update_provider_payouts_updated_at_trigger
    BEFORE UPDATE ON provider_payouts
    FOR EACH ROW
    EXECUTE FUNCTION update_providers_updated_at();