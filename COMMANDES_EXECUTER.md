# 🚀 COMMANDES PRÊTES À EXÉCUTER

## 1️⃣ INITIALISER GIT & POUSSER SUR GITHUB

### Exécuter ces commandes dans le terminal:
```bash
# Aller dans le répertoire du projet
cd /home/mranseo/Musique/PaymentSAASback-main(3)

# Initialiser Git
git init
git config user.email "votre.email@example.com"
git config user.name "Votre Nom"

# Créer le .gitignore (si pas fait)
cat > .gitignore << 'EOF'
.env
.env.local
node_modules/
npm-debug.log*
.DS_Store
.vscode/
.idea/
dist/
build/
coverage/
EOF

# Ajouter tous les fichiers
git add .

# Committer
git commit -m "Initial commit - Payment SaaS project ready for deployment"

# Ajouter le remote GitHub
git remote add origin https://github.com/YOUR_USERNAME/payment-saas.git

# Renommer la branche en 'main'
git branch -M main

# Pousser
git push -u origin main
```

---

## 2️⃣ MODIFIER `frontend/script.js`

### Chercher la ligne (actuellement ligne 4):
```bash
grep -n "const API_BASE_URL" /home/mranseo/Musique/PaymentSAASback-main\(3\)/frontend/script.js
```

### Remplacer avec cette commande:
```bash
cat > /tmp/api_base_url.txt << 'EOF'
const API_BASE_URL = (() => {
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isDev 
    ? 'http://localhost:3000/api/v1'
    : 'https://payment-saas-backend-xxxx.up.railway.app/api/v1';
})();
EOF
```

**Puis remplacer dans script.js:**
```bash
# Ouvrir dans VS Code et remplacer manuellement OU utiliser sed:
sed -i "s|const API_BASE_URL = '[^']*'|const API_BASE_URL = 'https://payment-saas-backend-xxxx.up.railway.app/api/v1'|" /home/mranseo/Musique/PaymentSAASback-main\(3\)/frontend/script.js
```

**Aussi changer le AMOUNT:**
```bash
sed -i 's/const AMOUNT = [0-9]*/const AMOUNT = 10000/' /home/mranseo/Musique/PaymentSAASback-main\(3\)/frontend/script.js
```

---

## 3️⃣ VÉRIFIER QUE LES FICHIERS SONT CRÉÉS

```bash
# Vérifier la présence des fichiers de config
ls -la /home/mranseo/Musique/PaymentSAASback-main\(3\)/PaymentSAASback-main/backend/ | grep -E "Procfile|Dockerfile|.env|.gitignore"

# Résultat attendu:
# -rw-r--r-- Procfile
# -rw-r--r-- Dockerfile
# -rw-r--r-- .env.example
# -rw-r--r-- .gitignore
```

---

## 4️⃣ TESTER LOCALEMENT AVANT DÉPLOIEMENT

### Terminal 1 - Démarrer PostgreSQL (si local)
```bash
# Si PostgreSQL est installé localement
sudo systemctl start postgresql  # Linux
brew services start postgresql  # macOS
# Ou utilisez Docker:
docker run --name payment-db -e POSTGRES_PASSWORD=postgres -d -p 5432:5432 postgres
```

### Terminal 2 - Démarrer le Backend
```bash
cd /home/mranseo/Musique/PaymentSAASback-main\(3\)/PaymentSAASback-main/backend
npm install
npm start

# Résultat attendu:
# ✅ PostgreSQL connecté
# ✅ Modèles synchronisés
# 🚀 API Payment SaaS MeSomb en ligne
```

### Terminal 3 - Servir le Frontend
```bash
cd /home/mranseo/Musique/PaymentSAASback-main\(3\)/frontend
# Utiliser live-server (à installer: npm install -g live-server)
live-server

# Ou utiliser Python:
python -m http.server 5500
```

### Terminal 4 - Tester l'API
```bash
# Test health check
curl http://localhost:3000/health

# Test avec jq pour formater (optionnel: brew install jq)
curl http://localhost:3000/health | jq '.'

# Résultat attendu:
# {
#   "success": true,
#   "message": "API Payment SaaS MeSomb en fonctionnement",
#   "database": "PostgreSQL",
#   "mesomb": {
#     "configured": true
#   }
# }
```

