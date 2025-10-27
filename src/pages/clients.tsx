"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RentStatus = "Paid" | "Due" | "Late";
export type ProjectStatus = "In Progress" | "Completed" | "Pending";

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  rentAmount: number;
  moveInDate: string;
  leaseTerm: string;
  rentStatus: RentStatus;
}

export interface Project {
  id: number;
  name: string;
  externalClient: string; // e.g. Plumbing, Landscaping
  budget: number;
  amountPaid: number;
  status: ProjectStatus;
}

export interface Note {
  id: number;
  text: string;
  category: "client" | "project" | "finance" | "maintenance";
  date: string;
}

interface AppStore {
  clients: Client[];
  projects: Project[];
  notes: Note[];

  addClient: (c: Omit<Client, "id">) => void;
  updateClient: (id: number, updated: Omit<Client, "id">) => void;
  deleteClient: (id: number) => void;

  addProject: (p: Omit<Project, "id">) => void;
  updateProject: (id: number, updated: Omit<Project, "id">) => void;
  deleteProject: (id: number) => void;

  addNote: (n: Omit<Note, "id" | "date">) => void;
  updateNote: (id: number, updated: Omit<Note, "id" | "date">) => void;
  deleteNote: (id: number) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      clients: [],
      projects: [],
      notes: [],

      addClient: (c) =>
        set((state) => ({
          clients: [...state.clients, { id: Date.now(), ...c }],
        })),

      updateClient: (id, updated) =>
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === id ? { id, ...updated } : client
          ),
        })),

      deleteClient: (id) =>
        set((state) => ({
          clients: state.clients.filter((client) => client.id !== id),
        })),

      addProject: (p) =>
        set((state) => ({
          projects: [...state.projects, { id: Date.now(), ...p }],
        })),

      updateProject: (id, updated) =>
        set((state) => ({
          projects: state.projects.map((proj) =>
            proj.id === id ? { id, ...updated } : proj
          ),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((proj) => proj.id !== id),
        })),

      addNote: (n) =>
        set((state) => ({
          notes: [
            ...state.notes,
            { id: Date.now(), date: new Date().toLocaleString(), ...n },
          ],
        })),

      updateNote: (id, updated) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updated } : note
          ),
        })),

      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        })),
    }),
    {
      name: "app-storage", // data saved to localStorage
    }
  )
);
