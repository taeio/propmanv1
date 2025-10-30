"use client";
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Briefcase, Users, DollarSign, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

export default function DashboardPage() {
  const projects = useAppStore((state) => state.projects);
  const clients = useAppStore((state) => state.clients);

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
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
    setTimeout(() => setIsHydrated(true), 200); // Prevent flicker
  }, []);

  if (!isHydrated) {
    return (
      <Layout>
        <div className="p-6">
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  const totalPaid = projects.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const activeProjects = projects.filter((p) => p.status === "In Progress").length;
  const completedProjects = projects.filter((p) => p.status === "Completed").length;

  return (
    <Layout>
      <div className="p-6 space-y-8">
        {/* Overview Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Dashboard Overview
          </h1>
        </div>

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

        {/* Tenants Table */}
         <div className="bg-white shadow rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
           <Users className="w-5 h-5 text-blue-600" />
            Current Tenants
          </h2>
  {clients.length === 0 ? (
    <p className="text-gray-500">
      No tenants yet — add one from the <span className="font-semibold">Clients</span> tab.
    </p>
  ) : (
    <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="py-2 px-4 border-b">First Name</th>
                    <th className="py-2 px-4 border-b">Last Name</th>
                    <th className="py-2 px-4 border-b">Unit #</th>
                    <th className="py-2 px-4 border-b">Rent ($)</th>
                    <th className="py-2 px-4 border-b">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{client.firstName}</td>
                      <td className="py-2 px-4 border-b">{client.lastName}</td>
                      <td className="py-2 px-4 border-b">{client.unitNumber}</td>
                      <td className="py-2 px-4 border-b">{client.rentAmount}</td>
                      <td
                        className={`py-2 px-4 border-b font-semibold ${
                          client.status === "Paid"
                            ? "text-green-600"
                            : client.status === "Late"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {client.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
            <p className="text-gray-500 text-sm">
              No projects yet — add one from the Projects tab.
            </p>
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

// Stat card component unchanged
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
