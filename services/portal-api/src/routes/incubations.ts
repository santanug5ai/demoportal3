import { Router } from 'express';
import { z } from 'zod';
import { dataStore } from '../store/dataStore';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import type { IncubationRequest, StatusChange, IncubationMetrics } from '@ob-digital-portal/shared';

const router = Router();

router.use(authenticateToken);

const createIncubationSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  region: z.string().min(1),
  techStack: z.array(z.string()),
  businessValue: z.string().min(1),
  estimatedCost: z.number().optional(),
});

router.post('/', requireRole('sales', 'integration', 'partner'), (req: AuthRequest, res) => {
  try {
    const validation = createIncubationSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
      return;
    }

    const data = validation.data;
    const now = new Date().toISOString();

    const incubation: IncubationRequest = {
      id: `incub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      submittedBy: req.user!.username,
      submittedAt: now,
      status: 'requested',
      labAssets: [],
      timeline: {
        requestedDate: now,
      },
      statusHistory: [],
    };

    dataStore.addIncubationRequest(incubation);

    res.json({
      success: true,
      data: incubation,
      message: 'Incubation request created successfully',
    });
  } catch (error) {
    console.error('Error creating incubation:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/', (req, res) => {
  try {
    let incubations = dataStore.getIncubationRequests();

    const status = req.query.status as string;
    const region = req.query.region as string;

    if (status) {
      incubations = incubations.filter((i) => i.status === status);
    }

    if (region) {
      incubations = incubations.filter((i) => i.region === region);
    }

    res.json({
      success: true,
      data: incubations,
    });
  } catch (error) {
    console.error('Error fetching incubations:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/metrics', (req, res) => {
  try {
    const incubations = dataStore.getIncubationRequests();

    const statusBreakdown: Record<string, number> = {};
    incubations.forEach((i) => {
      statusBreakdown[i.status] = (statusBreakdown[i.status] || 0) + 1;
    });

    const readyCount = incubations.filter((i) => i.status === 'ready').length;
    const conversionRate = incubations.length > 0 ? readyCount / incubations.length : 0;

    const readyIncubations = incubations.filter(
      (i) => i.status === 'ready' && i.timeline.readyDate && i.timeline.requestedDate
    );

    let averageTimeToReady = 0;
    if (readyIncubations.length > 0) {
      const totalTime = readyIncubations.reduce((sum, i) => {
        const start = new Date(i.timeline.requestedDate).getTime();
        const end = new Date(i.timeline.readyDate!).getTime();
        return sum + (end - start);
      }, 0);
      averageTimeToReady = totalTime / readyIncubations.length / (1000 * 60 * 60 * 24); // Convert to days
    }

    const metrics: IncubationMetrics = {
      totalRequests: incubations.length,
      conversionRate,
      averageTimeToReady,
      statusBreakdown,
    };

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error fetching incubation metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const incubation = dataStore.getIncubationRequestById(req.params.id);

    if (!incubation) {
      res.status(404).json({
        success: false,
        error: 'Incubation not found',
      });
      return;
    }

    res.json({
      success: true,
      data: incubation,
    });
  } catch (error) {
    console.error('Error fetching incubation:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

const updateIncubationSchema = z.object({
  status: z.enum(['requested', 'design', 'poc', 'offerize', 'ready', 'rejected']).optional(),
  labAssets: z.array(z.string()).optional(),
  actualCost: z.number().optional(),
  notes: z.string().optional(),
});

router.patch('/:id', requireRole('integration', 'partner'), (req: AuthRequest, res) => {
  try {
    const validation = updateIncubationSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
      return;
    }

    const incubation = dataStore.getIncubationRequestById(req.params.id);
    if (!incubation) {
      res.status(404).json({
        success: false,
        error: 'Incubation not found',
      });
      return;
    }

    const updates: any = { ...validation.data };

    if (updates.status && updates.status !== incubation.status) {
      const statusChange: StatusChange = {
        from: incubation.status,
        to: updates.status,
        timestamp: new Date().toISOString(),
        changedBy: req.user!.username,
        notes: updates.notes,
      };

      incubation.statusHistory.push(statusChange);
      updates.statusHistory = incubation.statusHistory;

      // Update timeline based on status
      const timeline = { ...incubation.timeline };
      const now = new Date().toISOString();

      if (updates.status === 'design' && !timeline.designStartDate) {
        timeline.designStartDate = now;
      } else if (updates.status === 'poc' && !timeline.pocStartDate) {
        timeline.pocStartDate = now;
      } else if (updates.status === 'offerize' && !timeline.offerizeDate) {
        timeline.offerizeDate = now;
      } else if (updates.status === 'ready' && !timeline.readyDate) {
        timeline.readyDate = now;
      }

      updates.timeline = timeline;
    }

    const updated = dataStore.updateIncubationRequest(req.params.id, updates);

    res.json({
      success: true,
      data: updated,
      message: 'Incubation updated successfully',
    });
  } catch (error) {
    console.error('Error updating incubation:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
