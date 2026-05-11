// routes/authRoutes.js
const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const Admin    = require('../models/Admin');

const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// GET /api/auth/setup — create first admin (run once)
router.get('/setup', async (req, res) => {
  try {
    const exists = await Admin.findOne({});
    if (exists) return res.status(400).json({ message: 'Admin already exists' });

    const admin = new Admin({
      email:    process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      name:     'Admin',
    });

    await admin.save();
    return res.status(201).json({ message: 'Admin created successfully! You can now login.' });
  } catch (err) {
    console.error('❌ Setup error:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/reset-admin — delete and recreate admin (run once, then remove)
router.get('/reset-admin', async (req, res) => {
  try {
    await Admin.deleteMany({});
    const admin = new Admin({
      email:    process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      name:     'Admin',
    });
    await admin.save();
    return res.status(201).json({ message: 'Admin reset successfully! You can now login with new credentials.' });
  } catch (err) {
    console.error('❌ Reset error:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login — admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({
      token: genToken(admin._id),
      name:  admin.name,
      email: admin.email,
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
