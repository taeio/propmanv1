"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Download } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function FinancePage() {
  const { clients, projects, payments } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate total rent collected (all payments)
  const totalRentCollected = payments.reduce((sum, payment) => sum + payment.amount, 0);

  // Calculate expected rent (all clients' rent amounts)
  const expectedRent = clients.reduce((sum, client) => sum + client.rentAmount, 0);

  // Calculate outstanding balance (expected - collected)
  const outstandingBalance = expectedRent - totalRentCollected;

  // Calculate number of late/due clients
  const lateOrDueClients = clients.filter((c) => c.status === "Late" || c.status === "Due").length;

  // Calculate project budget tracking
  const totalProjectBudget = projects.reduce((sum, project) => sum + project.budget, 0);
  const totalProjectPaid = projects.reduce((sum, project) => sum + project.amountPaid, 0);
  const projectBudgetRemaining = totalProjectBudget - totalProjectPaid;

  // Prepare monthly revenue data for chart
  const monthlyRevenue = payments.reduce((acc, payment) => {
    const date = new Date(payment.paymentDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthName = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    
    if (!acc[monthKey]) {
      acc[monthKey] = { monthKey, month: monthName, revenue: 0 };
    }
    acc[monthKey].revenue += payment.amount;
    return acc;
  }, {} as Record<string, { monthKey: string; month: string; revenue: number }>);

  const chartData = Object.values(monthlyRevenue).sort((a, b) => {
    return new Date(`${a.monthKey}-01`).getTime() - new Date(`${b.monthKey}-01`).getTime();
  });

  const exportToCSV = () => {
    // Prepare CSV data
    const csvRows = [];
    
    // Add header
    csvRows.push("Financial Report - Generated " + new Date().toLocaleDateString());
    csvRows.push("");
    
    // Summary section
    csvRows.push("SUMMARY");
    csvRows.push(`Total Rent Collected,$${totalRentCollected}`);
    csvRows.push(`Expected Rent,$${expectedRent}`);
    csvRows.push(`Outstanding Balance,$${outstandingBalance}`);
    csvRows.push(`Late/Due Clients,${lateOrDueClients}`);
    csvRows.push(`Project Budget Total,$${totalProjectBudget}`);
    csvRows.push(`Project Budget Spent,$${totalProjectPaid}`);
    csvRows.push(`Project Budget Remaining,$${projectBudgetRemaining}`);
    csvRows.push("");
    
    // Payments section
    csvRows.push("PAYMENTS");
    csvRows.push("Date,Client,Unit,Amount,Notes");
    payments
      .slice()
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .forEach((payment) => {
        const client = clients.find((c) => c.id === payment.clientId);
        const clientName = client ? `${client.firstName} ${client.lastName}` : "Unknown";
        const unit = client ? client.unitNumber : "N/A";
        const notes = payment.notes ? payment.notes.replace(/,/g, ";") : "";
        csvRows.push(`${new Date(payment.paymentDate).toLocaleDateString()},${clientName},${unit},$${payment.amount},${notes}`);
      });
    csvRows.push("");
    
    // Clients section
    csvRows.push("CLIENTS");
    csvRows.push("Name,Unit,Rent Amount,Status");
    clients.forEach((client) => {
      csvRows.push(`${client.firstName} ${client.lastName},${client.unitNumber},$${client.rentAmount},${client.status}`);
    });
    csvRows.push("");
    
    // Projects section
    csvRows.push("PROJECTS");
    csvRows.push("Name,External Client,Budget,Amount Paid,Remaining,Status");
    projects.forEach((project) => {
      const remaining = project.budget - project.amountPaid;
      csvRows.push(`${project.name},${project.externalClient},$${project.budget},$${project.amountPaid},$${remaining},${project.status}`);
    });
    
    // Create CSV blob and download
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `financial-report-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Financial Dashboard</h1>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
        >
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Rent Collected */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border-l-4 border-green-500 dark:border-green-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">Total Rent Collected</span>
            <DollarSign className="text-green-500 dark:text-green-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">${totalRentCollected.toLocaleString()}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All-time payments</p>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border-l-4 border-red-500 dark:border-red-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">Outstanding Balance</span>
            <AlertCircle className="text-red-500 dark:text-red-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">${outstandingBalance.toLocaleString()}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{lateOrDueClients} clients late/due</p>
        </div>

        {/* Project Budget */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border-l-4 border-blue-500 dark:border-blue-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">Project Budget</span>
            <TrendingUp className="text-blue-500 dark:text-blue-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">${totalProjectBudget.toLocaleString()}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total allocated</p>
        </div>

        {/* Project Remaining */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border-l-4 border-yellow-500 dark:border-yellow-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">Budget Remaining</span>
            <CreditCard className="text-yellow-500 dark:text-yellow-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">${projectBudgetRemaining.toLocaleString()}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">${totalProjectPaid.toLocaleString()} spent</p>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md mb-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Monthly Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="dark:stroke-gray-600" />
              <XAxis dataKey="month" stroke="#6B7280" className="dark:stroke-gray-400" />
              <YAxis stroke="#6B7280" className="dark:stroke-gray-400" />
              <Tooltip 
                formatter={(value: number) => `$${value.toLocaleString()}`}
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Payments */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md mb-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Recent Payments</h2>
        {payments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No payments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Date</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Client</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Notes</th>
                </tr>
              </thead>
              <tbody>
                {payments
                  .slice()
                  .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                  .slice(0, 10)
                  .map((payment) => {
                    const client = clients.find((c) => c.id === payment.clientId);
                    return (
                      <tr key={payment.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                          {client
                            ? `${client.firstName} ${client.lastName} (Unit ${client.unitNumber})`
                            : "Unknown Client"}
                        </td>
                        <td className="py-3 px-4 font-semibold text-green-600 dark:text-green-400">
                          ${payment.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{payment.notes || "—"}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Project Budget Breakdown */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Project Budget Breakdown</h2>
        {projects.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No projects created yet.</p>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const percentSpent = project.budget > 0 
                ? (project.amountPaid / project.budget) * 100 
                : 0;
              const remaining = project.budget - project.amountPaid;
              
              return (
                <div key={project.id} className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{project.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{project.externalClient}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        project.status === "Completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : project.status === "In Progress"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                      <span>Budget: ${project.budget.toLocaleString()}</span>
                      <span>Paid: ${project.amountPaid.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          percentSpent > 100 ? "bg-red-500 dark:bg-red-600" : "bg-blue-500 dark:bg-blue-600"
                        }`}
                        style={{ width: `${Math.min(percentSpent, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600 dark:text-gray-400">
                        {percentSpent.toFixed(1)}% spent
                      </span>
                      <span
                        className={remaining < 0 ? "text-red-600 dark:text-red-400 font-semibold" : "text-gray-600 dark:text-gray-400"}
                      >
                        ${Math.abs(remaining).toLocaleString()} {remaining < 0 ? "over budget" : "remaining"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
