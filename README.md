# OB Digital Portal

A complete local monorepo implementing a Digital Portal with automated BUY service workflows and minimal manual updates. Everything runs on localhost with no cloud vendor dependencies.

## Architecture

This is a monorepo with the following structure:

```
ob-digital-portal/
├── package.json (workspaces)
├── frontend/ (Next.js 14, TypeScript, App Router, Tailwind CSS)
├── services/
│   └── portal-api/ (Node.js 20+, Express, TypeScript, Zod validation)
├── shared/ (TypeScript types shared between frontend and backend)
├── data/ (JSON file storage for seed data)
├── scripts/ (Seed and data persistence helpers)
└── docker-compose.yaml (optional)
```

## Features

### 1. Portfolio Hub
- Browse/filter services, use cases, case studies
- Tech credentials display
- Partner SPOC information
- Collateral URLs

### 2. Skills & Certifications Directory
- Searchable tables with filtering
- Certification counts and last update quarter
- "Request quarterly refresh" action creates tasks

### 3. Pre-Sales Engagement Intake
- Multi-step form to request SME/consultant/professional
- Auto-routing simulation to Partner SPOC based on region
- SLA timers simulated with setTimeout
- Status transitions with audit trail

### 4. Incubation Tracker
- Submit incubation requests
- Track status: requested → design → PoC → offerize → ready
- Attach lab assets (string IDs)
- Conversion rate metrics

### 5. Project Status & Reports
- Dashboard with SLA/KPI columns:
  - Uptime %
  - Incident response time
  - ROT (Run rate optimization)
  - First-time acceptance rate
  - Change failure rate
  - Deployment frequency
  - Mean time to recovery (MTTR)
- Export to CSV

### 6. Knowledge Area
- List links/files from seed data
- Tags and filtering
- Simple markdown renderer for docs
- SOPs, runbooks, collaterals, documentation

### 7. Minimal RBAC
- User roles: sales, integration, partner, viewer
- Simple local login page with JWT
- Static secret for JWT signing (no external IdP)
- Backend checks roles for access control

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Markdown for rendering docs

### Backend
- Node.js 20+
- Express
- TypeScript
- Zod validation
- bcryptjs for password hashing
- jsonwebtoken for JWT auth
- In-memory store backed by JSON files

### Data Storage
- JSON files in `/data` directory
- In-memory caching with file persistence
- No external database required

## Prerequisites

- Node.js 20 or higher
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

From the root directory:

```bash
npm install
```

This will install dependencies for all workspaces (frontend, backend, shared).

### 2. Build Shared Types

```bash
cd shared
npm run build
cd ..
```

### 3. Set Up Environment Variables

**Backend API:**
```bash
cd services/portal-api
cp .env.example .env
```

Edit `.env` if needed (defaults should work for local development).

**Frontend:**
```bash
cd frontend
cp .env.example .env
```

Edit `.env` if needed (defaults should work for local development).

### 4. Optional: Run Seed Script

The seed data already has hashed passwords, but you can regenerate them:

```bash
npm run seed
```

### 5. Start the Application

**Option 1: Start Both Services Concurrently (Recommended)**

From the root directory:

```bash
npm run dev
```

This starts both the API (port 3001) and frontend (port 3000) simultaneously.

**Option 2: Start Services Separately**

