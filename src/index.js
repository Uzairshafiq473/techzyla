import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import fetch from 'node-fetch';
import util from 'util';

const app = express();
app.use(cors({
  origin: 'https://techzyla.com',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Force HTTPS in production
app.use((req, res, next) => {
  if (req.protocol === 'http' && process.env.NODE_ENV === 'production') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // SSL option (if supported by Hostinger)
  ssl: {
    rejectUnauthorized: false
  }
};

const pool = mysql.createPool(dbConfig);
pool.getConnection = util.promisify(pool.getConnection);

const connectWithRetry = async (retries = 10, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('Connected to database');
      connection.release();
      return pool;
    } catch (err) {
      console.error(`Connection failed (attempt ${i + 1}/${retries}):`, err.message);
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

connectWithRetry().catch(err => {
  console.error('Failed to connect to database after retries:', err.message);
  process.exit(1);
});

// Contact form API
app.post('/api/contact', (req, res) => {
  const { name, email, phone, service, message } = req.body;
  pool.query(
    'INSERT INTO contact_messages (name, email, phone, service, message) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, service, message],
    (err, result) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: 'Database connection failed' });
      }
      res.json({ success: true });
    }
  );
});

// Feedback API
app.post('/api/feedback', (req, res) => {
  const { name, role, company, rating, message } = req.body;
  pool.query(
    'INSERT INTO feedback (name, role, company, rating, message) VALUES (?, ?, ?, ?, ?)',
    [name, role, company, rating, message],
    (err, result) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: 'Database connection failed' });
      }
      res.json({ success: true });
    }
  );
});

// Public IP endpoint
app.get('/get-ip', async (req, res) => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    res.send(data.ip);
  } catch (error) {
    res.status(500).send('Error fetching public IP');
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});