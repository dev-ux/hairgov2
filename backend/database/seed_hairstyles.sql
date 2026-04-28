-- Script pour ajouter 10 hairstyles avec des photos visibles
-- Exécuter ce script après avoir créé la base de données

INSERT INTO hairstyles (name, description, photo, estimated_duration, category, is_active) VALUES
('Coupe Dégradé Homme', 'Coupe moderne avec dégradé progressif sur les côtés et dos', 'https://images.unsplash.com/photo-1582073213061-1b3d9a5b7b6b?w=400&h=400&fit=crop', 30, 'homme', true),
('Brushing Lissant', 'Brushing professionnel pour cheveux lisses et brillants', 'https://images.unsplash.com/photo-1562322140-8ddde5a8b4d5?w=400&h=400&fit=crop', 45, 'femme', true),
('Coloration Ombré', 'Coloration ombré avec dégradé naturel du foncé au clair', 'https://images.unsplash.com/photo-1560066988-1a4b1b6b8b6b?w=400&h=400&fit=crop', 120, 'femme', true),
('Barbe Traditionnelle', 'Taille de barbe traditionnelle au rasoir et ciseaux', 'https://images.unsplash.com/photo-1582073213061-1b3d9a5b7b6b?w=400&h=400&fit=crop', 25, 'homme', true),
('Chignon Classique', 'Chignon élégant pour occasions spéciales', 'https://images.unsplash.com/photo-1562322140-8ddde5a8b4d5?w=400&h=400&fit=crop', 60, 'femme', true),
('Coupe Enfant Mixte', 'Coupe simple et rapide pour enfants', 'https://images.unsplash.com/photo-1582073213061-1b3d9a5b7b6b?w=400&h=400&fit=crop', 20, 'enfant', true),
('Mèches Balayage', 'Mèches balayage pour effet naturel et ensoleillé', 'https://images.unsplash.com/photo-1560066988-1a4b1b6b8b6b?w=400&h=400&fit=crop', 90, 'femme', true),
('Coupe Court Homme', 'Coupe courte et stylée pour homme moderne', 'https://images.unsplash.com/photo-1582073213061-1b3d9a5b7b6b?w=400&h=400&fit=crop', 25, 'homme', true),
('Soin Capillaire Profond', 'Soin nourrissant et réparateur en profondeur', 'https://images.unsplash.com/photo-1562322140-8ddde5a8b4d5?w=400&h=400&fit=crop', 40, 'femme', true),
('Tresse Africaine', 'Tresse africaine traditionnelle et moderne', 'https://images.unsplash.com/photo-1560066988-1a4b1b6b8b6b?w=400&h=400&fit=crop', 180, 'femme', true);

-- Association des nouvelles coiffures à tous les coiffeurs actifs
INSERT INTO hairdresser_hairstyles (hairdresser_id, hairstyle_id)
SELECT 
    h.id as hairdresser_id,
    hs.id as hairstyle_id
FROM 
    hairdressers h
CROSS JOIN 
    hairstyles hs
WHERE 
    h.registration_status = 'approved'
    AND hs.name IN (
        'Coupe Dégradé Homme', 'Brushing Lissant', 'Coloration Ombré', 
        'Barbe Traditionnelle', 'Chignon Classique', 'Coupe Enfant Mixte',
        'Mèches Balayage', 'Coupe Court Homme', 'Soin Capillaire Profond', 'Tresse Africaine'
    )
    AND random() < 0.8; -- 80% de chance qu'un coiffeur propose chaque nouvelle coiffure

-- Afficher un résumé des ajouts
SELECT 
    'Hairstyles ajoutés' as action,
    COUNT(*) as count
FROM hairstyles 
WHERE name IN (
    'Coupe Dégradé Homme', 'Brushing Lissant', 'Coloration Ombré', 
    'Barbe Traditionnelle', 'Chignon Classique', 'Coupe Enfant Mixte',
    'Mèches Balayage', 'Coupe Court Homme', 'Soin Capillaire Profond', 'Tresse Africaine'
);

SELECT 
    'Associations coiffeur-hairstyle créées' as action,
    COUNT(*) as count
FROM hairdresser_hairstyles hh
JOIN hairstyles h ON hh.hairstyle_id = h.id
WHERE h.name IN (
    'Coupe Dégradé Homme', 'Brushing Lissant', 'Coloration Ombré', 
    'Barbe Traditionnelle', 'Chignon Classique', 'Coupe Enfant Mixte',
    'Mèches Balayage', 'Coupe Court Homme', 'Soin Capillaire Profond', 'Tresse Africaine'
);
