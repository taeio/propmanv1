import React from "react";
import Layout from "@/components/Layout";
import { Briefcase, Users, DollarSign, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

export default function DashboardPage() {
  const projects = useAppStore(state => state.projects);
  const clients = useAppStore(state => state.clients);

  // Example revenue & task stats (stub logic, adjust as needed)
  const revenue = "$12,400";
  const tasksInProgress = projects.filter(p => p.status === "In Progress").length;

  const stats = [
    { title: "Active Projects", value: projects.filter(p => p.status === "In Progress").length, icon: <Briefcase className="w-5 h-5 text-columbia-700" /> },
    { title: "Clients", value: clients.length, icon: <Users className="w-5 h-5 text-columbia-700" /> },
    { title: "Revenue", value: revenue, icon: <DollarSign className="w-5 h-5 text-columbia-700" /> },
    { title: "Tasks In Progress", value: tasksInProgress, icon: <ClipboardList className="w-5 h-5 text-columbia-700" /> },
  ];

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="text-3xl font-bold text-gray-800">
          Dashboard Overview
        </motion.h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-md flex items-center justify-between border border-gray-100">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <h2 className="text-2xl font-semibold text-gray-800">{stat.value}</h2>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">{stat.icon}</div>
            </motion.div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Projects</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="text-left text-sm text-gray-500">
                <th className="pb-2">Project Name</th>
                <th className="pb-2">Client</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map((proj, i) => (
                <tr key={i} className="text-sm text-gray-700">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">All Clients</h2>
          <ul className="space-y-2">
            {clients.map((client) => (
              <li key={client.id} className="text-gray-700 text-sm">
                {client.name} &lt;{client.email}&gt;
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}

