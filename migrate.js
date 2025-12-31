import { pool } from './pool.js';

const sql = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT CHECK (status IN ('lost','found')) NOT NULL,
  image_url TEXT,
  location_name TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  posted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  claimant_id UUID REFERENCES users(id) ON DELETE CASCADE,
  proof_text TEXT,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

(async () => {
  try {
    await pool.query(sql);
    console.log('Migration complete');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();