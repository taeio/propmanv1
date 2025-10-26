"use client";

import React, { useState } from "react";
import { Users, Plus, Trash } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useAppStore } from "@/store/useAppStore";

type RentStatus = "Paid" | "Due" | "Late";

export default function ClientsPage() {
  const clients = useAppStore(state => state.clients);
  const addClient = useAppStore(state => state.addClient);
  const deleteClient = useAppStore(state => state.deleteClient);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    rentAmount: "",
    moveInDate: "",
    leaseTerm: "",
    rentStatus: "Due" as RentStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.rentAmount || !form.rentStatus) return;

    addClient({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      rentAmount: Number(form.rentAmount),
      moveInDate: form.moveInDate,
      leaseTerm: form.leaseTerm,
      rentStatus: form.rentStatus,
    });

    setForm({
      firstName: "",
      lastName: "",
      email: "",
      rentAmount: "",
      moveInDate: "",
      leaseTerm: "",
      rentStatus: "Due",
    });

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
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition">
            <Plus className="w-5 h-5" /> Add Client
          </button>
        </div>
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-4 min-w-[340px]">
              <input className="w-full border rounded px-3 py-2" placeholder="First Name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
              <input className="w-full border rounded px-3 py-2" placeholder="Last Name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
              <input className="w-full border rounded px-3 py-2" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <input className="w-full border rounded px-3 py-2" placeholder="Rent Amount" type="number" min="0" value={form.rentAmount} onChange={e => setForm({ ...form, rentAmount: e.target.value })} />
              <input className="w-full border rounded px-3 py-2" placeholder="Move-In Date" type="date" value={form.moveInDate} onChange={e => setForm({ ...form, moveInDate: e.target.value })} />
              <input className="w-full border rounded px-3 py-2" placeholder="Lease Term" value={form.leaseTerm} onChange={e => setForm({ ...form, leaseTerm: e.target.value })} />
              <select value={form.rentStatus} onChange={e => setForm({ ...form, rentStatus: e.target.value as RentStatus })} className="w-full border rounded px-3 py-2">
                <option value="Paid">Paid</option>
                <option value="Due">Due</option>
                <option value="Late">Late</option>
              </select>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1 text-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Add</button>
              </div>
            </form>
          </div>
        )}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm">
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Rent</th>
                <th>Status</th>
                <th>Move-In</th>
                <th>Lease</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map(client => (
                <tr key={client.id} className="text-gray-800 hover:bg-gray-50">
                  <td className="py-2">{client.firstName}</td>
                  <td className="py-2">{client.lastName}</td>
                  <td className="py-2">{client.email}</td>
                  <td className="py-2">${client.rentAmount}</td>
                  <td className="py-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      client.rentStatus === "Paid" ? "bg-green-100 text-green-700" :
                      client.rentStatus === "Due" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {client.rentStatus}
                    </span>
                  </td>
                  <td className="py-2">{client.moveInDate}</td>
                  <td className="py-2">{client.leaseTerm}</td>
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