Terminal 1 - Backend API:
```bash
cd services/portal-api
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

**Option 3: Using Docker Compose (Optional)**

```bash
docker-compose up
```

## Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Health Check:** http://localhost:3001/health

## Demo Credentials

All users have the password: `password123`

| Username     | Role        | Description                           |
|--------------|-------------|---------------------------------------|
| sales1       | sales       | Sales role with engagement access     |
| integrator1  | integration | Integration role with full access     |
| partner1     | partner     | Partner role with management access   |
| viewer1      | viewer      | Viewer role with read-only access     |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Portfolio
- `GET /api/portfolio/services` - List services with filters
- `GET /api/portfolio/services/:id` - Get service details
- `GET /api/portfolio/credentials` - List tech credentials

### Skills & Certifications
- `GET /api/skills/skills` - List skills
- `GET /api/skills/certifications` - List certifications
- `POST /api/skills/refresh-request` - Request quarterly refresh
- `GET /api/skills/refresh-requests` - List refresh requests

### Engagements
- `POST /api/engagements` - Create engagement request
- `GET /api/engagements` - List engagements
- `GET /api/engagements/:id` - Get engagement details
- `PATCH /api/engagements/:id` - Update engagement

### Incubations
- `POST /api/incubations` - Create incubation request
- `GET /api/incubations` - List incubations
- `GET /api/incubations/:id` - Get incubation details
- `GET /api/incubations/metrics` - Get incubation metrics
- `PATCH /api/incubations/:id` - Update incubation

### Projects
- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Get project details
- `GET /api/projects/dashboard` - Get dashboard metrics
- `GET /api/projects/:id/reports` - Get project reports
- `GET /api/projects/export/csv` - Export projects to CSV

### Knowledge
- `GET /api/knowledge` - List knowledge items
- `GET /api/knowledge/:id` - Get knowledge item (increments view count)

## Project Structure Details

### `/frontend`
- `src/app/` - Next.js 14 App Router pages
  - `login/` - Login page
  - `dashboard/` - Main dashboard
  - `portfolio/` - Portfolio hub
  - `skills/` - Skills & certifications
  - `engagements/` - Pre-sales engagements
  - `incubations/` - Incubation tracker
  - `projects/` - Projects & reports
  - `knowledge/` - Knowledge area
- `src/components/` - Reusable React components
- `src/contexts/` - React contexts (Auth)
- `src/lib/` - Utility functions and API client

### `/services/portal-api`
- `src/index.ts` - Express app entry point
- `src/routes/` - API route handlers
- `src/middleware/` - Express middleware (auth)
- `src/store/` - In-memory data store with JSON persistence

### `/shared`
- `src/types.ts` - Shared TypeScript types and interfaces

### `/data`
- `seed.json` - Seed data with:
  - Users (with hashed passwords)
  - Portfolio services and credentials
  - Skills and certifications
  - Engagement requests
  - Incubation requests
  - Projects and reports
  - Knowledge items

## Key Features Explained

### Auto-Routing Simulation
When a new engagement request is created, the system:
1. Sets status to "routing"
2. Simulates a 1-3 second delay using setTimeout
3. Assigns to Partner SPOC based on region mapping
4. Updates status to "assigned"
5. Records all changes in audit trail

### SLA Timers
SLA deadlines are calculated based on priority:
- **Critical:** 4 hours
- **High:** 24 hours (1 day)
- **Medium:** 72 hours (3 days)
- **Low:** 168 hours (1 week)

### Data Persistence
- All data is stored in memory for fast access
- Changes are automatically persisted to `/data/seed.json`
- Restart the server to reload from the JSON file

### Role-Based Access Control
- **Viewer:** Read-only access to all features
- **Sales:** Can create engagements and refresh requests
- **Integration:** Full access including creating incubations
- **Partner:** Full access including updating engagements and incubations

## CSV Export

The Projects page includes a CSV export feature that generates a downloadable CSV file with all project data and KPIs. Click the "Export to CSV" button on the projects page.

## Development

### Running Tests
```bash
npm run lint
```

### Building for Production

**Backend:**
```bash
cd services/portal-api
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

## Troubleshooting

### Port Conflicts
If ports 3000 or 3001 are in use, you can change them:
- Backend: Edit `PORT` in `services/portal-api/.env`
- Frontend: Use `PORT=3002 npm run dev` in the frontend directory

### Module Not Found Errors
If you encounter module resolution errors:
```bash
rm -rf node_modules */node_modules
npm install
cd shared && npm run build && cd ..
```

### TypeScript Errors
Make sure to build the shared package first:
```bash
cd shared
npm run build
```

## Notes

- This is a **local-only** application with no cloud dependencies
- JWT tokens are stored in localStorage (for demo purposes)
- All data is stored in JSON files (not suitable for production)
- CORS is enabled for localhost development
- Passwords are hashed using bcrypt with salt rounds = 10

## License

This project is for demonstration purposes only.
