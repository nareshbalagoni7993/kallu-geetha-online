const express = require('express');
const cors    = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

connectDB();

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any localhost port and the configured CLIENT_URL
    const allowed = /^http:\/\/localhost:\d+$/.test(origin) || origin === process.env.CLIENT_URL;
    if (allowed) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', require('express').static(require('path').join(__dirname, 'uploads')));

app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/superadmin', require('./routes/superAdminRoutes'));
app.use('/api/admin',      require('./routes/adminRoutes'));
app.use('/api/user',       require('./routes/userRoutes'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Geetha Online API is running' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
