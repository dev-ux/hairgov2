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
const debugRoutes = require('./routes/debug.routes');
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
app.use('/api/v1/debug', debugRoutes);
app.use('/api/v1/trending-hairstyles', trendingHairstylesRoutes);
app.use('/api/v1/special-offers', specialOffersRoutes);
app.use('/api/v1/specialists', specialistsRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/history', historyRoutes);

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
  
  // Démarrer les jobs d'archivage automatique
  if (process.env.NODE_ENV === 'production') {
    const ArchiveJob = require('./jobs/archive.job');
    ArchiveJob.startProduction();
    ArchiveJob.startCleanupJob();
  } else {
    // En développement, archiver toutes les heures pour les tests
    const ArchiveJob = require('./jobs/archive.job');
    ArchiveJob.start();
  }
});

module.exports = app;// Force deployment - Tue Feb 10 03:46:36 CET 2026
