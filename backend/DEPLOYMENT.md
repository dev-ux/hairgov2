# 🚀 Déploiement HAIRGO Backend sur Render

## Étapes de déploiement

### 1. Prérequis
- Compte Render (gratuit)
- Repository GitHub avec votre code
- Variables d'environnement configurées

### 2. Configuration du repository

Assurez-vous que votre backend est dans un repository GitHub:
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 3. Création du service sur Render

1. Connectez-vous à [Render](https://render.com)
2. Cliquez sur **"New +"** → **"Web Service"**
3. Connectez votre repository GitHub
4. Configurez le service:

**Configuration:**
- **Name**: `hairgo-backend`
- **Environment**: `Node`
- **Region**: Choisissez la plus proche
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node 18+`
- **Build Command**: `npm install && npm run migrate`
- **Start Command**: `npm start`

### 4. Configuration de la base de données

1. Dans le dashboard Render, cliquez **"New +"** → **"PostgreSQL"**
2. **Name**: `hairgo-db`
3. **Database Name**: `hairgo`
4. **User**: `hairgo_user`
5. Choisissez le plan **Free**

### 5. Variables d'environnement

Dans les settings de votre web service, ajoutez ces variables:

```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://hairgo_user:password@host:5432/hairgo
JWT_SECRET=votre-secret-jet-super-secr
JWT_EXPIRES_IN=7d

# Optionnels (selon vos besoins)
FIREBASE_PROJECT_ID=votre-projet-firebase
FIREBASE_CLIENT_EMAIL=votre-email-service@firebase.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nvotre-clé-privée\n-----END PRIVATE KEY-----"

AWS_ACCESS_KEY_ID=votre-clé-aws
AWS_SECRET_ACCESS_KEY=votre-secret-aws
AWS_REGION=us-east-1
AWS_S3_BUCKET=votre-bucket-s3

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-app

TWILIO_ACCOUNT_SID=votre-sid-twilio
TWILIO_AUTH_TOKEN=votre-token-twilio
TWILIO_PHONE_NUMBER=+1234567890

ALLOWED_ORIGINS=https://votre-frontend.com,https://votre-admin.com
GOOGLE_MAPS_API_KEY=votre-clé-google-maps
```

### 6. Configuration CORS

Mettez à jour les origines autorisées dans `server.js` ou via les variables d'environnement:

```javascript
const allowedOrigins = [
  'https://votre-frontend-render.onrender.com',
  'https://votre-admin-panel-render.onrender.com',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
];
```

### 7. Déploiement automatique

Render va automatiquement:
1. Détecter les changements sur GitHub
2. Builder votre application
3. Exécuter les migrations de base de données
4. Démarrer le serveur

### 8. Vérification du déploiement

1. Attendez la fin du déploiement (vert = succès)
2. Testez l'API: `https://votre-backend.onrender.com/api/health`
3. Vérifiez les logs en cas d'erreur

## 🛠️ Dépannage

### Problèmes courants:

**Erreur de connexion BDD:**
- Vérifiez que `DATABASE_URL` est correct
- Assurez-vous que la BDD est démarrée

**Timeout de build:**
- Le plan free a 15 minutes max
- Optimisez vos `npm install`

**Erreur CORS:**
- Ajoutez votre domaine Render dans `ALLOWED_ORIGINS`
- Vérifiez la configuration dans `server.js`

**Migrations échouées:**
- Vérifiez le script `database/migrate.js`
- Testez en local avec `npm run migrate`

## 📊 Monitoring

- **Logs**: Disponibles dans le dashboard Render
- **Métriques**: CPU, mémoire, requests
- **Alertes**: Configurable pour les erreurs

## 🔄 Mises à jour

Chaque `git push` sur la branche principale déclenche automatiquement un nouveau déploiement.

## 💡 Conseils

1. **Variables sensibles**: Utilisez toujours les variables d'environnement
2. **Logs**: Ajoutez des logs utiles pour le debugging
3. **Santé**: Implémentez un endpoint `/health` pour monitoring
4. **Performance**: Surveillez l'utilisation des ressources (limites sur plan free)

---

🎉 **Votre backend HAIRGO est maintenant déployé sur Render !**
