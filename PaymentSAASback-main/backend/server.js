require('dotenv').config();
const express = require('express');
const { sequelize, isDBConfigured } = require('./src/config/database');
const securityMiddleware = require('./src/middleware/security');

const authRoutes = require('./src/routes/authRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const webhookRoutes = require('./src/routes/webhookRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connexion PostgreSQL (optionnelle)
if (sequelize && isDBConfigured) {
  sequelize.authenticate()
    .then(() => {
      console.log('✅ PostgreSQL connecté');
      app.locals.dbConnected = true;
    })
    .catch(err => {
      console.warn('⚠️ PostgreSQL non disponible:', err.message);
      console.warn('   Mode dégradé: API fonctionnelle sans BD');
      app.locals.dbConnected = false;
    });

  // Synchronisation des modèles (création des tables si absentes)
  sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
    .then(() => console.log('✅ Modèles synchronisés'))
    .catch(err => console.warn('⚠️ Sync modèles échouée:', err.message));
} else {
  console.warn('⚠️ Base de données NON configurée - Mode sans BD activé');
  app.locals.dbConnected = false;
}

app.set('trust proxy', 1);

// Middleware sécurité
app.use(securityMiddleware.helmet());
app.use(securityMiddleware.corsMiddleware);
app.use(securityMiddleware.limiter);

app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/', (req, res) => res.send('<h2>🚀 API Payment SaaS MeSomb en ligne</h2><p><a href="/health">/health</a></p>'));

// Raw body pour le webhook (AVANT le JSON global)
app.use(
  '/api/v1/webhooks/mesomb',
  express.raw({
    type: (req) => {
      const ct = (req.headers['content-type'] || '').toLowerCase();
      return ct.includes('application/json') || ct.includes('+json');
    },
    limit: '10mb',
    verify: (req, res, buf) => { req.rawBody = buf; }
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logger simple
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/webhooks', webhookRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Payment SaaS MeSomb en fonctionnement',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: app.locals.dbConnected ? '✅ PostgreSQL Connecté' : '⚠️ PostgreSQL Non disponible (mode dégradé)',
    databaseStatus: app.locals.dbConnected ? 'connected' : 'disconnected',
    mesomb: {
      configured: !!(process.env.MESOMB_APP_KEY && process.env.MESOMB_API_KEY && process.env.MESOMB_SECRET_KEY)
    }
  });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur globale:', err.message, err.stack);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Erreur serveur' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Serveur démarré sur port ${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

module.exports = app;