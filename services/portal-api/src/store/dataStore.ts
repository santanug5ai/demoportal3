import fs from 'fs/promises';
import path from 'path';
import type {
  User,
  PortfolioService,
  TechCredential,
  Skill,
  Certification,
  RefreshRequest,
  EngagementRequest,
  IncubationRequest,
  Project,
  KnowledgeItem,
  Task,
} from '@ob-digital-portal/shared';

interface DataStore {
  users: User[];
  portfolioServices: PortfolioService[];
  techCredentials: TechCredential[];
  skills: Skill[];
  certifications: Certification[];
  refreshRequests: RefreshRequest[];
  engagementRequests: EngagementRequest[];
  incubationRequests: IncubationRequest[];
  projects: Project[];
  knowledgeItems: KnowledgeItem[];
  tasks: Task[];
}

class InMemoryStore {
  private data: DataStore = {
    users: [],
    portfolioServices: [],
    techCredentials: [],
    skills: [],
    certifications: [],
    refreshRequests: [],
    engagementRequests: [],
    incubationRequests: [],
    projects: [],
    knowledgeItems: [],
    tasks: [],
  };

  private dataPath: string;
  private initialized = false;

  constructor() {
    this.dataPath = path.join(process.cwd(), '../../data/seed.json');
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const fileContent = await fs.readFile(this.dataPath, 'utf-8');
      this.data = JSON.parse(fileContent);
      this.initialized = true;
      console.log('✅ Data store initialized from seed.json');
    } catch (error) {
      console.error('❌ Failed to load seed data:', error);
      throw error;
    }
  }

  async persist(): Promise<void> {
    try {
      await fs.writeFile(this.dataPath, JSON.stringify(this.data, null, 2), 'utf-8');
      console.log('💾 Data persisted to disk');
    } catch (error) {
      console.error('❌ Failed to persist data:', error);
    }
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByUsername(username: string): User | undefined {
    return this.data.users.find((u) => u.username === username);
  }

  // Portfolio Services
  getPortfolioServices(): PortfolioService[] {
    return this.data.portfolioServices;
  }

  getPortfolioServiceById(id: string): PortfolioService | undefined {
    return this.data.portfolioServices.find((s) => s.id === id);
  }

  // Tech Credentials
  getTechCredentials(): TechCredential[] {
    return this.data.techCredentials;
  }

  // Skills
  getSkills(): Skill[] {
    return this.data.skills;
  }

  getSkillById(id: string): Skill | undefined {
    return this.data.skills.find((s) => s.id === id);
  }

  // Certifications
  getCertifications(): Certification[] {
    return this.data.certifications;
  }

  getCertificationById(id: string): Certification | undefined {
    return this.data.certifications.find((c) => c.id === id);
  }

  // Refresh Requests
  getRefreshRequests(): RefreshRequest[] {
    return this.data.refreshRequests;
  }

  addRefreshRequest(request: RefreshRequest): RefreshRequest {
    this.data.refreshRequests.push(request);
    this.persist();
    return request;
  }

  updateRefreshRequest(id: string, updates: Partial<RefreshRequest>): RefreshRequest | undefined {
    const index = this.data.refreshRequests.findIndex((r) => r.id === id);
    if (index === -1) return undefined;

    this.data.refreshRequests[index] = {
      ...this.data.refreshRequests[index],
      ...updates,
    };
    this.persist();
    return this.data.refreshRequests[index];
  }

  // Engagement Requests
  getEngagementRequests(): EngagementRequest[] {
    return this.data.engagementRequests;
  }

  getEngagementRequestById(id: string): EngagementRequest | undefined {
    return this.data.engagementRequests.find((e) => e.id === id);
  }

  addEngagementRequest(request: EngagementRequest): EngagementRequest {
    this.data.engagementRequests.push(request);
    this.persist();
    return request;
  }

  updateEngagementRequest(id: string, updates: Partial<EngagementRequest>): EngagementRequest | undefined {
    const index = this.data.engagementRequests.findIndex((e) => e.id === id);
    if (index === -1) return undefined;

    this.data.engagementRequests[index] = {
      ...this.data.engagementRequests[index],
      ...updates,
    };
    this.persist();
    return this.data.engagementRequests[index];
  }

  // Incubation Requests
  getIncubationRequests(): IncubationRequest[] {
    return this.data.incubationRequests;
  }

  getIncubationRequestById(id: string): IncubationRequest | undefined {
    return this.data.incubationRequests.find((i) => i.id === id);
  }

  addIncubationRequest(request: IncubationRequest): IncubationRequest {
    this.data.incubationRequests.push(request);
    this.persist();
    return request;
  }

  updateIncubationRequest(id: string, updates: Partial<IncubationRequest>): IncubationRequest | undefined {
    const index = this.data.incubationRequests.findIndex((i) => i.id === id);
    if (index === -1) return undefined;

    this.data.incubationRequests[index] = {
      ...this.data.incubationRequests[index],
      ...updates,
    };
    this.persist();
    return this.data.incubationRequests[index];
  }

  // Projects
  getProjects(): Project[] {
    return this.data.projects;
  }

  getProjectById(id: string): Project | undefined {
    return this.data.projects.find((p) => p.id === id);
  }

  addProject(project: Project): Project {
    this.data.projects.push(project);
    this.persist();
    return project;
  }

  updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const index = this.data.projects.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    this.data.projects[index] = {
      ...this.data.projects[index],
      ...updates,
    };
    this.persist();
    return this.data.projects[index];
  }

  // Knowledge Items
  getKnowledgeItems(): KnowledgeItem[] {
    return this.data.knowledgeItems;
  }

  getKnowledgeItemById(id: string): KnowledgeItem | undefined {
    return this.data.knowledgeItems.find((k) => k.id === id);
  }

  incrementKnowledgeItemViews(id: string): void {
    const item = this.data.knowledgeItems.find((k) => k.id === id);
    if (item) {
      item.viewCount++;
      this.persist();
    }
  }

  // Tasks
  getTasks(): Task[] {
    return this.data.tasks;
  }

  addTask(task: Task): Task {
    this.data.tasks.push(task);
    this.persist();
    return task;
  }

  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const index = this.data.tasks.findIndex((t) => t.id === id);
    if (index === -1) return undefined;

    this.data.tasks[index] = {
      ...this.data.tasks[index],
      ...updates,
    };
    this.persist();
    return this.data.tasks[index];
  }
}

export const dataStore = new InMemoryStore();
