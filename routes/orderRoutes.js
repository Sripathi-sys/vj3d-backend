// routes/orderRoutes.js
const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const { protect } = require('../middleware/auth');

// POST /api/orders — customer places order (public)
router.post('/', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json({ message: 'Order placed!', orderId: order._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/orders — all orders (admin only)
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id — single order (admin only)
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/status — update status (admin only)
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
