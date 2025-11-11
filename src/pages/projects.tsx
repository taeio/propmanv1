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
  <div className="p-6">
    {/* Header */}
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
        <Briefcase className="w-7 h-7 text-gray-800 dark:text-gray-100" />
        Projects
      </h1>

      <button
        onClick={() => setModalOpen(true)}
        className="px-4 py-2 rounded-xl bg-blue-600 dark:bg-blue-700 text-white flex items-center gap-2 hover:bg-blue-700 dark:hover:bg-blue-600"
      >
        <Plus className="w-5 h-5" />
        New Project
      </button>
    </div>

    {/* Projects List */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {projects.map((project) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border dark:border-gray-700 rounded-xl shadow bg-white dark:bg-gray-800"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{project.name}</h2>
          <p className="text-gray-600 dark:text-gray-300">{project.externalClient}</p>

          <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
            <p>Budget: ${project.budget}</p>
            <p>Paid: ${project.amountPaid}</p>
            <p>Status: {project.status}</p>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => openEditModal(project)}
              className="p-2 rounded bg-yellow-400 dark:bg-yellow-600 text-white hover:bg-yellow-500 dark:hover:bg-yellow-500"
            >
              <Edit className="w-4 h-4" />
            </button>

            <button
              onClick={() => deleteProject(project.id)}
              className="p-2 rounded bg-red-500 dark:bg-red-700 text-white hover:bg-red-600 dark:hover:bg-red-600"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Modal */}
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex justify-center items-center p-4"
        >
          <motion.form
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md space-y-4"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {editingProjectId ? "Edit Project" : "New Project"}
            </h2>

            <input
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Project Name"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
            />

            <input
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="External Client"
              value={form.externalClient}
              onChange={(e) =>
                setForm((f) => ({ ...f, externalClient: e.target.value }))
              }
            />

            <input
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              type="number"
              placeholder="Budget"
              value={form.budget}
              onChange={(e) =>
                setForm((f) => ({ ...f, budget: e.target.value }))
              }
            />

            <input
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              type="number"
              placeholder="Amount Paid"
              value={form.amountPaid}
              onChange={(e) =>
                setForm((f) => ({ ...f, amountPaid: e.target.value }))
              }
            />

            <select
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as ProjectStatus,
                }))
              }
            >
              <option>In Progress</option>
              <option>Completed</option>
              <option>Pending</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 border dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  resetForm();
                  setModalOpen(false);
                }}
              >
                Cancel
              </button>

              <button type="submit" className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600">
                Save
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

}

