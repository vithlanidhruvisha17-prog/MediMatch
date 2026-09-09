import { Router, Request, Response } from 'express';
import { aiProviderService } from '../services/aiProvider.service';
import { requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/sandbox', requireAdmin, async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const result = await aiProviderService.executeSandboxTest(query);
  res.json(result);
});

export default router;

