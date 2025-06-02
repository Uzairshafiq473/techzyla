import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// Contact form API
app.post('/api/contact', (req, res) => {
  const { name, email, phone, service, message } = req.body;
  db.query(
    'INSERT INTO contact_messages (name, email, phone, service, message) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, service, message],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: true });
    }
  );
});

// Feedback API
app.post('/api/feedback', (req, res) => {
  const { name, role, company, rating, message } = req.body;
  db.query(
    'INSERT INTO feedback (name, role, company, rating, message) VALUES (?, ?, ?, ?, ?)',
    [name, role, company, rating, message],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
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