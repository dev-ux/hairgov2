# 🎯 HAIRGO - Structure Complète du Projet Backend

## 📂 Arborescence du Projet

```
hairgo-backend/
├── 📄 server.js                    # Point d'entrée principal
├── 📄 .env                         # Variables d'environnement
├── 📄 .env.example                 # Exemple de configuration
├── 📄 .gitignore                   # Fichiers à ignorer
├── 📄 package.json                 # Dépendances npm
├── 📄 README.md                    # Documentation principale
│
├── 📁 config/
│   ├── database.js                 # Configuration base de données
│   └── firebase-service-account.json  # Clés Firebase (à créer)
│
├── 📁 database/
│   ├── schema.sql                  # Schéma PostgreSQL complet
│   ├── migrate.js                  # Script de migration
│   └── seed.js                     # Données de test
│
├── 📁 models/
│   ├── index.js                    # Initialisation Sequelize + Relations
│   ├── user.model.js               # Modèle utilisateur
│   ├── hairdresser.model.js        # Modèle coiffeur
│   ├── booking.model.js            # Modèle réservation
│   ├── hairstyle.model.js          # Modèle coiffure
│   ├── rating.model.js             # Modèle évaluation
│   ├── balance-transaction.model.js # Modèle transaction
│   ├── notification.model.js       # Modèle notification
│   ├── complaint.model.js          # Modèle réclamation
│   └── salon.model.js              # Modèle salon
│
├── 📁 controllers/
│   ├── auth.controller.js          # Authentification
│   ├── booking.controller.js       # Réservations
│   ├── hairdresser.controller.js   # Gestion coiffeurs
│   ├── client.controller.js        # Gestion clients
│   └── admin.controller.js         # Administration
│
├── 📁 routes/
│   ├── auth.routes.js              # Routes authentification
│   ├── booking.routes.js           # Routes réservations
│   ├── hairdresser.routes.js       # Routes coiffeurs
│   ├── client.routes.js            # Routes clients
│   ├── hairstyle.routes.js         # Routes coiffures
│   └── admin.routes.js             # Routes admin
│
├── 📁 middleware/
│   ├── auth.middleware.js          # Authentification JWT
│   ├── errorHandler.js             # Gestion erreurs globale
│   ├── upload.middleware.js        # Upload fichiers (Multer)
│   └── rateLimiter.middleware.js   # Limitation requêtes
│
├── 📁 validators/
│   ├── auth.validator.js           # Validation authentification
│   ├── booking.validator.js        # Validation réservations
│   └── hairdresser.validator.js    # Validation coiffeurs
│
├── 📁 services/
│   ├── notification.service.js     # Firebase Cloud Messaging
│   ├── geolocation.service.js      # Google Maps / Géolocalisation
│   ├── upload.service.js           # AWS S3 uploads
│   ├── sms.service.js              # Envoi SMS / OTP
│   └── payment.service.js          # Paiements Mobile Money
│
├── 📁 utils/
│   ├── jwt.util.js                 # Utilitaires JWT
│   ├── email.util.js               # Envoi emails
│   └── helpers.js                  # Fonctions utilitaires
│
└── 📁 tests/
    ├── unit/                       # Tests unitaires
    │   ├── models/
    │   ├── controllers/
    │   └── services/
    └── integration/                # Tests d'intégration
        ├── auth.test.js
        ├── booking.test.js
        └── hairdresser.test.js
```

---

## 🚀 Installation et Démarrage Rapide

### 1. Prérequis

```bash
Node.js >= 16.x
PostgreSQL >= 14.x
npm >= 8.x
```

### 2. Installation

```bash
# Cloner le projet
git clone <votre-repo>
cd hairgo-backend

# Installer les dépendances
npm install

# Copier le fichier .env
cp .env.example .env

# Configurer les variables d'environnement
nano .env
```

### 3. Configuration Base de Données

```bash
# Créer la base de données
createdb hairgo_db

# Ou avec psql
psql -U postgres
CREATE DATABASE hairgo_db;
\q

# Exécuter les migrations
npm run migrate

# Peupler avec des données de test
npm run seed
```

### 4. Démarrer l'Application

```bash
# Mode développement (avec rechargement auto)
npm run dev

# Mode production
npm start
```

L'API sera accessible sur `http://localhost:3000`

