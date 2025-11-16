// Storage layer for database operations
// Reference: blueprint:javascript_log_in_with_replit
import {
  users,
  clients,
  projects,
  notes,
  payments,
  maintenanceIssues,
  maintenanceComments,
  type User,
  type UpsertUser,
  type Client,
  type Project,
  type Note,
  type Payment,
  type MaintenanceIssue,
  type MaintenanceComment,
} from "../shared/schema";
import { db } from "./db";
import { eq, and, isNull } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, data: Partial<User>): Promise<User | undefined>;
  updateUserStripeAccount(userId: string, accountId: string): Promise<User | undefined>;
  
  getClients(userId: string): Promise<Client[]>;
  getClient(id: number, userId: string): Promise<Client | undefined>;
  getClientById(id: number): Promise<Client | undefined>;
  createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client>;
  updateClient(id: number, userId: string, data: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: number, userId: string): Promise<void>;
  
  getProjects(userId: string): Promise<Project[]>;
  getProject(id: number, userId: string): Promise<Project | undefined>;
  createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>;
  updateProject(id: number, userId: string, data: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number, userId: string): Promise<void>;
  
  getNotes(userId: string): Promise<Note[]>;
  getNote(id: number, userId: string): Promise<Note | undefined>;
  createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note>;
  updateNote(id: number, userId: string, data: Partial<Note>): Promise<Note | undefined>;
  deleteNote(id: number, userId: string): Promise<void>;
  
  getPayments(userId: string): Promise<Payment[]>;
  getPayment(id: number, userId: string): Promise<Payment | undefined>;
  createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment>;
  updatePayment(id: number, userId: string, data: Partial<Payment>): Promise<Payment | undefined>;
  deletePayment(id: number, userId: string): Promise<void>;
  
  getMaintenanceIssues(userId: string): Promise<MaintenanceIssue[]>;
  getMaintenanceIssue(id: number, userId: string): Promise<MaintenanceIssue | undefined>;
  createMaintenanceIssue(issue: Omit<MaintenanceIssue, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceIssue>;
  updateMaintenanceIssue(id: number, userId: string, data: Partial<MaintenanceIssue>): Promise<MaintenanceIssue | undefined>;
  deleteMaintenanceIssue(id: number, userId: string): Promise<void>;
  
  getMaintenanceComments(issueId: number, userId: string): Promise<MaintenanceComment[]>;
  createMaintenanceComment(comment: Omit<MaintenanceComment, 'id' | 'createdAt'>): Promise<MaintenanceComment>;
  deleteMaintenanceComment(id: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStripeAccount(userId: string, accountId: string): Promise<User | undefined> {
    if (!accountId.startsWith('acct_')) {
      throw new Error('Invalid Stripe account ID format');
    }
    
    const [user] = await db
      .update(users)
      .set({
        stripeConnectedAccountId: accountId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getClients(userId: string): Promise<Client[]> {
    return db.select().from(clients).where(eq(clients.userId, userId));
  }

  async getClient(id: number, userId: string): Promise<Client | undefined> {
    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)));
    return client;
  }

  async getClientById(id: number): Promise<Client | undefined> {
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id));
    return client;
  }

  async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const [client] = await db.insert(clients).values(clientData as any).returning();
    return client;
  }

  async updateClient(id: number, userId: string, data: Partial<Client>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .returning();
    return client;
  }

  async deleteClient(id: number, userId: string): Promise<void> {
    await db.delete(clients).where(and(eq(clients.id, id), eq(clients.userId, userId)));
  }

  async getProjects(userId: string): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.userId, userId));
  }

  async getProject(id: number, userId: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)));
    return project;
  }

  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const [project] = await db.insert(projects).values(projectData as any).returning();
    return project;
  }

  async updateProject(id: number, userId: string, data: Partial<Project>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning();
    return project;
  }

  async deleteProject(id: number, userId: string): Promise<void> {
    await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, userId)));
  }

  async getNotes(userId: string): Promise<Note[]> {
    return db.select().from(notes).where(eq(notes.userId, userId));
  }

  async getNote(id: number, userId: string): Promise<Note | undefined> {
    const [note] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)));
    return note;
  }

  async createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const [note] = await db.insert(notes).values(noteData as any).returning();
    return note;
  }

  async updateNote(id: number, userId: string, data: Partial<Note>): Promise<Note | undefined> {
    const [note] = await db
      .update(notes)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .returning();
    return note;
  }

  async deleteNote(id: number, userId: string): Promise<void> {
    await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)));
  }

  async getPayments(userId: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.userId, userId));
  }

  async getPayment(id: number, userId: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(and(eq(payments.id, id), eq(payments.userId, userId)));
    return payment;
  }

  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const [payment] = await db.insert(payments).values(paymentData as any).returning();
    return payment;
  }

  async updatePayment(id: number, userId: string, data: Partial<Payment>): Promise<Payment | undefined> {
    const [payment] = await db
      .update(payments)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(payments.id, id), eq(payments.userId, userId)))
      .returning();
    return payment;
  }

  async deletePayment(id: number, userId: string): Promise<void> {
    await db.delete(payments).where(and(eq(payments.id, id), eq(payments.userId, userId)));
  }

  async getPaymentByStripeId(stripePaymentIntentId: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.stripePaymentIntentId, stripePaymentIntentId));
    return payment;
  }

  async updatePaymentStatus(id: number, userId: string, status: string): Promise<Payment | undefined> {
    const [payment] = await db
      .update(payments)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(payments.id, id), eq(payments.userId, userId)))
      .returning();
    return payment;
  }

  async getMaintenanceIssues(userId: string): Promise<MaintenanceIssue[]> {
    return db
      .select({ issue: maintenanceIssues })
      .from(maintenanceIssues)
      .innerJoin(projects, eq(maintenanceIssues.projectId, projects.id))
      .where(and(eq(projects.userId, userId), isNull(maintenanceIssues.deletedAt)))
      .then(rows => rows.map(row => row.issue));
  }

  async getMaintenanceIssue(id: number, userId: string): Promise<MaintenanceIssue | undefined> {
    const [result] = await db
      .select({ issue: maintenanceIssues })
      .from(maintenanceIssues)
      .innerJoin(projects, eq(maintenanceIssues.projectId, projects.id))
      .where(and(eq(maintenanceIssues.id, id), eq(projects.userId, userId), isNull(maintenanceIssues.deletedAt)));
    return result?.issue;
  }

  async createMaintenanceIssue(issueData: Omit<MaintenanceIssue, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceIssue> {
    const [issue] = await db.insert(maintenanceIssues).values(issueData as any).returning();
    return issue;
  }

  async updateMaintenanceIssue(id: number, userId: string, data: Partial<MaintenanceIssue>): Promise<MaintenanceIssue | undefined> {
    const issue = await this.getMaintenanceIssue(id, userId);
    if (!issue) return undefined;
    
    const [updated] = await db
      .update(maintenanceIssues)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(maintenanceIssues.id, id))
      .returning();
    return updated;
  }

  async deleteMaintenanceIssue(id: number, userId: string): Promise<void> {
    const issue = await this.getMaintenanceIssue(id, userId);
    if (!issue) return;
    
    await db.delete(maintenanceComments).where(eq(maintenanceComments.issueId, id));
    await db.delete(maintenanceIssues).where(eq(maintenanceIssues.id, id));
  }

  async getMaintenanceComments(issueId: number, userId: string): Promise<MaintenanceComment[]> {
    const issue = await this.getMaintenanceIssue(issueId, userId);
    if (!issue) return [];
    
    return db.select().from(maintenanceComments).where(eq(maintenanceComments.issueId, issueId));
  }

  async createMaintenanceComment(commentData: Omit<MaintenanceComment, 'id' | 'createdAt'>): Promise<MaintenanceComment> {
    const [comment] = await db.insert(maintenanceComments).values(commentData as any).returning();
    return comment;
  }

  async deleteMaintenanceComment(id: number, userId: string): Promise<void> {
    const [comment] = await db
      .select()
      .from(maintenanceComments)
      .where(eq(maintenanceComments.id, id));
    
    if (comment) {
      const issue = await this.getMaintenanceIssue(comment.issueId, userId);
      if (issue) {
        await db.delete(maintenanceComments).where(eq(maintenanceComments.id, id));
      }
    }
  }
}

export const storage = new DatabaseStorage();
