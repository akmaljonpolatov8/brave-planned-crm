import express from 'express';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../db/database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username va parol kerak' });
  }

  const db = getDatabase();
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ message: 'Noto\'g\'ri username yoki parol' });
  }

  const token = generateToken(user);

  res.cookie('bp_crm_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      full_name: user.full_name
    }
  });
});

router.get('/me', authenticateToken, (req, res) => {
  const db = getDatabase();
  const user = db.prepare('SELECT id, username, role, full_name FROM users WHERE id = ?').get(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ user });
});

router.post('/logout', (req, res) => {
  res.clearCookie('bp_crm_token');
  res.json({ message: 'Logged out' });
});

export default router;
