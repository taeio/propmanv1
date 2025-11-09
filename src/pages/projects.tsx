"use client";
import React, { useState } from "react";
import { Briefcase, Plus, Trash, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  
  
}
