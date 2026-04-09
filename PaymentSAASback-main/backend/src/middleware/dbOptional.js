/**
 * Middleware pour gérer les opérations BD optionnelles
 * Permet à l'API de fonctionner même sans BD disponible
 */

const dbOptional = (req, res, next) => {
  // Ajoute un helper pour les contrôleurs
  res.locals.dbAvailable = req.app.locals.dbConnected || false;
  
  // Si BD non disponible et que c'est une requête sensible
  if (!res.locals.dbAvailable && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
    // Pour certaines routes, on peut retourner une erreur
    // Pour d'autres, on continue en mode dégradé
    req.app.locals.dbStatus = 'unavailable';
  }
  
  next();
};

module.exports = dbOptional;
