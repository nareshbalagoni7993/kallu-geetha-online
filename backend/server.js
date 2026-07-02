const express  = require('express');
const http     = require('http');
const cors     = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();
const connectDB = require('./config/db');

connectDB();

const app    = express();
const server = http.createServer(app);

// ── Socket.io setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const ok = /^http:\/\/localhost:\d+$/.test(origin) || origin === process.env.CLIENT_URL;
      cb(ok ? null : new Error('Socket CORS blocked'), ok);
    },
    credentials: true,
  },
});

global.io = io; // accessible in all controllers

io.on('connection', (socket) => {
  console.log('[Socket] client connected:', socket.id);
  socket.on('join_admin', (adminId) => {
    socket.join(`admin_${adminId}`);
    console.log(`[Socket] admin joined room: admin_${adminId}`);
  });
  socket.on('join_superadmin', () => {
    socket.join('superadmin');
    console.log('[Socket] superadmin joined room');
  });
  socket.on('disconnect', () => console.log('[Socket] client disconnected:', socket.id));
});

// ── Express middleware ────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = /^http:\/\/localhost:\d+$/.test(origin) || origin === process.env.CLIENT_URL;
    if (allowed) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', require('express').static(require('path').join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/superadmin', require('./routes/superAdminRoutes'));
app.use('/api/admin',      require('./routes/adminRoutes'));
app.use('/api/user',       require('./routes/userRoutes'));
app.use('/api/payment',    require('./routes/paymentRoutes'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Geetha Online API is running' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
