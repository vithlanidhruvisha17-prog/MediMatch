import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { auditService } from '../services/audit.service';
import { getClientIp, getClientUserAgent } from './audit.middleware';

export interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'PATIENT' | string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    auditService.logEvent({
      action: 'SECURITY_BLOCKED',
      status: 'FAILURE',
      ipAddress: getClientIp(req),
      userAgent: getClientUserAgent(req),
      details: { reason: 'Missing or malformed Authorization header', path: req.originalUrl, method: req.method }
    });
    return res.status(401).json({ error: 'Unauthorized: Missing or malformed token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err: any) {
    auditService.logEvent({
      action: 'SECURITY_BLOCKED',
      status: 'FAILURE',
      ipAddress: getClientIp(req),
      userAgent: getClientUserAgent(req),
      details: { reason: 'Invalid or expired JWT token', path: req.originalUrl, method: req.method, error: err?.message }
    });
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'ADMIN') {
      auditService.logEvent({
        action: 'SECURITY_BLOCKED',
        userId: req.user?.id,
        userEmail: req.user?.email,
        userRole: req.user?.role,
        status: 'WARNING',
        ipAddress: getClientIp(req),
        userAgent: getClientUserAgent(req),
        details: { reason: 'Unauthorized access to admin resource attempted', path: req.originalUrl, method: req.method }
      });
      return res.status(403).json({ error: 'Forbidden: Administrator privileges required' });
    }
    next();
  });
}

export function requirePatient(req: AuthRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'PATIENT') {
      auditService.logEvent({
        action: 'SECURITY_BLOCKED',
        userId: req.user?.id,
        userEmail: req.user?.email,
        userRole: req.user?.role,
        status: 'WARNING',
        ipAddress: getClientIp(req),
        userAgent: getClientUserAgent(req),
        details: { reason: 'Access denied: Patient role required', path: req.originalUrl, method: req.method }
      });
      return res.status(403).json({ error: 'Forbidden: Patient account required' });
    }
    next();
  });
}

