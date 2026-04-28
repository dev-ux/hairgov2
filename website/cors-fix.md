# Configuration CORS à ajouter dans votre .env
# Ajoutez localhost:3002 aux origines autorisées

ALLOWED_ORIGINS=https://hairgov2.onrender.com,http://localhost:3002,http://localhost:3000

# Ou si vous utilisez une configuration directe dans le serveur :
# Dans server.js ou app.js de votre backend :

const cors = require('cors');

// Option 1: Autoriser localhost en développement
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://hairgov2.onrender.com',
      'http://localhost:3002',
      'http://localhost:3000'
    ];
    
    // Autoriser les requêtes sans origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Cette origine n\'est pas autorisée par CORS: ' + origin));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// Option 2: Plus permissif pour le développement
if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: ['http://localhost:3002', 'http://localhost:3000'],
    credentials: true
  }));
} else {
  app.use(cors({
    origin: ['https://hairgov2.onrender.com'],
    credentials: true
  }));
}
