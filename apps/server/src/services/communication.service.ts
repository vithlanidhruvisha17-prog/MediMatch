import { Resend } from 'resend';
import { ENV } from '../config/env';
import { auditService } from './audit.service';
import { prisma } from '../lib/prisma';

export interface DispatchBookingPayload {
  inquiry: {
    id: string;
    hospitalId?: string | null;
    hospitalName?: string | null;
    doctorId?: string | null;
    doctorName?: string | null;
    procedure: string;
    notes?: string | null;
    status: string;
    createdAt: Date | string;
  };
  patient: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    city?: string | null;
    age?: number | null;
    budgetCap?: number | null;
  };
  notifyVia?: string[];
}

class CommunicationService {
  private emailClient: any = null;
  private isEmailConfigured: boolean = false;

  constructor() {
    this.initEmailClient();
  }

  private initEmailClient() {
    if (ENV.RESEND_API_KEY) {
      this.emailClient = new Resend(ENV.RESEND_API_KEY);
      this.isEmailConfigured = true;
      console.log('[COMMUNICATION] Resend client initialized');
    } else {
      console.log('[COMMUNICATION] DEV MODE — Resend API key missing, email will not be sent');
    }
  }

  private async sendEmail(to: string, subject: string, html: string, text: string) {
    if (!this.isEmailConfigured) {
      console.log(`[DEV MODE — no real email sent, would have sent to ${to} with subject "${subject}"]`);
      return false;
    }
    try {
      const response = await this.emailClient.emails.send({
        from: ENV.EMAIL_FROM,
        to,
        subject,
        html,
        text,
      });
      if (response?.error) {
        console.error(`[COMMUNICATION EMAIL ERROR to ${to}]:`, response.error.message || response.error);
        if (response.error.message?.includes('You can only send testing emails to your own email address')) {
          console.warn(`[COMMUNICATION NOTICE] Resend trial accounts can only deliver to your registered email (vithlanidhruvisha17@gmail.com). To send to "${to}", verify your domain at resend.com/domains.`);
        }
        return false;
      }
      return true;
    } catch (err) {
      console.error('[COMMUNICATION EMAIL ERROR]', err);
      return false;
    }
  }

