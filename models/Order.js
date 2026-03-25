// models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:     String,
  price:    Number,
  qty:      Number,
  emoji:    String,
});

const orderSchema = new mongoose.Schema({
  customerName:  { type: String, required: true },
  customerEmail: { type: String, default: '' },
  customerPhone: { type: String, required: true },
  address:       { type: String, required: true },
  city:          { type: String, required: true },
  pincode:       { type: String, required: true },
  items:         [orderItemSchema],
  totalAmount:   { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending','confirmed','processing','shipped','delivered','cancelled'],
    default: 'pending'
  },
  paymentMethod: { type: String, default: 'COD' },
  notes:         { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
