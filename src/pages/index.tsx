"use client";
import React, { JSX } from "react";
import Layout from "@/components/Layout";
import { Briefcase, Users, DollarSign, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

export default function DashboardPage() {
  const projects = useAppStore(state => state.projects);
  const clients = useAppStore(state => state.clients);

  // Sum all project payments to show total amount paid
  const totalPaid = projects.reduce((sum, p) => sum + (p.amountPaid || 0), 0); // Ensure 'amountPaid' typed in store

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }} 
          className="text-3xl font-bold text-gray-800"
        >
          Dashboard Overview
        </motion.h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard title="Active Projects" value={projects.filter(p => p.status === "In Progress").length} icon={<Briefcase className="w-5 h-5 text-columbia-700" />} />
          <StatCard title="Clients" value={clients.length} icon={<Users className="w-5 h-5 text-columbia-700" />} />
          <StatCard title="Total Paid" value={`$${totalPaid}`} icon={<DollarSign className="w-5 h-5 text-columbia-700" />} />
          <StatCard title="Tasks In Progress" value={projects.filter(p => p.status === "In Progress").length} icon={<ClipboardList className="w-5 h-5 text-columbia-700" />} />
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number | string; icon: JSX.Element }) {
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



