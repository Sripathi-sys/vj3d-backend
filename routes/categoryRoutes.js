// routes/categoryRoutes.js
const express  = require('express');
const router   = express.Router();
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try { res.json(await Category.find().sort({ name: 1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const slug = req.body.name.toLowerCase().replace(/\s+/g, '-');
    const cat  = await Category.create({ ...req.body, slug });
    res.status(201).json(cat);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try { res.json(await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
