import { Router, Response } from 'express';
import { auditService } from '../services/audit.service';
import { requireAdmin, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// GET /api/audit-logs - Query paginated audit trail (Admin only)
router.get('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { limit, offset, action, status, userRole, search } = req.query;

    const results = await auditService.getLogs({
      limit: limit ? parseInt(limit as string, 10) : 50,
      offset: offset ? parseInt(offset as string, 10) : 0,
      action: action as string,
      status: status as string,
      userRole: userRole as string,
      search: search as string
    });

    return res.json(results);
  } catch (err: any) {
    console.error('Failed to retrieve audit logs:', err);
    return res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

export default router;
