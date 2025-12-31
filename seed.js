import { pool } from './pool.js';
import { v4 as uuid } from 'uuid';

(async () => {
  try {
    const userId = uuid();
    await pool.query(
      'INSERT INTO users (id, email, name, points) VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO NOTHING',
      [userId, 'demo@college.edu', 'Demo User', 10]
    );

    const itemId = uuid();
    await pool.query(
      `INSERT INTO items (id, title, description, category, status, location_name, location_lat, location_lng, posted_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [itemId, 'Black Lenovo Laptop', 'Sticker on lid', 'electronics', 'lost', 'Library', 21.19, 81.28, userId]
    );

    console.log('Seed complete');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();