---

## 5️⃣ AVANT DE POUSSER SUR RAILWAY

### Vérifier que .env n'est pas versionné
```bash
cd /home/mranseo/Musique/PaymentSAASback-main\(3\)
git ls-files | grep ".env"

# Si résultat vide → bon ✅
# Si résultat contient .env → le retirer:
git rm --cached PaymentSAASback-main/backend/.env
git commit -m "Remove .env from version control"
```

### Vérifier que node_modules n'est pas versionné
```bash
git ls-files | grep "node_modules"

# Si résultat vide → bon ✅
# Si présent → ajouter à .gitignore et retirer
```

### Vérifier package.json
```bash
cat /home/mranseo/Musique/PaymentSAASback-main\(3\)/PaymentSAASback-main/backend/package.json | grep -A 5 "scripts"

# Doit contenir:
# "start": "node server.js"
# "dev": "nodemon server.js"
```

---

## 6️⃣ POUSSER LE CODE FINAL

```bash
cd /home/mranseo/Musique/PaymentSAASback-main\(3\)

git status  # Vérifier les changements

git add .
git commit -m "Configure for Railway deployment - Add API_BASE_URL and env files"
git push

# Ou si vous avez déjà pushé:
git add frontend/script.js
git commit -m "Update frontend API_BASE_URL for Railway"
git push
```

---

## 7️⃣ OBTENIR LES INFOS POSTGRESQL DE RAILWAY

**Après avoir créé PostgreSQL dans Railway:**

```bash
# Ces infos sont visibles dans:
# Railway Dashboard → PostgreSQL Service → Variables

# Copier et sauvegarder ces variables:
# PGHOST=
# PGPORT=
# PGUSER=
# PGPASSWORD=
# PGDATABASE=
```

---

## 8️⃣ CONFIGURER LES VARIABLES DANS RAILWAY

**Pour chaque variable, dans Railway Dashboard → Backend Service → Variables:**

```bash
# Copier-coller ces lignes:

PORT=3000
NODE_ENV=production
JWT_SECRET=VotreSecretSuperSecuriseAu Moins32Caracteres!
DB_HOST=<copier de PostgreSQL>
DB_PORT=5432
DB_NAME=<copier de PostgreSQL>
DB_USER=<copier de PostgreSQL>
DB_PASSWORD=<copier de PostgreSQL>
BASE_URL=https://payment-saas-backend-xxxx.up.railway.app
FRONTEND_URL=https://payment-saas-frontend-xxx.vercel.app
MESOMB_APP_KEY=d6461c22d0bb1fb371ab3a1cec9971c41ce79356
MESOMB_API_KEY=688633a7-6a65-451f-b091-3caf525e5ef0
MESOMB_SECRET_KEY=3627ee5d-8fa4-457e-952a-5ef4c4d4322e
INTERNAL_WEBHOOK_SECRET=VotreSecretWebhook
MIN_AMOUNT=10000
```

---

## 9️⃣ TESTER LE BACKEND DEPLOYÉ

```bash
# Remplacer XXXX par votre URL Railway réelle
BACKEND_URL="https://payment-saas-backend-xxxx.up.railway.app"

# Test 1: Health Check
curl "$BACKEND_URL/health"

# Test 2: Avec jq (si installé)
curl -s "$BACKEND_URL/health" | jq '.'

# Test 3: Vérifier CORS depuis frontend
curl -i -X OPTIONS "$BACKEND_URL/api/v1/payments/initiate" \
  -H "Origin: https://payment-saas-frontend-xxx.vercel.app" \
  -H "Access-Control-Request-Method: POST"
```

---

## 🔟 TESTER DEPUIS LE FRONTEND DEPLOYÉ

**Dans la console du navigateur (F12 → Console):**

```javascript
// Test 1: Vérifier que API_BASE_URL est bon
console.log('API_BASE_URL:', API_BASE_URL);

// Test 2: Appel API health
fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`)
  .then(r => r.json())
  .then(d => console.log('Backend response:', d))
  .catch(e => console.error('Erreur:', e.message));

