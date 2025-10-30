"use client";
import React from "react";
import Layout from "@/components/Layout";
import { useAppStore } from "@/store/useAppStore";
import { Users } from "lucide-react";

export default function DashboardPage() {
  const clients = useAppStore((state) => state.clients);
  const projects = useAppStore((state) => state.projects);

  // Optional summary counts
  const paidClients = clients.filter((c) => c.status === "Paid").length;
  const dueClients = clients.filter((c) => c.status === "Due").length;
  const lateClients = clients.filter((c) => c.status === "Late").length;

  return (
    <Layout>
      <div className="p-6 space-y-8">
        {/* ---- Original Dashboard Header ---- */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
        </div>

        {/* ---- Your Existing Dashboard Cards (keep these) ---- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-xl p-6 border border-gray-200">
            <h3 className="text-gray-500 text-sm">Paid Tenants</h3>
            <p className="text-2xl font-bold text-green-600">{paidClients}</p>
          </div>

          <div className="bg-white shadow rounded-xl p-6 border border-gray-200">
            <h3 className="text-gray-500 text-sm">Due Tenants</h3>
            <p className="text-2xl font-bold text-yellow-600">{dueClients}</p>
          </div>

          <div className="bg-white shadow rounded-xl p-6 border border-gray-200">
            <h3 className="text-gray-500 text-sm">Late Tenants</h3>
            <p className="text-2xl font-bold text-red-600">{lateClients}</p>
          </div>
        </div>

        {/* ---- Your Projects Section (unchanged) ---- */}
        <div className="bg-white shadow rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Active Projects</h2>
          {projects.length === 0 ? (
            <p className="text-gray-500">
              No current projects — add one from the <span className="font-semibold">Projects</span> tab.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="py-2 px-4 border-b">Project Name</th>
                    <th className="py-2 px-4 border-b">Client</th>
                    <th className="py-2 px-4 border-b">Budget</th>
                    <th className="py-2 px-4 border-b">Paid</th>
                    <th className="py-2 px-4 border-b">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{p.name}</td>
                      <td className="py-2 px-4 border-b">{p.externalClient}</td>
                      <td className="py-2 px-4 border-b">${p.budget}</td>
                      <td className="py-2 px-4 border-b">${p.amountPaid}</td>
                      <td className="py-2 px-4 border-b">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ---- New Tenants Section (added) ---- */}
        <div className="bg-white shadow rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Current Tenants
          </h2>

          {clients.length === 0 ? (
            <p className="text-gray-500">
              No tenants yet — add one from the <span className="font-semibold">Clients</span> tab.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="py-2 px-4 border-b">First Name</th>
                    <th className="py-2 px-4 border-b">Last Name</th>
                    <th className="py-2 px-4 border-b">Unit #</th>
                    <th className="py-2 px-4 border-b">Rent ($)</th>
                    <th className="py-2 px-4 border-b">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{client.firstName}</td>
                      <td className="py-2 px-4 border-b">{client.lastName}</td>
                      <td className="py-2 px-4 border-b">{client.unitNumber}</td>
                      <td className="py-2 px-4 border-b">${client.rentAmount}</td>
                      <td
                        className={`py-2 px-4 border-b font-semibold ${
                          client.status === "Paid"
                            ? "text-green-600"
                            : client.status === "Late"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {client.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}



