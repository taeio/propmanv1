import { z } from 'zod';

export const ClientSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  unitNumber: z.string().min(1, "Unit number is required").max(50),
  rentAmount: z.number().min(0, "Rent amount must be positive"),
  status: z.enum(["active", "inactive"]),
});

export const ClientUpdateSchema = ClientSchema.partial();

export const ProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(200),
  externalClient: z.string().max(200).optional(),
  budget: z.number().min(0, "Budget must be positive"),
  amountPaid: z.number().min(0, "Amount paid must be positive"),
  status: z.enum(["planning", "in_progress", "completed", "on_hold"]),
});

export const ProjectUpdateSchema = ProjectSchema.partial();

export const NoteSchema = z.object({
  text: z.string().min(1, "Note text is required").max(5000),
  category: z.enum(["general", "maintenance", "financial", "legal"]),
});

export const NoteUpdateSchema = NoteSchema.partial();

export const PaymentSchema = z.object({
  clientId: z.number().int().positive("Client ID is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  paymentDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  notes: z.string().max(500).optional(),
});

export const MaintenanceIssueSchema = z.object({
  projectId: z.number().int().positive("Project ID is required"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(2000),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).default("open"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  category: z.enum(["plumbing", "electrical", "hvac", "appliance", "structural", "other"]),
  assignedTo: z.number().int().positive().optional(),
  dueDate: z.string().datetime().optional(),
});

export const MaintenanceIssueUpdateSchema = MaintenanceIssueSchema.partial().extend({
  id: z.number().int().positive("Issue ID is required"),
});

export const MaintenanceCommentSchema = z.object({
  issueId: z.number().int().positive("Issue ID is required"),
  comment: z.string().min(1, "Comment is required").max(1000),
});

export const UserProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").max(255),
  themePreference: z.enum(["light", "dark"]).optional(),
});

export const UserRegistrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").max(255),
  role: z.enum(["property_manager", "tenant"]),
});

export const StripePaymentIntentSchema = z.object({});

export const StripeRecordPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
});

export type ClientInput = z.infer<typeof ClientSchema>;
export type ProjectInput = z.infer<typeof ProjectSchema>;
export type NoteInput = z.infer<typeof NoteSchema>;
export type PaymentInput = z.infer<typeof PaymentSchema>;
export type MaintenanceIssueInput = z.infer<typeof MaintenanceIssueSchema>;
export type MaintenanceCommentInput = z.infer<typeof MaintenanceCommentSchema>;
export type UserProfileInput = z.infer<typeof UserProfileSchema>;
export type UserRegistrationInput = z.infer<typeof UserRegistrationSchema>;
export type StripePaymentIntentInput = z.infer<typeof StripePaymentIntentSchema>;
export type StripeRecordPaymentInput = z.infer<typeof StripeRecordPaymentSchema>;
