import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticateToken } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import studentRoutes from './routes/students.js';
import teacherRoutes from './routes/teachers.js';
import groupRoutes from './routes/groups.js';
import attendanceRoutes from './routes/attendance.js';
import paymentRoutes from './routes/payments.js';
import debtorRoutes from './routes/debtors.js';
import smsRoutes from './routes/sms.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/students', authenticateToken, studentRoutes);
app.use('/api/teachers', authenticateToken, teacherRoutes);
app.use('/api/groups', authenticateToken, groupRoutes);
app.use('/api/attendance', authenticateToken, attendanceRoutes);
app.use('/api/payments', authenticateToken, paymentRoutes);
app.use('/api/debtors', authenticateToken, debtorRoutes);
app.use('/api/sms', authenticateToken, smsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
