import { Router, Request, Response } from 'express';
import { storageService } from '../services/storage.service';
import { requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { specialty, search } = req.query;
  const doctors = await storageService.getDoctors({
    specialty: specialty as string,
    search: search as string
  });
  res.json(doctors);
});

router.get('/:id', async (req: Request, res: Response) => {
  const doctor = await storageService.getDoctorById(req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  res.json(doctor);
});

router.post('/', requireAdmin, async (req: Request, res: Response) => {
  const { name, specialty, credentials, yearsExp, fee, photoUrl, contactEmail } = req.body;
  if (!name || !specialty || !credentials) {
    return res.status(400).json({ error: 'Name, specialty, and credentials are required' });
  }
  const doctor = await storageService.createDoctor({
    name,
    specialty,
    credentials,
    yearsExp: Number(yearsExp) || 10,
    fee: Number(fee) || 1000,
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
    contactEmail: contactEmail || null
  });
  res.status(201).json(doctor);
});

router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  const doctor = await storageService.updateDoctor(req.params.id, req.body);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  res.json(doctor);
});

router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  const success = await storageService.deleteDoctor(req.params.id);
  if (!success) return res.status(404).json({ error: 'Doctor not found' });
  res.json({ message: 'Doctor deleted successfully' });
});

export default router;

