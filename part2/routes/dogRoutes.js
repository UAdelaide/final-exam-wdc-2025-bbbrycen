const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET /api/dogs – list all dogs with size and owner username
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.dog_id, d.name AS dog_name, d.size, u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch dogs:', err);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

module.exports = router; 