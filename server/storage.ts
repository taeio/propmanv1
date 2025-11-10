// Storage layer for database operations
// Reference: blueprint:javascript_log_in_with_replit
import {
  users,
  clients,
  projects,
  notes,
  payments,
  type User,
  type UpsertUser,
  type Client,
  type Project,
  type Note,
  type Payment,
} from "../shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  getClients(userId: string): Promise<Client[]>;
  getClient(id: number, userId: string): Promise<Client | undefined>;
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
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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
}

export const storage = new DatabaseStorage();
