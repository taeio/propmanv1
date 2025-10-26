import React, { useState } from "react";
import { FileText, Plus } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useAppStore } from "@/store/useAppStore";

export default function NotesPage() {
  const notes = useAppStore(state => state.notes);
  const addNote = useAppStore(state => state.addNote);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ text: "", category: "client" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.text) return;
    addNote({
        text: form.text, category: form.category,
        id: 0
    });
    setForm({ text: "", category: "client" });
    setModalOpen(false);
  };

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-bold flex items-center gap-3 text-gray-800"
        >
          <FileText className="w-7 h-7" /> Notes & Communications
        </motion.h1>
        <div className="flex justify-end">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" /> Add Note
          </button>
        </div>
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-4 min-w-[300px]">
              <textarea
                className="w-full border rounded px-3 py-2"
                placeholder="Enter communication, payment, or maintenance note..."
                value={form.text}
                onChange={e => setForm({ ...form, text: e.target.value })}
              />
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="client">Client</option>
                <option value="project">Project</option>
                <option value="finance">Finance</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1 text-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Add</button>
              </div>
            </form>
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
        >
          <ul className="space-y-2">
            {notes.map((note) => (
              <li key={note.id} className="text-gray-700 text-sm">
                <span className="font-medium">{note.category} | {note.date}:</span> {note.text}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </Layout>
  );
}
