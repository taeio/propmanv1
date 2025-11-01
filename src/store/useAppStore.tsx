// /store/useAppStore.ts
"use client";
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

// ✅ CLIENT TYPE
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

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
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
          clients: [
            ...state.clients,
            {
              id: Date.now(),
              firstName: data.firstName,
              lastName: data.lastName,
              unitNumber: data.unitNumber,
              rentAmount: data.rentAmount,
              status: data.status,
            },
          ],
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
      name: "taeio-dashboard-storage",
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          if (typeof window === "undefined") return;
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          if (typeof window === "undefined") return;
          localStorage.removeItem(name);
        },
      },
      // Here is the added merge function to prevent actions from being lost on hydration
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState ?? {}),
      }),
    }
  )
);