  /**
   * Dispatch real-world booking notification via selected channels
   */
  async dispatchBookingNotification(payload: DispatchBookingPayload): Promise<{
    emailSent: boolean;
  }> {
    const { inquiry, patient, notifyVia = ['EMAIL'] } = payload;
    const bookingRef = inquiry.id;
    const targetHospital = inquiry.hospitalName || (inquiry.doctorName ? `Dr. Consultation (${inquiry.doctorName})` : 'Top MediMatch Partner Hospital');
    const dateFormatted = new Date(inquiry.createdAt).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // Email templates
    const patientHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0284c7; margin: 0; font-size: 24px;">MediMatch Health</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Smart Healthcare Matching & Booking Confirmation</p>
        </div>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h2 style="color: #166534; margin: 0 0 8px 0; font-size: 18px;">✓ Booking Request Received</h2>
          <p style="color: #15803d; margin: 0; font-size: 14px;">
            Dear <strong>${patient.fullName}</strong>, your hospital care inquiry has been securely registered.
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Reference ID</td>
            <td style="padding: 10px 0; font-weight: bold; color: #1e293b; font-size: 14px; text-align: right;"><code>${bookingRef}</code></td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Hospital / Provider</td>
            <td style="padding: 10px 0; font-weight: bold; color: #0284c7; font-size: 14px; text-align: right;">${targetHospital}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Requested Procedure</td>
            <td style="padding: 10px 0; font-weight: bold; color: #1e293b; font-size: 14px; text-align: right;">${inquiry.procedure}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Status</td>
            <td style="padding: 10px 0; font-weight: bold; color: #d97706; font-size: 14px; text-align: right;">Pending Hospital Coordination</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Booking Time</td>
            <td style="padding: 10px 0; color: #475569; font-size: 14px; text-align: right;">${dateFormatted} IST</td>
          </tr>
        </table>

        <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 8px 0; color: #334155; font-size: 15px;">What Happens Next?</h3>
          <ol style="margin: 0; padding-left: 20px; color: #475569; font-size: 13px; line-height: 1.6;">
            <li>Our MediMatch Medical Care Coordinator reviews your clinical symptoms and hospital preference.</li>
            <li>The hospital admission coordinator will verify bed availability and doctor schedules.</li>
            <li>You will receive a phone call or WhatsApp message on <strong>${patient.phone}</strong> within 2 hours to confirm your appointment time.</li>
          </ol>
        </div>

        <div style="text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          Need immediate assistance? Call MediMatch 24/7 Helpline: <strong>+91 (022) 8000-MEDI</strong><br/>
          MediMatch Health Technologies &bull; Mumbai, India
        </div>
      </div>
    `;

    const coordinatorHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0;">
        <h2 style="color: #dc2626; margin-top: 0;">🚨 Urgent Patient Intake Dispatch</h2>
        <p>A patient has submitted a package booking on MediMatch:</p>
        <ul>
          <li><strong>Patient Name:</strong> ${patient.fullName}</li>
          <li><strong>Contact Phone:</strong> ${patient.phone}</li>
          <li><strong>Email:</strong> ${patient.email}</li>
          <li><strong>City:</strong> ${patient.city || 'Not specified'}</li>
          <li><strong>Target Hospital:</strong> ${targetHospital}</li>
          <li><strong>Procedure:</strong> ${inquiry.procedure}</li>
          <li><strong>Patient Notes / Budget:</strong> ${inquiry.notes || 'None'}</li>
          <li><strong>Inquiry Ref:</strong> ${bookingRef}</li>
          <li><strong>Timestamp:</strong> ${dateFormatted} IST</li>
        </ul>
        <!-- Localhost link: http://localhost:5173/admin/login -->
        <p>Please log in to the <a href="https://medimatch-nrzs.onrender.com/admin/login">MediMatch Admin Portal</a> to process and update this inquiry.</p>
      </div>
    `;

    let emailSent = false;
    let coordinatorEmailSent = false;
    let providerNotified = false;
    let providerContactEmail: string | null = null;
    let providerType: 'hospital' | 'doctor' | null = null;
    let dispatchError: string | null = null;

    try {
      // Send patient confirmation email
      if (notifyVia.includes('EMAIL')) {
        emailSent = await this.sendEmail(
          patient.email,
          `MediMatch Booking Confirmation: ${targetHospital} [Ref: ${bookingRef}]`,
          patientHtml,
          `Dear ${patient.fullName},\n\nYour booking request for ${targetHospital} has been received. Reference ID: ${bookingRef}.\nOur coordinator will call you at ${patient.phone} shortly.`
        );
      }

      // Send coordinator email
      if (notifyVia.includes('EMAIL') && ENV.ADMIN_NOTIFICATION_EMAIL) {
        coordinatorEmailSent = await this.sendEmail(
          ENV.ADMIN_NOTIFICATION_EMAIL,
          `🚨 New Patient Intake: ${patient.fullName} → ${targetHospital} [Ref: ${bookingRef}]`,
          coordinatorHtml,
          `Urgent: New booking from ${patient.fullName} (${patient.phone}) for ${targetHospital}. Procedure: ${inquiry.procedure}. Ref: ${bookingRef}`
        );
      }

      // Look up hospital/doctor contactEmail and send provider notification
      if (inquiry.hospitalId) {
        const hospital = await prisma?.hospital.findUnique({ where: { id: inquiry.hospitalId }, select: { contactEmail: true } });
        providerContactEmail = hospital?.contactEmail || null;
        providerType = 'hospital';
      } else if (inquiry.doctorId) {
        const doctor = await prisma?.doctor.findUnique({ where: { id: inquiry.doctorId }, select: { contactEmail: true } });
        providerContactEmail = doctor?.contactEmail || null;
        providerType = 'doctor';
      }

      if (providerContactEmail) {
        const providerHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #0284c7; margin: 0; font-size: 24px;">MediMatch Health</h1>
              <p style="color: #64748b; font-size: 14px; margin-top: 4px;">New Patient Booking Notification</p>
            </div>

            <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <h2 style="color: #1e40af; margin: 0 0 8px 0; font-size: 18px;">📋 New Booking Request</h2>
              <p style="color: #1d4ed8; margin: 0; font-size: 14px;">
                A patient has booked through MediMatch and selected your facility.
              </p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Patient Name</td>
                <td style="padding: 10px 0; font-weight: bold; color: #1e293b; font-size: 14px; text-align: right;">${patient.fullName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Contact Phone</td>
                <td style="padding: 10px 0; font-weight: bold; color: #1e293b; font-size: 14px; text-align: right;">${patient.phone}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Patient Email</td>
                <td style="padding: 10px 0; color: #1e293b; font-size: 14px; text-align: right;">${patient.email}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Procedure</td>
                <td style="padding: 10px 0; font-weight: bold; color: #1e293b; font-size: 14px; text-align: right;">${inquiry.procedure}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Notes / Budget</td>
                <td style="padding: 10px 0; color: #475569; font-size: 14px; text-align: right;">${inquiry.notes || 'None'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Booking Reference</td>
                <td style="padding: 10px 0; font-weight: bold; color: #0284c7; font-size: 14px; text-align: right;"><code>${bookingRef}</code></td>
              </tr>
            </table>

            <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0; color: #475569; font-size: 13px;">
                Please coordinate with the patient at the earliest. For questions, contact MediMatch at <strong>+91 (022) 8000-MEDI</strong>.
              </p>
            </div>

            <div style="text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px;">
              MediMatch Health Technologies &bull; Mumbai, India
            </div>
          </div>
        `;
        providerNotified = await this.sendEmail(
          providerContactEmail,
          `MediMatch: New Patient Booking — ${patient.fullName} [Ref: ${bookingRef}]`,
          providerHtml,
          `New booking on MediMatch.\nPatient: ${patient.fullName}\nPhone: ${patient.phone}\nEmail: ${patient.email}\nProcedure: ${inquiry.procedure}\nNotes: ${inquiry.notes || 'None'}\nRef: ${bookingRef}`
        );
        if (providerNotified) {
          console.log(`[COMMUNICATION] Provider notification sent successfully to ${providerContactEmail}`);
        } else {
          console.warn(`[COMMUNICATION] Provider notification could not be delivered to ${providerContactEmail}`);
        }
      } else {
        const providerLabel = providerType === 'hospital' ? (targetHospital || 'unknown hospital') : 'unknown provider';
        console.log(`[COMMUNICATION] No contact email on file for ${providerLabel}, skipped direct notification`);
      }
    } catch (err: any) {
      dispatchError = err?.message || String(err);
      console.error('[COMMUNICATION ERROR] Dispatch failed:', dispatchError);
    }

    // Log the real-world communication dispatch event into AuditLog
    await auditService.logEvent({
      action: 'COMMUNICATION_DISPATCHED',
      entityType: 'Inquiry',
      entityId: inquiry.id,
      userId: patient.id,
      userEmail: patient.email,
      userRole: 'PATIENT',
      status: emailSent ? 'SUCCESS' : 'FAILURE',
      details: {
        channels: notifyVia,
        emailSent,
        coordinatorEmailSent,
        recipientEmail: patient.email,
        coordinatorEmail: ENV.ADMIN_NOTIFICATION_EMAIL,
        hospital: targetHospital,
        bookingRef,
        isEmailConfigured: this.isEmailConfigured,
        hospitalNotified: (providerType as string) === 'hospital' ? providerNotified : undefined,
        doctorNotified: (providerType as string) === 'doctor' ? providerNotified : undefined,
        providerContactEmail: providerContactEmail || undefined,
        dispatchError
      },
    });

    console.log(`[REAL COMMUNICATION] Dispatched confirmation for patient ${patient.fullName} (${patient.email}) -> Hospital: ${targetHospital}`);

    return { emailSent };
  }
}

export const communicationService = new CommunicationService();