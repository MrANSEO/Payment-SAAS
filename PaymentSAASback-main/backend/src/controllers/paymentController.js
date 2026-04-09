const Transaction = require('../models/Transaction');
const Merchant = require('../models/Merchant');
const MeSombService = require('../services/mesombOfficialService');
const NotificationService = require('../services/notificationService');
const { v4: uuidv4 } = require('uuid');

class PaymentController {
  async initiatePayment(req, res) {
    try {
      const merchant = req.merchant;
      const { amount, customer_phone, operator, metadata } = req.body;

      const minAmount = parseInt(process.env.MIN_AMOUNT) || 10000;
      if (amount < minAmount) {
        return res.status(400).json({ success: false, message: `Montant minimum ${minAmount} FCFA` });
      }

      let dbPhone = customer_phone.replace(/^\+237/, '').replace(/^237/, '');
      if (!/^[0-9]{9}$/.test(dbPhone)) {
        return res.status(400).json({ success: false, message: 'Numéro invalide' });
      }

      let mesombPhone = customer_phone.replace(/^\+/, '');
      if (!/^237[0-9]{9}$/.test(mesombPhone)) {
        return res.status(400).json({ success: false, message: 'Numéro invalide pour MeSomb' });
      }

      const reference = `TX-${uuidv4().substring(0, 8).toUpperCase()}`;
      const transaction = await Transaction.create({
        reference,
        amount,
        customer_phone: dbPhone,
        operator,
        merchant_id: merchant.id,
        metadata: metadata || {},
        status: 'PENDING'
      });

      console.log(`💰 Paiement initié: ${reference} - ${amount}F - ${dbPhone}`);
      await NotificationService.sendPaymentConfirmation(customer_phone, amount, reference);

      const paymentResult = await MeSombService.makePayment(amount, mesombPhone, operator);

      if (!paymentResult.success) {
        await transaction.update({ status: 'FAILED', metadata: { ...metadata, error: paymentResult.error } });
        await NotificationService.sendPaymentFailure(customer_phone, amount, reference, paymentResult.error);
        return res.status(400).json({ success: false, message: 'Échec de l\'initiation', error: paymentResult.error });
      }

      const mesombTransactionId = paymentResult.data.transactionId || paymentResult.data.transaction?.pk;
      const mesombStatus = paymentResult.data.status || paymentResult.data.transaction?.status;

      let finalStatus = 'PENDING';
      if (mesombStatus === 'SUCCESS') {
        finalStatus = 'SUCCESS';
        await NotificationService.sendPaymentSuccess(customer_phone, amount, reference);
      } else if (mesombStatus === 'FAILED') {
        finalStatus = 'FAILED';
        await NotificationService.sendPaymentFailure(customer_phone, amount, reference, 'Transaction refusée');
      }

      await transaction.update({
        mesomb_transaction_id: mesombTransactionId,
        status: finalStatus
      });

      console.log(`✅ Transaction ${reference} marquée ${finalStatus} (réponse synchrone)`);

      res.status(200).json({
        success: true,
        message: finalStatus === 'SUCCESS' ? 'Paiement réussi' : 'Paiement en attente',
        data: {
          reference,
          transaction_id: mesombTransactionId,
          status: finalStatus
        }
      });
    } catch (error) {
      console.error('❌ Erreur initiatePayment:', error);
      res.status(500).json({ success: false, message: 'Erreur interne' });
    }
  }

  async checkPaymentStatus(req, res) {
    try {
      const { reference } = req.params;
      const transaction = await Transaction.findOne({ where: { reference } });
      if (!transaction) return res.status(404).json({ success: false, message: 'Transaction introuvable' });
      res.status(200).json({
        success: true,
        data: {
          reference: transaction.reference,
          amount: transaction.amount,
          status: transaction.status,
          operator: transaction.operator,
          created_at: transaction.createdAt
        }
      });
    } catch (error) {
      console.error('❌ checkPaymentStatus:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  async getMerchantTransactions(req, res) {
    try {
      const merchant = req.merchant;
      const transactions = await Transaction.findAll({
        where: { merchant_id: merchant.id },
        order: [['createdAt', 'DESC']],
        limit: 20
      });
      res.json({ success: true, data: { transactions } });
    } catch (error) {
      console.error('❌ getMerchantTransactions:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }
}

module.exports = new PaymentController();
