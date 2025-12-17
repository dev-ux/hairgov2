-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert a reservation for hairdresser ID: 342b7422-ffe4-42a9-8836-3cbe7c58e36d

-- First, let's get the hairdresser's record from the hairdressers table
-- Then insert a reservation with sample data

INSERT INTO bookings (
    id,
    client_id,
    client_name,
    client_phone,
    hairdresser_id,
    hairstyle_id,
    service_type,
    service_fee,
    client_price,
    status,
    location_address,
    latitude,
    longitude,
    estimated_duration,
    scheduled_time,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',  -- Manual UUID for booking
    NULL,  -- client_id (for non-registered client)
    'Jean Dupont',  -- client_name
    '+2250102030405',  -- client_phone
    '5f5883f6-6745-4787-be6a-d5ee0d108d11',  -- hairdresser_id (from hairdressers table)
    (SELECT id FROM hairstyles LIMIT 1),  -- hairstyle_id (get first available hairstyle)
    'home',  -- service_type
    1500.00,  -- service_fee
    2000.00,  -- client_price
    'pending',  -- status
    'Abidjan, Cocody, Rue des Princes',  -- location_address
    5.3600,  -- latitude (Abidjan)
    -3.9500,  -- longitude (Abidjan)
    45,  -- estimated_duration (minutes)
    NOW() + INTERVAL '1 day',  -- scheduled_time (tomorrow)
    NOW(),  -- created_at
    NOW()   -- updated_at
);
