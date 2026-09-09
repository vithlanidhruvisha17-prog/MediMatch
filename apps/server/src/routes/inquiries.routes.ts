import { Router, Response } from 'express';
import { z } from 'zod';
import { storageService } from '../services/storage.service';
import { communicationService } from '../services/communication.service';
import { auditService } from '../services/audit.service';
import { requireAdmin, requirePatient, AuthRequest } from '../middleware/auth.middleware';
import { bookingLimiter } from '../middleware/rateLimiter.middleware';
import { getClientIp, getClientUserAgent } from '../middleware/audit.middleware';

const router = Router();

const createInquirySchema = z.object({
  hospitalId: z.string().trim().nullable().optional(),
  hospitalName: z.string().trim().nullable().optional(),
  doctorId: z.string().trim().nullable().optional(),
  doctorName: z.string().trim().nullable().optional(),
  procedure: z.string().trim().min(2, 'Procedure name is required').max(200),
  notes: z.string().trim().max(2000).nullable().optional(),
  notifyVia: z.array(z.enum(['EMAIL'])).min(1).default(['EMAIL'])
});

const updateStatusSchema = z.object({
  status: z.enum(['New', 'Contacted', 'Booked', 'Closed'], {
    errorMap: () => ({ message: 'Status must be one of: New, Contacted, Booked, Closed' })
  })
});

// GET /api/inquiries - Admin only
router.get('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  const inquiries = await storageService.getInquiries();
  res.json(inquiries);
});

// POST /api/inquiries - Patient booking with real communication dispatch & audit logging
router.post('/', requirePatient, bookingLimiter, async (req: AuthRequest, res: Response) => {
  try {
    console.log('Incoming booking request body:', req.body);
    const parseResult = createInquirySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors.map(e => e.message).join('. ') });
    }
    console.log('Parsed data:', parseResult.data);

    const { hospitalId, hospitalName, doctorId, doctorName, procedure, notes, notifyVia } = parseResult.data;
    const patientId = req.user!.id;

    // Fetch verified patient profile
    const patient = await storageService.getPatientById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient account not found' });
    }

    // 1. Create persistent row in PostgreSQL
    const inquiry = await storageService.createInquiry({
      patientId,
      hospitalId: hospitalId || null,
      hospitalName: hospitalName || null,
      doctorId: doctorId || null,
      doctorName: doctorName || null,
      procedure,
      notes: notes || null,
      status: 'New',
      notifyVia
    });

    // 2. Audit log entry for booking creation
    await auditService.logEvent({
      action: 'BOOKING_CREATED',
      entityType: 'Inquiry',
      entityId: inquiry.id,
      userId: patient.id,
      userEmail: patient.email,
      userRole: 'PATIENT',
      ipAddress: getClientIp(req),
      userAgent: getClientUserAgent(req),
      status: 'SUCCESS',
      details: {
        hospitalName: inquiry.hospitalName,
        procedure: inquiry.procedure,
        patientPhone: patient.phone
      }
    });

    // 3. Dispatch real-world communication (Patient email + Care desk intake dispatch)
    // Non-blocking so response is fast and resilient
    communicationService.dispatchBookingNotification({
      inquiry,
      patient,
      notifyVia: inquiry.notifyVia || notifyVia
    }).catch(err => {
      console.error('[INQUIRY DISPATCH ERROR]', err);
    });

    return res.status(201).json(inquiry);
  } catch (err: any) {
    console.error('Error creating booking inquiry:', err);
    return res.status(500).json({ error: 'Failed to submit booking inquiry' });
  }
});

// PATCH /api/inquiries/:id/status - Admin only status updates with audit tracking
router.patch('/:id/status', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const parseResult = updateStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors.map(e => e.message).join('. ') });
    }

    const { status } = parseResult.data;
    const updated = await storageService.updateInquiryStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: 'Inquiry not found' });

    // Record audit event
    await auditService.logEvent({
      action: 'INQUIRY_STATUS_UPDATED',
      entityType: 'Inquiry',
      entityId: req.params.id,
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: 'ADMIN',
      ipAddress: getClientIp(req),
      userAgent: getClientUserAgent(req),
      status: 'SUCCESS',
      details: { newStatus: status }
    });

    return res.json(updated);
  } catch (err: any) {
    console.error('Error updating inquiry status:', err);
    return res.status(500).json({ error: 'Failed to update inquiry status' });
  }
});

export default router;
