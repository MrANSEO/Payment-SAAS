const jwt = require('jsonwebtoken');
const Merchant = require('../models/Merchant');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Token manquant' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.merchantId = decoded.merchantId;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Token invalide' });
  }
};

const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ success: false, message: 'Clé API manquante' });

    const merchant = await Merchant.findOne({ where: { api_key: apiKey } });
    if (!merchant) return res.status(403).json({ success: false, message: 'Clé API invalide' });

    req.merchant = merchant;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur authentification' });
  }
};

module.exports = { authenticateToken, authenticateApiKey };