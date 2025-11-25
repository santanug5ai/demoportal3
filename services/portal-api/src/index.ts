import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { dataStore } from './store/dataStore';

// Import routes
import authRoutes from './routes/auth';
import portfolioRoutes from './routes/portfolio';
import skillsRoutes from './routes/skills';
import engagementsRoutes from './routes/engagements';
import incubationsRoutes from './routes/incubations';
import projectsRoutes from './routes/projects';
import knowledgeRoutes from './routes/knowledge';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/engagements', engagementsRoutes);
app.use('/api/incubations', incubationsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/knowledge', knowledgeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Initialize data store and start server
async function start() {
  try {
    await dataStore.initialize();

    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 OB Digital Portal API Server');
      console.log('================================');
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log('');
      console.log('Available endpoints:');
      console.log('  POST   /api/auth/login');
      console.log('  GET    /api/portfolio/services');
      console.log('  GET    /api/portfolio/credentials');
      console.log('  GET    /api/skills/skills');
      console.log('  GET    /api/skills/certifications');
      console.log('  POST   /api/skills/refresh-request');
      console.log('  POST   /api/engagements');
      console.log('  GET    /api/engagements');
      console.log('  POST   /api/incubations');
      console.log('  GET    /api/incubations');
      console.log('  GET    /api/incubations/metrics');
      console.log('  GET    /api/projects');
      console.log('  GET    /api/projects/dashboard');
      console.log('  GET    /api/projects/export/csv');
      console.log('  GET    /api/knowledge');
      console.log('');
      console.log('Demo credentials:');
      console.log('  Username: sales1, integrator1, partner1, viewer1');
      console.log('  Password: password123');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
