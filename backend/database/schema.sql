-- database/schema.sql
-- Schéma de base de données PostgreSQL pour HAIRGO

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Pour géolocalisation avancée

-- Table des utilisateurs (clients et coiffeurs)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('client', 'hairdresser', 'admin')),
    full_name VARCHAR(255) NOT NULL,
    profile_photo VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    fcm_token TEXT, -- Pour notifications push
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des coiffeurs (profil détaillé)
CREATE TABLE hairdressers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profession VARCHAR(100),
    residential_address TEXT,
    date_of_birth DATE,
    id_card_number VARCHAR(50),
    id_card_photo VARCHAR(500),
    has_salon BOOLEAN DEFAULT false,
    education_level VARCHAR(50),
    registration_status VARCHAR(20) DEFAULT 'pending' CHECK (registration_status IN ('pending', 'approved', 'rejected')),
    balance DECIMAL(10, 2) DEFAULT 0.00,
    total_earnings DECIMAL(10, 2) DEFAULT 0.00,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_jobs INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT false,
    current_job_id UUID,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location GEOGRAPHY(POINT, 4326), -- PostGIS pour géolocalisation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Table des salons
CREATE TABLE salons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hairdresser_id UUID REFERENCES hairdressers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    photos TEXT[], -- Array de URLs
    is_validated BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des coiffures
CREATE TABLE hairstyles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    photo VARCHAR(500),
    estimated_duration INTEGER NOT NULL, -- en minutes
    category VARCHAR(50), -- homme, femme, enfant
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison coiffeurs-coiffures
CREATE TABLE hairdresser_hairstyles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hairdresser_id UUID NOT NULL REFERENCES hairdressers(id) ON DELETE CASCADE,
    hairstyle_id UUID NOT NULL REFERENCES hairstyles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hairdresser_id, hairstyle_id)
);

-- Table des réservations/jobs
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES users(id) ON DELETE SET NULL,
    client_name VARCHAR(255), -- Pour clients non inscrits
    client_phone VARCHAR(20) NOT NULL,
    hairdresser_id UUID NOT NULL REFERENCES hairdressers(id),
    hairstyle_id UUID NOT NULL REFERENCES hairstyles(id),
    service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('home', 'salon')),
    service_fee DECIMAL(10, 2) NOT NULL,
    client_price DECIMAL(10, 2), -- Prix payé par le client
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled')),
    location_address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    estimated_duration INTEGER, -- minutes
    scheduled_time TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    extension_requested BOOLEAN DEFAULT false,
    extension_minutes INTEGER,
    extension_approved BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des évaluations
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    hairdresser_id UUID NOT NULL REFERENCES hairdressers(id),
    client_id UUID REFERENCES users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(booking_id)
);

-- Table des transactions de solde
CREATE TABLE balance_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hairdresser_id UUID NOT NULL REFERENCES hairdressers(id),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('recharge', 'deduction', 'bonus', 'refund')),
    amount DECIMAL(10, 2) NOT NULL,
    balance_before DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,
    booking_id UUID REFERENCES bookings(id),
    description TEXT,
    approved_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- job_accepted, rating_request, recharge_approved, etc.
    data JSONB, -- Données additionnelles
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des réclamations
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Index pour performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_hairdressers_status ON hairdressers(registration_status);
CREATE INDEX idx_hairdressers_available ON hairdressers(is_available);
CREATE INDEX idx_hairdressers_location ON hairdressers USING GIST(location);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_hairdresser ON bookings(hairdresser_id);
CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_location ON bookings USING GIST(location);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hairdressers_updated_at BEFORE UPDATE ON hairdressers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();