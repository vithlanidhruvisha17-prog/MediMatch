import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { storageService } from '../services/storage.service';
import { ENV } from '../config/env';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Rate limiter for authentication attempts (20 attempts per 15 minutes per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again in 15 minutes.' }
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().trim().min(7, 'Please provide a valid phone number'),
  city: z.string().trim().optional().default('Mumbai'),
  age: z.union([z.number(), z.string()]).optional().transform((val) => {
    if (val === undefined || val === null || val === '') return 45;
    const num = Number(val);
    return isNaN(num) ? 45 : num;
  }),
  gender: z.string().trim().optional().default('Not Specified'),
  budgetCap: z.union([z.number(), z.string()]).optional().transform((val) => {
    if (val === undefined || val === null || val === '') return 250000;
    const num = Number(val);
    return isNaN(num) ? 250000 : num;
  })
});

// POST /api/auth/register - Patient Registration
router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map(e => e.message).join('. ');
      return res.status(400).json({ error: errorMsg });
    }

    const data = parseResult.data;
    const normalizedEmail = data.email.toLowerCase();

    // Prevent duplicate emails across both Admin and Patient accounts
    const [existingAdmin, existingPatient] = await Promise.all([
      storageService.findAdminByEmail(normalizedEmail),
      storageService.findPatientByEmail(normalizedEmail)
    ]);

    if (existingAdmin || existingPatient) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Hash password with bcrypt (10 rounds)
    const passwordHash = bcrypt.hashSync(data.password, 10);

    // Create persistent patient in PostgreSQL
    const patient = await storageService.createPatient({
      fullName: data.fullName,
      email: normalizedEmail,
      passwordHash,
      role: 'PATIENT',
      phone: data.phone,
      city: data.city,
      age: data.age,
      gender: data.gender,
      budgetCap: data.budgetCap
    });

    // Issue JWT
    const token = jwt.sign(
      { id: patient.id, email: patient.email, role: 'PATIENT' },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return token and sanitized user profile (passwordHash excluded)
    return res.status(201).json({
      token,
      user: patient
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed due to a server error. Please try again.' });
  }
});

// POST /api/auth/login - Unified Admin & Patient Login
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // 1. Check AdminUser first
    const admin = await storageService.findAdminByEmail(normalizedEmail);
    if (admin && admin.passwordHash && bcrypt.compareSync(password, admin.passwordHash)) {
      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: 'ADMIN' },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        token,
        user: {
          id: admin.id,
          email: admin.email,
          role: 'ADMIN',
          fullName: 'Administrator'
        }
      });
    }

    // 2. Check Patient
    const patient = await storageService.findPatientByEmail(normalizedEmail);
    if (patient && patient.passwordHash && bcrypt.compareSync(password, patient.passwordHash)) {
      const token = jwt.sign(
        { id: patient.id, email: patient.email, role: 'PATIENT' },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        token,
        user: {
          id: patient.id,
          fullName: patient.fullName,
          email: patient.email,
          phone: patient.phone,
          city: patient.city,
          age: patient.age,
          gender: patient.gender,
          budgetCap: patient.budgetCap,
          role: 'PATIENT'
        }
      });
    }

    // Generic 401 to prevent account enumeration
    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed due to a server error. Please try again.' });
  }
});

// GET /api/auth/me - Validate current session and retrieve profile
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.user.role === 'ADMIN') {
      return res.json({
        user: {
          id: req.user.id,
          email: req.user.email,
          role: 'ADMIN',
          fullName: 'Administrator'
        }
      });
    }

    // Patient
    const patient = await storageService.getPatientById(req.user.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    return res.json({ user: patient });
  } catch (err: any) {
    console.error('Auth verification error:', err);
    return res.status(500).json({ error: 'Failed to verify session' });
  }
});

export default router;

