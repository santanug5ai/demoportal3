// User and Authentication
export type UserRole = 'sales' | 'integration' | 'partner' | 'viewer';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

// Portfolio Hub
export interface PortfolioService {
  id: string;
  name: string;
  category: string;
  description: string;
  techStack: string[];
  region: string[];
  partnerSpoc: string;
  collateralUrls: string[];
  useCases: string[];
  caseStudies: CaseStudy[];
  createdAt: string;
  updatedAt: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  client: string;
  industry: string;
  summary: string;
  outcomes: string[];
  techUsed: string[];
  duration: string;
}

export interface TechCredential {
  id: string;
  technology: string;
  certificationLevel: string;
  provider: string;
  validUntil: string;
  credentialUrl?: string;
}

// Skills & Certifications
export interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  practitioners: number;
  lastUpdated: string;
}

export interface Certification {
  id: string;
  name: string;
  provider: string;
  level: string;
  validUntil: string;
  holdersCount: number;
  lastRefreshQuarter: string;
  nextRefreshDue: string;
  status: 'active' | 'expiring' | 'expired';
}

export interface RefreshRequest {
  id: string;
  type: 'skill' | 'certification';
  targetId: string;
  targetName: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'in-progress' | 'completed';
  notes?: string;
}

// Pre-sales Engagement
export interface EngagementRequest {
  id: string;
  requestType: 'sme' | 'consultant' | 'professional';
  title: string;
  description: string;
  requiredSkills: string[];
  region: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requestedBy: string;
  requestedAt: string;
  status: 'submitted' | 'routing' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  assignedSpoc?: string;
  assignedAt?: string;
  slaDeadline: string;
  estimatedHours?: number;
  actualHours?: number;
  auditTrail: AuditEntry[];
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

// Incubation Tracker
export interface IncubationRequest {
  id: string;
  name: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
  status: 'requested' | 'design' | 'poc' | 'offerize' | 'ready' | 'rejected';
  region: string;
  techStack: string[];
  businessValue: string;
  labAssets: string[];
  estimatedCost?: number;
  actualCost?: number;
  timeline: {
    requestedDate: string;
    designStartDate?: string;
    pocStartDate?: string;
    offerizeDate?: string;
    readyDate?: string;
  };
  statusHistory: StatusChange[];
}

export interface StatusChange {
  from: string;
  to: string;
  timestamp: string;
  changedBy: string;
  notes?: string;
}

export interface IncubationMetrics {
  totalRequests: number;
  conversionRate: number;
  averageTimeToReady: number;
  statusBreakdown: Record<string, number>;
}

// Project Status & Reports
export interface Project {
  id: string;
  name: string;
  client: string;
  region: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  projectManager: string;
  kpis: ProjectKPIs;
  reports: Report[];
}

export interface ProjectKPIs {
  uptimePercent: number;
  incidentResponseTimeHours: number;
  rot: number; // Run rate optimization
  firstTimeAcceptanceRate: number;
  changeFailureRate: number;
  deploymentFrequency: number;
  meanTimeToRecovery: number;
}

export interface Report {
  id: string;
  projectId: string;
  reportType: 'weekly' | 'monthly' | 'quarterly' | 'incident' | 'milestone';
  title: string;
  period: string;
  generatedAt: string;
  generatedBy: string;
  summary: string;
  kpiSnapshot: ProjectKPIs;
  fileUrl?: string;
}

export interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  averageUptime: number;
  averageIncidentResponse: number;
  averageFirstTimeAcceptance: number;
  projectsByRegion: Record<string, number>;
  projectsByStatus: Record<string, number>;
}

// Knowledge Area
export interface KnowledgeItem {
  id: string;
  title: string;
  type: 'sop' | 'runbook' | 'collateral' | 'documentation' | 'guide';
  category: string;
  tags: string[];
  description: string;
  contentUrl?: string;
  markdownContent?: string;
  author: string;
  lastUpdated: string;
  viewCount: number;
  region?: string;
}

// Tasks (for quarterly refresh requests, etc.)
export interface Task {
  id: string;
  title: string;
  type: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  dueDate?: string;
  completedAt?: string;
}

// API Response wrappers
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter and Query types
export interface PortfolioFilters {
  category?: string;
  region?: string;
  techStack?: string[];
  search?: string;
}

export interface SkillFilters {
  category?: string;
  level?: string;
  search?: string;
}

export interface ProjectFilters {
  status?: string;
  region?: string;
  search?: string;
}

export interface KnowledgeFilters {
  type?: string;
  category?: string;
  tags?: string[];
  search?: string;
}