// Test 3: Si vous avez un compte merchant:
// Voir dans Network tab lors d'un paiement
```

---

## 1️⃣1️⃣ METTRE À JOUR WEBHOOK MESOMB

```bash
# À faire manuellement dans le dashboard MeSomb:
# 1. Aller sur https://mesomb.com/dashboard
# 2. Settings → Webhooks
# 3. Remplacer l'URL:
#    De: https://2b4b-154-72-153-100.ngrok-free.app/api/v1/webhooks/mesomb
#    À: https://payment-saas-backend-xxxx.up.railway.app/api/v1/webhooks/mesomb
# 4. Sauvegarder
```

---

## 📊 COMMANDE POUR VÉRIFIER TOUT

```bash
#!/bin/bash
# Sauvegarder comme verify.sh et exécuter: bash verify.sh

echo "🔍 Vérification du projet..."
echo ""

# 1. Vérifier structure
echo "1️⃣ Structure:"
ls -d /home/mranseo/Musique/PaymentSAASback-main\(3\)/frontend && echo "  ✅ Frontend existe"
ls -d /home/mranseo/Musique/PaymentSAASback-main\(3\)/PaymentSAASback-main/backend && echo "  ✅ Backend existe"

# 2. Vérifier fichiers critiques
echo ""
echo "2️⃣ Fichiers critiques:"
[ -f /home/mranseo/Musique/PaymentSAASback-main\(3\)/frontend/script.js ] && echo "  ✅ frontend/script.js"
[ -f /home/mranseo/Musique/PaymentSAASback-main\(3\)/PaymentSAASback-main/backend/server.js ] && echo "  ✅ backend/server.js"
[ -f /home/mranseo/Musique/PaymentSAASback-main\(3\)/PaymentSAASback-main/backend/package.json ] && echo "  ✅ backend/package.json"

# 3. Vérifier fichiers de config
echo ""
echo "3️⃣ Fichiers de configuration:"
[ -f /home/mranseo/Musique/PaymentSAASback-main\(3\)/PaymentSAASback-main/backend/Procfile ] && echo "  ✅ Procfile"
[ -f /home/mranseo/Musique/PaymentSAASback-main\(3\)/PaymentSAASback-main/backend/.env.example ] && echo "  ✅ .env.example"
[ -f /home/mranseo/Musique/PaymentSAASback-main\(3\)/PaymentSAASback-main/backend/.gitignore ] && echo "  ✅ .gitignore"

# 4. Vérifier API_BASE_URL
echo ""
echo "4️⃣ API_BASE_URL dans frontend:"
grep "API_BASE_URL" /home/mranseo/Musique/PaymentSAASback-main\(3\)/frontend/script.js | head -1

# 5. Vérifier Git
echo ""
echo "5️⃣ Git status:"
cd /home/mranseo/Musique/PaymentSAASback-main\(3\)
git status --short | head -5

echo ""
echo "✨ Vérification terminée!"
```

---

## 🆘 EN CAS DE PROBLÈME

### Erreur: "Cannot find module"
```bash
cd /home/mranseo/Musique/PaymentSAASback-main\(3\)/PaymentSAASback-main/backend
npm install
```

### Erreur: "Port 3000 already in use"
```bash
# Trouver le processus
lsof -i :3000
# Tuer le processus
kill -9 <PID>
```

### Erreur: "PostgreSQL connection failed"
```bash
# Vérifier que PostgreSQL tourne
psql -U postgres -d postgres -c "SELECT version();"
```

### Erreur: "CORS error"
```bash
# Vérifier security.js a votre domaine
grep "FRONTEND_URL\|origin" /home/mranseo/Musique/PaymentSAASback-main\(3\)/PaymentSAASback-main/backend/src/middleware/security.js
```

---

## 📚 RÉFÉRENCES UTILES

```bash
# Railway logs
# https://dashboard.railway.app → Select Project → Logs

# Vercel logs
# https://vercel.com → Dashboard → Select Project → Deployments → Logs

# MeSomb API Status
curl https://api.mesomb.com/health

# Vérifier si domaine résout
nslookup payment-saas-backend-xxxx.up.railway.app
```

