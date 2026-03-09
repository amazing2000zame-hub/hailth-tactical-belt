import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.post('/', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM newsletter WHERE email = ?').get(email);

  if (existing) {
    return res.json({ success: true, message: 'Already subscribed' });
  }

  db.prepare('INSERT INTO newsletter (email) VALUES (?)').run(email);
  res.status(201).json({ success: true, message: 'Subscribed successfully' });
});

export default router;
