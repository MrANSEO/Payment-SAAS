# Mode BD Optionnelle - Configuration

## 📋 Description

Le backend a été modifié pour **rendre la connexion à la base de données optionnelle**. Cela signifie :

✅ Si BD configurée → API fonctionne **avec BD**
⚠️ Si BD non configurée → API fonctionne **en mode dégradé** (sans BD)

---

## 🔧 Fichiers Modifiés

### 1. `src/config/database.js`
- Vérifie si toutes les variables BD sont présentes
- Crée la connexion Sequelize **seulement si BD configurée**
- Exporte `{ sequelize, isDBConfigured, dbConnected }`

### 2. `server.js`
- Tente la connexion BD de manière **non-bloquante**
- Continue le démarrage même si BD échoue
- Stocker le status BD dans `app.locals.dbConnected`
- `/health` retourne le status BD (connecté ou non)

### 3. `src/models/Merchant.js`
- Si `sequelize` existe → modèle Sequelize normal
- Si `sequelize` null → retourne un mock avec méthodes stubées

### 4. `src/models/Transaction.js`
- Même logique que Merchant

### 5. `src/middleware/dbOptional.js` (NOUVEAU)
- Middleware pour tracking du status BD dans chaque requête

---

## 🚀 Utilisation

### **Option 1 : Avec Base de Données (Production)**

Configurer `.env` :
```env
DB_HOST=your-db-host.railway.app
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_PORT=5432
```

Résultat :
```
✅ PostgreSQL connecté
✅ Modèles synchronisés
```

---

### **Option 2 : Sans Base de Données (Développement/Test)**

**NE PAS configurer les variables BD** ou laisser `.env` vide :

```env
PORT=3000
NODE_ENV=development
# Pas de DB_* ici
```

Résultat :
```
⚠️ Variables de base de données non configurées. BD désactivée.
⚠️ Base de données NON configurée - Mode sans BD activé
```

---

## 📊 Vérifier le Status

### Via `/health` endpoint

```bash
curl http://localhost:3000/health
```

**Avec BD :**
```json
{
  "databaseStatus": "connected",
  "database": "✅ PostgreSQL Connecté"
}
```

**Sans BD :**
```json
{
  "databaseStatus": "disconnected",
  "database": "⚠️ PostgreSQL Non disponible (mode dégradé)"
}
```

---

## ⚠️ Limitations en Mode Sans BD

- ❌ Impossible de créer des utilisateurs (Merchant)
- ❌ Impossible d'enregistrer les transactions
- ✅ API répond sur `/health`
- ✅ Routes publiques restent accessibles
- ✅ Webhooks MeSomb ne stockent pas

---

## 🔄 Migration Future

Quand vous aurez la BD sur Railway :

1. Ajouter les variables `DB_*` dans Railway Environment
2. Redéployer
3. API détecte automatiquement la BD et bascule en mode normal

**Zéro modification de code nécessaire !**

---

## ✅ Checklist de Déploiement

- [ ] Code local poussé sur GitHub
- [ ] Railway backend créé
- [ ] Variables BD ajoutées à Railway (ou laissées vides pour mode sans BD)
- [ ] Déploiement effectué
- [ ] `/health` teste le status
- [ ] Frontend teste la connexion API

---

## 📚 Voir aussi

- `PLAN_ACTION_FINAL.md` - Plan de déploiement complet
- `GUIDE_DEPLOYMENT_RAILWAY.md` - Guide Railway détaillé
