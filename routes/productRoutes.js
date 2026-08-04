// routes/productRoutes.js
const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Product    = require('../models/Product');
const { protect } = require('../middleware/auth');

// ── Cloudinary Config ──
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Multer uses Cloudinary as storage ──
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'vj3d-works',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ── Helper: get correct Cloudinary URL from uploaded file ──
// ✅ FIX: secure_url is the full https Cloudinary URL
// f.path is also the Cloudinary URL in newer versions of multer-storage-cloudinary
// but secure_url is more reliable — we try it first
const getImageUrl = (file) => file.secure_url || file.path;

// POST /api/products/upload — upload a single image to Cloudinary (public)
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const url = getImageUrl(req.file);
    res.json({ url });
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ message: err.message });
  }
});

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
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });
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

// POST /api/products — create product (admin)
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    // ✅ FIX: Use secure_url (full Cloudinary https URL) instead of f.path
    const images = req.files ? req.files.map(f => getImageUrl(f)) : [];

    // Log to verify Cloudinary URLs are being saved
    console.log('📸 Uploaded image URLs:', images);

    const body = { ...req.body };

    // Convert string booleans
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

// PUT /api/products/:id — update product (admin)
router.put('/:id', protect, upload.array('images', 5), async (req, res) => {
  try {
    const updates = { ...req.body };

    // ✅ FIX: Use secure_url here too
    if (req.files?.length) {
      updates.images = req.files.map(f => getImageUrl(f));
      console.log('📸 Updated image URLs:', updates.images);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/products/:id — delete product (admin)
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
