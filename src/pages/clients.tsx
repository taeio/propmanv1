"use client";
import React, { useState } from "react";
import { Users, Plus, Trash, Edit, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

type RentStatus = "Paid" | "Late" | "Due";

export default function ClientsPage() {
  const clients = useAppStore((s) => s.clients);
  const addClient = useAppStore((s) => s.addClient);
  const updateClient = useAppStore((s) => s.updateClient);
  const deleteClient = useAppStore((s) => s.deleteClient);
  const addPayment = useAppStore((s) => s.addPayment);

  const [modalOpen, setModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [editingClientId, setEditingClientId] = useState<number | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    unitNumber: "",
    rentAmount: "",
    status: "Due" as RentStatus,
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
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

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: "",
      paymentDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setSelectedClientId(null);
  };

  const openPaymentModal = (clientId: number) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setSelectedClientId(clientId);
      setPaymentForm({
        amount: client.rentAmount.toString(),
        paymentDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setPaymentModalOpen(true);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !paymentForm.amount) return;

    await addPayment({
      clientId: selectedClientId,
      amount: Number(paymentForm.amount),
      paymentDate: new Date(paymentForm.paymentDate).toISOString(),
      notes: paymentForm.notes || undefined,
    });

    await updateClient(selectedClientId, { status: "Paid" });

    resetPaymentForm();
    setPaymentModalOpen(false);
  };

  const openEditModal = (client: any) => {
    setEditingClientId(client.id);
    setForm({
      firstName: client.firstName,
      lastName: client.lastName,
      unitNumber: client.unitNumber,
      rentAmount: client.rentAmount?.toString() ?? "",
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

  const handleDelete = (id: number) => {
    deleteClient(id);
  };

  return (
    <div className="relative">
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
                Rent: ${client.rentAmount?.toLocaleString?.() ?? client.rentAmount}
              </p>
              <span
                className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${client.status === "Paid"
                    ? "bg-green-100 text-green-700"
                    : client.status === "Late"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"}`}
              >
                {client.status}
              </span>
              <div className="flex justify-between items-center mt-3">
                <button
                  onClick={() => openPaymentModal(client.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                >
                  <DollarSign size={14} />
                  Record Payment
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(client)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash size={16} />
                  </button>
                </div>
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
                {editingClientId !== null ? "Edit Tenant" : "New Tenant"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  required />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  required />
                <input
                  type="text"
                  placeholder="Unit Number"
                  value={form.unitNumber}
                  onChange={(e) => setForm({ ...form, unitNumber: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  required />
                <input
                  type="number"
                  placeholder="Rent Amount"
                  value={form.rentAmount}
                  onChange={(e) => setForm({ ...form, rentAmount: e.target.value })}
                  className="w-full border rounded-lg p-2" />
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as RentStatus })}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="Due">Due</option>
                  <option value="Paid">Paid</option>
                  <option value="Late">Late</option>
                </select>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setModalOpen(false);
                    } }
                    className="px-4 py-2 rounded-lg border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    {editingClientId !== null ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {paymentModalOpen && selectedClientId && (
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
              <h2 className="text-xl font-semibold mb-4">Record Payment</h2>
              {(() => {
                const client = clients.find((c) => c.id === selectedClientId);
                return client ? (
                  <p className="text-sm text-gray-600 mb-4">
                    For {client.firstName} {client.lastName} - Unit {client.unitNumber}
                  </p>
                ) : null;
              })()}
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Payment Amount"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                  <textarea
                    placeholder="Add notes about this payment..."
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    className="w-full border rounded-lg p-2"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetPaymentForm();
                      setPaymentModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-lg border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                  >
                    Record Payment
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
