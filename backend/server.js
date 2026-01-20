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
  'https://hairgov2.onrender.com', // Backend production
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

// Configuration pour servir les fichiers statiques
app.use('/uploads', (req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// Servir les fichiers statiques depuis le dossier racine /public/uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

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

module.exports = app;