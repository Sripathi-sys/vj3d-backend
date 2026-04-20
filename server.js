const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const dotenv   = require('dotenv');
const path     = require('path');

dotenv.config();

const app = express();

// ✅ Allowed Origins
const allowedOrigins = [
  "https://vj3dworks.com",
  "https://www.vj3dworks.com",
  "https://admin.vj3dworks.com",
  "http://localhost:3000",
  "http://localhost:5173"
];

// ✅ CORS (FINAL FIXED VERSION)
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, mobile, some preflight cases)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("❌ Blocked by CORS:", origin);

    // ⚠️ IMPORTANT: don't throw error (prevents "status null")
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Handle preflight explicitly (VERY IMPORTANT)
app.options('*', cors());

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

// ✅ Root Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ✅ GLOBAL ERROR HANDLER (prevents silent crashes)
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({
    success: false,
    message: err.message
  });
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