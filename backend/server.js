const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Odoo Cafe POS Backend Running');
});

app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
  console.error('Request error:', err.message);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  const healthCheck = http.get(
    `http://127.0.0.1:${PORT}/`,
    (res) => {
      console.log(`Startup health check passed (status ${res.statusCode})`);
      res.resume();
    }
  );

  healthCheck.on('error', (err) => {
    console.error(
      `WARNING: Port ${PORT} may be hijacked by another process (${err.message}).`
    );
    console.error(
      'Set PORT in .env to a free port (e.g. 5001) and stop conflicting services.'
    );
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Choose another PORT in .env.`);
  } else {
    console.error('Server failed to start:', err.message);
  }

  process.exit(1);
});
