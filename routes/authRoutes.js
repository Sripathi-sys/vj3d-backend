// routes/authRoutes.js
const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const Admin   = require('../models/Admin');

const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// GET /api/auth/setup — create first admin (run once)
router.get('/setup', async (req, res) => {
  try {
    const exists = await Admin.findOne({});
    if (exists) return res.status(400).json({ message: 'Admin already exists' });

    const admin = new Admin({
      email:    process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      name:     'Admin'
    });
    await admin.save(); // this triggers pre('save') hook to hash password

    res.status(201).json({ message: 'Admin created successfully! You can now login.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/auth/login — admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ token: genToken(admin._id), name: admin.name, email: admin.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
