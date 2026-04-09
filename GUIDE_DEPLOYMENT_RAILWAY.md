# 🚀 GUIDE ÉTAPE PAR ÉTAPE - DÉPLOIEMENT RAILWAY

## 📌 PRÉREQUIS
- Compte GitHub avec votre code pushé
- Compte Railway (gratuit, credit $5/mois)
- Compte Vercel (optionnel, pour le frontend)
- Clés MeSomb valides

---

## ÉTAPE 1: PRÉPARER LE CODE POUR GITHUB

### 1.1 Initialiser Git dans votre projet
```bash
cd /home/mranseo/Musique/PaymentSAASback-main(3)
git init
git config user.email "votre@email.com"
git config user.name "Votre Nom"
```

### 1.2 Créer `.gitignore`
```bash
# À la racine du projet
cat > .gitignore << 'EOF'
# Environment
.env
.env.local
.env.*.local

# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# OS
Thumbs.db

# Testing
coverage/
.nyc_output/

# Build
dist/
build/
out/
EOF
```

### 1.3 Ajouter et committer
```bash
git add .
git commit -m "Initial commit: Payment SaaS project ready for deployment"
```

### 1.4 Pousser vers GitHub
```bash
# Option A: Si le repo n'existe pas encore
git remote add origin https://github.com/YOUR_USERNAME/payment-saas.git
git branch -M main
git push -u origin main

# Option B: Si le repo existe déjà
git push
```

---

## ÉTAPE 2: CRÉER COMPTE RAILWAY & PROJET

### 2.1 Aller sur railway.app
1. Ouvrir https://railway.app
2. Cliquer "Login with GitHub" (ou créer compte)
3. Autoriser l'accès à GitHub

### 2.2 Créer un nouveau projet
1. Dashboard → "New Project" ou "Create"
2. "Deploy from GitHub repo"
3. Sélectionner votre repository `payment-saas`
4. Autoriser Railway à accéder GitHub

---

## ÉTAPE 3: AJOUTER POSTGRESQL À RAILWAY

### 3.1 Créer la base de données
1. Dans votre projet Railway
2. Cliquer "Add Services" → "+ Create"
3. Sélectionner "PostgreSQL"
4. Railway crée automatiquement la BD

### 3.2 Copier les identifiants DB
1. Dans le service PostgreSQL
2. Aller dans "Variables"
3. Copier:
   - `DATABASE_URL` (ou construire à partir de PGHOST, PGUSER, PGPASSWORD, PGDATABASE)
   - Ou individuellement: PGHOST, PGUSER, PGPASSWORD, PGDATABASE

**Exemple:**
```
PGHOST: aws-0-eu-central-1.railway.app
PGPORT: 5432
PGUSER: postgres
PGPASSWORD: abc123xyz789
PGDATABASE: railway
```

---

## ÉTAPE 4: CONFIGURER LE BACKEND SUR RAILWAY

### 4.1 Modifier le fichier `backend/.env`

**D'ABORD, connecter au service Backend dans Railway:**
1. Sélectionner le service "PaymentSAASback-main" (ou Node app)
2. Aller dans "Variables"

### 4.2 Ajouter les variables:
```env
# Application
PORT=3000
NODE_ENV=production
JWT_SECRET=VotreSecretTrasSuperSecurisede32CharactersAuMoins!

# Database - À copier du service PostgreSQL
DB_HOST=aws-0-eu-central-1.railway.app
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=abc123xyz789

# URLs
BASE_URL=https://payment-saas-backend-xxxx.up.railway.app
FRONTEND_URL=https://payment-saas-frontend.vercel.app

# MeSomb
MESOMB_APP_KEY=d6461c22d0bb1fb371ab3a1cec9971c41ce79356
MESOMB_API_KEY=688633a7-6a65-451f-b091-3caf525e5ef0
MESOMB_SECRET_KEY=3627ee5d-8fa4-457e-952a-5ef4c4d4322e
INTERNAL_WEBHOOK_SECRET=VotreSecretWebhookSecurise123

MIN_AMOUNT=10000
```

### 4.3 Configurer le déploiement
1. Railway détecte automatiquement Node.js
2. Vérifie que le "Start Command" est: `npm start`
3. Appuyer "Deploy" ou attendre le déploiement auto

### 4.4 Obtenir l'URL du backend
1. Après déploiement, aller dans "Settings"
2. Copier le "Public Domain" ou "Railway.app URL"
3. Format: `https://payment-saas-backend-xxxx.up.railway.app`

⚠️ **NOTER CETTE URL - Vous en aurez besoin pour le frontend!**

---

## ÉTAPE 5: METTRE À JOUR LE FRONTEND

### 5.1 Modifier `frontend/script.js`

**Ouvrir le fichier et remplacer la ligne 4:**

**Avant:**
```javascript
const API_BASE_URL = 'https://2b4b-154-72-153-100.ngrok-free.app/api/v1';
```

**Après (avec URL Railway):**
```javascript
const API_BASE_URL = (() => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000/api/v1';  // Pour développement local
  }
  return 'https://payment-saas-backend-xxxx.up.railway.app/api/v1';  // ← REMPLACER
})();
```

**Remplacer aussi la ligne 7:**
```javascript
const AMOUNT = 10000; // Production
```

### 5.2 Commit et push
```bash
git add frontend/script.js
git commit -m "Update API_BASE_URL for Railway deployment"
git push
```

---

## ÉTAPE 6: DÉPLOYER LE FRONTEND

### OPTION A: Vercel (Recommandé - Gratuit)

#### A.1 Pousser le code
Votre code est déjà sur GitHub (étape 1)

#### A.2 Se connecter à Vercel
1. Aller sur https://vercel.com
2. "Login with GitHub"
3. Autoriser Vercel

