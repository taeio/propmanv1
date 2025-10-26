import React from "react";
import Layout from "@/components/Layout";
import { Briefcase, Users, DollarSign, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

export default function DashboardPage() {
  const projects = useAppStore(state => state.projects);
  const clients = useAppStore(state => state.clients);

  const stats = [
    { title: "Active Projects", value: projects.filter(p => p.status === "In Progress").length, icon: <Briefcase className="w-5 h-5 text-columbia-700" /> },
    { title: "Clients", value: clients.length, icon: <Users className="w-5 h-5 text-columbia-700" /> },
    { title: "Revenue", value: "$12,400", icon: <DollarSign className="w-5 h-5 text-columbia-700" /> },
    { title: "Tasks In Progress", value: projects.filter(p => p.status === "In Progress").length, icon: <ClipboardList className="w-5 h-5 text-columbia-700" /> },
  ];

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-3xl font-bold text-gray-800">
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
        {/* Quick tenant overview */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Tenant Overview</h2>
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm">
                <th>First Name</th>
                <th>Rent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((client) => (
                <tr key={client.id} className="text-gray-800 hover:bg-gray-50">
                  <td className="py-2">{client.firstName}</td>
                  <td className="py-2">${client.rentAmount}</td>
                  <td className="py-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      client.rentStatus === "Paid" ? "bg-green-100 text-green-700"
                      : client.rentStatus === "Due" ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                    }`}>
                      {client.rentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}


