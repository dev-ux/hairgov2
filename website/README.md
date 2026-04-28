# HairGov Website

Site web de présentation de l'application HairGov - plateforme de coiffure à domicile.

## 🚀 Fonctionnalités

- **Présentation de l'application** avec mockups iPhone
- **Inscription des coiffeurs** connectée à l'API existante
- **Design responsive** adapté à tous les écrans
- **Animations modernes** avec Framer Motion
- **Intégration des couleurs** de l'application mobile
- **Connexion à l'API** HairGov existante

## 🎨 Design System

Le site utilise les couleurs de l'application mobile :
- **Primary**: `#6C63FF`
- **Secondary**: `#FF6B6B`
- **Typography**: Poppins
- **Animations**: Framer Motion

## 🛠 Technologies

- **React 18** avec hooks modernes
- **React Router** pour la navigation
- **Sass/SCSS** pour le styling
- **Framer Motion** pour les animations
- **React Hook Form** pour les formulaires
- **Axios** pour les appels API
- **Webpack** pour le bundling

## 📦 Installation

```bash
# Cloner le projet
git clone <repository-url>
cd hairgov2/website

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Démarrer le serveur de développement
npm start
```

Le site sera disponible sur `http://localhost:3002`

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
REACT_APP_API_URL=https://hairgov2.onrender.com
NODE_ENV=development
```

### API Integration

Le site est configuré pour utiliser la même API que l'application mobile :

- **URL de l'API**: `https://hairgov2.onrender.com`
- **Endpoints**: `/api/v1/auth`, `/api/v1/hairdressers`, etc.
- **Authentification**: JWT tokens

## 📁 Structure du projet

```
website/
├── public/
│   ├── index.html
│   └── assets/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── Features.jsx
│   │   ├── HowItWorks.jsx
│   │   ├── Testimonials.jsx
│   │   ├── CTA.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   └── HairdresserRegistration.jsx
│   ├── styles/
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   └── global.scss
│   ├── utils/
│   │   └── api.js
│   ├── App.jsx
│   └── index.js
├── package.json
├── webpack.config.js
└── README.md
```

## 🎯 Pages

### Page d'accueil (`/`)
- Hero section avec mockups iPhone
- Fonctionnalités de l'application
- Comment ça marche
- Témoignages
- Call-to-action

### Inscription coiffeur (`/inscription-coiffeur`)
- Formulaire en 3 étapes
- Validation en temps réel
- Connexion à l'API existante
- Toast notifications

## 🚀 Build & Déploiement

```bash
# Build pour production
npm run build

# Linter
npm run lint

# Linter avec auto-correction
npm run lint:fix
```

## 📱 Responsive Design

Le site est optimisé pour :
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🔗 API Endpoints utilisés

### Authentification
- `POST /api/v1/auth/register/hairdresser` - Inscription coiffeur
- `POST /api/v1/auth/login` - Connexion

### Coiffeurs
- `GET /api/v1/hairdressers` - Lister les coiffeurs
- `GET /api/v1/hairdressers/:id` - Détails coiffeur
- `PUT /api/v1/hairdressers/:id` - Mettre à jour profil

## 🎨 Composants réutilisables

- **Header**: Navigation responsive
- **Hero**: Section principale avec animations
- **Features**: Grille de fonctionnalités
- **HowItWorks**: Étapes d'utilisation
- **Testimonials**: Carrousel de témoignages
- **CTA**: Call-to-action avec formulaire
- **Footer**: Pied de page complet

## 🔄 Workflow de développement

1. **Feature branch**: `git checkout -b feature/nom-feature`
2. **Development**: Code avec tests
3. **Linting**: `npm run lint`
4. **Build test**: `npm run build`
5. **Merge**: Pull request vers main

## 🐛 Débugage

- Console browser pour les erreurs JavaScript
- Network tab pour vérifier les appels API
- React DevTools pour le debugging des composants
- Sass source maps activées en développement

## 📝 Notes importantes

- Le site utilise les mêmes couleurs que l'application mobile
- L'API est partagée avec l'application mobile
- Les mockups iPhone sont à ajouter dans `/public/images/`
- Le formulaire d'inscription est connecté à l'API existante
- Le design est fully responsive

## 🤝 Contribution

1. Fork le projet
2. Créer une feature branch
3. Commit les changements
4. Push vers la branch
5. Créer une Pull Request

## 📄 Licence

MIT License - voir le fichier LICENSE pour les détails
