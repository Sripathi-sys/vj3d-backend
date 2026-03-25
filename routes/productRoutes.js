// routes/productRoutes.js
const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const Product  = require('../models/Product');
const { protect } = require('../middleware/auth');

// ── Multer: image upload config ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/products — all products (public)
router.get('/', async (req, res) => {
  try {
    const { category, featured, newArrival, combo, search, badge } = req.query;
    let filter = {};
    if (category)   filter.category    = category;
    if (featured)   filter.featured    = true;
    if (newArrival) filter.isNewArrival = true;
    if (combo)      filter.isCombo     = true;
    if (badge)      filter.badge       = badge;
    if (search)     filter.name        = { $regex: search, $options: 'i' };
    const products = await Product.find(filter).populate('category', 'name slug').sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:id — single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products — create (admin only)
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    // Convert string booleans to real booleans
    const body = { ...req.body };
    if (body.inStock      !== undefined) body.inStock      = body.inStock      === 'true' || body.inStock      === true;
    if (body.featured     !== undefined) body.featured     = body.featured     === 'true' || body.featured     === true;
    if (body.isNewArrival !== undefined) body.isNewArrival = body.isNewArrival === 'true' || body.isNewArrival === true;
    if (body.isCombo      !== undefined) body.isCombo      = body.isCombo      === 'true' || body.isCombo      === true;
    // Remove empty category
    if (!body.category || body.category === '') delete body.category;
    const product = await Product.create({ ...body, images });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/products/:id — update (admin only)
router.put('/:id', protect, upload.array('images', 5), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.files?.length) updates.images = req.files.map(f => `/uploads/${f.filename}`);
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/products/:id — delete (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
