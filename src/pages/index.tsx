"use client";
import React, { useState, useEffect } from "react";
import { Briefcase, Users, DollarSign, ClipboardList, Wrench, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/router";
import { withRoleProtection } from "@/hoc/withRoleProtection";

function DashboardPage() {
  const router = useRouter();
  const projects = useAppStore((state) => state.projects);
  const clients = useAppStore((state) => state.clients);
  const maintenanceIssues = useAppStore((state) => state.maintenanceIssues);

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // ✅ Only run once on mount
    const storedData = localStorage.getItem("taeio-dashboard-storage");
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData).state;
        if (parsed) {
          useAppStore.setState(parsed, true);
        }
      } catch (err) {
        console.error("Failed to load persisted state:", err);
      }
    }
    // Hydration only runs once
    setTimeout(() => setIsHydrated(true), 200);
  }, []); // <-- empty dependency array = run once

  if (!isHydrated) {
    return (
      <div className="p-6">
        <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  // ✅ Filter only Due or Late clients for dashboard
  const dueClients = clients.filter(
    (client) => client.status === "Due" || client.status === "Late"
  );

  const totalPaid = projects.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const activeProjects = projects.filter((p) => p.status === "In Progress").length;
  const completedProjects = projects.filter((p) => p.status === "Completed").length;

  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  const activeIssues = maintenanceIssues
    .filter((issue) => !issue.deletedAt && (issue.status === "open" || issue.status === "in_progress"))
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const getProjectName = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";
      case "high": return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200";
      case "low": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";
      case "in_progress": return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
      <div className="p-6 space-y-8">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-bold text-gray-800 dark:text-gray-100"
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
            title="Clients (Due/Late)"
            value={dueClients.length}
            icon={<Users className="w-5 h-5 text-columbia-700" />}
          />
          <StatCard
            title="Total Paid"
            value={`$${totalPaid.toLocaleString()}`}
            icon={<DollarSign className="w-5 h-5 text-columbia-700" />}
          />
        </div>

        {/* Due or Late Clients */}
        {dueClients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-columbia-700 dark:text-columbia-400" /> Rent Due / Late Clients
            </h2>
            <table className="min-w-full text-sm text-gray-700 dark:text-gray-300">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Property</th>
                  <th className="pb-2">Rent Status</th>
                  <th className="pb-2">Rent Amount</th>
                </tr>
              </thead>
              <tbody>
                {dueClients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b dark:border-gray-700 last:border-none hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="py-2">{client.firstName}</td>
                    <td className="py-2">{client.unitNumber || "N/A"}</td>
                    <td className="py-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          client.status === "Late"
                            ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td className="py-2">${client.rentAmount?.toLocaleString() || "0"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Maintenance Issues by Priority */}
        {activeIssues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-columbia-700 dark:text-columbia-400" /> Active Maintenance Issues
            </h2>
            <table className="min-w-full text-sm text-gray-700 dark:text-gray-300">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                  <th className="pb-2">Priority</th>
                  <th className="pb-2">Issue</th>
                  <th className="pb-2">Project</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {activeIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    onClick={() => router.push({ pathname: '/projects', query: { projectId: issue.projectId, openMaintenance: 'true' } })}
                    className="border-b dark:border-gray-700 last:border-none hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
                  >
                    <td className="py-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                        {issue.priority === 'urgent' && <AlertCircle className="w-3 h-3 inline mr-1" />}
                        {issue.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 font-medium">{issue.title}</td>
                    <td className="py-2">{getProjectName(issue.projectId)}</td>
                    <td className="py-2 capitalize">{issue.category}</td>
                    <td className="py-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-columbia-700 dark:text-columbia-400" /> Recent Projects
          </h2>

          {projects.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No projects yet — add one from the Projects tab.
            </p>
          ) : (
            <table className="min-w-full text-sm text-gray-700 dark:text-gray-300">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
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
                      className="border-b dark:border-gray-700 last:border-none hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="py-2">{project.name}</td>
                      <td className="py-2">{project.externalClient}</td>
                      <td className="py-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            project.status === "Completed"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                              : project.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
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
      className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex items-center justify-between border border-gray-100 dark:border-gray-700"
    >
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{value}</h2>
      </div>
      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">{icon}</div>
    </motion.div>
  );
}

export default withRoleProtection(DashboardPage, "property_manager");
