# Configuration CORS à ajouter dans votre backend
# Dans le fichier .env de votre backend sur Render

ALLOWED_ORIGINS=https://hairgov2.onrender.com,https://scizzwebsite.vercel.app,http://localhost:3002

# Ou dans le code du serveur (server.js ou app.js) :
const cors = require('cors');

const corsOptions = {
  origin: [
    'https://hairgov2.onrender.com',    // Votre backend
    'https://scizzwebsite.vercel.app',    // Votre frontend Vercel
    'http://localhost:3002'              // Développement local
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
