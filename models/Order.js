// models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:    String,
  price:   Number,
  qty:     Number,
  emoji:   String,
  size:    String,
  color:   String,
  photo:   String,
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
  notes:         { type: String, default: '' },

  status: {
    type:    String,
    enum:    ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },

  // ✅ Payment fields
  paymentMethod: {
    type:    String,
    enum:    ['COD', 'Razorpay'],
    default: 'COD',
  },
  paymentStatus: {
    type:    String,
    enum:    ['Pending', 'Paid', 'Failed'],
    default: 'Pending',
  },
  razorpayOrderId:   { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);