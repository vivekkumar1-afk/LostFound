import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './db/pool.js';
import authRouter from './routes/auth.js';
import itemsRouter from './routes/items.js';
import claimsRouter from './routes/claims.js';
import usersRouter from './routes/users.js';

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ status: 'error', error: e.message });
  }
});

app.use('/auth', authRouter);
app.use('/items', itemsRouter);
app.use('/claims', claimsRouter);
app.use('/users', usersRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend running on :${port}`));