// server.js - Point d'entrée principal
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import des routes
const authRoutes = require('./routes/auth.routes');
const hairdresserRoutes = require('./routes/hairdresser.routes');
const bookingRoutes = require('./routes/booking.routes');
const adminRoutes = require('./routes/admin.routes');
const clientRoutes = require('./routes/client.routes');
const hairstyleRoutes = require('./routes/hairstyle.routes');
const salonRoutes = require('./routes/salon.routes');
const notificationRoutes = require('./routes/notification.routes');
const uploadRoutes = require('./routes/upload.routes');
const debugRoutes = process.env.NODE_ENV !== 'production' ? require('./routes/debug.routes') : null;
const trendingHairstylesRoutes = require('./routes/trending-hairstyles.routes');
const specialOffersRoutes = require('./routes/special-offers.routes');
const specialistsRoutes = require('./routes/specialists.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const historyRoutes = require('./routes/history.routes');

// Import middleware d'erreur
const errorHandler = require('./middleware/errorHandler');

// Importer les modèles pour les créer automatiquement
const { sequelize } = require('./models');

// Vérifier les variables d'environnement essentielles
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET manquant! Ajoutez cette variable dans Render Environment');
  process.exit(1);
}

if (!process.env.JWT_REFRESH_SECRET) {
  console.error('❌ JWT_REFRESH_SECRET manquant! Ajoutez cette variable dans Render Environment');
  process.exit(1);
}

// Initialiser la base de données au démarrage
sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Base de données synchronisée');
}).catch(err => {
  console.error('❌ Erreur de synchronisation DB:', err);
});

const app = express();

// Trust proxy pour Render
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

// Configuration CORS
const allowedOrigins = [
  'http://localhost:3000', // Panel admin
  'http://localhost:3001', // Backend (si nécessaire)
  'http://localhost:3002', // Frontend développement
  'https://hairgov2.onrender.com', // Backend production
  'https://scizzwebsite.vercel.app', // Frontend Vercel production ⭐
  'exp://192.168.0.29:8081', // Expo Go local
  'exp://192.168.0.29:19006', // Expo Go local
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
];

// Configuration CORS pour les fichiers statiques
const staticCors = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS pour les API
app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origine (comme les applications mobiles ou Postman)
    if (!origin) return callback(null, true);
    
    // Vérifier si l'origine est dans la liste blanche
    if (allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || 
      origin.startsWith(allowedOrigin.replace('http', 'https'))
    )) {
      return callback(null, true);
    }
    
    console.log('Tentative de connexion non autorisée depuis l\'origine:', origin);
    return callback(new Error(`Cette origine n'est pas autorisée par CORS: ${origin}`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Gestion des requêtes OPTIONS (pré-vol)
app.options('*', cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuration des dossiers d'uploads
const uploadsDir = path.join(__dirname, '../public/uploads');
const hairstylesDir = path.join(uploadsDir, 'hairstyles');
require('fs').mkdirSync(hairstylesDir, { recursive: true });

console.log('Dossier des uploads:', uploadsDir);
console.log('Dossier des coiffures:', hairstylesDir);

// Configuration pour servir les fichiers statiques avec les bons headers
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), {
  setHeaders: (res, path) => {
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cache-Control', 'public, max-age=3600');
  }
}));

// Route racine (AVANT rate limit)
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'HAIRGO API - Service de coiffure à domicile',
    version: '1.0.0',
    url: 'https://hairgov2.onrender.com',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      auth: '/api/v1/auth',
      hairdressers: '/api/v1/hairdressers',
      clients: '/api/v1/clients',
      bookings: '/api/v1/bookings',
      hairstyles: '/api/v1/hairstyles',
      salons: '/api/v1/salons'
    }
  });
});

