import express from 'express';
import { pool } from '../db/pool.js';
import { v4 as uuid } from 'uuid';
import { requireAuth } from '../middleware/auth.js';
import QRCode from 'qrcode';

const router = express.Router();

// Create item (lost/found)
router.post('/', requireAuth, async (req, res) => {
  const { title, description, category, status, imageUrl, locationName, locationLat, locationLng, anonymous } = req.body;
  if (!title || !status) return res.status(400).json({ error: 'Missing title/status' });
  if (!['lost', 'found'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

  try {
    const id = uuid();
    await pool.query(
      `INSERT INTO items (id, title, description, category, status, image_url, location_name, location_lat, location_lng, posted_by, anonymous)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [id, title, description || null, category || null, status, imageUrl || null, locationName || null, locationLat || null, locationLng || null, req.user.id, !!anonymous]
    );

    if (status === 'found') {
      await pool.query('UPDATE users SET points = points + 5 WHERE id=$1', [req.user.id]);
    }

    res.json({ id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Search & filter
router.get('/', async (req, res) => {
  const { q, category, status } = req.query;
  const clauses = [];
  const params = [];
  let idx = 1;

  if (q) {
    clauses.push(`(LOWER(title) LIKE $${idx} OR LOWER(description) LIKE $${idx} OR LOWER(location_name) LIKE $${idx})`);
    params.push(`%${q.toLowerCase()}%`);
    idx++;
  }
  if (category) {
    clauses.push(`category = $${idx}`);
    params.push(category);
    idx++;
  }
  if (status) {
    clauses.push(`status = $${idx}`);
    params.push(status);
    idx++;
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  try {
    const result = await pool.query(`SELECT * FROM items ${where} ORDER BY created_at DESC`, params);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Generate QR poster for item
router.get('/:id/qr', async (req, res) => {
  const { id } = req.params;
  try {
    const item = await pool.query('SELECT * FROM items WHERE id=$1', [id]);
    if (!item.rows[0]) return res.status(404).json({ error: 'Item not found' });

    const url = `https://lostfound.example/items/${id}`; // replace with your frontend deep link
    const svg = await QRCode.toString(url, { type: 'svg', margin: 2 });
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;