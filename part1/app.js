const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();

// Create a connection pool. Credentials can be supplied through env vars.
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'DogWalkService',
  multipleStatements: true,
});

/* --------------------------- Route Definitions --------------------------- */

// Serve the index.html file at the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// GET /api/dogs
app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.name AS dog_name, d.size, u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id;
    `);
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch dogs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/walkrequests/open
app.get('/api/walkrequests/open', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT wr.request_id,
             d.name AS dog_name,
             wr.requested_time,
             wr.duration_minutes,
             wr.location,
             u.username AS owner_username
      FROM WalkRequests wr
      JOIN Dogs d ON wr.dog_id = d.dog_id
      JOIN Users u ON d.owner_id = u.user_id
      WHERE wr.status = 'open';
    `);
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch open walk requests:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/walkers/summary
app.get('/api/walkers/summary', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.username AS walker_username,
        COUNT(r.rating_id)          AS total_ratings,
        AVG(r.rating)               AS average_rating,
        COUNT(r.rating_id)          AS completed_walks
      FROM Users u
      LEFT JOIN WalkRatings r ON u.user_id = r.walker_id
      WHERE u.role = 'walker'
      GROUP BY u.user_id, u.username;
    `);
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch walkers summary:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export the app
module.exports = app; 