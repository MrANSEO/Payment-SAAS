const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateApiKey } = require('../middleware/auth');
const { validateInitiatePayment, handleValidationErrors } = require('../middleware/validation');

router.post('/initiate', authenticateApiKey, validateInitiatePayment, handleValidationErrors, paymentController.initiatePayment);
router.get('/status/:reference', paymentController.checkPaymentStatus);
router.get('/merchant', authenticateApiKey, paymentController.getMerchantTransactions); // plus d'ID dans l'URL

module.exports = router;