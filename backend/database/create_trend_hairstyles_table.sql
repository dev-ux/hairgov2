-- Création de la table trend_hairstyles
CREATE TABLE IF NOT EXISTS trend_hairstyles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hairstyle_id UUID NOT NULL REFERENCES hairstyles(id) ON DELETE CASCADE,
    trending_score DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    category VARCHAR(20) NOT NULL DEFAULT 'Mixte' CHECK (category IN ('Homme', 'Femme', 'Mixte', 'Enfant')),
    difficulty VARCHAR(20) NOT NULL DEFAULT 'moyen' CHECK (difficulty IN ('facile', 'moyen', 'difficile')),
    duration_minutes INTEGER,
    price_range VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    added_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hairstyle_id)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_trend_hairstyles_hairstyle ON trend_hairstyles(hairstyle_id);
CREATE INDEX IF NOT EXISTS idx_trend_hairstyles_active ON trend_hairstyles(is_active);
CREATE INDEX IF NOT EXISTS idx_trend_hairstyles_score ON trend_hairstyles(trending_score);

-- Trigger pour updated_at
CREATE TRIGGER update_trend_hairstyles_updated_at 
    BEFORE UPDATE ON trend_hairstyles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
