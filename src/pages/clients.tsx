"use client";
import React from "react";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { User2, Home, DollarSign, Calendar } from "lucide-react";

export default function ClientsPage() {
  const clients = useAppStore((state) => state.clients);

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-bold text-gray-800"
        >
          Tenants Overview
        </motion.h1>

        {clients.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center text-gray-500 bg-white rounded-2xl p-10 shadow-sm"
          >
            No current tenants. Add one from the “Clients” tab.
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {clients.map((client) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-2"
              >
                <div className="flex items-center gap-2 text-gray-700">
                  <User2 className="w-4 h-4 text-columbia-700" />
                  <p className="font-semibold">
                    {client.firstName} {client.lastName}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Home className="w-4 h-4" />
                  <p>{client.leaseTerm} lease — moved in {client.moveInDate}</p>
                </div>

                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <DollarSign className="w-4 h-4" />
                  <p>
                    Rent: ${client.rentAmount} ({client.rentStatus})
                  </p>
                </div>

                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Calendar className="w-4 h-4" />
                  <p>Email: {client.email}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}


