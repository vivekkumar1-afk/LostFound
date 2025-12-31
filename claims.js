import express from 'express';
import { pool } from '../db/pool.js';
import { v4 as uuid } from 'uuid';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Create claim
router.post('/', requireAuth, async (req, res) => {
  const { itemId, proofText } = req.body;
  if (!itemId || !proofText) return res.status(400).json({ error: 'Missing itemId/proofText' });

  try {
    const id = uuid();
    await pool.query(
      'INSERT INTO claims (id, item_id, claimant_id, proof_text) VALUES ($1,$2,$3,$4)',
      [id, itemId, req.user.id, proofText]
    );
    res.json({ id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Approve claim (moderator/admin flow—simplified)
router.post('/:id/approve', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE claims SET approved=true WHERE id=$1', [id]);

    const claim = await pool.query('SELECT claimant_id FROM claims WHERE id=$1', [id]);
    const claimantId = claim.rows[0]?.claimant_id;
    if (claimantId) {
      await pool.query('UPDATE users SET points = points + 10 WHERE id=$1', [claimantId]);
    }

    res.json({ approved: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;