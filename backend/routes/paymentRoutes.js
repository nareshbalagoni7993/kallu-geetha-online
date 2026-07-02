const router  = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl    = require('../controllers/paymentController');

// Test / Simulation (works without real gateway keys)
router.post('/test/confirm', protect, ctrl.confirmTestPayment);

// Razorpay
router.post('/razorpay/create', protect, ctrl.createRazorpayOrder);
router.post('/razorpay/verify', protect, ctrl.verifyRazorpayPayment);

// PhonePe
router.post('/phonepe/create',          protect, ctrl.createPhonePeOrder);
router.get('/phonepe/callback',                  ctrl.phonePeCallback);
router.get('/phonepe/status/:txnId',    protect, ctrl.checkPhonePeStatus);

module.exports = router;
