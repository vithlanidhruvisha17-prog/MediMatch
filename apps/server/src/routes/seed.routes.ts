import { Router, Request, Response } from 'express';
import { storageService } from '../services/storage.service';
import { checkPrismaConnection, prisma } from '../lib/prisma';
import { requireAdmin } from '../middleware/auth.middleware';
import bcrypt from 'bcryptjs';

const router = Router();

router.get('/stats', async (req: Request, res: Response) => {
  const stats = await storageService.getStats();
  const isPostgresLive = await checkPrismaConnection();
  res.json({
    ...stats,
    databaseStatus: isPostgresLive ? 'PostgreSQL (Supabase Connected)' : 'Database Disconnected',
    isPostgresLive
  });
});

router.post('/trigger', requireAdmin, async (req: Request, res: Response) => {
  const logs: string[] = [];
  logs.push(`[${new Date().toISOString()}] Initiating MediMatch database seeding routine...`);

  const isPostgresLive = await checkPrismaConnection();
  if (!isPostgresLive || !prisma) {
    return res.status(503).json({ error: 'PostgreSQL database is not connected via Prisma.' });
  }

  logs.push(`[${new Date().toISOString()}] Connected to PostgreSQL database via Prisma.`);
  try {
    // Upsert default admin
    const adminHash = bcrypt.hashSync('admin123', 10);
    await prisma.adminUser.upsert({
      where: { email: 'admin@medimatch.health' },
      update: { passwordHash: adminHash },
      create: { email: 'admin@medimatch.health', passwordHash: adminHash }
    });
    logs.push(`[${new Date().toISOString()}] Seeded Admin user: admin@medimatch.health`);

    // Reset and seed catalog + demo data via transaction
    const counts = await storageService.resetAndSeed();
    logs.push(`[${new Date().toISOString()}] Successfully seeded ${counts.hospitalsCount} hospitals in catalog.`);
    logs.push(`[${new Date().toISOString()}] Successfully seeded ${counts.doctorsCount} specialist doctors in catalog.`);
    logs.push(`[${new Date().toISOString()}] Initialized demo patient assessments (${counts.assessmentsCount}) and inquiries (${counts.inquiriesCount}).`);
    logs.push(`[${new Date().toISOString()}] Seeding routine completed successfully in PostgreSQL.`);

    res.json({
      success: true,
      counts,
      logs
    });
  } catch (err: any) {
    logs.push(`[${new Date().toISOString()}] Error during PostgreSQL seeding: ${err?.message || err}`);
    res.status(500).json({ success: false, error: err?.message || err, logs });
  }
});

export default router;

