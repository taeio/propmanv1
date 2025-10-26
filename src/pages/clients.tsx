import React, { useState } from "react";
import { Users, Plus, Trash } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useAppStore } from "@/store/useAppStore";

export default function ClientsPage() {
  const clients = useAppStore(state => state.clients);
  const addClient = useAppStore(state => state.addClient);
  const deleteClient = useAppStore(state => state.deleteClient);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", leaseStatus: "Active" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    addClient({ name: form.name, email: form.email, leaseStatus: form.leaseStatus });
    setForm({ name: "", email: "", leaseStatus: "Active" });
    setModalOpen(false);
  };

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
          className="text-3xl font-bold flex items-center gap-3 text-gray-800">
          <Users className="w-7 h-7" /> Clients
        </motion.h1>
        <div className="flex justify-end">
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition">
            <Plus className="w-5 h-5" /> Add Client
          </button>
        </div>
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-4 min-w-[300px]">
              <input className="w-full border rounded px-3 py-2" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="w-full border rounded px-3 py-2" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <select value={form.leaseStatus} onChange={e => setForm({ ...form, leaseStatus: e.target.value })} className="w-full border rounded px-3 py-2">
                <option>Active</option>
                <option>Pending</option>
                <option>Past</option>
              </select>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1 text-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Add</button>
              </div>
            </form>
          </div>
        )}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${client.leaseStatus === "Active"
                      ? "bg-green-100 text-green-700"
                      : client.leaseStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"}`}>
                      {client.leaseStatus}
                    </span>
                  </td>
                  <td className="py-2 flex gap-2 items-center">
                    <button className="text-red-600 hover:underline" onClick={() => deleteClient(client.id)}>
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
