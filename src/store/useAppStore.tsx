// /store/useAppStore.tsx
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Project = {
  id: number;
  name: string;
  externalClient: string;
  budget: number;
  amountPaid: number;
  status: "In Progress" | "Completed" | "Pending";
};

type Client = {
  id: number;
  firstName: string;
  lastName: string;
  unitNumber: string;
  rentAmount: number;
  status: "Paid" | "Late" | "Due";
};

type Note = {
  id: number;
  text: string;
  category: "client" | "project" | "finance" | "maintenance";
};

type Payment = {
  id: number;
  clientId: number;
  amount: number;
  paymentDate: string;
  notes?: string;
};

type MaintenanceIssue = {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: "plumbing" | "electrical" | "hvac" | "appliance" | "structural" | "other";
  createdBy: string;
  assignedTo?: string | null;
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type MaintenanceComment = {
  id: number;
  issueId: number;
  userId: string;
  comment: string;
  createdAt?: string;
};

type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  themePreference: "light" | "dark";
  isDirty: boolean;
};

type AppStore = {
  projects: Project[];
  clients: Client[];
  notes: Note[];
  payments: Payment[];
  maintenanceIssues: MaintenanceIssue[];
  maintenanceComments: MaintenanceComment[];
  isAuthenticated: boolean;
  isSyncing: boolean;
  profile: UserProfile;

  // --- Auth & Sync ---
  setAuthenticated: (isAuth: boolean) => void;
  syncWithDatabase: () => Promise<void>;
  migrateLocalDataToDatabase: () => Promise<void>;

  // --- Profile ---
  loadProfile: () => Promise<void>;
  updateProfile: (data: Partial<Omit<UserProfile, "isDirty">>) => void;
  saveProfile: () => Promise<void>;
  setTheme: (theme: "light" | "dark") => void;

  // --- Projects ---
  addProject: (data: Omit<Project, "id">) => Promise<void>;
  updateProject: (id: number, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;

  // --- Clients ---
  addClient: (data: Omit<Client, "id">) => Promise<void>;
  updateClient: (id: number, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;

  // --- Notes ---
  addNote: (data: Omit<Note, "id">) => Promise<void>;
  updateNote: (id: number, data: Partial<Note>) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;

  // --- Payments ---
  addPayment: (data: Omit<Payment, "id">) => Promise<void>;
  updatePayment: (id: number, data: Partial<Payment>) => Promise<void>;
  deletePayment: (id: number) => Promise<void>;
  getClientPayments: (clientId: number) => Payment[];

  // --- Maintenance Issues ---
  addMaintenanceIssue: (data: Omit<MaintenanceIssue, "id" | "createdBy" | "createdAt" | "updatedAt">) => Promise<void>;
  updateMaintenanceIssue: (id: number, data: Partial<MaintenanceIssue>) => Promise<void>;
  deleteMaintenanceIssue: (id: number) => Promise<void>;
  getProjectIssues: (projectId: number) => MaintenanceIssue[];

  // --- Maintenance Comments ---
  addMaintenanceComment: (issueId: number, comment: string) => Promise<void>;
  deleteMaintenanceComment: (id: number) => Promise<void>;
  getIssueComments: (issueId: number) => MaintenanceComment[];
};

const STORAGE_KEY = "taeio-dashboard-storage-v2";

// Clean up old storage keys on initialization
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("taeio-dashboard-storage");
    const oldData = localStorage.getItem(STORAGE_KEY);
    if (oldData) {
      const parsed = JSON.parse(oldData);
      if (parsed?.state) {
        const hasInvalidFunctions = 
          typeof parsed.state.addClient !== "undefined" ||
          typeof parsed.state.deleteProject !== "undefined";
        if (hasInvalidFunctions) {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  } catch (e) {
    console.warn("Failed to clean old storage", e);
  }
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      projects: [],
      clients: [],
      notes: [],
      payments: [],
      maintenanceIssues: [],
      maintenanceComments: [],
      isAuthenticated: false,
      isSyncing: false,
      profile: {
        firstName: "",
        lastName: "",
        email: "",
        themePreference: (typeof window !== "undefined" && localStorage.getItem("theme") === "dark") ? "dark" : "light",
        isDirty: false,
      },

      // --- Auth & Sync ---
      setAuthenticated: (isAuth) => {
        set({ isAuthenticated: isAuth });
      },

      syncWithDatabase: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;

        set({ isSyncing: true });
        try {
          const [clients, projects, notes, payments, maintenanceIssues] = await Promise.all([
            fetch("/api/data/clients").then((r) => r.ok ? r.json() : []),
            fetch("/api/data/projects").then((r) => r.ok ? r.json() : []),
            fetch("/api/data/notes").then((r) => r.ok ? r.json() : []),
            fetch("/api/data/payments").then((r) => r.ok ? r.json() : []),
            fetch("/api/data/maintenance-issues").then((r) => r.ok ? r.json() : []),
          ]);

          const markSynced = (items: any[]) => items.map((item) => ({ ...item, _synced: true }));
          set({ 
            clients: markSynced(clients), 
            projects: markSynced(projects), 
            notes: markSynced(notes),
            payments: markSynced(payments),
            maintenanceIssues: markSynced(maintenanceIssues)
          });
        } catch (error) {
          console.error("Failed to sync with database:", error);
        } finally {
          set({ isSyncing: false });
        }
      },

      migrateLocalDataToDatabase: async () => {
        const { clients, projects, notes, payments, isAuthenticated } = get();
        if (!isAuthenticated) return;

        const unsyncedClients = clients.filter((c: any) => !c._synced);
        const unsyncedProjects = projects.filter((p: any) => !p._synced);
        const unsyncedNotes = notes.filter((n: any) => !n._synced);
        const unsyncedPayments = payments.filter((p: any) => !p._synced);

        if (unsyncedClients.length === 0 && unsyncedProjects.length === 0 && unsyncedNotes.length === 0 && unsyncedPayments.length === 0) {
          return;
        }

        try {
          const stripMetadata = (obj: any) => {
            const { id, createdAt, updatedAt, _synced, _deleted, ...rest } = obj;
            return rest;
          };

          const processBatch = async (items: any[], endpoint: string) => {
            const promises = items.map((item) => {
              if ((item as any)._deleted) {
                return fetch(`${endpoint}/${item.id}`, { method: "DELETE" });
              } else if (item.id && typeof item.id === 'number' && item.id > 1000000000) {
                return fetch(endpoint, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(stripMetadata(item)),
                });
              } else if (item.id) {
                return fetch(`${endpoint}/${item.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(stripMetadata(item)),
                });
              } else {
                return fetch(endpoint, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(stripMetadata(item)),
                });
              }
            });
            return Promise.all(promises);
          };

          await Promise.all([
            unsyncedClients.length > 0 ? processBatch(unsyncedClients, "/api/data/clients") : Promise.resolve(),
            unsyncedProjects.length > 0 ? processBatch(unsyncedProjects, "/api/data/projects") : Promise.resolve(),
            unsyncedNotes.length > 0 ? processBatch(unsyncedNotes, "/api/data/notes") : Promise.resolve(),
            unsyncedPayments.length > 0 ? processBatch(unsyncedPayments, "/api/data/payments") : Promise.resolve(),
          ]);

          await get().syncWithDatabase();
        } catch (error) {
          console.error("Failed to migrate data to database:", error);
        }
      },

      // --- Profile ---
      loadProfile: async () => {
        const { isAuthenticated } = get();
        
        if (isAuthenticated) {
          try {
            const response = await fetch("/api/user/profile");
            if (response.ok) {
              const userData = await response.json();
              set((state) => ({
                profile: {
                  firstName: userData.firstName || "",
                  lastName: userData.lastName || "",
                  email: userData.email || "",
                  themePreference: userData.themePreference || state.profile.themePreference,
                  isDirty: false,
                },
              }));
              if (userData.themePreference && typeof window !== "undefined") {
                localStorage.setItem("theme", userData.themePreference);
                if (userData.themePreference === "dark") {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
              }
            }
          } catch (error) {
            console.error("Failed to load profile:", error);
          }
        }
      },

      updateProfile: (data) => {
        set((state) => ({
          profile: {
            ...state.profile,
            ...data,
            isDirty: true,
          },
        }));
      },

      saveProfile: async () => {
        const { profile, isAuthenticated } = get();
        if (!isAuthenticated) return;

        if (!profile.firstName || !profile.lastName || !profile.email) {
          console.warn("Cannot save profile with empty required fields");
          return;
        }

        try {
          const response = await fetch("/api/user/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firstName: profile.firstName,
              lastName: profile.lastName,
              email: profile.email,
              themePreference: profile.themePreference,
            }),
          });

          if (response.ok) {
            set((state) => ({
              profile: {
                ...state.profile,
                isDirty: false,
              },
            }));
          }
        } catch (error) {
          console.error("Failed to save profile:", error);
        }
      },

      setTheme: (theme) => {
        set((state) => ({
          profile: {
            ...state.profile,
            themePreference: theme,
            isDirty: true,
          },
        }));
        
        if (typeof window !== "undefined") {
          localStorage.setItem("theme", theme);
          if (theme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      },

      // --- Projects ---
      addProject: async (data) => {
        const { isAuthenticated } = get();
        
        if (isAuthenticated) {
          const response = await fetch("/api/data/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const project = await response.json();
          set((state) => ({ projects: [...state.projects, { ...project, _synced: true }] }));
        } else {
          set((state) => ({
            projects: [...state.projects, { id: Date.now(), ...data }],
          }));
        }
      },

      updateProject: async (id, data) => {
        const { isAuthenticated } = get();
        
        if (isAuthenticated) {
          const response = await fetch(`/api/data/projects/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const project = await response.json();
          set((state) => ({
            projects: state.projects.map((p) => p.id === id ? { ...project, _synced: true } : p),
          }));
        } else {
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === id ? { ...p, ...data, _synced: false } : p
            ),
          }));
        }
      },

      deleteProject: async (id) => {
        const { isAuthenticated } = get();
        
        if (isAuthenticated) {
          await fetch(`/api/data/projects/${id}`, { method: "DELETE" });
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
          }));
        } else {
          const project = get().projects.find((p) => p.id === id);
          if ((project as any)?._synced) {
            set((state) => ({
              projects: state.projects.map((p) => 
                p.id === id ? { ...p, _synced: false, _deleted: true } : p
              ),
            }));
          } else {
            set((state) => ({
              projects: state.projects.filter((p) => p.id !== id),
            }));
          }
        }
      },

      // --- Clients ---
      addClient: async (data) => {
        const { isAuthenticated } = get();
        
        if (isAuthenticated) {
          const response = await fetch("/api/data/clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const client = await response.json();
          set((state) => ({ clients: [...state.clients, { ...client, _synced: true }] }));
        } else {
          set((state) => ({
            clients: [...state.clients, { id: Date.now(), ...data }],
          }));
        }
      },

      updateClient: async (id, data) => {
        const { isAuthenticated } = get();
        
        if (isAuthenticated) {
          const response = await fetch(`/api/data/clients/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const client = await response.json();
          set((state) => ({
            clients: state.clients.map((c) => c.id === id ? { ...client, _synced: true } : c),
          }));
        } else {
          set((state) => ({
            clients: state.clients.map((c) =>
              c.id === id ? { ...c, ...data, _synced: false } : c
            ),
          }));
        }
      },

      deleteClient: async (id) => {
        const { isAuthenticated } = get();
        
        if (isAuthenticated) {
          await fetch(`/api/data/clients/${id}`, { method: "DELETE" });
          set((state) => ({
            clients: state.clients.filter((c) => c.id !== id),
          }));
        } else {
          const client = get().clients.find((c) => c.id === id);
          if ((client as any)?._synced) {
            set((state) => ({
              clients: state.clients.map((c) => 
                c.id === id ? { ...c, _synced: false, _deleted: true } : c
              ),
            }));
          } else {
            set((state) => ({
              clients: state.clients.filter((c) => c.id !== id),
            }));
          }
        }
      },

      // --- Notes ---
      addNote: async (data) => {
        const { isAuthenticated } = get();
        
        if (isAuthenticated) {
          const response = await fetch("/api/data/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const note = await response.json();
          set((state) => ({ notes: [...state.notes, { ...note, _synced: true }] }));
        } else {
          set((state) => ({
            notes: [...state.notes, { id: Date.now(), ...data }],
          }));
        }
      },

      updateNote: async (id, data) => {
        const { isAuthenticated } = get();
        
        if (isAuthenticated) {
          const response = await fetch(`/api/data/notes/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const note = await response.json();
          set((state) => ({
            notes: state.notes.map((n) => n.id === id ? { ...note, _synced: true } : n),
          }));
        } else {
          set((state) => ({
            notes: state.notes.map((n) =>
              n.id === id ? { ...n, ...data, _synced: false } : n
            ),
          }));
        }
      },

      deleteNote: async (id) => {
        const { isAuthenticated} = get();
        
        if (isAuthenticated) {
          await fetch(`/api/data/notes/${id}`, { method: "DELETE" });
          set((state) => ({
            notes: state.notes.filter((n) => n.id !== id),
          }));
        } else {
          const note = get().notes.find((n) => n.id === id);
          if ((note as any)?._synced) {
            set((state) => ({
              notes: state.notes.map((n) => 
                n.id === id ? { ...n, _synced: false, _deleted: true } : n
              ),
            }));
          } else {
            set((state) => ({
              notes: state.notes.filter((n) => n.id !== id),
            }));
          }
        }
      },

      // --- Payments ---
      addPayment: async (data) => {
        const { isAuthenticated } = get();
        
        if (isAuthenticated) {
          const response = await fetch("/api/data/payments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const payment = await response.json();
          set((state) => ({ payments: [...state.payments, { ...payment, _synced: true }] }));
        } else {
          set((state) => ({
            payments: [...state.payments, { id: Date.now(), ...data }],
          }));
        }
      },

      updatePayment: async (id, data) => {
        const { isAuthenticated } = get();
        
        if (isAuthenticated) {
          const response = await fetch(`/api/data/payments/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const payment = await response.json();
          set((state) => ({
            payments: state.payments.map((p) => p.id === id ? { ...payment, _synced: true } : p),
          }));
        } else {
          set((state) => ({
            payments: state.payments.map((p) =>
              p.id === id ? { ...p, ...data, _synced: false } : p
            ),
          }));
        }
      },

      deletePayment: async (id) => {
        const { isAuthenticated } = get();
        
        if (isAuthenticated) {
          await fetch(`/api/data/payments/${id}`, { method: "DELETE" });
          set((state) => ({
            payments: state.payments.filter((p) => p.id !== id),
          }));
        } else {
          const payment = get().payments.find((p) => p.id === id);
          if ((payment as any)?._synced) {
            set((state) => ({
              payments: state.payments.map((p) => 
                p.id === id ? { ...p, _synced: false, _deleted: true } : p
              ),
            }));
          } else {
            set((state) => ({
              payments: state.payments.filter((p) => p.id !== id),
            }));
          }
        }
      },

      getClientPayments: (clientId) => {
        return get().payments.filter((p) => p.clientId === clientId);
      },

      // --- Maintenance Issues ---
      addMaintenanceIssue: async (data) => {
        const { isAuthenticated } = get();
        
        if (isAuthenticated) {
          const response = await fetch("/api/data/maintenance-issues", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const issue = await response.json();
          set((state) => ({ maintenanceIssues: [...state.maintenanceIssues, { ...issue, _synced: true }] }));
        } else {
          set((state) => ({
            maintenanceIssues: [...state.maintenanceIssues, { id: Date.now(), createdBy: "offline", ...data }],
          }));
        }
      },

      updateMaintenanceIssue: async (id, data) => {
        const { isAuthenticated } = get();
        
        if (isAuthenticated) {
          const response = await fetch("/api/data/maintenance-issues", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...data }),
          });
          const issue = await response.json();
          set((state) => ({
            maintenanceIssues: state.maintenanceIssues.map((i) => i.id === id ? { ...issue, _synced: true } : i),
          }));
        } else {
          set((state) => ({
            maintenanceIssues: state.maintenanceIssues.map((i) =>
              i.id === id ? { ...i, ...data, _synced: false } : i
            ),
          }));
        }
      },

      deleteMaintenanceIssue: async (id) => {
        const { isAuthenticated } = get();
        
        if (isAuthenticated) {
          await fetch(`/api/data/maintenance-issues?id=${id}`, { method: "DELETE" });
          set((state) => ({
            maintenanceIssues: state.maintenanceIssues.filter((i) => i.id !== id),
            maintenanceComments: state.maintenanceComments.filter((c) => c.issueId !== id),
          }));
        } else {
          const issue = get().maintenanceIssues.find((i) => i.id === id);
          if ((issue as any)?._synced) {
            set((state) => ({
              maintenanceIssues: state.maintenanceIssues.map((i) => 
                i.id === id ? { ...i, _synced: false, _deleted: true } as any : i
              ),
            }));
          } else {
            set((state) => ({
              maintenanceIssues: state.maintenanceIssues.filter((i) => i.id !== id),
            }));
          }
        }
      },

      getProjectIssues: (projectId) => {
        return get().maintenanceIssues.filter((i) => i.projectId === projectId);
      },

      // --- Maintenance Comments ---
      addMaintenanceComment: async (issueId, comment) => {
        const { isAuthenticated } = get();
        
        if (isAuthenticated) {
          const response = await fetch("/api/data/maintenance-comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ issueId, comment }),
          });
          const newComment = await response.json();
          set((state) => ({ 
            maintenanceComments: [...state.maintenanceComments, { ...newComment, _synced: true }] 
          }));
        } else {
          set((state) => ({
            maintenanceComments: [...state.maintenanceComments, { 
              id: Date.now(), 
              issueId, 
              userId: "offline", 
              comment,
              createdAt: new Date().toISOString()
            }],
          }));
        }
      },

      deleteMaintenanceComment: async (id) => {
        const { isAuthenticated } = get();
        
        if (isAuthenticated) {
          await fetch(`/api/data/maintenance-comments?id=${id}`, { method: "DELETE" });
          set((state) => ({
            maintenanceComments: state.maintenanceComments.filter((c) => c.id !== id),
          }));
        } else {
          set((state) => ({
            maintenanceComments: state.maintenanceComments.filter((c) => c.id !== id),
          }));
        }
      },

      getIssueComments: (issueId) => {
        return get().maintenanceComments.filter((c) => c.issueId === issueId);
      },
    }),
    {
      name: STORAGE_KEY,

      // Persist only serializable data (no functions)
      partialize: (state) => ({
        projects: state.projects,
        clients: state.clients,
        notes: state.notes,
        payments: state.payments,
        maintenanceIssues: state.maintenanceIssues,
        maintenanceComments: state.maintenanceComments,
      }),
    }
  )
);






