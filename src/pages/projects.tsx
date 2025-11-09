"use client";
import React, { useState } from "react";
import { Briefcase, Plus, Trash, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { useAppStore } from "@/store/useAppStore";

type ProjectStatus = "In Progress" | "Completed" | "Pending";

export default function ProjectsPage() {
  const projects = useAppStore((state) => state.projects);
  const addProject = useAppStore((state) => state.addProject);
  const updateProject = useAppStore((state) => state.updateProject);
  const deleteProject = useAppStore((state) => state.deleteProject);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    externalClient: "",
    budget: "",
    amountPaid: "",
    status: "In Progress" as ProjectStatus,
  });

  const resetForm = () => {
    setForm({
      name: "",
      externalClient: "",
      budget: "",
      amountPaid: "",
      status: "In Progress",
    });
    setEditingProjectId(null);
  };

  const openEditModal = (project: any) => {
    setEditingProjectId(project.id);
    setForm({
      name: project.name,
      externalClient: project.externalClient,
      budget: project.budget.toString(),
      amountPaid: project.amountPaid.toString(),
      status: project.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.externalClient) return;

    const projectData = {
      name: form.name,
      externalClient: form.externalClient,
      budget: Number(form.budget),
      amountPaid: Number(form.amountPaid),
      status: form.status,
    };

    if (editingProjectId !== null) {
      updateProject(editingProjectId, projectData);
    } else {
      addProject(projectData);
    }

    resetForm();
    setModalOpen(false);
  };

  // ✅ RETURN UI (this was missing)
  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" /> Projects
          </h1>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={18} /> Add Project
          </button>
        </div>

        {projects.length === 0 ? (
          <p className="text-gray-500">No projects yet. Add one above!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow p-4 border border-gray-200"
              >
                <h3 className="text-lg font-bold">{project.name}</h3>
                <p className="text-sm text-gray-600">
                  Client: {project.externalClient}
                </p>
                <p className="text-sm text-gray-600">
                  Budget: ${project.budget.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Paid: ${project.amountPaid.toLocaleString()}
                </p>

                <span
                  className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                    project.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : project.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {project.status}
                </span>

                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => openEditModal(project)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h2 className="text-xl font-semibold mb-4">
                {editingProjectId ? "Edit Project" : "New Project"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  required
                />

                <input
                  type="text"
                  placeholder="Client Name"
                  value={form.externalClient}
                  onChange={(e) =>
                    setForm({ ...form, externalClient: e.target.value })
                  }
                  className="w-full border rounded-lg p-2"
                  required
                />

                <input
                  type="number"
                  placeholder="Budget"
                  value={form.budget}
                  onChange={(e) =>
                    setForm({ ...form, budget: e.target.value })
                  }
                  className="w-full border rounded-lg p-2"
                  required
                />

                <input
                  type="number"
                  placeholder="Amount Paid"
                  value={form.amountPaid}
                  onChange={(e) =>
                    setForm({ ...form, amountPaid: e.target.value })
                  }
                  className="w-full border rounded-lg p-2"
                  required
                />

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as ProjectStatus })
                  }
                  className="w-full border rounded-lg p-2"
                >
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Pending</option>
                </select>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setModalOpen(false);
                    }}
                    className="px-4 py-2 bg-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

