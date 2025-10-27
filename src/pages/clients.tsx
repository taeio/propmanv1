"use client";
import React, { useState } from "react";
import { Users, Plus, Trash, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { useAppStore } from "@/store/useAppStore";

type RentStatus = "Paid" | "Due" | "Late";

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
    email: "",
    rentAmount: "",
    moveInDate: "",
    leaseTerm: "",
    rentStatus: "Due" as RentStatus,
    phone: "",
  });

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      rentAmount: "",
      moveInDate: "",
      leaseTerm: "",
      rentStatus: "Due",
      phone: "",
    });
    setEditingClientId(null);
  };

  const openEditModal = (client: any) => {
    setEditingClientId(client.id);
    setForm({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      rentAmount: client.rentAmount.toString(),
      moveInDate: client.moveInDate,
      leaseTerm: client.leaseTerm,
      rentStatus: client.rentStatus,
      phone: typeof client.phone === "string" ? client.phone : "",
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.rentAmount || !form.rentStatus) return;

    const clientData = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      rentAmount: Number(form.rentAmount),
      moveInDate: form.moveInDate,
      leaseTerm: form.leaseTerm,
      rentStatus: form.rentStatus,
      phone: form.phone,
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
            <Users className="w-6 h-6 text-red-600" /> Clients
          </h1>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
          >
            <Plus size={18} /> Add Client
          </button>
        </div>
        {clients.length === 0 ? (
          <p className="text-gray-500">No clients yet. Add one above!</p>
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
                <p className="text-sm text-gray-600">Email: {client.email}</p>
                <p className="text-sm text-gray-600">Phone: {client.phone}</p>
                <p className="text-sm text-gray-600">
                  Rent: ${client.rentAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Move-in: {client.moveInDate}</p>
                <p className="text-sm text-gray-600">Lease: {client.leaseTerm}</p>
                <span
                  className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                    client.rentStatus === "Paid"
                      ? "bg-green-100 text-green-700"
                      : client.rentStatus === "Due"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {client.rentStatus}
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
                  {editingClientId ? "Edit Client" : "New Client"}
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
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  />
                  <input
                    type="number"
                    placeholder="Rent Amount"
                    value={form.rentAmount}
                    onChange={(e) => setForm({ ...form, rentAmount: e.target.value })}
                    className="w-full border rounded-lg p-2"
                    min={0}
                    required
                  />
                  <input
                    type="date"
                    placeholder="Move-In Date"
                    value={form.moveInDate}
                    onChange={(e) => setForm({ ...form, moveInDate: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  />
                  <input
                    type="text"
                    placeholder="Lease Term"
                    value={form.leaseTerm}
                    onChange={(e) => setForm({ ...form, leaseTerm: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  />
                  <select
                    value={form.rentStatus}
                    onChange={(e) =>
                      setForm({ ...form, rentStatus: e.target.value as RentStatus })
                    }
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Due">Due</option>
                    <option value="Late">Late</option>
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
      </div>
    </Layout>
  );
}

