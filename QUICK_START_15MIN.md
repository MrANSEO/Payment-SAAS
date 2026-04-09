# 🚀 QUICK START - 3 CHANGEMENTS À FAIRE

## ⏱️ VOUS AVEZ 15 MINUTES?

Faites simplement ces 3 changements et c'est bon! ✅

---

## 1️⃣ CHANGE #1: `frontend/script.js` (2 min)

### Ouvrir le fichier:
```bash
code /home/mranseo/Musique/PaymentSAASback-main\(3\)/frontend/script.js
```

### Chercher la ligne ~4:
```javascript
const API_BASE_URL = 'https://2b4b-154-72-153-100.ngrok-free.app/api/v1';
```

### Remplacer par:
```javascript
const API_BASE_URL = (() => {
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isDev 
    ? 'http://localhost:3000/api/v1'
    : 'https://payment-saas-backend-xxxx.up.railway.app/api/v1';
})();
```

### Aussi remplacer la ligne ~7:
De: `const AMOUNT = 100;`
À: `const AMOUNT = 10000;`

### ✅ Sauvegardez (Ctrl+S)

---

## 2️⃣ CHANGE #2: `backend/.env` (3 min)

### Ouvrir le fichier:
```bash
code /home/mranseo/Musique/PaymentSAASback-main\(3\)/PaymentSAASback-main/backend/.env
```

### Remplacer ces lignes:

```env
# AVANT:
PORT=3000
NODE_ENV=development
BASE_URL=https://2b4b-154-72-153-100.ngrok-free.app
FRONTEND_URL=http://localhost:3000
JWT_SECRET=unSuperSecretLongEtComplexe
MIN_AMOUNT=100
DB_HOST=localhost
DB_NAME=payment_saas
DB_USER=postgres
DB_PASSWORD=postgres

# APRÈS:
PORT=3000
NODE_ENV=production
BASE_URL=https://payment-saas-backend-xxxx.up.railway.app
FRONTEND_URL=https://payment-saas-frontend-xxx.vercel.app
JWT_SECRET=VotreSecretSuperSecuriseAvecAu_Moins_32_Caracteres
MIN_AMOUNT=10000
DB_HOST=aws-0-eu-central-1.railway.app
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=<COPIER DE RAILWAY>
```

### ⚠️ Notes importantes:
- `JWT_SECRET`: Mettre un secret aléatoire et long (min 32 caractères)
- `DB_HOST`, `DB_PASSWORD`: À copier du service PostgreSQL de Railway (vous ferez ça après)
- `BASE_URL`, `FRONTEND_URL`: À adapter après avoir créé Railway et Vercel

### ✅ Sauvegardez (Ctrl+S)

---

## 3️⃣ CHANGE #3: `backend/src/middleware/security.js` (2 min)

### Ouvrir le fichier:
```bash
code /home/mranseo/Musique/PaymentSAASback-main\(3\)/PaymentSAASback-main/backend/src/middleware/security.js
```

### Chercher la section `corsOptions`:
```javascript
const corsOptions = {
  origin: [
    'https://frontendpay.onrender.com',
    'https://paymentsaafront.onrender.com',
    'http://localhost:3000',
    // ...
  ],
```

### Remplacer la COMPLÈTE par:
```javascript
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      'https://payment-saas-frontend-xxx.vercel.app',
      'https://payment-saas-frontend-xxx.up.railway.app',
      process.env.FRONTEND_URL
    ].filter(url => url);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-signature'],
  optionsSuccessStatus: 200
};
```

### ✅ Sauvegardez (Ctrl+S)

---

## ✅ FICHIERS CONFIG (VÉRIFIER)

### Ces 4 fichiers DOIVENT exister dans `backend/`:
```bash
# Vérifier:
ls -la /home/mranseo/Musique/PaymentSAASback-main\(3\)/PaymentSAASback-main/backend/Procfile
ls -la /home/mranseo/Musique/PaymentSAASback-main\(3\)/PaymentSAASback-main/backend/.env.example
ls -la /home/mranseo/Musique/PaymentSAASback-main\(3\)/PaymentSAASback-main/backend/.gitignore
ls -la /home/mranseo/Musique/PaymentSAASback-main\(3\)/PaymentSAASback-main/backend/Dockerfile

# Résultat attendu: Les 4 fichiers sont listés ✅
```

---

## 📤 PUSH SUR GITHUB (2 min)

```bash
cd /home/mranseo/Musique/PaymentSAASback-main\(3\)

# Initialiser Git si besoin
git init
git config user.email "votre@email.com"
git config user.name "Votre Nom"

# Ajouter les changements
git add .

# Committer
git commit -m "Fix URLs and config for Railway deployment"

# Pousser
git remote add origin https://github.com/YOUR_USERNAME/payment-saas.git
git branch -M main
git push -u origin main
```

---

## ✨ C'EST BON!

Vous avez fait les 3 changements! 🎉

Maintenant allez sur:
1. **railway.app** → Créer le projet
2. **vercel.com** → Déployer le frontend
3. Suivez **GUIDE_DEPLOYMENT_RAILWAY.md** pour les détails

---

## 🎯 RÉSUMÉ

| Fichier | Changement | Raison |
|---------|-----------|--------|
| `script.js` | API_BASE_URL dynamique | URL ngrok → Railway |
| `.env` | BASE_URL & FRONTEND_URL | URLs railway/vercel |
| `security.js` | CORS flexible | Autoriser frontend vercel |
| Config files | Vérifier présence | Procfile, .gitignore, etc |

**Durée totale: ~15 minutes** ✅

---

## 🚀 PROCHAINE ÉTAPE

Lire: **GUIDE_DEPLOYMENT_RAILWAY.md**

(C'est le guide étape-par-étape pour Railroad et Vercel)

