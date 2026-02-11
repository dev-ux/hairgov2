# Configuration des variables d'environnement sur Render

## Variables requises pour le backend

### 1. Variables de base (Obligatoires)
```
NODE_ENV=production
JWT_SECRET=votre-super-secret-jwt-key-changez-cela-en-production
JWT_REFRESH_SECRET=votre-super-secret-jwt-refresh-key-changez-cela-en-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
PORT=10000
```

### 2. Variables Base de données (Obligatoires)
```
DATABASE_URL=postgresql://username:password@host:5432/database_name
DB_HOST=votre-db-host
DB_PORT=5432
DB_NAME=votre-db-name
DB_USER=votre-db-user
DB_PASSWORD=votre-db-password
```

### 3. Variables Cloudinary (Obligatoires)
```
CLOUDINARY_CLOUD_NAME=votre-nouveau-nom-cloudinary
CLOUDINARY_API_KEY=votre-nouvelle-clé-api
CLOUDINARY_API_SECRET=votre-nouveau-secret
```

### 4. Variables CORS (Recommandées)
```
ALLOWED_ORIGINS=https://hairgov2.onrender.com,https://votre-admin-panel.onrender.com
```

### 5. Variables Application (Recommandées)
```
APP_NAME=HAIRGO
APP_URL=https://hairgov2.onrender.com
```

## Étapes de configuration sur Render

1. Allez sur votre dashboard Render
2. Sélectionnez votre service backend
3. Allez dans "Environment"
4. Ajoutez les variables ci-dessus
5. Redémarrez le service

## Variables pour l'admin panel

L'admin panel a besoin de :
```
REACT_APP_API_URL=https://votre-backend.onrender.com/api/v1
```

## Instructions pour générer les secrets

Générez des secrets forts :
```bash
# Pour JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Résultat: 2586aaef8fed97d8eda6d555c2e3feeb60be34f43cb798496bffe5d31c083634922750d3ec01f7d486d5db45ee66cf35822b1baead8c0faeea6886b3f9ae93f3

# Pour JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Résultat: 2e8ef0df3aecb48737101520bd4bf2c576bd4c597b905496693fa7c7746d6451f2f515d2ef5775e88304a82a4f970915deb4cdf5bdc4c79d4f5289024454dea1
```
