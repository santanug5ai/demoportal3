import { Router } from 'express';
import { dataStore } from '../store/dataStore';
import { authenticateToken } from '../middleware/auth';
import type { PortfolioFilters } from '@ob-digital-portal/shared';

const router = Router();

router.use(authenticateToken);

router.get('/services', (req, res) => {
  try {
    let services = dataStore.getPortfolioServices();

    const filters: PortfolioFilters = {
      category: req.query.category as string,
      region: req.query.region as string,
      techStack: req.query.techStack ? (req.query.techStack as string).split(',') : undefined,
      search: req.query.search as string,
    };

    if (filters.category) {
      services = services.filter((s) => s.category === filters.category);
    }

    if (filters.region) {
      services = services.filter((s) => s.region.includes(filters.region!));
    }

    if (filters.techStack && filters.techStack.length > 0) {
      services = services.filter((s) =>
        filters.techStack!.some((tech) => s.techStack.includes(tech))
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      services = services.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.description.toLowerCase().includes(searchLower) ||
          s.techStack.some((tech) => tech.toLowerCase().includes(searchLower))
      );
    }

    res.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error('Error fetching portfolio services:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/services/:id', (req, res) => {
  try {
    const service = dataStore.getPortfolioServiceById(req.params.id);

    if (!service) {
      res.status(404).json({
        success: false,
        error: 'Service not found',
      });
      return;
    }

    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/credentials', (req, res) => {
  try {
    const credentials = dataStore.getTechCredentials();

    res.json({
      success: true,
      data: credentials,
    });
  } catch (error) {
    console.error('Error fetching credentials:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
