const Merchant = require('../models/Merchant');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class AuthController {
  async register(req, res) {
    try {
      const { company_name, email, password, phone, webhook_url } = req.body;

      if (!company_name || !email || !password || !phone) {
        return res.status(400).json({ success: false, message: 'Champs manquants' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Email invalide' });
      }

      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Mot de passe ≥ 6 caractères' });
      }

      const phoneRegex = /^[0-9+-\s()]{8,20}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ success: false, message: 'Téléphone invalide' });
      }

      const existingMerchant = await Merchant.findOne({
        where: { email: email.toLowerCase().trim() }
      });
      if (existingMerchant) {
        return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
      }

      const merchant = await Merchant.create({
        company_name: company_name.trim(),
        email: email.toLowerCase().trim(),
        password,
        phone: phone.trim(),
        webhook_url: webhook_url ? webhook_url.trim() : '',
        api_key: `pk_${crypto.randomBytes(24).toString('hex')}`
      });

      const merchantResponse = {
        id: merchant.id,
        company_name: merchant.company_name,
        email: merchant.email,
        phone: merchant.phone,
        webhook_url: merchant.webhook_url,
        api_key: merchant.api_key,
        is_active: merchant.is_active,
        created_at: merchant.createdAt
      };

      res.status(201).json({ success: true, message: 'Marchand inscrit', data: { merchant: merchantResponse } });
    } catch (error) {
      console.error('Erreur inscription:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
      }

      const merchant = await Merchant.findOne({ where: { email: email.toLowerCase().trim() } });
      if (!merchant || !merchant.is_active) {
        return res.status(400).json({ success: false, message: 'Identifiants incorrects ou compte inactif' });
      }

      const isPasswordValid = await bcrypt.compare(password, merchant.password);
      if (!isPasswordValid) {
        return res.status(400).json({ success: false, message: 'Identifiants incorrects' });
      }

      const token = jwt.sign(
        { merchantId: merchant.id, email: merchant.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const merchantResponse = {
        id: merchant.id,
        company_name: merchant.company_name,
        email: merchant.email,
        phone: merchant.phone,
        webhook_url: merchant.webhook_url,
        api_key: merchant.api_key,
        is_active: merchant.is_active
      };

      res.status(200).json({ success: true, message: 'Connexion réussie', data: { merchant: merchantResponse, token, expires_in: '24h' } });
    } catch (error) {
      console.error('Erreur connexion:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  async getProfile(req, res) {
    try {
      const merchant = await Merchant.findByPk(req.merchantId, { attributes: { exclude: ['password'] } });
      if (!merchant) return res.status(404).json({ success: false, message: 'Marchand non trouvé' });
      res.status(200).json({ success: true, data: { merchant } });
    } catch (error) {
      console.error('Erreur profil:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  async regenerateApiKey(req, res) {
    try {
      const merchant = await Merchant.findByPk(req.merchantId);
      if (!merchant) return res.status(404).json({ success: false, message: 'Marchand non trouvé' });

      const newApiKey = `pk_${crypto.randomBytes(24).toString('hex')}`;
      merchant.api_key = newApiKey;
      await merchant.save();

      res.status(200).json({ success: true, message: 'Clé API régénérée', data: { new_api_key: newApiKey } });
    } catch (error) {
      console.error('Erreur régénération clé:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }
}

module.exports = new AuthController();