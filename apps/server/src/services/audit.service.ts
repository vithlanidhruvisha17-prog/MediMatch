import { prisma } from '../lib/prisma';

export interface AuditEventPayload {
  action: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: 'SUCCESS' | 'FAILURE' | 'WARNING';
  details?: any;
}

export interface GetAuditLogsParams {
  limit?: number;
  offset?: number;
  action?: string;
  status?: string;
  userRole?: string;
  search?: string;
}

class AuditService {
  /**
   * Log an audit event asynchronously into PostgreSQL.
   * Resilient execution: Never throws to prevent disrupting main request flow.
   */
  async logEvent(payload: AuditEventPayload): Promise<void> {
    try {
      const detailsStr = payload.details
        ? (typeof payload.details === 'string' ? payload.details : JSON.stringify(payload.details))
        : null;

      if (!prisma) {
        console.warn('[AUDIT FALLBACK] Prisma not available. Audit log not persisted:', payload.action);
        return;
      }

      await prisma.auditLog.create({
        data: {
          action: payload.action,
          entityType: payload.entityType || null,
          entityId: payload.entityId || null,
          userId: payload.userId || null,
          userEmail: payload.userEmail || null,
          userRole: payload.userRole || 'ANONYMOUS',
          ipAddress: payload.ipAddress || null,
          userAgent: payload.userAgent ? payload.userAgent.substring(0, 255) : null,
          status: payload.status || 'SUCCESS',
          details: detailsStr
        }
      });
    } catch (err: any) {
      console.error('[AUDIT LOG ERROR] Failed to record audit event:', err?.message || err);
    }
  }

  /**
   * Query paginated audit logs for Admin inspection.
   */
  async getLogs(params: GetAuditLogsParams = {}) {
    const limit = Math.min(Math.max(params.limit || 50, 1), 200);
    const offset = Math.max(params.offset || 0, 0);

    const where: any = {};
    if (params.action && params.action !== 'ALL') {
      where.action = params.action;
    }
    if (params.status && params.status !== 'ALL') {
      where.status = params.status;
    }
    if (params.userRole && params.userRole !== 'ALL') {
      where.userRole = params.userRole;
    }
    if (params.search && params.search.trim()) {
      const s = params.search.trim();
      where.OR = [
        { userEmail: { contains: s, mode: 'insensitive' } },
        { action: { contains: s, mode: 'insensitive' } },
        { entityType: { contains: s, mode: 'insensitive' } },
        { details: { contains: s, mode: 'insensitive' } },
        { ipAddress: { contains: s, mode: 'insensitive' } }
      ];
    }

    if (!prisma) {
      return { logs: [], total: 0, limit, offset };
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      logs,
      total,
      limit,
      offset,
      totalPages: Math.ceil(total / limit)
    };
  }
}

export const auditService = new AuditService();
