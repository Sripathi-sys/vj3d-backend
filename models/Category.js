// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  subtitle: { type: String, default: '' },
  emoji:    { type: String, default: '📦' },
  bg:       { type: String, default: 'linear-gradient(135deg,#1a1a2e,#16213e)' },
  slug:     { type: String, unique: true, lowercase: true },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
