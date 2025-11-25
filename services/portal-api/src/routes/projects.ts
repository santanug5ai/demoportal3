import { Router } from 'express';
import { dataStore } from '../store/dataStore';
import { authenticateToken } from '../middleware/auth';
import type { ProjectFilters, DashboardMetrics } from '@ob-digital-portal/shared';

const router = Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    let projects = dataStore.getProjects();

    const filters: ProjectFilters = {
      status: req.query.status as string,
      region: req.query.region as string,
      search: req.query.search as string,
    };

    if (filters.status) {
      projects = projects.filter((p) => p.status === filters.status);
    }

    if (filters.region) {
      projects = projects.filter((p) => p.region === filters.region);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.client.toLowerCase().includes(searchLower) ||
          p.projectManager.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/dashboard', (req, res) => {
  try {
    const projects = dataStore.getProjects();

    const activeProjects = projects.filter((p) => p.status === 'active');

    const projectsByRegion: Record<string, number> = {};
    const projectsByStatus: Record<string, number> = {};

    projects.forEach((p) => {
      projectsByRegion[p.region] = (projectsByRegion[p.region] || 0) + 1;
      projectsByStatus[p.status] = (projectsByStatus[p.status] || 0) + 1;
    });

    // Calculate average KPIs across active projects
    let avgUptime = 0;
    let avgIncidentResponse = 0;
    let avgFirstTimeAcceptance = 0;

    if (activeProjects.length > 0) {
      avgUptime =
        activeProjects.reduce((sum, p) => sum + p.kpis.uptimePercent, 0) / activeProjects.length;
      avgIncidentResponse =
        activeProjects.reduce((sum, p) => sum + p.kpis.incidentResponseTimeHours, 0) /
        activeProjects.length;
      avgFirstTimeAcceptance =
        activeProjects.reduce((sum, p) => sum + p.kpis.firstTimeAcceptanceRate, 0) /
        activeProjects.length;
    }

    const metrics: DashboardMetrics = {
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      averageUptime: avgUptime,
      averageIncidentResponse: avgIncidentResponse,
      averageFirstTimeAcceptance: avgFirstTimeAcceptance,
      projectsByRegion,
      projectsByStatus,
    };

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const project = dataStore.getProjectById(req.params.id);

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/:id/reports', (req, res) => {
  try {
    const project = dataStore.getProjectById(req.params.id);

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    res.json({
      success: true,
      data: project.reports,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Export projects to CSV format
router.get('/export/csv', (req, res) => {
  try {
    const projects = dataStore.getProjects();

    const csvHeader =
      'ID,Name,Client,Region,Status,Project Manager,Uptime %,Incident Response (hrs),ROT,First Time Acceptance,Change Failure Rate,Deployment Frequency,MTTR\n';

    const csvRows = projects
      .map((p) => {
        return [
          p.id,
          p.name,
          p.client,
          p.region,
          p.status,
          p.projectManager,
          p.kpis.uptimePercent,
          p.kpis.incidentResponseTimeHours,
          p.kpis.rot,
          p.kpis.firstTimeAcceptanceRate,
          p.kpis.changeFailureRate,
          p.kpis.deploymentFrequency,
          p.kpis.meanTimeToRecovery,
        ].join(',');
      })
      .join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=projects-export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting projects:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
