"use client";
import React, { useState } from "react";
import { Users, Plus, Trash, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { useAppStore } from "@/store/useAppStore";

type RentStatus = "Paid" | "Late" | "Due";

export default function ClientsPage() {
  const clients = useAppStore((state) => state.clients);
  const addClient = useAppStore((state) => state.addClient);
  const updateClient = useAppStore((state) => state.updateClient);
  const deleteClient = useAppStore((state) => state.deleteClient);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<number | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    unitNumber: "",
    rentAmount: "",
    status: "Due" as RentStatus,
  });

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      unitNumber: "",
      rentAmount: "",
      status: "Due",
    });
    setEditingClientId(null);
  };

  const openEditModal = (client: any) => {
    setEditingClientId(client.id);
    setForm({
      firstName: client.firstName,
      lastName: client.lastName,
      unitNumber: client.unitNumber,
      rentAmount: client.rentAmount.toString(),
      status: client.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.unitNumber) return;

    const clientData = {
      firstName: form.firstName,
      lastName: form.lastName,
      unitNumber: form.unitNumber,
      rentAmount: Number(form.rentAmount),
      status: form.status,
    };

    if (editingClientId !== null) {
      updateClient(editingClientId, clientData);
    } else {
      addClient(clientData);
    }

    resetForm();
    setModalOpen(false);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="w-6 h-6 text-red-600" /> Tenants
          </h1>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
          >
            <Plus size={18} /> Add Tenant
          </button>
        </div>

        {clients.length === 0 ? (
          <p className="text-gray-500">No tenants yet. Add one above!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow p-4 border border-gray-200"
              >
                <h3 className="text-lg font-bold">
                  {client.firstName} {client.lastName}
                </h3>
                <p className="text-sm text-gray-600">Unit #: {client.unitNumber}</p>
                <p className="text-sm text-gray-600">
                  Rent: ${client.rentAmount.toLocaleString()}
                </p>
                <span
                  className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                    client.status === "Paid"
                      ? "bg-green-100 text-green-700"
                      : client.status === "Late"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {client.status}
                </span>
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => openEditModal(client)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => deleteClient(client.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h2 className="text-xl font-semibold mb-4">
                {editingClientId ? "Edit Tenant" : "New Tenant"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Unit #"
                  value={form.unitNumber}
                  onChange={(e) => setForm({ ...form, unitNumber: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  required
                />
                <input
                  type="number"
                  placeholder="Rent Amount"
                  value={form.rentAmount}
                  onChange={(e) => setForm({ ...form, rentAmount: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  required
                />
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as RentStatus })
                  }
                  className="w-full border rounded-lg p-2"
                >
                  <option>Paid</option>
                  <option>Late</option>
                  <option>Due</option>
                </select>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setModalOpen(false);
                    }}
                    className="px-4 py-2 bg-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}






