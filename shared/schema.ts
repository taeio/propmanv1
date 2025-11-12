// Database schema for PropMan
// Reference: blueprint:javascript_log_in_with_replit
import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  serial,
} from "drizzle-orm/pg-core";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").notNull().unique(),
  password: varchar("password"), // Nullable to support transition from OAuth
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("property_manager"),
  clientId: integer("client_id"), // Link tenant users to their client record (foreign key defined in DB)
  themePreference: varchar("theme_preference").default("light"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  externalClient: varchar("external_client").notNull(),
  budget: integer("budget").notNull().default(0),
  amountPaid: integer("amount_paid").notNull().default(0),
  status: varchar("status").notNull().default("In Progress"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clients (tenants) table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  unitNumber: varchar("unit_number").notNull(),
  rentAmount: integer("rent_amount").notNull().default(0),
  status: varchar("status").notNull().default("Due"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notes table
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  text: varchar("text").notNull(),
  category: varchar("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  clientId: integer("client_id").notNull().references(() => clients.id),
  amount: integer("amount").notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  notes: varchar("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Maintenance Issues table
export const maintenanceIssues = pgTable("maintenance_issues", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  title: varchar("title").notNull(),
  description: varchar("description").notNull(),
  status: varchar("status").notNull().default("open"),
  priority: varchar("priority").notNull().default("medium"),
  category: varchar("category").notNull().default("other"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  assignedTo: varchar("assigned_to").references(() => users.id),
  dueDate: timestamp("due_date"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Maintenance Comments table
export const maintenanceComments = pgTable("maintenance_comments", {
  id: serial("id").primaryKey(),
  issueId: integer("issue_id").notNull().references(() => maintenanceIssues.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  comment: varchar("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type MaintenanceIssue = typeof maintenanceIssues.$inferSelect;
export type MaintenanceComment = typeof maintenanceComments.$inferSelect;
