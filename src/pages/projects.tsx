"use client";
import React, { useState } from "react";
import { Briefcase, Edit, Trash, Plus } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";

type Project = {
  id: number;
  name: string;
  client: string;
  budget: number;
  progress: number;
};

const initialProjects: Project[] = [
  { id: 1, name: "Garden Redesign", client: "QWM Property", budget: 2000, progress: 65 },
  { id: 2, name: "Irrigation Setup", client: "GreenScape", budget: 900, progress: 100 },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const handleDelete = (id: number) => setProjects(projects.filter((p) => p.id !== id));

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-bold flex items-center gap-3 text-gray-800"
        >
          <Briefcase className="w-7 h-7" />
          Projects
        </motion.h1>
        <div className="flex justify-end">
          <button className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition">
            <Plus className="w-5 h-5" />
            Add Project
          </button>
        </div>
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
                <th>Budget</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map((proj) => (
                <tr key={proj.id} className="text-gray-800 hover:bg-gray-50">
                  <td className="py-2">{proj.name}</td>
                  <td className="py-2">{proj.client}</td>
                  <td className="py-2">${proj.budget}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="relative w-24 h-2 bg-gray-200 rounded-xl">
                        <div className="absolute top-0 left-0 h-2 bg-green-600 rounded-xl"
                             style={{ width: `${proj.progress}%` }} />
                      </div>
                      <span className="text-xs">{proj.progress}%</span>
                    </div>
                  </td>
                  <td className="py-2 flex gap-2 items-center">
                    <button className="text-blue-600 hover:underline">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(proj.id)}
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
