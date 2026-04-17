const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const dotenv   = require('dotenv');
const path     = require('path');

dotenv.config();

const app = express();

// ✅ CORS (Wildcard support for *.vj3dworks.com)
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (
      origin === "https://vj3dworks.com" ||
      origin.endsWith(".vj3dworks.com")
    ) {
      return callback(null, true);
    }

    return callback(new Error("❌ Not allowed by CORS: " + origin));
  },
  credentials: true
}));

// ✅ Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Routes
app.use('/api/products',   require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders',     require('./routes/orderRoutes'));
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/contact',    require('./routes/contactRoutes'));

// ✅ Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'VJ 3D Works API running' });
});

// ✅ Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ✅ MongoDB + Server Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });