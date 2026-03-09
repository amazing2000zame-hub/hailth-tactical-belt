import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.post('/', (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email, and message are required' });
  }

  const db = getDb();
  db.prepare(
    'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)'
  ).run(name, email, subject || null, message);

  res.status(201).json({ success: true, message: 'Message received' });
});

export default router;