---

## 📝 Scripts NPM Disponibles

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "migrate": "node database/migrate.js",
  "seed": "node database/seed.js",
  "test": "jest --coverage",
  "test:watch": "jest --watch",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix"
}
```

---

## 🔑 Comptes de Test (après seed)

### Administrateur
```
Email: admin@hairgo.com
Password: Admin123!
```

### Clients
```
Jean Dupont
Phone: +225071111111
Password: Client123!

Marie Kouamé
Phone: +225072222222
Password: Client123!
```

### Coiffeurs
```
Konan Yao
Phone: +225079876543
Password: Hair123!

Aya Diouf
Phone: +225079876544
Password: Hair123!
```

---

## 📡 Endpoints API Principaux

### Authentification
```http
POST   /api/v1/auth/register/client
POST   /api/v1/auth/register/hairdresser
POST   /api/v1/auth/register/admin
POST   /api/v1/auth/login
POST   /api/v1/auth/login/guest
POST   /api/v1/auth/refresh-token
GET    /api/v1/auth/me
```

#### Détails des endpoints d'authentification

- **Inscription client**
  - URL: `POST /api/v1/auth/register/client`
  - Corps requis: 
    ```json
    {
      "full_name": "string",
      "phone": "string (format: +225XXXXXXXXX)",
      "email": "string (optionnel)",
      "password": "string"
    }
    ```

- **Inscription coiffeur**
  - URL: `POST /api/v1/auth/register/hairdresser`
  - Corps requis: 
    ```json
    {
      "full_name": "string",
      "phone": "string (format: +225XXXXXXXXX)",
      "email": "string (optionnel)",
      "password": "string",
      "profession": "string",
      "residential_address": "string",
      "date_of_birth": "date",
      "id_card_number": "string",
      "has_salon": "boolean",
      "education_level": "string",
      "hairstyle_ids": "array"
    }
    ```

- **Inscription administrateur**
  - URL: `POST /api/v1/auth/register/admin`
  - Corps requis: 
    ```json
    {
      "full_name": "string",
      "email": "string (obligatoire)",
      "password": "string (doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre)",
      "phone": "string (optionnel, format: +225XXXXXXXXX)"
    }
    ```
    - **Note** : Cet endpoint est sécurisé et devrait être protégé dans un environnement de production.

### Réservations
```http
POST   /api/v1/bookings
GET    /api/v1/bookings/nearby-hairdressers
GET    /api/v1/bookings/:id
PUT    /api/v1/bookings/:id/accept
PUT    /api/v1/bookings/:id/start
PUT    /api/v1/bookings/:id/complete
POST   /api/v1/bookings/:id/rate
```

### Coiffeurs
```http
GET    /api/v1/hairdressers/profile
PUT    /api/v1/hairdressers/availability
POST   /api/v1/hairdressers/recharge
GET    /api/v1/hairdressers/balance/history
GET    /api/v1/hairdressers/statistics
```

### Admin
```http
GET    /api/v1/admin/users                 # Récupère la liste des utilisateurs
GET    /api/v1/admin/dashboard/stats       # Statistiques du tableau de bord
GET    /api/v1/admin/hairdressers/pending  # Coiffeurs en attente de validation
PUT    /api/v1/admin/hairdressers/:id/approve
PUT    /api/v1/admin/transactions/:id/approve
GET    /api/v1/admin/bookings
```

#### Détails des endpoints admin

- **Récupérer la liste des utilisateurs**
  - URL: `GET /api/v1/admin/users`
  - Headers requis:
    ```
    Authorization: Bearer <JWT_TOKEN>
    ```
  - Réponse réussie (200):
    ```json
    {
      "success": true,
      "count": 5,
      "data": [
        {
          "id": "uuid",
          "email": "user@example.com",
          "phone": "+225XXXXXXXXX",
          "first_name": "Prénom",
          "last_name": "Nom",
          "role": "client",
          "is_active": true,
          "created_at": "2023-01-01T00:00:00.000Z",
          "updated_at": "2023-01-01T00:00:00.000Z"
        }
      ]
    }
    ```
  - Erreurs possibles:
    - 401 Non autorisé (token manquant ou invalide)
    - 403 Accès refusé (rôle non autorisé)
    - 500 Erreur serveur

---

## 🔐 Authentification

Toutes les routes protégées nécessitent un JWT token :

```javascript
headers: {
  'Authorization': 'Bearer <your_jwt_token>'
}
```

---

## 🌍 Variables d'Environnement Requises

### Base de données
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hairgo_db
DB_USER=postgres
DB_PASSWORD=your_password
```

