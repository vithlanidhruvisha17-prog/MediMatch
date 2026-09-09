import { Router, Request, Response } from 'express';
import { storageService } from '../services/storage.service';
import { requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { city, search, accreditation } = req.query;
  const hospitals = await storageService.getHospitals({
    city: city as string,
    search: search as string,
    accreditation: accreditation as string
  });
  res.json(hospitals);
});

router.get('/:id', async (req: Request, res: Response) => {
  const hospital = await storageService.getHospitalById(req.params.id);
  if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
  res.json(hospital);
});

router.post('/', requireAdmin, async (req: Request, res: Response) => {
  const { name, city, accreditation, address, beds, icuBeds, imageUrl, contactEmail } = req.body;
  if (!name || !city || !address) {
    return res.status(400).json({ error: 'Name, city, and address are required' });
  }
  const hospital = await storageService.createHospital({
    name,
    city,
    accreditation: accreditation || 'NABH Accredited',
    address,
    beds: Number(beds) || 100,
    icuBeds: Number(icuBeds) || 20,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800',
    contactEmail: contactEmail || null
  });
  res.status(201).json(hospital);
});

router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  const hospital = await storageService.updateHospital(req.params.id, req.body);
  if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
  res.json(hospital);
});

router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  const success = await storageService.deleteHospital(req.params.id);
  if (!success) return res.status(404).json({ error: 'Hospital not found' });
  res.json({ message: 'Hospital deleted successfully' });
});

export default router;

