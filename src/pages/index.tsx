"use client";
import React from "react";
import Layout from "@/components/Layout";
import { Briefcase, Users, DollarSign, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

export default function DashboardPage() {
  const projects = useAppStore((state) => state.projects);
  const clients = useAppStore((state) => state.clients);

  const totalPaid = projects.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const activeProjects = projects.filter((p) => p.status === "In Progress").length;
  const completedProjects = projects.filter((p) => p.status === "Completed").length;

  return (
    <Layout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-bold text-gray-800"
        >
          Dashboard Overview
        </motion.h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Active Projects"
            value={activeProjects}
            icon={<Briefcase className="w-5 h-5 text-columbia-700" />}
          />
          <StatCard
            title="Completed Projects"
            value={completedProjects}
            icon={<ClipboardList className="w-5 h-5 text-columbia-700" />}
          />
          <StatCard
            title="Clients"
            value={clients.length}
            icon={<Users className="w-5 h-5 text-columbia-700" />}
          />
          <StatCard
            title="Total Paid"
            value={`$${totalPaid.toLocaleString()}`}
            icon={<DollarSign className="w-5 h-5 text-columbia-700" />}
          />
        </div>

        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-columbia-700" /> Recent Projects
          </h2>

          {projects.length === 0 ? (
            <p className="text-gray-500 text-sm">No projects yet — add one from the Projects tab.</p>
          ) : (
            <table className="min-w-full text-sm text-gray-700">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Client</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                {projects
                  .slice(-3)
                  .reverse()
                  .map((project) => (
                    <tr
                      key={project.id}
                      className="border-b last:border-none hover:bg-gray-50 transition"
                    >
                      <td className="py-2">{project.name}</td>
                      <td className="py-2">{project.externalClient}</td>
                      <td className="py-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            project.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : project.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className="py-2">${project.amountPaid.toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-2xl shadow-md flex items-center justify-between border border-gray-100"
    >
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="text-2xl font-semibold text-gray-800">{value}</h2>
      </div>
      <div className="bg-gray-50 p-3 rounded-xl">{icon}</div>
    </motion.div>
  );
}




