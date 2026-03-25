// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  description:   { type: String, default: '' },
  price:         { type: Number, required: true },
  originalPrice: { type: Number, default: null },
  category:      { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  images:        [{ type: String }],        // image URLs/paths
  emoji:         { type: String, default: '🖨️' }, // fallback display
  badge:         { type: String, default: null }, // "SALE","NEW","HOT"
  inStock:       { type: Boolean, default: true },
  featured:      { type: Boolean, default: false },
  isNewArrival:  { type: Boolean, default: false },
  isCombo:       { type: Boolean, default: false },
  tags:          [String],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
