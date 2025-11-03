-- Script de génération de données de test pour HAIRGO

-- Désactiver temporairement les contraintes de clé étrangère
SET session_replication_role = 'replica';

-- 1. Désactiver temporairement les contraintes de clé étrangère
SET session_replication_role = 'replica';

-- 2. Suppression des données existantes (dans le bon ordre pour éviter les violations de clé étrangère)
TRUNCATE TABLE balance_transactions, complaints, notifications, ratings, bookings, 
            hairdresser_hairstyles, salons, hairdressers, hairstyles, users 
RESTART IDENTITY CASCADE;

-- 2. Réactiver les contraintes de clé étrangère
SET session_replication_role = 'origin';

-- 3. Insertion des utilisateurs (clients, coiffeurs et admin)
-- Mot de passe pour tous les utilisateurs: Test123!
INSERT INTO users (email, phone, password_hash, user_type, full_name, profile_photo, is_verified, is_active) VALUES
-- Admin
('admin@hairgo.com', '+33612345678', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Admin HAIRGO', 'https://randomuser.me/api/portraits/men/1.jpg', true, true),
-- Coiffeurs
('marie.dupont@example.com', '+33612345679', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hairdresser', 'Marie Dupont', 'https://randomuser.me/api/portraits/women/44.jpg', true, true),
('jean.martin@example.com', '+33612345680', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hairdresser', 'Jean Martin', 'https://randomuser.me/api/portraits/men/32.jpg', true, true),
('sophie.leroy@example.com', '+33612345681', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hairdresser', 'Sophie Leroy', 'https://randomuser.me/api/portraits/women/63.jpg', true, true),
-- Clients
('client1@example.com', '+33612345682', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', 'Thomas Durand', 'https://randomuser.me/api/portraits/men/22.jpg', true, true),
('client2@example.com', '+33612345683', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', 'Julie Lambert', 'https://randomuser.me/api/portraits/women/33.jpg', true, true),
('client3@example.com', '+33612345684', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', 'Nicolas Petit', 'https://randomuser.me/api/portraits/men/45.jpg', true, true);

-- 4. Insertion des profils coiffeurs
-- Coordonnées autour de Paris (48.8566° N, 2.3522° E)
WITH hairdresser_users AS (
    SELECT id FROM users WHERE user_type = 'hairdresser' ORDER BY created_at
)
INSERT INTO hairdressers (
    user_id, profession, residential_address, date_of_birth, id_card_number, 
    registration_status, balance, total_earnings, average_rating, total_jobs, is_available,
    latitude, longitude, location
) 
SELECT 
    id,
    CASE 
        WHEN id = (SELECT id FROM users WHERE email = 'marie.dupont@example.com') THEN 'Coiffeuse professionnelle'
        WHEN id = (SELECT id FROM users WHERE email = 'jean.martin@example.com') THEN 'Barbier expert'
        ELSE 'Coiffeur visagiste'
    END,
    CASE 
        WHEN id = (SELECT id FROM users WHERE email = 'marie.dupont@example.com') 
            THEN '15 Rue de Rivoli, 75004 Paris, France'
        WHEN id = (SELECT id FROM users WHERE email = 'jean.martin@example.com') 
            THEN '22 Avenue des Champs-Élysées, 75008 Paris, France'
        ELSE '5 Rue de la Paix, 75002 Paris, France'
    END,
    (CURRENT_DATE - INTERVAL '25 years' - (random() * 365 * 20 || ' days')::interval)::date,
    'ID' || LPAD(FLOOR(random() * 1000000)::text, 6, '0'),
    'approved',
    ROUND((random() * 1000)::numeric, 2),
    ROUND((random() * 5000)::numeric, 2),
    ROUND((3 + random() * 2)::numeric, 2), -- Note entre 3 et 5
    FLOOR(random() * 100)::int,
    (random() > 0.3), -- 70% de chance d'être disponible
    -- Coordonnées aléatoires autour de Paris (±0.1 degré)
    48.8566 + (random() * 0.2 - 0.1),
    2.3522 + (random() * 0.2 - 0.1),
    -- Pas de géométrie PostGIS, utilisation des colonnes latitude/longitude
FROM hairdresser_users;

-- Pas de mise à jour de la colonne location (PostGIS non utilisé)

-- 5. Insertion des salons
WITH salon_hairdressers AS (
    SELECT id, user_id FROM hairdressers 
    WHERE user_id IN (
        SELECT id FROM users 
        WHERE email IN ('marie.dupont@example.com', 'jean.martin@example.com')
    )
)
INSERT INTO salons (
    hairdresser_id, name, address, latitude, longitude, location, photos, is_validated
)
SELECT 
    id,
    CASE 
        WHEN user_id = (SELECT id FROM users WHERE email = 'marie.dupont@example.com') 
            THEN 'Salon Marie Coiffure'
        ELSE 'Barbier des Champs'
    END,
    residential_address,
    latitude,
    longitude,
    ARRAY[
        'https://example.com/salon1_1.jpg',
        'https://example.com/salon1_2.jpg'
    ],
    true
FROM salon_hairdressers;

-- 6. Insertion des coiffures
INSERT INTO hairstyles (name, description, photo, estimated_duration, category, is_active) VALUES
('Coupe homme', 'Coupe classique pour homme avec dégradé', 'https://example.com/coupe_homme.jpg', 30, 'homme', true),
('Coupe femme', 'Coupe au carré moderne', 'https://example.com/coupe_femme.jpg', 45, 'femme', true),
('Coloration', 'Coloration complète avec mèches', 'https://example.com/coloration.jpg', 120, 'femme', true),
('Barbe', 'Taille et entretien de la barbe', 'https://example.com/barbe.jpg', 20, 'homme', true),
('Enfant', 'Coupe spéciale pour enfants', 'https://example.com/enfant.jpg', 25, 'enfant', true),
('Chignon', 'Coiffure de soirée élégante', 'https://example.com/chignon.jpg', 60, 'femme', true);

-- 7. Association des coiffures aux coiffeurs
WITH hairdresser_hairstyles AS (
    SELECT 
        h.id as hairdresser_id,
        hs.id as hairstyle_id
    FROM 
        hairdressers h
    CROSS JOIN 
        hairstyles hs
    WHERE 
        -- Marie fait tout sauf la barbe
        (h.user_id = (SELECT id FROM users WHERE email = 'marie.dupont@example.com') AND hs.name != 'Barbe')
        -- Jean est spécialisé dans les coupes hommes et barbes
        OR (h.user_id = (SELECT id FROM users WHERE email = 'jean.martin@example.com' AND hs.category = 'homme'))
        -- Sophie fait tout
        OR h.user_id = (SELECT id FROM users WHERE email = 'sophie.leroy@example.com'
        -- Les autres coiffeurs font un échantillon aléatoire
        OR (h.user_id NOT IN (
            SELECT id FROM users WHERE email IN ('marie.dupont@example.com', 'jean.martin@example.com', 'sophie.leroy@example.com')
        ) AND random() < 0.7)) -- 70% de chance qu'un coiffeur fasse une coiffure donnée
)
INSERT INTO hairdresser_hairstyles (hairdresser_id, hairstyle_id)
SELECT hairdresser_id, hairstyle_id 
FROM hairdresser_hairstyles;

-- 8. Insertion des réservations
WITH 
clients AS (SELECT id FROM users WHERE user_type = 'client' ORDER BY created_at),
hairdressers_list AS (SELECT id, user_id FROM hairdressers WHERE registration_status = 'approved'),
hairstyles_list AS (SELECT id FROM hairstyles WHERE is_active = true)
INSERT INTO bookings (
    client_id, client_name, client_phone, hairdresser_id, hairstyle_id, 
    service_type, service_fee, client_price, status, location_address, 
    latitude, longitude, location, estimated_duration, scheduled_time,
    started_at, completed_at, created_at, updated_at
)
SELECT 
    c.id as client_id,
    (SELECT full_name FROM users WHERE id = c.id) as client_name,
    (SELECT phone FROM users WHERE id = c.id) as client_phone,
    h.id as hairdresser_id,
    (SELECT id FROM hairstyles_list ORDER BY random() LIMIT 1) as hairstyle_id,
    CASE WHEN random() > 0.5 THEN 'home' ELSE 'salon' END as service_type,
    ROUND((30 + random() * 100)::numeric, 2) as service_fee,
    ROUND((40 + random() * 120)::numeric, 2) as client_price,
    CASE 
        WHEN random() < 0.7 THEN 'completed'
        WHEN random() < 0.8 THEN 'cancelled'
        WHEN random() < 0.9 THEN 'in_progress'
        ELSE 'pending'
    END as status,
    CASE 
        WHEN random() > 0.5 THEN '15 Rue de la Paix, 75002 Paris, France'
        ELSE '22 Avenue des Champs-Élysées, 75008 Paris, France'
    END as location_address,
    -- Coordonnées aléatoires autour de Paris
    48.85 + (random() * 0.1 - 0.05) as latitude,
    2.35 + (random() * 0.1 - 0.05) as longitude,
    -- Pas de géométrie PostGIS, utilisation des colonnes latitude/longitude
    (20 + random() * 100)::int as estimated_duration,
    -- Création de dates aléatoires dans les 30 derniers jours
    (CURRENT_TIMESTAMP - (random() * 30 || ' days')::interval) as scheduled_time,
    CASE 
        WHEN random() < 0.7 THEN (CURRENT_TIMESTAMP - (random() * 30 || ' days')::interval + (random() * 2 || ' hours')::interval)
        ELSE NULL 
    END as started_at,
    CASE 
        WHEN random() < 0.7 THEN (CURRENT_TIMESTAMP - (random() * 30 || ' days')::interval + (random() * 3 + 1 || ' hours')::interval)
        ELSE NULL 
    END as completed_at,
    (CURRENT_TIMESTAMP - (random() * 30 || ' days')::interval - (random() * 24 || ' hours')::interval) as created_at,
    CURRENT_TIMESTAMP as updated_at
FROM 
    generate_series(1, 50) as i
CROSS JOIN LATERAL (
    SELECT id FROM clients ORDER BY random() LIMIT 1
) c
CROSS JOIN LATERAL (
    SELECT id, user_id FROM hairdressers_list ORDER BY random() LIMIT 1
) h;

-- 9. Mise à jour des dates d'annulation pour les réservations annulées
UPDATE bookings 
SET cancelled_at = created_at + (random() * 24 || ' hours')::interval,
    cancellation_reason = CASE 
        WHEN random() < 0.3 THEN 'Client a annulé'
        WHEN random() < 0.6 THEN 'Coiffeur indisponible'
        ELSE 'Autre raison'
    END
WHERE status = 'cancelled';

-- 10. Insertion des évaluations pour les réservations terminées
WITH completed_bookings AS (
    SELECT 
        b.id as booking_id, 
        b.hairdresser_id, 
        b.client_id,
        b.completed_at
    FROM 
        bookings b
    WHERE 
        b.status = 'completed'
    ORDER BY 
        random()
    LIMIT 
        (SELECT COUNT(*) * 0.8 FROM bookings WHERE status = 'completed')::int -- 80% des réservations terminées ont une évaluation
)
INSERT INTO ratings (
    booking_id, hairdresser_id, client_id, rating, comment, created_at
)
SELECT 
    booking_id,
    hairdresser_id,
    client_id,
    (random() * 2 + 3)::int as rating, -- Note entre 3 et 5
    CASE 
        WHEN rating = 5 THEN 'Service exceptionnel, je recommande vivement !'
        WHEN rating = 4 THEN 'Très bon service, professionnel et sympathique.'
        ELSE 'Correct, mais il y a eu quelques petits soucis.'
    END as comment,
    completed_at + (random() * 24 || ' hours')::interval as created_at
FROM 
    completed_bookings,
    LATERAL (SELECT (random() * 2 + 3)::int as rating) r;

-- 11. Mise à jour des statistiques des coiffeurs basées sur les évaluations
WITH hairdresser_stats AS (
    SELECT 
        h.id as hairdresser_id,
        COUNT(r.id) as rating_count,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(b.id) as total_jobs
    FROM 
        hairdressers h
    LEFT JOIN 
        bookings b ON h.id = b.hairdresser_id
    LEFT JOIN 
        ratings r ON b.id = r.booking_id
    GROUP BY 
        h.id
)
UPDATE hairdressers h
SET 
    average_rating = hs.avg_rating,
    total_jobs = hs.total_jobs
FROM 
    hairdresser_stats hs
WHERE 
    h.id = hs.hairdresser_id;

-- 12. Insertion des transactions de solde
WITH hairdresser_balances AS (
    SELECT 
        h.id as hairdresser_id,
        h.balance as current_balance,
        b.id as booking_id,
        b.client_price as amount,
        b.completed_at as transaction_date
    FROM 
        hairdressers h
    JOIN 
        bookings b ON h.id = b.hairdresser_id
    WHERE 
        b.status = 'completed'
    ORDER BY 
        b.completed_at
)
INSERT INTO balance_transactions (
    hairdresser_id, transaction_type, amount, 
    balance_before, balance_after, booking_id,
    description, status, created_at
)
SELECT 
    hb.hairdresser_id,
    'recharge' as transaction_type,
    hb.amount,
    hb.current_balance - hb.amount as balance_before,
    hb.current_balance as balance_after,
    hb.booking_id,
    'Paiement pour réservation #' || hb.booking_id as description,
    'approved' as status,
    hb.transaction_date as created_at
FROM 
    hairdresser_balances hb
ORDER BY 
    hb.transaction_date;

-- 13. Insertion des notifications
WITH notification_data AS (
    SELECT 
        u.id as user_id,
        CASE 
            WHEN random() < 0.3 THEN 'Réservation confirmée'
            WHEN random() < 0.6 THEN 'Rappel de rendez-vous'
            ELSE 'Nouveau message'
        END as title,
        CASE 
            WHEN title = 'Réservation confirmée' THEN 'Votre réservation a été confirmée pour le ' || 
                 to_char(CURRENT_DATE + (random() * 30)::int * '1 day'::interval, 'DD/MM/YYYY HH24:MI')
            WHEN title = 'Rappel de rendez-vous' THEN 'Vous avez un rendez-vous demain à ' || 
                 to_char(CURRENT_TIME + (random() * 8 + 9 || ' hours')::interval, 'HH24:MI')
            ELSE 'Vous avez reçu un nouveau message dans votre messagerie'
        END as body,
        CASE 
            WHEN title = 'Réservation confirmée' THEN 'booking_confirmed'
            WHEN title = 'Rappel de rendez-vous' THEN 'appointment_reminder'
            ELSE 'new_message'
        END as type,
        CASE 
            WHEN title = 'Réservation confirmée' THEN 
                jsonb_build_object('bookingId', (SELECT id FROM bookings ORDER BY random() LIMIT 1))
            ELSE NULL
        END as data,
        (CURRENT_TIMESTAMP - (random() * 30 || ' days')::interval) as sent_at
    FROM 
        users u,
        generate_series(1, 5) as n  -- 5 notifications par utilisateur
)
INSERT INTO notifications (
    user_id, title, body, type, data, is_read, sent_at
)
SELECT 
    user_id,
    title,
    body,
    type,
    data,
    random() < 0.7 as is_read, -- 70% de chance d'être lu
    sent_at
FROM 
    notification_data;

-- 14. Insertion des réclamations
WITH booking_complaints AS (
    SELECT 
        b.id as booking_id,
        b.client_id,
        b.hairdresser_id,
        b.completed_at
    FROM 
        bookings b
    WHERE 
        b.status = 'completed'
    ORDER BY 
        random()
    LIMIT 10 -- 10 réclamations au total
)
INSERT INTO complaints (
    user_id, booking_id, subject, description, status, created_at, resolved_at
)
SELECT 
    bc.client_id as user_id,
    bc.booking_id,
    CASE 
        WHEN random() < 0.3 THEN 'Retard important'
        WHEN random() < 0.6 THEN 'Prestation non conforme'
        ELSE 'Problème de paiement'
    END as subject,
    CASE 
        WHEN subject = 'Retard important' THEN 'Le coiffeur a eu plus d''une heure de retard sans prévenir.'
        WHEN subject = 'Prestation non conforme' THEN 'La coupe ne correspond pas à ce qui avait été demandé.'
        ELSE 'J''ai été débité deux fois pour la même prestation.'
    END as description,
    CASE 
        WHEN random() < 0.7 THEN 'resolved'
        WHEN random() < 0.9 THEN 'in_progress'
        ELSE 'open'
    END as status,
    bc.completed_at + (random() * 24 || ' hours')::interval as created_at,
    CASE 
        WHEN status = 'resolved' THEN created_at + (random() * 72 || ' hours')::interval
        ELSE NULL
    END as resolved_at
FROM 
    booking_complaints bc;

-- 15. Mise à jour des notes de résolution pour les réclamations résolues
UPDATE complaints 
SET resolved_by = (SELECT id FROM users WHERE email = 'admin@hairgo.com'),
    resolution_notes = 'Problème résolu après échange avec le client.'
WHERE status = 'resolved';

-- 16. Mise à jour des tokens FCM pour les notifications push
UPDATE users 
SET fcm_token = 'fcm_token_' || substr(md5(random()::text), 1, 20)
WHERE fcm_token IS NULL;

-- Message de confirmation
SELECT 'Données de test insérées avec succès !' as message;
