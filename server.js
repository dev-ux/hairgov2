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

// Import middleware d'erreur
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite de requêtes
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging
app.use(morgan('combined'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'HAIRGO API'
  });
});

// Routes API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hairdressers', hairdresserRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/hairstyles', hairstyleRoutes);
app.use('/api/v1/salons', salonRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.path 
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 HAIRGO API démarrée sur le port ${PORT}`);
  console.log(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;