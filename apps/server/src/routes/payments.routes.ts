import { Router, Response } from 'express';
import { z } from 'zod';
import { requirePatient, AuthRequest } from '../middleware/auth.middleware';
import { paymentLimiter } from '../middleware/rateLimiter.middleware';
import { paymentService } from '../services/payment.service';
import { prisma } from '../lib/prisma';
import { ENV } from '../config/env';
import { PACKAGE_ADVANCE_AMOUNT_PAISE } from '../config/pricing';
import { auditService } from '../services/audit.service';
import { communicationService } from '../services/communication.service';
import { getClientIp, getClientUserAgent } from '../middleware/audit.middleware';

const router = Router();

const createOrderSchema = z.object({
  type: z.enum(['CONSULTATION', 'PACKAGE_ADVANCE']),
  doctorId: z.string().optional(),
  inquiryId: z.string().optional(),
}).refine((data) => {
  if (data.type === 'CONSULTATION' && !data.doctorId) return false;
  if (data.type === 'PACKAGE_ADVANCE' && !data.inquiryId) return false;
  return true;
}, { message: 'Must provide doctorId for CONSULTATION and inquiryId for PACKAGE_ADVANCE' });

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

// POST /api/payments/create-order
router.post('/create-order', requirePatient, paymentLimiter, async (req: AuthRequest, res: Response) => {
  if (!prisma) return res.status(500).json({ error: 'Database unavailable' });

  try {
    const parseResult = createOrderSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors.map(e => e.message).join('. ') });
    }

    const { type, doctorId, inquiryId } = parseResult.data;
    const patientId = req.user!.id;
    let amountPaise = 0;

    if (type === 'CONSULTATION') {
      const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
      if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
      amountPaise = doctor.fee * 100; // Assuming fee is in INR, convert to paise
    } else if (type === 'PACKAGE_ADVANCE') {
      const inquiry = await prisma.inquiry.findUnique({ where: { id: inquiryId } });
      if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });
      amountPaise = PACKAGE_ADVANCE_AMOUNT_PAISE;
    }

    if (!paymentService.isConfigured) {
      return res.status(503).json({ error: 'Payment service not configured' });
    }

    const receipt = `rcpt_${patientId.slice(0, 10)}_${Date.now()}`;
    const order = await paymentService.createOrder(amountPaise, receipt);

    const payment = await prisma.payment.create({
      data: {
        type,
        patientId,
        doctorId,
        inquiryId,
        amount: amountPaise,
        currency: 'INR',
        razorpayOrderId: order.id,
        status: 'CREATED'
      }
    });

    await auditService.logEvent({
      action: 'PAYMENT_ORDER_CREATED',
      entityType: 'Payment',
      entityId: payment.id,
      userId: patientId,
      userRole: 'PATIENT',
      ipAddress: getClientIp(req),
      userAgent: getClientUserAgent(req),
      status: 'SUCCESS',
      details: { amount: amountPaise, type, orderId: order.id }
    });

    res.json({
      orderId: order.id,
      amount: amountPaise,
      currency: 'INR',
      keyId: ENV.RAZORPAY_KEY_ID
    });

  } catch (err: any) {
    console.error('Create Order Error:', err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// POST /api/payments/verify
router.post('/verify', requirePatient, paymentLimiter, async (req: AuthRequest, res: Response) => {
  if (!prisma) return res.status(500).json({ error: 'Database unavailable' });

  try {
    const parseResult = verifyPaymentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parseResult.data;
    const patientId = req.user!.id;

    const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: razorpay_order_id } });
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment order not found' });
    }

    if (payment.patientId !== patientId) {
      return res.status(403).json({ error: 'Unauthorized to verify this payment' });
    }

    // Idempotency: Check if already paid or failed
    if (payment.status !== 'CREATED') {
      return res.json({ success: payment.status === 'PAID', status: payment.status });
    }

    const isValid = paymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (isValid) {
      const paidPayment = await prisma.$transaction(async (tx) => {
        const updatedPayment = await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'PAID',
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
          }
        });

        if (updatedPayment.type !== 'CONSULTATION' || !updatedPayment.doctorId) {
          return { payment: updatedPayment, inquiry: null, patient: null };
        }

        const [doctor, patient] = await Promise.all([
          tx.doctor.findUnique({ where: { id: updatedPayment.doctorId } }),
          tx.patient.findUnique({ where: { id: updatedPayment.patientId } })
        ]);
        if (!doctor || !patient) {
          throw new Error('Doctor or patient record not found for consultation payment');
        }

        const inquiry = await tx.inquiry.create({
          data: {
            patientId: patient.id,
            doctorId: doctor.id,
            doctorName: doctor.name,
            procedure: `Consultation with ${doctor.name} (${doctor.specialty})`,
            notes: `Consultation fee: ₹${(updatedPayment.amount / 100).toLocaleString('en-IN')}. Patient: ${patient.fullName} (${patient.phone})`,
            status: 'New',
            notifyVia: ['EMAIL']
          },
          include: { patient: true }
        });

        const paymentWithInquiry = await tx.payment.update({
          where: { id: updatedPayment.id },
          data: { inquiryId: inquiry.id }
        });

        return { payment: paymentWithInquiry, inquiry, patient };
      });

      await auditService.logEvent({
        action: 'PAYMENT_VERIFIED',
        entityType: 'Payment',
        entityId: payment.id,
        userId: patientId,
        userRole: 'PATIENT',
        status: 'SUCCESS',
        details: { razorpay_payment_id }
      });

      if (paidPayment.inquiry && paidPayment.patient) {
        communicationService.dispatchBookingNotification({
          inquiry: paidPayment.inquiry,
          patient: paidPayment.patient,
          notifyVia: paidPayment.inquiry.notifyVia
        }).catch(err => {
          console.error('[PAYMENT BOOKING DISPATCH ERROR]', err);
        });
      }

      res.json({ success: true, inquiryId: paidPayment.inquiry?.id });
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });

      await auditService.logEvent({
        action: 'PAYMENT_VERIFICATION_FAILED',
        entityType: 'Payment',
        entityId: payment.id,
        userId: patientId,
        userRole: 'PATIENT',
        ipAddress: getClientIp(req),
        userAgent: getClientUserAgent(req),
        status: 'FAILURE',
        details: { reason: 'Invalid signature', razorpay_payment_id }
      });

      res.status(400).json({ success: false, error: 'Payment signature verification failed' });
    }

  } catch (err: any) {
    console.error('Verify Payment Error:', err);
    res.status(500).json({ error: 'Internal server error during verification' });
  }
});

export default router;

