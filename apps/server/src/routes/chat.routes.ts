import { Router, Request, Response } from 'express';
import { aiProviderService } from '../services/aiProvider.service';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { messages = [], query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const reply = await aiProviderService.handleChat(messages, query);
  res.json({ reply });
});

export default router;