#### A.3 Créer nouveau projet
1. "Add New Project"
2. Sélectionner votre repository `payment-saas`
3. Configurer:
   - **Root Directory**: `frontend`
   - **Build Command**: (laisser vide, fichiers statiques)
   - **Install Command**: `npm install` (ou laisser vide)

#### A.4 Déployer
1. Cliquer "Deploy"
2. Attendre que Vercel termine (2-3 minutes)
3. Copier l'URL Vercel: `https://payment-saas-front-xxx.vercel.app`

---

### OPTION B: Railway pour Frontend (Alternative)

#### B.1 Créer un Dockerfile pour le frontend
```bash
# À la racine du frontend/
cat > frontend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Si vous avez un build process
COPY . .

# Servir avec un serveur simple
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", ".", "-l", "3000"]
EOF
```

#### B.2 Dans Railway
1. "Add Services" → "+ Create"
2. Ajouter Dockerfile
3. Railway construit et déploie automatiquement

---

## ÉTAPE 7: METTRE À JOUR LES URLS PARTOUT

### 7.1 Mettre à jour `backend/.env` sur Railway
1. Railroad dashboard → Backend service
2. "Variables"
3. Mettre à jour:
   ```
   FRONTEND_URL=https://payment-saas-front-xxx.vercel.app
   BASE_URL=https://payment-saas-backend-xxxx.up.railway.app
   ```

### 7.2 Vérifier `backend/src/middleware/security.js`
Mettre à jour les origines CORS acceptées:
```javascript
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5500',
      'https://payment-saas-front-xxx.vercel.app',  // ← Vercel
      'https://payment-saas-front-xxx.up.railway.app',  // ← Si Railway
      process.env.FRONTEND_URL
    ].filter(url => url);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'), false);
    }
  },
  // ... reste
};
```

---

## ÉTAPE 8: TESTER LA CONNEXION

### Test 1: Vérifier que le backend fonctionne
```bash
curl https://payment-saas-backend-xxxx.up.railway.app/health
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "API Payment SaaS MeSomb en fonctionnement",
  "timestamp": "2025-04-09T...",
  "environment": "production",
  "database": "PostgreSQL",
  "mesomb": {
    "configured": true
  }
}
```

### Test 2: Depuis le Frontend (Browser Console)
```javascript
// Dans la console du navigateur, sur votre frontend Vercel
fetch('https://payment-saas-backend-xxxx.up.railway.app/health')
  .then(r => r.json())
  .then(d => console.log('Backend réponse:', d))
  .catch(e => console.error('Erreur:', e));
```

**Résultat attendu:** Affiche le JSON de health check

### Test 3: Test API depuis Frontend
1. Ouvrir votre frontend: `https://payment-saas-front-xxx.vercel.app`
2. Entrer un numéro de téléphone: `697123456`
3. Sélectionner "Orange Money"
4. Cliquer "Payer"
5. Vérifier que la modal s'affiche (pas d'erreur CORS)

---

## ÉTAPE 9: METTRE À JOUR WEBHOOK MESOMB

### 9.1 Dashboard MeSomb
1. Aller sur https://mesomb.com/dashboard
2. Aller dans "Settings" ou "Webhooks"
3. Mettre à jour l'URL du webhook:

**Avant:**
```
https://2b4b-154-72-153-100.ngrok-free.app/api/v1/webhooks/mesomb
```

**Après:**
```
https://payment-saas-backend-xxxx.up.railway.app/api/v1/webhooks/mesomb
```

4. Sauvegarder
5. Tester le webhook si possible

---

## ÉTAPE 10: LOGS ET DÉBOGAGE

### 10.1 Voir les logs Railway (Backend)
```
Dashboard → Backend service → "Deployments" → "Logs"
```

**À chercher:**
```
✅ PostgreSQL connecté
✅ Modèles synchronisés
API Payment SaaS MeSomb en ligne
```

### 10.2 Voir les logs Vercel (Frontend)
```
Vercel dashboard → projet → "Deployments" → sélectionner → "Logs"
```

### 10.3 Déboguer dans le navigateur
1. Ouvrir DevTools (F12)
2. Onglet "Network"
3. Faire une action (paiement)
4. Voir les requêtes API
5. Vérifier status codes et responses

---

## 🎯 CHECKLIST FINAL

- [ ] Code sur GitHub
- [ ] PostgreSQL créée sur Railway
- [ ] Backend déployé sur Railway
- [ ] Variables d'environnement railway configurées
- [ ] Frontend mis à jour avec URL backend
- [ ] Frontend déployé (Vercel ou Railway)
- [ ] CORS configurés dans security.js
- [ ] Health check (/health) fonctionne
- [ ] Test d'appel API depuis frontend OK
- [ ] Webhook MeSomb mis à jour
- [ ] Clés MeSomb valides en production

---

## 🔴 PROBLÈMES COURANTS

### "CORS error - origin not allowed"
**Solution:** Ajouter l'origine dans `corsOptions` de security.js

### "Cannot GET /api/v1/..."
**Solution:** Backend n'est pas déployé ou URL incorrecte dans frontend

### "Database connection failed"
**Solution:** Variables DB_HOST, DB_USER, DB_PASSWORD manquent ou incorrectes

### "Webhook not received"
**Solution:** URL webhook incorrecte dans MeSomb dashboard

### Frontend ne se met à jour
**Solution:** Cache - Faire Ctrl+Shift+R ou Clear Cache dans DevTools

---

## 📞 SUPPORT
- Railway Docs: https://docs.railway.app
- MeSomb API: https://mesomb.com/api
- Vercel Docs: https://vercel.com/docs

