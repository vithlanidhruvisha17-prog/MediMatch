import { Router, Request, Response } from 'express';
import { storageService } from '../services/storage.service';
import { requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAdmin, async (req: Request, res: Response) => {
  const config = await storageService.getAIConfig();
  const { apiKeyEnc, ...safeConfig } = config;
  res.json(safeConfig);
});

router.put('/', requireAdmin, async (req: Request, res: Response) => {
  const { provider, apiKey, modelName, systemPrompt } = req.body;
  const updated = await storageService.updateAIConfig({
    provider,
    apiKey,
    modelName,
    systemPrompt
  });
  const { apiKeyEnc, ...safeConfig } = updated;
  res.json(safeConfig);
});

export default router;

