-- Script de génération de données de test simplifié pour HAIRGO

-- 1. Désactiver temporairement les contraintes de clé étrangère
SET session_replication_role = 'replica';

-- 2. Suppression des données existantes (dans le bon ordre pour éviter les violations de clé étrangère)
TRUNCATE TABLE balance_transactions, complaints, notifications, ratings, bookings, 
            hairdresser_hairstyles, salons, hairdressers, hairstyles, users 
RESTART IDENTITY CASCADE;

-- 3. Réactiver les contraintes de clé étrangère
SET session_replication_role = 'origin';

-- 4. Insertion des utilisateurs (clients, coiffeurs et admin)
-- Mot de passe pour tous les utilisateurs: Test123!
INSERT INTO users (id, email, phone, password_hash, user_type, full_name, profile_photo, is_verified, is_active, created_at, updated_at) VALUES
-- Admin
(gen_random_uuid(), 'admin@hairgo.com', '+33612345678', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Admin HAIRGO', 'https://randomuser.me/api/portraits/men/1.jpg', true, true, NOW(), NOW()),
-- Coiffeurs
(gen_random_uuid(), 'marie.dupont@example.com', '+33612345679', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hairdresser', 'Marie Dupont', 'https://randomuser.me/api/portraits/women/44.jpg', true, true, NOW(), NOW()),
(gen_random_uuid(), 'jean.martin@example.com', '+33612345680', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hairdresser', 'Jean Martin', 'https://randomuser.me/api/portraits/men/32.jpg', true, true, NOW(), NOW()),
(gen_random_uuid(), 'sophie.leroy@example.com', '+33612345681', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hairdresser', 'Sophie Leroy', 'https://randomuser.me/api/portraits/women/63.jpg', true, true, NOW(), NOW()),
-- Clients
(gen_random_uuid(), 'client1@example.com', '+33612345682', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', 'Thomas Durand', 'https://randomuser.me/api/portraits/men/22.jpg', true, true, NOW(), NOW()),
(gen_random_uuid(), 'client2@example.com', '+33612345683', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', 'Julie Lambert', 'https://randomuser.me/api/portraits/women/33.jpg', true, true, NOW(), NOW()),
(gen_random_uuid(), 'client3@example.com', '+33612345684', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', 'Nicolas Petit', 'https://randomuser.me/api/portraits/men/45.jpg', true, true, NOW(), NOW());

-- 5. Insertion des profils coiffeurs
INSERT INTO hairdressers (
    id, user_id, profession, residential_address, date_of_birth, id_card_number,
    registration_status, balance, total_earnings, average_rating, total_jobs, is_available,
    latitude, longitude, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    u.id,
    CASE 
        WHEN u.email = 'marie.dupont@example.com' THEN 'Coiffeuse professionnelle'
        WHEN u.email = 'jean.martin@example.com' THEN 'Barbier expert'
        ELSE 'Coiffeur visagiste'
    END,
    CASE 
        WHEN u.email = 'marie.dupont@example.com' 
            THEN '15 Rue de Rivoli, 75004 Paris, France'
        WHEN u.email = 'jean.martin@example.com' 
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
    NOW(),
    NOW()
FROM users u
WHERE u.user_type = 'hairdresser';

-- 6. Insertion des coiffures
INSERT INTO hairstyles (id, name, description, photo, estimated_duration, category, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'Coupe homme', 'Coupe classique pour homme avec dégradé', 'https://example.com/coupe_homme.jpg', 30, 'homme', true, NOW(), NOW()),
(gen_random_uuid(), 'Coupe femme', 'Coupe au carré moderne', 'https://example.com/coupe_femme.jpg', 45, 'femme', true, NOW(), NOW()),
(gen_random_uuid(), 'Coloration', 'Coloration complète avec mèches', 'https://example.com/coloration.jpg', 120, 'femme', true, NOW(), NOW()),
(gen_random_uuid(), 'Barbe', 'Taille et entretien de la barbe', 'https://example.com/barbe.jpg', 20, 'homme', true, NOW(), NOW()),
(gen_random_uuid(), 'Enfant', 'Coupe spéciale pour enfants', 'https://example.com/enfant.jpg', 25, 'enfant', true, NOW(), NOW()),
(gen_random_uuid(), 'Chignon', 'Coiffure de soirée élégante', 'https://example.com/chignon.jpg', 60, 'femme', true, NOW(), NOW());

-- 7. Association des coiffures aux coiffeurs
INSERT INTO hairdresser_hairstyles (id, hairdresser_id, hairstyle_id, created_at)
SELECT 
    gen_random_uuid(),
    h.id as hairdresser_id,
    hs.id as hairstyle_id,
    NOW()
FROM 
    hairdressers h
CROSS JOIN 
    hairstyles hs
WHERE 
    -- Marie fait tout sauf la barbe
    (h.user_id = (SELECT id FROM users WHERE email = 'marie.dupont@example.com') AND hs.name != 'Barbe')
    -- Jean est spécialisé dans les coupes hommes et barbes
    OR (h.user_id = (SELECT id FROM users WHERE email = 'jean.martin@example.com' AND (hs.category = 'homme' OR hs.name = 'Barbe')))
    -- Sophie fait tout
    OR h.user_id = (SELECT id FROM users WHERE email = 'sophie.leroy@example.com')
    -- Les autres coiffeurs font un échantillon aléatoire
    OR (h.user_id NOT IN (
        SELECT id FROM users WHERE email IN ('marie.dupont@example.com', 'jean.martin@example.com', 'sophie.leroy@example.com')
    ) AND random() < 0.7); -- 70% de chance qu'un coiffeur fasse une coiffure donnée

-- 8. Insertion des réservations
INSERT INTO bookings (
    id, client_id, client_name, client_phone, hairdresser_id, hairstyle_id, 
    service_type, service_fee, client_price, status, location_address, 
    latitude, longitude, estimated_duration, scheduled_time,
    started_at, completed_at, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    c.id as client_id,
    c.full_name as client_name,
    c.phone as client_phone,
    h.id as hairdresser_id,
    hs.id as hairstyle_id,
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
    (20 + random() * 100)::int as estimated_duration,
    -- Création de dates aléatoires dans les 30 derniers jours
    (CURRENT_TIMESTAMP - (random() * 30 || ' days')::interval) as scheduled_time,
    CASE 
        WHEN status = 'completed' OR status = 'in_progress' 
        THEN (scheduled_time + (random() * 2 || ' hours')::interval)
        ELSE NULL 
    END as started_at,
    CASE 
        WHEN status = 'completed' 
        THEN (scheduled_time + (random() * 3 + 1 || ' hours')::interval)
        ELSE NULL 
    END as completed_at,
    NOW(),
    NOW()
FROM 
    (SELECT id, full_name, phone FROM users WHERE user_type = 'client' LIMIT 3) c
CROSS JOIN LATERAL (
    SELECT id FROM hairdressers ORDER BY random() LIMIT 1
) h
CROSS JOIN LATERAL (
    SELECT id FROM hairstyles ORDER BY random() LIMIT 1
) hs,
    generate_series(1, 20); -- Créer 20 réservations

-- 9. Mise à jour des dates d'annulation pour les réservations annulées
UPDATE bookings 
SET cancelled_at = created_at + (random() * 24 || ' hours')::interval,
    cancellation_reason = CASE 
        WHEN random() < 0.3 THEN 'Client a annulé'
        WHEN random() < 0.6 THEN 'Coiffeur indisponible'
        ELSE 'Autre raison'
    END
WHERE status = 'cancelled';

-- 10. Insertion des évaluations
INSERT INTO ratings (
    id, booking_id, hairdresser_id, client_id, rating, comment, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    b.id as booking_id,
    b.hairdresser_id,
    b.client_id,
    (random() * 2 + 3)::int as rating, -- Note entre 3 et 5
    CASE 
        WHEN rating = 5 THEN 'Service exceptionnel, je recommande vivement !'
        WHEN rating = 4 THEN 'Très bon service, professionnel et sympathique.'
        ELSE 'Correct, mais il y a eu quelques petits soucis.'
    END as comment,
    b.completed_at + (random() * 24 || ' hours')::interval as created_at,
    NOW() as updated_at
FROM 
    bookings b
WHERE 
    b.status = 'completed' AND
    random() < 0.8; -- 80% des réservations terminées ont une évaluation

-- 11. Insertion des transactions de solde
INSERT INTO balance_transactions (
    id, hairdresser_id, transaction_type, amount, 
    balance_before, balance_after, booking_id,
    description, status, created_at
)
SELECT 
    gen_random_uuid(),
    h.id as hairdresser_id,
    'recharge' as transaction_type,
    b.service_fee as amount,
    h.balance - b.service_fee as balance_before,
    h.balance as balance_after,
    b.id as booking_id,
    'Paiement pour réservation #' || b.id as description,
    'approved' as status,
    b.completed_at as created_at
FROM 
    hairdressers h
JOIN 
    bookings b ON h.id = b.hairdresser_id
WHERE 
    b.status = 'completed';

-- 12. Insertion des notifications
INSERT INTO notifications (
    id, user_id, title, body, type, data, is_read, sent_at, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
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
    random() < 0.7 as is_read, -- 70% de chance d'être lu
    (CURRENT_TIMESTAMP - (random() * 30 || ' days')::interval) as sent_at,
    NOW(),
    NOW()
FROM 
    users u,
    generate_series(1, 5); -- 5 notifications par utilisateur

-- 13. Insertion des réclamations
INSERT INTO complaints (
    id, user_id, booking_id, subject, description, status, created_at, resolved_at, updated_at
)
SELECT 
    gen_random_uuid(),
    b.client_id as user_id,
    b.id as booking_id,
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
    b.completed_at + (random() * 24 || ' hours')::interval as created_at,
    CASE 
        WHEN status = 'resolved' THEN created_at + (random() * 72 || ' hours')::interval
        ELSE NULL
    END as resolved_at,
    NOW()
FROM 
    bookings b
WHERE 
    b.status = 'completed'
ORDER BY 
    random()
LIMIT 10; -- 10 réclamations au total

-- 14. Mise à jour des réclamations résolues
UPDATE complaints 
SET resolved_by = (SELECT id FROM users WHERE email = 'admin@hairgo.com'),
    resolution_notes = 'Problème résolu après échange avec le client.'
WHERE status = 'resolved';

-- 15. Mise à jour des tokens FCM pour les notifications push
UPDATE users 
SET fcm_token = 'fcm_token_' || substr(md5(random()::text), 1, 20)
WHERE fcm_token IS NULL;

-- Message de confirmation
SELECT 'Données de test insérées avec succès !' as message;
