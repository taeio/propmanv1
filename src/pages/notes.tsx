"use client";
import React, { useState } from "react";
import { Plus, Trash, Edit } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useAppStore } from "@/store/useAppStore";

type NoteCategory = "client" | "project" | "finance" | "maintenance";

export default function NotesPage() {
  const notes = useAppStore(state => state.notes);
  const addNote = useAppStore(state => state.addNote);
  const updateNote = useAppStore(state => state.updateNote);
  const deleteNote = useAppStore(state => state.deleteNote);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  const [form, setForm] = useState({
    text: "",
    category: "client" as NoteCategory,
  });

  const resetForm = () => {
    setForm({ text: "", category: "client" });
    setEditingNoteId(null);
  };

  const openEditModal = (note: typeof form & { id: number }) => {
    setEditingNoteId(note.id);
    setForm({ text: note.text, category: note.category });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.text) return;

    if (editingNoteId !== null) {
      updateNote(editingNoteId, { text: form.text, category: form.category });
    } else {
      addNote({ text: form.text, category: form.category });
    }

    resetForm();
    setModalOpen(false);
  };

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-bold flex items-center gap-3 text-gray-800 dark:text-gray-100"
        >
          <Plus className="w-7 h-7" /> Notes
        </motion.h1>
        <div className="flex justify-end">
          <button
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            className="flex items-center gap-1 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition"
          >
            <Plus className="w-5 h-5" /> Add Note
          </button>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-50 z-50 flex items-center justify-center">
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-4 min-w-[340px]"
            >
              <textarea
                className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Note text"
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                rows={4}
              />
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as NoteCategory })
                }
                className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="client">Client</option>
                <option value="project">Project</option>
                <option value="finance">Finance</option>
                <option value="maintenance">Maintenance</option>
              </select>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600"
                >
                  {editingNoteId !== null ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
        >
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 text-sm">
                <th>Text</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {notes.map((note) => (
                <tr key={note.id} className="text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-2">{note.text}</td>
                  <td className="py-2 capitalize">{note.category}</td>
                  <td className="py-2 flex gap-2 items-center">
                    <button
                      onClick={() => openEditModal(note)}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-600 dark:text-red-400 hover:underline"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </Layout>
  );
}

