import { create } from "zustand";

type Client = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  rentAmount: number;
  moveInDate: string;
  leaseTerm: string;
  rentStatus: "Paid" | "Due" | "Late";
};

type Project = { id: number; name: string; client: string; status: string };
type Note = { id: number; text: string; category: string; date: string };

type AppStore = {
  clients: Client[];
  addClient: (c: Omit<Client, "id">) => void;
  deleteClient: (id: number) => void;

  projects: Project[];
  addProject: (p: Omit<Project, "id">) => void;
  deleteProject: (id: number) => void;

  notes: Note[];
  addNote: (n: Omit<Note, "date">) => void;
};

export const useAppStore = create<AppStore>((set, get) => ({
  clients: [],
  addClient: (c) =>
    set((state) => ({
      clients: [...state.clients, { ...c, id: Date.now() }],
    })),
  deleteClient: (id) =>
    set((state) => ({
      clients: state.clients.filter((client) => client.id !== id),
    })),

  projects: [],
  addProject: (p) =>
    set((state) => ({
      projects: [...state.projects, { ...p, id: Date.now() }],
    })),
  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((proj) => proj.id !== id),
    })),

  notes: [],
  addNote: (n) =>
    set((state) => ({
      notes: [
        ...state.notes,
        { ...n, date: new Date().toLocaleString() },
      ],
    })),
}));