### JWT
```bash
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
```

### Google Maps (OBLIGATOIRE)
```bash
GOOGLE_MAPS_API_KEY=your_api_key
```

### Firebase Cloud Messaging (OBLIGATOIRE)
```bash
FCM_SERVER_KEY=your_fcm_key
FCM_PROJECT_ID=your_project_id
```

### AWS S3 (pour uploads)
```bash
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_BUCKET_NAME=hairgo-uploads
AWS_REGION=eu-west-1
```

### Tarification
```bash
RESERVATION_FEE=3000
HOME_SERVICE_FEE=5000
```

---

## 📊 Flux de Données Principaux

### 1. Création d'une Réservation
```
Client → POST /bookings 
  → Recherche coiffeurs disponibles
  → Sélection du meilleur coiffeur
  → Déduction frais de service
  → Notification au coiffeur
  → Retour détails réservation
```

### 2. Acceptation d'une Réservation
```
Coiffeur → PUT /bookings/:id/accept
  → Vérification statut
  → Déduction balance
  → Création transaction
  → Notification au client
  → Mise à jour statut
```

### 3. Évaluation d'un Coiffeur
```
Client → POST /bookings/:id/rate
  → Création évaluation
  → Recalcul moyenne coiffeur
  → Mise à jour statistiques
  → Badge si top-rated
```

---

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de données relationnelle
- **Sequelize** - ORM
- **JWT** - Authentification

### Services Externes
- **Firebase Cloud Messaging** - Notifications push
- **Google Maps API** - Géolocalisation
- **AWS S3** - Stockage fichiers
- **Twilio/SMS API** - Envoi SMS/OTP

### Sécurité
- **Helmet** - Headers HTTP sécurisés
- **bcrypt** - Hashage mots de passe
- **express-rate-limit** - Limitation requêtes
- **Joi** - Validation données

---

## 🐛 Débogage

### Logs en développement
```bash
# Le serveur affiche des logs détaillés en mode dev
npm run dev
```

### Tester les endpoints
```bash
# Avec curl
curl http://localhost:3000/health

# Avec httpie
http GET http://localhost:3000/health
```

### Vérifier la base de données
```bash
psql -U postgres hairgo_db
\dt  # Lister les tables
SELECT * FROM users;  # Vérifier les données
```

---

## 📈 Optimisations et Bonnes Pratiques

### Performance
- ✅ Index sur les colonnes fréquemment recherchées
- ✅ Pagination sur toutes les listes
- ✅ Requêtes SQL optimisées avec Sequelize
- ✅ Cache avec Redis (à implémenter)

### Sécurité
- ✅ Validation stricte des entrées
- ✅ Rate limiting sur toutes les routes
- ✅ Sanitisation des données
- ✅ CORS configuré

### Code Quality
- ✅ Structure modulaire
- ✅ Séparation des responsabilités
- ✅ Gestion d'erreurs centralisée
- ✅ Code commenté et documenté

---

## 🚦 Statut des Fonctionnalités

### ✅ Implémenté
- [x] Authentification complète
- [x] Gestion des réservations
- [x] Géolocalisation
- [x] Système de notation
- [x] Gestion du solde
- [x] Notifications push
- [x] Panel admin
- [x] Upload de fichiers

### 🔄 En cours
- [ ] Paiement Mobile Money intégration
- [ ] Chat en temps réel
- [ ] Système de recommandations

### 📋 À venir (Phase 2)
- [ ] Programme de fidélité
- [ ] Analytics avancés
- [ ] API publique pour partenaires
- [ ] Support multi-langues

---

## 📞 Support et Contact

Pour toute question ou problème :
- **Email**: dev@hairgo.com
- **Documentation**: https://docs.hairgo.com
- **Issues**: https://github.com/votre-org/hairgo-backend/issues

---

## 📜 License

MIT License - voir [LICENSE.md](LICENSE.md)

---

**Made with ❤️ by HAIRGO Team**