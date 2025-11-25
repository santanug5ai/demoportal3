import { Router } from 'express';
import { dataStore } from '../store/dataStore';
import { authenticateToken } from '../middleware/auth';
import type { KnowledgeFilters } from '@ob-digital-portal/shared';

const router = Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    let items = dataStore.getKnowledgeItems();

    const filters: KnowledgeFilters = {
      type: req.query.type as string,
      category: req.query.category as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      search: req.query.search as string,
    };

    if (filters.type) {
      items = items.filter((i) => i.type === filters.type);
    }

    if (filters.category) {
      items = items.filter((i) => i.category === filters.category);
    }

    if (filters.tags && filters.tags.length > 0) {
      items = items.filter((i) => filters.tags!.some((tag) => i.tags.includes(tag)));
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(searchLower) ||
          i.description.toLowerCase().includes(searchLower) ||
          i.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error fetching knowledge items:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const item = dataStore.getKnowledgeItemById(req.params.id);

    if (!item) {
      res.status(404).json({
        success: false,
        error: 'Knowledge item not found',
      });
      return;
    }

    // Increment view count
    dataStore.incrementKnowledgeItemViews(req.params.id);

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Error fetching knowledge item:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