// Endpoint temporaire pour créer les tables de favoris séparées (à supprimer après utilisation)
app.get('/api/v1/create-separate-favorites-tables', async (req, res) => {
  try {
    console.log('🚀 Création des tables de favoris séparées...');
    
    // Créer la table favorites_hairdresser
    await require('./models').sequelize.query(`
      CREATE TABLE IF NOT EXISTS favorites_hairdresser (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        hairdresser_id UUID NOT NULL REFERENCES hairdressers(id) ON DELETE CASCADE,
        is_favorite BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(client_id, hairdresser_id)
      )
    `);
    
    console.log('✅ Table favorites_hairdresser créée');
    
    // Créer la table favorites_salon
    await require('./models').sequelize.query(`
      CREATE TABLE IF NOT EXISTS favorites_salon (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
        is_favorite BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(client_id, salon_id)
      )
    `);
    
    console.log('✅ Table favorites_salon créée');
    
    // Créer la table favorites_hairstyle
    await require('./models').sequelize.query(`
      CREATE TABLE IF NOT EXISTS favorites_hairstyle (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        hairstyle_id UUID NOT NULL REFERENCES hairstyles(id) ON DELETE CASCADE,
        is_favorite BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(client_id, hairstyle_id)
      )
    `);
    
    console.log('✅ Table favorites_hairstyle créée');
    
    res.status(200).json({
      success: true,
      message: 'Tables de favoris séparées créées avec succès!'
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création des tables de favoris',
      details: error.message
    });
  }
});

// Endpoint temporaire pour mettre à jour la table favorites (à supprimer après utilisation)
app.get('/api/v1/update-favorites-table', async (req, res) => {
  try {
    console.log('🚀 Mise à jour de la table favorites pour supporter les salons...');
    
    // Ajouter les colonnes une par une
    try {
      await require('./models').sequelize.query(`ALTER TABLE favorites ADD COLUMN IF NOT EXISTS salon_id UUID`);
      console.log('✅ Colonne salon_id ajoutée');
    } catch (err) {
      console.log('ℹ️ Colonne salon_id existe déjà ou erreur:', err.message);
    }
    
    try {
      await require('./models').sequelize.query(`ALTER TABLE favorites ADD COLUMN IF NOT EXISTS hairstyle_id UUID`);
      console.log('✅ Colonne hairstyle_id ajoutée');
    } catch (err) {
      console.log('ℹ️ Colonne hairstyle_id existe déjà ou erreur:', err.message);
    }
    
    try {
      await require('./models').sequelize.query(`ALTER TABLE favorites ADD COLUMN IF NOT EXISTS favorite_type VARCHAR(20) NOT NULL DEFAULT 'hairdresser'`);
      console.log('✅ Colonne favorite_type ajoutée');
    } catch (err) {
      console.log('ℹ️ Colonne favorite_type existe déjà ou erreur:', err.message);
    }
    
    // Mettre à jour les enregistrements existants - ignorer les erreurs pour les enregistrements qui n'ont pas la colonne favorite_type
    try {
      await require('./models').sequelize.query(`
        UPDATE favorites 
        SET favorite_type = 'hairdresser' 
        WHERE favorite_type IS NULL OR favorite_type = ''
      `);
      console.log('✅ Enregistrements existants mis à jour');
    } catch (err) {
      console.log('ℹ️ Erreur lors de la mise à jour des enregistrements (probablement déjà à jour):', err.message);
    }
    
    // Rendre hairdresser_id nullable
    try {
      await require('./models').sequelize.query(`ALTER TABLE favorites ALTER COLUMN hairdresser_id DROP NOT NULL`);
      console.log('✅ hairdresser_id rendu nullable');
    } catch (err) {
      console.log('ℹ️ hairdresser_id déjà nullable ou erreur:', err.message);
    }
    
    res.status(200).json({
      success: true,
      message: 'Table favorites mise à jour avec succès pour supporter les salons!'
    });
    
  } catch (error) {
    console.error('❌ Erreur détaillée lors de la mise à jour:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de la table favorites',
      details: error.message
    });
  }
});

// Health check (AVANT rate limit)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'HAIRGO API'
  });
});

