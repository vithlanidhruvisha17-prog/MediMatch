import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter.middleware';

import authRoutes from './routes/auth.routes';
import patientsRoutes from './routes/patients.routes';
import assessmentsRoutes from './routes/assessments.routes';
import hospitalsRoutes from './routes/hospitals.routes';
import doctorsRoutes from './routes/doctors.routes';
import inquiriesRoutes from './routes/inquiries.routes';
import aiConfigRoutes from './routes/aiConfig.routes';
import aiPredictRoutes from './routes/aiPredict.routes';
import chatRoutes from './routes/chat.routes';
import seedRoutes from './routes/seed.routes';
import auditRoutes from './routes/audit.routes';
import paymentsRoutes from './routes/payments.routes';

import path from 'path';
import fs from 'fs';

export function createApp(): Express {
  const app = express();

  // Trust reverse proxy (Render, Cloudflare) to prevent rate-limiter X-Forwarded-For warning
  app.set('trust proxy', 1);

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: false, // Allow inline scripts/styles for React frontend
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));

  // Dynamic Universal CORS Configuration – works across Netlify, Vercel, Render, or custom domains
  // Dynamically reflects the incoming origin so credentials/auth headers work without wildcard rejection
  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      // Reflect whatever origin is calling, or allow non-browser requests
      callback(null, origin || true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  // Global Rate Limiter (general API traffic)
  app.use(generalLimiter);

  app.use(express.json());

  // Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'MediMatch API',
      timestamp: new Date().toISOString()
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/patients', patientsRoutes);
  app.use('/api/assessments', assessmentsRoutes);
  app.use('/api/hospitals', hospitalsRoutes);
  app.use('/api/doctors', doctorsRoutes);
  app.use('/api/inquiries', inquiriesRoutes);
  app.use('/api/payments', paymentsRoutes);
  app.use('/api/ai-config', aiConfigRoutes);
  app.use('/api/ai', aiPredictRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/seed', seedRoutes);
  // Secure admin audit endpoint
  app.use('/api/audit-logs', auditRoutes);

  // Serve frontend build if available (production full-stack deployment on Render)
  const clientDist = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
