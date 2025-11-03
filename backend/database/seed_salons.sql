-- Script pour ajouter des salons de test supplémentaires à la base de données HAIRGO

-- Désactiver temporairement les contraintes de clé étrangère
SET session_replication_role = 'replica';

-- Ajout de coiffeurs supplémentaires
WITH new_hairdressers AS (
    INSERT INTO users (email, phone, password_hash, user_type, full_name, profile_photo, is_verified, is_active)
    VALUES 
    ('coiffeur1@example.com', '+33612345700', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hairdresser', 'Léa Dubois', 'https://randomuser.me/api/portraits/women/12.jpg', true, true),
    ('coiffeur2@example.com', '+33612345701', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hairdresser', 'Thomas Leroy', 'https://randomuser.me/api/portraits/men/15.jpg', true, true),
    ('coiffeur3@example.com', '+33612345702', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hairdresser', 'Sophie Martin', 'https://randomuser.me/api/portraits/women/25.jpg', true, true)
    RETURNING id, full_name
),
-- Création des profils coiffeurs
hairdresser_profiles AS (
    INSERT INTO hairdressers (
        user_id, profession, residential_address, date_of_birth, id_card_number, 
        registration_status, balance, total_earnings, average_rating, total_jobs, is_available,
        latitude, longitude
    )
    SELECT 
        id,
        CASE 
            WHEN full_name = 'Léa Dubois' THEN 'Coiffeuse coloriste'
            WHEN full_name = 'Thomas Leroy' THEN 'Barbier expert'
            ELSE 'Styliste capillaire'
        END,
        CASE 
            WHEN full_name = 'Léa Dubois' THEN '8 Rue de la Pompe, 75016 Paris'
            WHEN full_name = 'Thomas Leroy' THEN '45 Avenue Montaigne, 75008 Paris'
            ELSE '22 Rue de Rivoli, 75004 Paris'
        END,
        (CURRENT_DATE - INTERVAL '30 years' - (random() * 365 * 15 || ' days')::interval)::date,
        'ID' || LPAD(FLOOR(random() * 1000000)::text, 6, '0'),
        'approved',
        ROUND((random() * 2000)::numeric, 2),
        ROUND((random() * 10000)::numeric, 2),
        ROUND((3.5 + random() * 1.5)::numeric, 2), -- Note entre 3.5 et 5
        FLOOR(random() * 200)::int,
        (random() > 0.3), -- 70% de chance d'être disponible
        -- Coordonnées aléatoires autour de Paris (±0.15 degré)
        48.8566 + (random() * 0.3 - 0.15),
        2.3522 + (random() * 0.3 - 0.15)
    FROM new_hairdressers
    RETURNING id, user_id
)
-- Insertion des salons
INSERT INTO salons (
    hairdresser_id, name, address, latitude, longitude, photos, is_validated
)
SELECT 
    h.id,
    CASE 
        WHEN u.full_name = 'Léa Dubois' THEN 'L''Atelier de Léa'
        WHEN u.full_name = 'Thomas Leroy' THEN 'Le Barbier d''Or'
        ELSE 'Salon Élégance'
    END,
    h.residential_address,
    h.latitude,
    h.longitude,
    ARRAY[
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500',
        'https://images.unsplash.com/photo-1560066984-138328acb9de?w=500'
    ],
    true
FROM hairdresser_profiles h
JOIN users u ON h.user_id = u.id;

-- Ajout de coiffures pour ces coiffeurs
WITH new_hairstyles AS (
    INSERT INTO hairstyles (name, description, photo, estimated_duration, category, is_active)
    VALUES 
    ('Coupe femme', 'Coupe personnalisée pour femme avec brushing', 'https://example.com/coupe-femme.jpg', 60, 'femme', true),
    ('Balayage', 'Balayage professionnel avec soin', 'https://example.com/balayage.jpg', 120, 'femme', true),
    ('Coupe homme', 'Coupe classique pour homme avec finition à la tondeuse', 'https://example.com/coupe-homme.jpg', 30, 'homme', true),
    ('Barbe', 'Taille et entretien de barbe', 'https://example.com/barbe.jpg', 20, 'homme', true),
    ('Brushing', 'Mise en forme et séchage professionnel', 'https://example.com/brushing.jpg', 45, 'femme', true)
    RETURNING id
),
-- Associer les coiffures aux coiffeurs
hairdresser_ids AS (
    SELECT id FROM hairdressers 
    WHERE user_id IN (
        SELECT id FROM users 
        WHERE email IN ('coiffeur1@example.com', 'coiffeur2@example.com', 'coiffeur3@example.com')
    )
)
INSERT INTO hairdresser_hairstyles (hairdresser_id, hairstyle_id)
SELECT 
    h.id,
    s.id
FROM hairdresser_ids h
CROSS JOIN new_hairstyles s
WHERE NOT EXISTS (
    SELECT 1 FROM hairdresser_hairstyles hh 
    WHERE hh.hairdresser_id = h.id 
    AND hh.hairstyle_id = s.id
);

-- Réactiver les contraintes de clé étrangère
SET session_replication_role = 'origin';

-- Afficher un message de confirmation
SELECT 'Données de test pour les salons ajoutées avec succès !' as message;
