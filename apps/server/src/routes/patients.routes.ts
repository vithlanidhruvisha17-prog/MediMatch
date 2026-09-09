import { Router, Response } from 'express';
import { storageService } from '../services/storage.service';
import { requireAdmin, requirePatient, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// GET /api/patients/me - Retrieve current patient's profile
router.get('/me', requirePatient, async (req: AuthRequest, res: Response) => {
  try {
    const patient = await storageService.getPatientById(req.user!.id);
    if (!patient) return res.status(404).json({ error: 'Patient profile not found' });
    res.json(patient);
  } catch (err: any) {
    console.error('Error fetching patient profile:', err);
    res.status(500).json({ error: 'Failed to retrieve patient profile' });
  }
});

// PATCH /api/patients/me - Update current patient's profile details
router.patch('/me', requirePatient, async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, phone, age, gender, city, budgetCap } = req.body;
    const updated = await storageService.updatePatient(req.user!.id, {
      fullName,
      phone,
      age: age !== undefined ? Number(age) : undefined,
      gender,
      city,
      budgetCap: budgetCap !== undefined ? Number(budgetCap) : undefined
    });
    if (!updated) return res.status(404).json({ error: 'Patient profile not found' });
    res.json(updated);
  } catch (err: any) {
    console.error('Error updating patient profile:', err);
    res.status(500).json({ error: 'Failed to update patient profile' });
  }
});

// GET /api/patients/me/assessments - Retrieve current patient's AI assessments
router.get('/me/assessments', requirePatient, async (req: AuthRequest, res: Response) => {
  try {
    const assessments = await storageService.getPatientAssessments(req.user!.id);
    res.json(assessments);
  } catch (err: any) {
    console.error('Error fetching patient assessments:', err);
    res.status(500).json({ error: 'Failed to retrieve assessments' });
  }
});

// GET /api/patients/me/inquiries - Retrieve current patient's inquiries & bookings
router.get('/me/inquiries', requirePatient, async (req: AuthRequest, res: Response) => {
  try {
    const inquiries = await storageService.getPatientInquiries(req.user!.id);
    res.json(inquiries);
  } catch (err: any) {
    console.error('Error fetching patient inquiries:', err);
    res.status(500).json({ error: 'Failed to retrieve inquiries' });
  }
});

// Admin-only routes
router.get('/', requireAdmin, async (_req: AuthRequest, res: Response) => {
  const patients = await storageService.getPatients();
  res.json(patients);
});

router.get('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  const patient = await storageService.getPatientById(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  res.json(patient);
});

export default router;

