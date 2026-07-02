const crypto   = require('crypto');
const Razorpay = require('razorpay');
const Order    = require('../models/Order');

let _razorpay = null;
const getRazorpay = () => {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
};

const PHONEPE_BASE       = 'https://api-preprod.phonepe.com/apis/pg-sandbox';
const PHONEPE_MERCHANT   = process.env.PHONEPE_MERCHANT_ID  || 'PGTESTPAYUAT';
const PHONEPE_SALT_KEY   = process.env.PHONEPE_SALT_KEY     || '099eb0cd-02cf-4dc2-a4a0-c97d6d1db50a';
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX   || '1';

// ─── Razorpay ────────────────────────────────────────────────────────────────

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const rzpOrder = await getRazorpay().orders.create({
      amount:   Math.round(order.grandTotal * 100),
      currency: 'INR',
      receipt:  order.orderNumber,
    });

    order.razorpayOrderId = rzpOrder.id;
    await order.save();

    res.json({
      razorpayOrderId: rzpOrder.id,
      amount:          rzpOrder.amount,
      currency:        rzpOrder.currency,
      key:             process.env.RAZORPAY_KEY_ID,
      orderId:         order._id,
      orderNumber:     order.orderNumber,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = hmac.digest('hex');

    if (digest !== razorpaySignature)
      return res.status(400).json({ message: 'Payment verification failed — signature mismatch' });

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.paymentStatus      = 'paid';
    order.razorpayPaymentId  = razorpayPaymentId;
    order.razorpaySignature  = razorpaySignature;
    order.status             = 'confirmed';
    order.statusHistory.push({ status: 'confirmed', note: 'Payment received via Razorpay' });
    await order.save();

    res.json({ success: true, orderId: order._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── PhonePe ─────────────────────────────────────────────────────────────────

exports.createPhonePeOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const txnId = `TXN${order.orderNumber.replace(/[^A-Z0-9]/g, '')}`;

    const payload = {
      merchantId:            PHONEPE_MERCHANT,
      merchantTransactionId: txnId,
      merchantUserId:        req.user._id.toString(),
      amount:                Math.round(order.grandTotal * 100),
      redirectUrl:           `${process.env.CLIENT_URL}/order/${order._id}?payment=phonepe&txn=${txnId}`,
      redirectMode:          'REDIRECT',
      callbackUrl:           `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/phonepe/callback`,
      paymentInstrument:     { type: 'PAY_PAGE' },
    };

    const b64     = Buffer.from(JSON.stringify(payload)).toString('base64');
    const xVerify = crypto.createHash('sha256')
      .update(b64 + '/pg/v1/pay' + PHONEPE_SALT_KEY)
      .digest('hex') + '###' + PHONEPE_SALT_INDEX;

    const response = await fetch(`${PHONEPE_BASE}/pg/v1/pay`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept':        'application/json',
        'X-VERIFY':     xVerify,
      },
      body: JSON.stringify({ request: b64 }),
    });

    const data = await response.json();
    console.log('[PhonePe] initiate response:', JSON.stringify(data));
    if (!data.success)
      return res.status(400).json({
        message: data.message || 'PhonePe initiation failed',
        code:    data.code,
      });

    order.phonepeTxnId = txnId;
    await order.save();

    res.json({ redirectUrl: data.data?.instrumentResponse?.redirectInfo?.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.phonePeCallback = async (req, res) => {
  try {
    const { transactionId } = req.query;
    if (!transactionId) return res.json({ success: false });

    const checkPath = `/pg/v1/status/${PHONEPE_MERCHANT}/${transactionId}`;
    const xVerify   = crypto.createHash('sha256')
      .update(checkPath + PHONEPE_SALT_KEY)
      .digest('hex') + '###' + PHONEPE_SALT_INDEX;

    const response = await fetch(`${PHONEPE_BASE}${checkPath}`, {
      headers: { 'X-VERIFY': xVerify, 'X-MERCHANT-ID': PHONEPE_MERCHANT },
    });
    const data = await response.json();

    if (data.success && data.code === 'PAYMENT_SUCCESS') {
      const order = await Order.findOne({ phonepeTxnId: transactionId });
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.status        = 'confirmed';
        order.statusHistory.push({ status: 'confirmed', note: 'Payment received via PhonePe' });
        await order.save();
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Test / Simulation ───────────────────────────────────────────────────────
// Confirms payment without calling any external gateway (dev/demo mode)
exports.confirmTestPayment = async (req, res) => {
  try {
    const { orderId, method } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentStatus === 'paid')
      return res.json({ success: true, orderId: order._id, already: true });

    order.paymentStatus      = 'paid';
    order.status             = 'confirmed';
    order.razorpayPaymentId  = method === 'online'  ? `test_pay_${Date.now()}` : '';
    order.phonepeTxnId       = method === 'phonepe' ? `test_txn_${Date.now()}` : order.phonepeTxnId;
    order.statusHistory.push({
      status: 'confirmed',
      note:   `Test payment confirmed via ${method === 'online' ? 'Razorpay' : 'PhonePe'}`,
    });
    await order.save();
    await order.populate('shop', 'name owner');

    // Notify admin of payment confirmation
    if (global.io && order.shop) {
      const notification = {
        type:        'payment_confirmed',
        orderId:     order._id,
        orderNumber: order.orderNumber,
        amount:      order.grandTotal,
        customer:    req.user.name,
        shopName:    order.shop.name,
        payMethod:   method,
        time:        new Date().toISOString(),
      };
      global.io.to(`admin_${order.shop.owner}`).emit('notification', notification);
      global.io.to('superadmin').emit('notification', notification);
    }

    res.json({ success: true, orderId: order._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkPhonePeStatus = async (req, res) => {
  try {
    const { txnId } = req.params;

    const checkPath = `/pg/v1/status/${PHONEPE_MERCHANT}/${txnId}`;
    const xVerify   = crypto.createHash('sha256')
      .update(checkPath + PHONEPE_SALT_KEY)
      .digest('hex') + '###' + PHONEPE_SALT_INDEX;

    const response = await fetch(`${PHONEPE_BASE}${checkPath}`, {
      headers: { 'X-VERIFY': xVerify, 'X-MERCHANT-ID': PHONEPE_MERCHANT },
    });
    const data = await response.json();

    if (data.success && data.code === 'PAYMENT_SUCCESS') {
      const order = await Order.findOne({ phonepeTxnId: txnId, user: req.user._id });
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.status        = 'confirmed';
        order.statusHistory.push({ status: 'confirmed', note: 'Payment received via PhonePe' });
        await order.save();
      }
      return res.json({ paid: true });
    }
    res.json({ paid: false, code: data.code });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
