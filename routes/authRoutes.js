const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const Admin    = require('../models/Admin');

const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.get('/setup', async (req, res) => {
  try {
    const exists = await Admin.findOne({});
    if (exists) return res.status(400).json({ message: 'Admin already exists' });
    const admin = new Admin({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, name: 'Admin' });
    await admin.save();
    return res.status(201).json({ message: 'Admin created successfully!' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/reset-admin', async (req, res) => {
  try {
    await Admin.deleteMany({});
    const admin = new Admin({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, name: 'Admin' });
    await admin.save();
    return res.status(201).json({ message: 'Admin reset successfully!' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    return res.json({ token: genToken(admin._id), name: admin.name, email: admin.email });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