// Rate limiting (après routes racine)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite de requêtes
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Routes API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hairdressers', hairdresserRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/hairstyles', hairstyleRoutes);
app.use('/api/v1/salons', salonRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/upload', uploadRoutes);
if (debugRoutes) app.use('/api/v1/debug', debugRoutes);
app.use('/api/v1/trending-hairstyles', trendingHairstylesRoutes);
app.use('/api/v1/special-offers', specialOffersRoutes);
app.use('/api/v1/specialists', specialistsRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/history', historyRoutes);

// Endpoint de seed pour les hairstyles et tendances (appeler une fois sur le serveur)
app.get('/api/v1/seed-hairstyles', async (req, res) => {
  try {
    const { Hairstyle, TrendHairstyle } = require('./models');

    const hairstyleData = [
      { name: 'Coupe Femme',        description: 'Coupe tendance avec brushing soigné, adaptée à votre morphologie. Shampooing, coupe personnalisée et coiffage inclus.',                                      photo: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80&fit=crop', estimated_duration: 60,  category: 'Femme',   is_active: true },
      { name: 'Coupe Homme',        description: 'Coupe classique pour hommes, finition au rasoir et contours nets. Style professionnel ou décontracté selon vos préférences.',                                photo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80&fit=crop', estimated_duration: 30,  category: 'Homme',   is_active: true },
      { name: 'Coloration',         description: 'Coloration complète avec soin protecteur. Choix de couleurs tendance avec des produits professionnels respectueux de vos cheveux.',                          photo: 'https://images.unsplash.com/photo-1522337360350-c45f7e7efa0c?w=800&q=80&fit=crop', estimated_duration: 90,  category: 'Femme',   is_active: true },
      { name: 'Mèches',             description: 'Balayage et mèches naturelles pour un effet soleil. Technique douce pour illuminer votre chevelure sans agression.',                                        photo: 'https://images.unsplash.com/photo-1522338242578-b4e75d61b94d?w=800&q=80&fit=crop', estimated_duration: 120, category: 'Femme',   is_active: true },
      { name: 'Brushing',           description: 'Brushing professionnel pour cheveux longs, lissés et brillants. Séchage soigné avec produits coiffants de qualité.',                                       photo: 'https://images.unsplash.com/photo-1560869513-b8f91ec05e8b?w=800&q=80&fit=crop', estimated_duration: 45,  category: 'Femme',   is_active: true },
      { name: 'Coupe Enfant',       description: 'Coupe adaptée aux enfants dans une ambiance ludique et rassurante. Patience et douceur garanties pour les plus petits.',                                    photo: 'https://images.unsplash.com/photo-1587909209111-5097be67167a?w=800&q=80&fit=crop', estimated_duration: 25,  category: 'Enfant',  is_active: true },
      { name: 'Barbe',              description: 'Taille précise et entretien de la barbe au rasoir chaud. Modelage selon vos envies pour un look soigné et stylé.',                                         photo: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80&fit=crop', estimated_duration: 30,  category: 'Homme',   is_active: true },
      { name: 'Soin',               description: 'Soin profond kératine ou protéines pour cheveux abîmés et secs. Masque restructurant, brillance et douceur retrouvées.',                                   photo: 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=800&q=80&fit=crop', estimated_duration: 40,  category: 'Mixte',   is_active: true },
      { name: 'Tresses africaines', description: 'Tresses traditionnelles africaines, protectrices et élégantes. Style cornrows, tresses plaquées ou classiques selon votre choix.',                        photo: 'https://images.unsplash.com/photo-1590285185520-b06a9c568c4f?w=800&q=80&fit=crop', estimated_duration: 120, category: 'Femme',   is_active: true },
      { name: 'Dégradé américain',  description: 'Dégradé (fade) impeccable avec contours nets au rasoir. Finition parfaite du fondu bas, moyen ou haut selon votre style.',                                photo: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80&fit=crop', estimated_duration: 45,  category: 'Homme',   is_active: true },
      { name: 'Twist / Torsades',   description: 'Torsades protectrices pour sublimer vos cheveux naturels. Style tendance qui protège vos pointes et définit vos boucles.',                                photo: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800&q=80&fit=crop', estimated_duration: 90,  category: 'Femme',   is_active: true },
      { name: 'Afro naturel',       description: 'Mise en valeur de votre afro naturel avec des soins adaptés. Coiffage, définition des boucles et volume maîtrisé.',                                       photo: 'https://images.unsplash.com/photo-1522337880898-5855f7bf66df?w=800&q=80&fit=crop', estimated_duration: 60,  category: 'Mixte',   is_active: true },
      { name: 'Lissage brésilien',  description: 'Lissage semi-permanent pour des cheveux lisses et brillants pendant plusieurs mois. Formule enrichie en kératine brésilienne.',                            photo: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&q=80&fit=crop', estimated_duration: 180, category: 'Femme',   is_active: true },
      { name: 'Ondulations',        description: 'Ondulations naturelles ou permanentes pour apporter du volume et du mouvement à vos cheveux. Look glamour et féminin.',                                    photo: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&fit=crop', estimated_duration: 75,  category: 'Femme',   is_active: true },
      { name: 'Locks / Dreadlocks', description: 'Pose et entretien de locks pour un style authentique et fort. Technique soignée pour des locks bien définies et durables.',                                photo: 'https://images.unsplash.com/photo-1624561172888-ac93c696ece2?w=800&q=80&fit=crop', estimated_duration: 150, category: 'Mixte',   is_active: true },
    ];

    const trendMeta = {
      'Coupe Femme':        { score: 4.8, difficulty: 'moyen',     duration: 60,  price: '5000-15000 FCFA' },
      'Tresses africaines': { score: 4.7, difficulty: 'difficile', duration: 120, price: '8000-25000 FCFA' },
      'Dégradé américain':  { score: 4.6, difficulty: 'moyen',     duration: 45,  price: '3000-6000 FCFA' },
      'Coupe Homme':        { score: 4.5, difficulty: 'facile',     duration: 30,  price: '2000-5000 FCFA' },
      'Twist / Torsades':   { score: 4.4, difficulty: 'moyen',     duration: 90,  price: '5000-12000 FCFA' },
      'Afro naturel':       { score: 4.3, difficulty: 'facile',     duration: 60,  price: '3000-7000 FCFA' },
      'Coloration':         { score: 4.2, difficulty: 'moyen',     duration: 90,  price: '5000-15000 FCFA' },
      'Lissage brésilien':  { score: 4.1, difficulty: 'difficile', duration: 180, price: '15000-40000 FCFA' },
      'Mèches':             { score: 3.9, difficulty: 'moyen',     duration: 120, price: '5000-15000 FCFA' },
      'Ondulations':        { score: 3.8, difficulty: 'moyen',     duration: 75,  price: '4000-9000 FCFA' },
      'Brushing':           { score: 3.7, difficulty: 'moyen',     duration: 45,  price: '5000-15000 FCFA' },
      'Locks / Dreadlocks': { score: 3.6, difficulty: 'difficile', duration: 150, price: '10000-30000 FCFA' },
      'Coupe Enfant':       { score: 3.5, difficulty: 'facile',     duration: 25,  price: '1500-3000 FCFA' },
      'Barbe':              { score: 3.2, difficulty: 'facile',     duration: 30,  price: '2000-5000 FCFA' },
      'Soin':               { score: 3.0, difficulty: 'moyen',     duration: 40,  price: '3000-8000 FCFA' },
    };

    // Supprimer les anciennes tendances et hairstyles
    await TrendHairstyle.destroy({ where: {} });
    await Hairstyle.destroy({ where: {} });

    // Créer les hairstyles
    const created = await Hairstyle.bulkCreate(hairstyleData);
    console.log(`✅ ${created.length} hairstyles créés`);

    // Créer les tendances
    const trends = created.map(h => {
      const meta = trendMeta[h.name] || { score: 3.0, difficulty: 'moyen', duration: h.estimated_duration, price: '3000-8000 FCFA' };
      return {
        hairstyle_id:     h.id,
        trending_score:   meta.score,
        category:         h.category,
        difficulty:       meta.difficulty,
        duration_minutes: meta.duration,
        price_range:      meta.price,
        is_active:        true,
        start_date:       new Date(),
      };
    });

    const createdTrends = await TrendHairstyle.bulkCreate(trends);
    console.log(`✅ ${createdTrends.length} tendances créées`);

    res.status(200).json({
      success: true,
      message: `${created.length} hairstyles et ${createdTrends.length} tendances créés avec succès`
    });
  } catch (error) {
    console.error('❌ Seed error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 404 handler - doit être à la fin après toutes les routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.path 
  });
});

// Error handling middleware - doit être tout à la fin
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 HAIRGO API démarrée sur le port ${PORT}`);
  console.log(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;// Force deployment - Tue Feb 10 03:46:36 CET 2026
