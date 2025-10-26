import React, { useState } from "react";
import { Users, Plus, Trash } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useAppStore } from "@/store/useAppStore";

export default function ClientsPage() {
  // Only subscribe to what is needed for this component
  const clients = useAppStore(state => state.clients);
  const addClient = useAppStore(state => state.addClient);
  const deleteClient = useAppStore(state => state.deleteClient);
  const notes = useAppStore(state => state.notes);

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
    <Layout children={undefined}>
      {/* ...your UI and modals as previously structured... */}
      {/* Table, modal, notes section, etc. */}
    </Layout>
  );
}
