import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username va parol kerak' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { username, isActive: true }
    });

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ message: "Noto'g'ri username yoki parol" });
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
        full_name: user.fullName
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server xatolik' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, role: true, fullName: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: { ...user, full_name: user.fullName } });
  } catch (err) {
    res.status(500).json({ message: 'Server xatolik' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('bp_crm_token');
  res.json({ message: 'Logged out' });
});

export default router;
