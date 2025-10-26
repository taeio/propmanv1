"use client";
import React, { useState } from "react";
import { Users, Plus, Edit, Trash } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";

type Client = {
  id: number;
  name: string;
  email: string;
  leaseStatus: "Active" | "Pending" | "Past";
};

const initialClients: Client[] = [
  { id: 1, name: "Jane Smith", email: "jane@client.com", leaseStatus: "Active" },
  { id: 2, name: "Bob Johnson", email: "bob@client.com", leaseStatus: "Pending" },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(initialClients);

  const handleDelete = (id: number) => setClients(clients.filter((c) => c.id !== id));

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-bold flex items-center gap-3 text-gray-800"
        >
          <Users className="w-7 h-7" />
          Clients
        </motion.h1>
        {/* Add Client Button */}
        <div className="flex justify-end">
          <button className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition">
            <Plus className="w-5 h-5" />
            Add Client
          </button>
        </div>
        {/* Clients Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
        >
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm">
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((client) => (
                <tr key={client.id} className="text-gray-800 hover:bg-gray-50">
                  <td className="py-2">{client.name}</td>
                  <td className="py-2">{client.email}</td>
                  <td className="py-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        client.leaseStatus === "Active"
                          ? "bg-green-100 text-green-700"
                          : client.leaseStatus === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {client.leaseStatus}
                    </span>
                  </td>
                  <td className="py-2 flex gap-2 items-center">
                    <button className="text-blue-600 hover:underline">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(client.id)}
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
