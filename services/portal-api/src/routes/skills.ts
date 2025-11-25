import { Router } from 'express';
import { z } from 'zod';
import { dataStore } from '../store/dataStore';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import type { SkillFilters, RefreshRequest, Task } from '@ob-digital-portal/shared';

const router = Router();

router.use(authenticateToken);

router.get('/skills', (req, res) => {
  try {
    let skills = dataStore.getSkills();

    const filters: SkillFilters = {
      category: req.query.category as string,
      level: req.query.level as string,
      search: req.query.search as string,
    };

    if (filters.category) {
      skills = skills.filter((s) => s.category === filters.category);
    }

    if (filters.level) {
      skills = skills.filter((s) => s.level === filters.level);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      skills = skills.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.category.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: skills,
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/certifications', (req, res) => {
  try {
    let certifications = dataStore.getCertifications();

    const status = req.query.status as string;
    if (status) {
      certifications = certifications.filter((c) => c.status === status);
    }

    res.json({
      success: true,
      data: certifications,
    });
  } catch (error) {
    console.error('Error fetching certifications:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

const refreshRequestSchema = z.object({
  type: z.enum(['skill', 'certification']),
  targetId: z.string(),
  notes: z.string().optional(),
});

router.post('/refresh-request', requireRole('sales', 'integration', 'partner'), (req: AuthRequest, res) => {
  try {
    const validation = refreshRequestSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
      return;
    }

    const { type, targetId, notes } = validation.data;

    let targetName = '';
    if (type === 'skill') {
      const skill = dataStore.getSkillById(targetId);
      if (!skill) {
        res.status(404).json({ success: false, error: 'Skill not found' });
        return;
      }
      targetName = skill.name;
    } else {
      const cert = dataStore.getCertificationById(targetId);
      if (!cert) {
        res.status(404).json({ success: false, error: 'Certification not found' });
        return;
      }
      targetName = cert.name;
    }

    const refreshRequest: RefreshRequest = {
      id: `refresh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      targetId,
      targetName,
      requestedBy: req.user!.username,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      notes,
    };

    dataStore.addRefreshRequest(refreshRequest);

    // Also create a task
    const task: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `Quarterly refresh: ${targetName}`,
      type: 'refresh',
      description: `Refresh request for ${type}: ${targetName}`,
      status: 'pending',
      priority: 'medium',
      createdBy: req.user!.username,
      createdAt: new Date().toISOString(),
    };

    dataStore.addTask(task);

    res.json({
      success: true,
      data: refreshRequest,
      message: 'Refresh request created successfully',
    });
  } catch (error) {
    console.error('Error creating refresh request:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/refresh-requests', (req, res) => {
  try {
    const requests = dataStore.getRefreshRequests();

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error('Error fetching refresh requests:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
