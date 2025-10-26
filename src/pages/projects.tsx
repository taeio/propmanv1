import React, { useState } from "react";
import { Briefcase, Plus, Trash } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useAppStore } from "@/store/useAppStore";

export default function ProjectsPage() {
  // Select only the necessary slices/actions from Zustand
  const projects = useAppStore(state => state.projects);
  const addProject = useAppStore(state => state.addProject);
  const deleteProject = useAppStore(state => state.deleteProject);
  const notes = useAppStore(state => state.notes);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", client: "", status: "In Progress" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.client) return;
    addProject({ name: form.name, client: form.client, status: form.status });
    setForm({ name: "", client: "", status: "In Progress" });
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
          <Briefcase className="w-7 h-7" /> Projects
        </motion.h1>
        <div className="flex justify-end">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" /> Add Project
          </button>
        </div>
        {/* Add Project Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-4 min-w-[300px]">
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Project Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Client"
                value={form.client}
                onChange={e => setForm({ ...form, client: e.target.value })}
              />
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option>In Progress</option>
                <option>Completed</option>
                <option>Pending</option>
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
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm">
                <th>Project Name</th>
                <th>Client</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map((proj) => (
                <tr key={proj.id} className="text-gray-800 hover:bg-gray-50">
                  <td className="py-2">{proj.name}</td>
                  <td className="py-2">{proj.client}</td>
                  <td className="py-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      proj.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : proj.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {proj.status}
                    </span>
                  </td>
                  <td className="py-2 flex gap-2 items-center">
                    <button className="text-red-600 hover:underline" onClick={() => deleteProject(proj.id)}>
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
        {/* Notes Section (optional, for project notes) */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Project Notes & Activity</h2>
          <ul className="space-y-2">
            {notes.filter(n => n.category === "project").map((note) => (
              <li key={note.id} className="text-gray-700 text-sm">
                <span className="font-medium">{note.date}:</span> {note.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
