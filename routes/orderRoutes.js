// routes/orderRoutes.js
const express   = require('express');
const router    = express.Router();
const Order     = require('../models/Order');
const { protect } = require('../middleware/auth');
const Razorpay  = require('razorpay');
const crypto    = require('crypto');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─────────────────────────────────────────────
// POST /api/orders/create-razorpay-order
// Called BEFORE showing the payment popup
// ─────────────────────────────────────────────
router.post('/create-razorpay-order', async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount:   Math.round(amount * 100), // ₹ to paise
      currency: 'INR',
      receipt:  `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (err) {
    console.error('❌ Razorpay order error:', err);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
});

// ─────────────────────────────────────────────
// POST /api/orders/verify-payment
// Called AFTER user pays — verifies & saves order
// ─────────────────────────────────────────────
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;

    // ✅ Verify Razorpay signature
    const body     = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: '⚠️ Payment verification failed' });
    }

    // ✅ Save order to MongoDB
    const newOrder = await Order.create({
      ...orderData,
      paymentMethod:     'Razorpay',
      paymentStatus:     'Paid',
      razorpayOrderId:   razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    res.json({ success: true, orderId: newOrder._id });
  } catch (err) {
    console.error('❌ Verify payment error:', err);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
});

// ─────────────────────────────────────────────
// POST /api/orders — COD fallback (kept for reference)
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json({ message: 'Order placed!', orderId: order._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/orders — all orders (admin only)
// ─────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/orders/:id — single order (admin only)
// ─────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// PUT /api/orders/:id/status — update status (admin only)
// ─────────────────────────────────────────────
router.put('/:id/status', protect, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;