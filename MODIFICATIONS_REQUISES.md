# 🔧 MODIFICATIONS CONCRÈTES AVANT DÉPLOIEMENT

## 1️⃣ MODIFIER: `frontend/script.js`

**Ligne 4 - À REMPLACER:**
```javascript
const API_BASE_URL = 'https://2b4b-154-72-153-100.ngrok-free.app/api/v1';
```

**PAR:**
```javascript
const API_BASE_URL = (() => {
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isDev 
    ? 'http://localhost:3000/api/v1'
    : 'https://YOUR_RAILWAY_BACKEND_URL/api/v1';  // ← Remplacer par URL Railway
})();
```

**Ligne 7 - À REMPLACER:**
```javascript
const AMOUNT = 100;       // 💰 100 FCFA pour les tests, passer à 10000 plus tard
```

**PAR:**
```javascript
const AMOUNT = 10000;     // 💰 10000 FCFA production
```

---

## 2️⃣ MODIFIER: `backend/.env`

**À REMPLACER:**
```env
BASE_URL=https://2b4b-154-72-153-100.ngrok-free.app
FRONTEND_URL=http://localhost:3000
```

**PAR:**
```env
BASE_URL=https://YOUR_RAILWAY_BACKEND_URL  # ← Sans /api/v1
FRONTEND_URL=https://YOUR_FRONTEND_URL      # ← Vercel ou domaine
```

**Complètement remplir:**
```env
# Application
PORT=3000
NODE_ENV=production
JWT_SECRET=votre_secret_ultra_securise_avec_32_chars_minimum

# Database (à obtenir de Railway)
DB_HOST=YOUR_RAILWAY_DB_HOST
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=YOUR_RAILWAY_DB_PASSWORD

# URLs
BASE_URL=https://payment-saas-backend-xxxx.up.railway.app
FRONTEND_URL=https://votre-domaine.com

# MeSomb (garder vos clés actuelles)
MESOMB_APP_KEY=d6461c22d0bb1fb371ab3a1cec9971c41ce79356
MESOMB_API_KEY=688633a7-6a65-451f-b091-3caf525e5ef0
MESOMB_SECRET_KEY=3627ee5d-8fa4-457e-952a-5ef4c4d4322e
INTERNAL_WEBHOOK_SECRET=votre_secret_webhook_securise

MIN_AMOUNT=10000
```

---

## 3️⃣ VÉRIFIER: `backend/src/middleware/security.js`

**ACTUELLEMENT - SITUATION ACTUELLE:**
```javascript
const corsOptions = {
  origin: [
    'https://frontendpay.onrender.com',
    'https://paymentsaafront.onrender.com',
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL,
  ],
  // ... reste du code
};
```

**À METTRE À JOUR POUR RAILWAY:**
```javascript
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      'https://payment-saas-frontend.vercel.app',  // ← Frontend URL
      process.env.FRONTEND_URL
    ].filter(url => url); // Filtrer les URL vides
    
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

---

## 4️⃣ CRÉER: `.gitignore` COMPLET

**CRÉER À LA RACINE DU PROJET:**
```
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

# Build
dist/
build/

# Testing
coverage/
*.lcov

# Logs
logs/
*.log
```

---

## 5️⃣ CRÉER: `Procfile` (Pour Railway)

**À LA RACINE DU BACKEND:**
```
web: npm start
```

---

## 6️⃣ CRÉER: `.env.example` (Template)

**À LA RACINE DU BACKEND:**
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=REMPLACER_PAR_SECRET_SECURISE

# Database
DB_HOST=localhost
DB_NAME=payment_saas
DB_USER=postgres
DB_PASSWORD=REMPLACER_PAR_MOT_DE_PASSE

# URLs
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# MeSomb
MESOMB_APP_KEY=REMPLACER_PAR_CLEF_REELLE
MESOMB_API_KEY=REMPLACER_PAR_CLEF_REELLE
MESOMB_SECRET_KEY=REMPLACER_PAR_CLEF_REELLE
INTERNAL_WEBHOOK_SECRET=REMPLACER_PAR_SECRET_WEBHOOK

MIN_AMOUNT=10000
```

---

## 7️⃣ OPTIONNEL: CRÉER `backend/Dockerfile` 

**Si vous voulez contrôler le build:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

---

## ✅ CHECKLIST AVANT PUSH

- [ ] `frontend/script.js` - API_BASE_URL dynamique ✓
- [ ] `frontend/script.js` - AMOUNT = 10000 ✓
- [ ] `backend/.env` - BASE_URL mis à jour ✓
- [ ] `backend/.env` - FRONTEND_URL correct ✓
- [ ] `backend/.env` - JWT_SECRET sécurisé (pas en local) ✓
- [ ] `backend/src/middleware/security.js` - CORS correctes ✓
- [ ] `.gitignore` créé ✓
- [ ] `Procfile` créé ✓
- [ ] `.env.example` créé ✓
- [ ] Pas de secrets en .env final ✓

