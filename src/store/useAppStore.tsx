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
      // bump this when making incompatible persisted-shape changes
      version: 1,

      // Persist only data (no functions) so functions never get serialized
      partialize: (state) => ({
        projects: state.projects,
        clients: state.clients,
        notes: state.notes,
      }),

      // Migrate is called when persisted version !== current version.
      // Also helpful to sanitize previously-corrupted persisted values (old clients that saved functions).
      // Return a Promise resolving to the cleaned persisted state shape.
      migrate: async (persistedRaw) => {
        try {
          if (!persistedRaw) return persistedRaw;
          // If old shape was { state: { ... } } we try to handle both shapes.
          const top = persistedRaw as any;
          const state = top?.state ?? top;

          const cleaned = {
            projects: Array.isArray(state?.projects) ? state.projects : [],
            clients: Array.isArray(state?.clients) ? state.clients : [],
            notes: Array.isArray(state?.notes) ? state.notes : [],
          };

          // Preserve outer wrapper if it existed
          if (top?.state) {
            return { ...top, state: cleaned };
          }
          return cleaned;
        } catch (err) {
          console.warn("[useAppStore:migrate] failed to migrate persisted state, clearing it", err);
          return undefined;
        }
      },

      // Ensure action functions are reattached after hydration and persisted arrays override defaults.
      merge: (persistedState: unknown, currentState) => {
        const typed = (persistedState as Partial<AppStore> | null) ?? {};

        return {
          // start with currentState (keeps action functions)
          ...currentState,
          // then override serializable parts from persisted state
          ...typed,
          // explicitly reattach actions to be extra safe
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

      // Extra safeguard: when rehydration finishes, validate shape and if corrupted, remove key.
      // This runs in the client after persist hydration.
      onRehydrateStorage: () => (state) => {
        try {
          // state is the rehydrated slice; verify serializable parts exist and actions are functions
          if (!state) return;
          const s = state as unknown as AppStore;
          // If any action isn't a function at this point, something went wrong — clear storage.
          const actionsOk =
            typeof s.addClient === "function" &&
            typeof s.updateClient === "function" &&
            typeof s.deleteClient === "function";

          if (!actionsOk) {
            console.warn("[useAppStore] detected corrupted actions after rehydrate — clearing persisted storage");
            try {
              localStorage.removeItem(STORAGE_KEY);
            } catch (err) {
              console.error("[useAppStore] failed to remove corrupted storage key:", err);
            }
          }
        } catch (err) {
          console.error("[useAppStore:onRehydrateStorage] unexpected error", err);
        }
      },
    }
  )
);







