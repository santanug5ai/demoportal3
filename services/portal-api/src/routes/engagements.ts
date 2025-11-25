import { Router } from 'express';
import { z } from 'zod';
import { dataStore } from '../store/dataStore';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import type { EngagementRequest, AuditEntry } from '@ob-digital-portal/shared';

const router = Router();

router.use(authenticateToken);

const createEngagementSchema = z.object({
  requestType: z.enum(['sme', 'consultant', 'professional']),
  title: z.string().min(1),
  description: z.string().min(1),
  requiredSkills: z.array(z.string()),
  region: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  estimatedHours: z.number().optional(),
});

// Partner SPOC mapping by region
const PARTNER_SPOCS: Record<string, string> = {
  'North America': 'John Anderson',
  'Europe': 'Sarah Chen',
  'APAC': 'Michael Rodriguez',
  'LATAM': 'Emily Watson',
};

// SLA timers (in hours) by priority
const SLA_HOURS: Record<string, number> = {
  low: 168, // 1 week
  medium: 72, // 3 days
  high: 24, // 1 day
  critical: 4, // 4 hours
};

function simulateAutoRouting(engagement: EngagementRequest): void {
  // Simulate routing delay (1-3 seconds)
  const routingDelay = 1000 + Math.random() * 2000;

  setTimeout(() => {
    const spoc = PARTNER_SPOCS[engagement.region] || 'Default SPOC';

    const auditEntry: AuditEntry = {
      timestamp: new Date().toISOString(),
      action: 'assigned',
      user: 'system',
      details: `Auto-assigned to ${spoc} based on region and skills`,
    };

    engagement.auditTrail.push(auditEntry);
    engagement.status = 'assigned';
    engagement.assignedSpoc = spoc;
    engagement.assignedAt = new Date().toISOString();

    dataStore.updateEngagementRequest(engagement.id, {
      status: 'assigned',
      assignedSpoc: spoc,
      assignedAt: engagement.assignedAt,
      auditTrail: engagement.auditTrail,
    });

    console.log(`✅ Auto-routed engagement ${engagement.id} to ${spoc}`);
  }, routingDelay);
}

router.post('/', requireRole('sales', 'integration', 'partner'), (req: AuthRequest, res) => {
  try {
    const validation = createEngagementSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
      return;
    }

    const data = validation.data;
    const now = new Date().toISOString();

    const slaHours = SLA_HOURS[data.priority];
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();

    const engagement: EngagementRequest = {
      id: `eng-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      requestedBy: req.user!.username,
      requestedAt: now,
      status: 'submitted',
      slaDeadline,
      auditTrail: [
        {
          timestamp: now,
          action: 'created',
          user: req.user!.username,
          details: 'Engagement request submitted',
        },
      ],
    };

    dataStore.addEngagementRequest(engagement);

    // Add routing audit entry and trigger auto-routing
    const routingEntry: AuditEntry = {
      timestamp: new Date().toISOString(),
      action: 'routing',
      user: 'system',
      details: 'Auto-routing based on region and skills',
    };
    engagement.auditTrail.push(routingEntry);
    engagement.status = 'routing';

    dataStore.updateEngagementRequest(engagement.id, {
      status: 'routing',
      auditTrail: engagement.auditTrail,
    });

    // Trigger auto-routing simulation
    simulateAutoRouting(engagement);

    res.json({
      success: true,
      data: engagement,
      message: 'Engagement request created and routing in progress',
    });
  } catch (error) {
    console.error('Error creating engagement:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/', (req, res) => {
  try {
    let engagements = dataStore.getEngagementRequests();

    const status = req.query.status as string;
    const region = req.query.region as string;

    if (status) {
      engagements = engagements.filter((e) => e.status === status);
    }

    if (region) {
      engagements = engagements.filter((e) => e.region === region);
    }

    res.json({
      success: true,
      data: engagements,
    });
  } catch (error) {
    console.error('Error fetching engagements:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const engagement = dataStore.getEngagementRequestById(req.params.id);

    if (!engagement) {
      res.status(404).json({
        success: false,
        error: 'Engagement not found',
      });
      return;
    }

    res.json({
      success: true,
      data: engagement,
    });
  } catch (error) {
    console.error('Error fetching engagement:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

const updateEngagementSchema = z.object({
  status: z.enum(['submitted', 'routing', 'assigned', 'in-progress', 'completed', 'cancelled']).optional(),
  actualHours: z.number().optional(),
  notes: z.string().optional(),
});

router.patch('/:id', requireRole('integration', 'partner'), (req: AuthRequest, res) => {
  try {
    const validation = updateEngagementSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
      return;
    }

    const engagement = dataStore.getEngagementRequestById(req.params.id);
    if (!engagement) {
      res.status(404).json({
        success: false,
        error: 'Engagement not found',
      });
      return;
    }

    const updates = validation.data;
    const updateData: any = { ...updates };

    if (updates.status && updates.status !== engagement.status) {
      const auditEntry: AuditEntry = {
        timestamp: new Date().toISOString(),
        action: 'status_change',
        user: req.user!.username,
        details: `Status changed from ${engagement.status} to ${updates.status}`,
      };

      engagement.auditTrail.push(auditEntry);
      updateData.auditTrail = engagement.auditTrail;
    }

    const updated = dataStore.updateEngagementRequest(req.params.id, updateData);

    res.json({
      success: true,
      data: updated,
      message: 'Engagement updated successfully',
    });
  } catch (error) {
    console.error('Error updating engagement:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
