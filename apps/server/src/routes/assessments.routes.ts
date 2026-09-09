import { Router, Response } from 'express';
import { storageService } from '../services/storage.service';
import { aiProviderService } from '../services/aiProvider.service';
import { matchingService } from '../services/matching.service';
import { requirePatient, requireAdmin, requireAuth, AuthRequest } from '../middleware/auth.middleware';
import { CreateAssessmentPayload, validateClinicalInput } from '@medimatch/shared';

const router = Router();

// POST /api/assessments - Mandatory patient authentication
router.post('/', requirePatient, async (req: AuthRequest, res: Response) => {
  try {
    const payload: CreateAssessmentPayload = req.body;

    const validation = validateClinicalInput(payload.illnessText, payload.symptoms);
    if (!validation.isValid) {
      return res.status(400).json({
        error: validation.reason || 'Insufficient clinical details provided. Please describe your symptoms or pain in detail (minimum 15 characters).'
      });
    }

    const patientId = req.user!.id;
    let patient = await storageService.getPatientById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Authenticated patient account not found' });
    }

    // Sync any updated demographic / budget adjustments from the wizard
    const updatedPatient = await storageService.updatePatient(patientId, {
      phone: payload.phone || patient.phone,
      age: payload.age ? Number(payload.age) : (patient.age ?? 45),
      gender: payload.gender || patient.gender || 'Not Specified',
      city: payload.city || patient.city || 'Mumbai',
      budgetCap: payload.budgetCap ? Number(payload.budgetCap) : patient.budgetCap
    });
    if (updatedPatient) {
      patient = updatedPatient;
    }

    // 1. AI Prediction
    const aiPrediction = await aiProviderService.predictDiagnosis({
      ...payload,
      fullName: patient.fullName,
      email: patient.email,
      phone: patient.phone,
      city: patient.city,
      budgetCap: patient.budgetCap
    });

    // 2. Hospital & Cost Matching under Patient's Budget Cap
    const matchingHospitals = await matchingService.matchHospitals(
      patient.city || 'Mumbai',
      aiPrediction.predictedSurgery,
      patient.budgetCap
    );

    // 3. Specialist Recommendation
    const recommendedDoctors = await matchingService.matchDoctors(aiPrediction.specialty);

    // 4. Store Assessment linked to the authenticated patient
    const assessment = await storageService.createAssessment({
      patientId: patient.id,
      illnessText: payload.illnessText,
      conditionKey: payload.conditionKey || null,
      conditionDetail: payload.conditionDetail || null,
      durationBucket: payload.durationBucket || '1-4 weeks',
      severity: Number(payload.severity) || 5,
      symptoms: payload.symptoms || [],
      preExisting: payload.preExisting || [],
      medicalHistoryText: payload.medicalHistoryText || null,
      aiPredictedSurgery: aiPrediction.predictedSurgery,
      aiPriority: aiPrediction.priority,
      aiSummary: aiPrediction.summary,
      status: 'Assessed & Predicted'
    });

    res.status(201).json({
      patient,
      assessment,
      aiPrediction,
      matchingHospitals,
      recommendedDoctors
    });
  } catch (err: any) {
    console.error('Assessment submission error:', err);
    res.status(500).json({ error: err.message || 'Failed to process assessment' });
  }
});

// Admin-only listing of all assessments
router.get('/', requireAdmin, async (_req: AuthRequest, res: Response) => {
  const assessments = await storageService.getAssessments();
  res.json(assessments);
});

// Get assessment by ID (Admin or owning Patient)
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const assessment = await storageService.getAssessmentById(req.params.id);
  if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

  // If not admin, ensure current user owns this assessment
  if (req.user?.role !== 'ADMIN' && assessment.patientId !== req.user?.id) {
    return res.status(403).json({ error: 'Forbidden: Access denied' });
  }

  res.json(assessment);
});

export default router;

