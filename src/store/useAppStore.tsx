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

type AppStore = {
  projects: Project[];
  clients: Client[];
  notes: Note[];

  // --- Projects ---
  addProject: (data: Omit<Project, "id">) => void;
  updateProject: (id: number, data: Partial<Project>) => void;
  deleteProject: (id: number) => void;

  // --- Clients ---
  addClient: (data: Omit<Client, "id">) => void;
  updateClient: (id: number, data: Partial<Client>) => void;
  deleteClient: (id: number) => void;

  // --- Notes ---
  addNote: (data: Omit<Note, "id">) => void;
  updateNote: (id: number, data: Partial<Note>) => void;
  deleteNote: (id: number) => void;
};

const STORAGE_KEY = "taeio-dashboard-storage";

function sanitizeRawPersisted(raw: unknown) {
  try {
    if (!raw) return null;
    // raw might be a JSON string already parsed by persist, but we'll be defensive.
    const top = raw as any;
    const state = top?.state ?? top;

    return {
      projects: Array.isArray(state?.projects) ? state.projects : [],
      clients: Array.isArray(state?.clients) ? state.clients : [],
      notes: Array.isArray(state?.notes) ? state.notes : [],
    };
  } catch (err) {
    return null;
  }
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      projects: [],
      clients: [],
      notes: [],

      // --- Projects ---
      addProject: (data) =>
        set((state) => ({
          projects: [...state.projects, { id: Date.now(), ...data }],
        })),
      updateProject: (id, data) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      // --- Clients (Tenants) ---
      addClient: (data) =>
        set((state) => ({
          clients: [...state.clients, { id: Date.now(), ...data }],
        })),
      updateClient: (id, data) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),
      deleteClient: (id) =>
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
        })),

      // --- Notes ---
      addNote: (data) =>
        set((state) => ({
          notes: [...state.notes, { id: Date.now(), ...data }],
        })),
      updateNote: (id, data) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, ...data } : n
          ),
        })),
      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        })),
    }),
    {
      name: STORAGE_KEY,
      version: 1,

      // Persist only serializable data (no functions)
      partialize: (state) => ({
        projects: state.projects,
        clients: state.clients,
        notes: state.notes,
      }),

      // Migrate: sanitize any older/corrupted persisted payloads
      migrate: async (persistedRaw) => {
        try {
          const cleaned = sanitizeRawPersisted(persistedRaw);
          if (!cleaned) return undefined;
          // Persist format can be either { state: {...} } or direct object
          const top = persistedRaw as any;
          if (top?.state) {
            return { ...top, state: cleaned };
          }
          return cleaned;
        } catch (err) {
          console.warn("[useAppStore:migrate] failed, clearing persisted state", err);
          return undefined;
        }
      },

      // Merge: Always keep current state's functions (actions) and override data with persisted arrays
      merge: (persistedState: unknown, currentState) => {
        const typed = (persistedState as Partial<AppStore> | null) ?? {};
        return {
          ...currentState,
          ...typed,
          // explicit reattachment of actions
          addClient: currentState.addClient,
          updateClient: currentState.updateClient,
          deleteClient: currentState.deleteClient,
          addProject: currentState.addProject,
          updateProject: currentState.updateProject,
          deleteProject: currentState.deleteProject,
          addNote: currentState.addNote,
          updateNote: currentState.updateNote,
          deleteNote: currentState.deleteNote,
        } as AppStore;
      },

      // On rehydrate: extra safeguard + sanitize raw persisted key if needed (writes back cleaned payload)
      onRehydrateStorage: () => (state) => {
        try {
          // Detect corrupted actions (defensive check)
          if (!state) return;
          const s = state as unknown as AppStore;
          const actionsOk =
            typeof s.addClient === "function" &&
            typeof s.updateClient === "function" &&
            typeof s.deleteClient === "function";

          // If actions are not functions, we will sanitize the persisted key so future hydrations are clean.
          if (!actionsOk) {
            console.warn("[useAppStore] corruption detected after rehydrate — sanitizing storage key:", STORAGE_KEY);
            try {
              const raw = localStorage.getItem(STORAGE_KEY);
              const parsed = raw ? JSON.parse(raw) : null;
              const cleaned = sanitizeRawPersisted(parsed) ?? { projects: [], clients: [], notes: [] };
              // Persist cleaned payload in the most common shape (plain object). This will be picked up next time.
              localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
              // Also remove the key to force a full reset if desired:
              // localStorage.removeItem(STORAGE_KEY);
            } catch (err) {
              console.error("[useAppStore] failed to sanitize persisted storage:", err);
              try {
                localStorage.removeItem(STORAGE_KEY);
              } catch (e) {
                /* ignore */
              }
            }
          }
        } catch (err) {
          console.error("[useAppStore:onRehydrateStorage] unexpected error", err);
        }
      },
    }
  )
);






