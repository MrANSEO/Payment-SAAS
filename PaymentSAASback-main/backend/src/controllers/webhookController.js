// ✅ CORRECTION COMPLÈTE : src/controllers/webhookController.js
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Merchant = require('../models/Merchant');
const NotificationService = require('../services/notificationService');

class WebhookController {
  // Accept both sha1 and sha256, hex or base64, remove prefices like "sha1=" or "sha256="
  verifySignature(payloadBuffer, signatureHeader, secret) {
    if (!payloadBuffer || !signatureHeader || !secret) return false;

    let sig = String(signatureHeader).trim();
    sig = sig.replace(/^(sha1=|sha256=|sha1:|sha256:)/i, '');

    const tryDecode = (alg, encoding) => {
      try {
        const computed = crypto.createHmac(alg, secret).update(payloadBuffer).digest();
        const sigBuf = Buffer.from(sig, encoding);
        if (sigBuf.length !== computed.length) return false;
        return crypto.timingSafeEqual(computed, sigBuf);
      } catch (e) {
        return false;
      }
    };

    // try hex/base64 with sha1 then sha256
    return tryDecode('sha1', 'hex') || tryDecode('sha1', 'base64') ||
           tryDecode('sha256', 'hex') || tryDecode('sha256', 'base64');
  }

  // nouvelle méthode pour vérifier signature interne marchand
  verifyInternalSignature(payloadBuffer, signatureHeader) {
    const secret = process.env.INTERNAL_WEBHOOK_SECRET || process.env.MESOMB_SECRET_KEY;
    if (!signatureHeader || !secret) return false;
    const sig = String(signatureHeader).trim();
    const computed = crypto.createHmac('sha256', secret).update(payloadBuffer).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(sig, 'hex'));
  }

    async handleMeSombWebhook(req, res) {
    try {
      const payloadBuffer = req.rawBody || (Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {})));
      const internalSig = req.headers['x-internal-signature'];
      if (internalSig) {
        if (this.verifyInternalSignature(payloadBuffer, internalSig)) {
          console.log('⚠️ Requête interne ignorée');
          return res.status(200).json({ success: true, message: 'Internal notification ignored' });
        } else {
          return res.status(401).json({ success: false, message: 'Internal signature invalid' });
        }
      }

      const signature = req.headers['x-signature'] || req.headers['x-mesomb-signature'] || req.headers['signature'] || req.headers['x-hub-signature'];
      const secret = process.env.MESOMB_SECRET_KEY;
      if (!signature || !secret) {
        return res.status(400).json({ success: false, message: 'Signature manquante' });
      }
      if (!this.verifySignature(payloadBuffer, signature, secret)) {
        return res.status(401).json({ success: false, message: 'Signature invalide' });
      }

      const payload = JSON.parse(payloadBuffer.toString());
      console.log('📦 Payload webhook:', JSON.stringify(payload, null, 2));

      const { pk, status, reference } = payload;
      if (!status || !reference) {
        return res.status(400).json({ success: false, message: 'Données manquantes' });
      }

      // ✅ RECHERCHE avec Sequelize (Op.or)
      const transaction = await Transaction.findOne({
        where: {
          [Op.or]: [
            { reference: reference },
            { mesomb_transaction_id: pk }
          ]
        }
      });

      if (!transaction) {
        console.log('❌ Transaction introuvable');
        return res.status(404).json({ success: false, message: 'Transaction introuvable' });
      }

      const statusMap = { SUCCESS: 'SUCCESS', FAILED: 'FAILED', PENDING: 'PENDING', REFUNDED: 'REFUNDED', EXPIRED: 'EXPIRED' };
      const newStatus = statusMap[status] || 'PENDING';

      if (transaction.status !== newStatus) {
        // ✅ MISE À JOUR avec Sequelize
        await transaction.update({
          status: newStatus,
          mesomb_transaction_id: pk || transaction.mesomb_transaction_id
        });
        console.log(`✅ Statut mis à jour: ${transaction.reference} → ${newStatus}`);
      }

      // Notifications
      if (newStatus === 'SUCCESS') {
        await NotificationService.sendPaymentSuccess(transaction.customer_phone, transaction.amount, transaction.reference);
      } else if (newStatus === 'FAILED') {
        await NotificationService.sendPaymentFailure(transaction.customer_phone, transaction.amount, transaction.reference);
      }

      // Notification du marchand
      if (transaction.merchant_id) {
        const merchant = await Merchant.findByPk(transaction.merchant_id);
        if (merchant?.webhook_url) {
          const webhookPayload = {
            event: 'payment.updated',
            data: {
              reference: transaction.reference,
              amount: transaction.amount,
              currency: transaction.currency || 'XAF',
              customer_phone: transaction.customer_phone,
              status: newStatus,
              operator: transaction.operator,
              mesomb_transaction_id: pk,
              timestamp: new Date().toISOString()
            }
          };
          await NotificationService.notifyMerchant(merchant.webhook_url, webhookPayload);
        }
      }

      return res.status(200).json({ success: true, message: 'Webhook traité' });
    } catch (err) {
      console.error('❌ Erreur webhook:', err);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
  }
}

const instance = new WebhookController();
module.exports = { handleMeSombWebhook: instance.handleMeSombWebhook.bind(instance) };