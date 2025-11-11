import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Settings, LogOut, User, Moon, Sun } from "lucide-react";
import { assignPriorityFromMessage } from "@/utils/priorityAssignment";

export default function TenantDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const {
    isAuthenticated,
    profile,
    projects,
    maintenanceIssues,
    maintenanceComments,
    addMaintenanceIssue,
    getProjectIssues,
    getIssueComments,
    updateProfile,
    saveProfile,
    setTheme,
  } = useAppStore();

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [issueListModalOpen, setIssueListModalOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  
  const [requestForm, setRequestForm] = useState({
    projectId: projects[0]?.id || 0,
    title: "",
    description: "",
    category: "other" as "plumbing" | "electrical" | "hvac" | "appliance" | "structural" | "other",
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    setEditForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
    });
  }, [profile]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const priority = assignPriorityFromMessage(requestForm.title, requestForm.description);
    
    await addMaintenanceIssue({
      projectId: requestForm.projectId,
      title: requestForm.title,
      description: requestForm.description,
      status: "open",
      priority,
      category: requestForm.category,
      assignedTo: null,
      dueDate: null,
    });

    setRequestForm({
      projectId: projects[0]?.id || 0,
      title: "",
      description: "",
      category: "other",
    });
    setRequestModalOpen(false);
  };

  const handleSaveProfile = async () => {
    updateProfile(editForm);
    await saveProfile();
  };

  const toggleTheme = () => {
    const newTheme = profile.themePreference === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    useAppStore.getState().setAuthenticated(false);
    router.push("/auth");
  };

  const currentUserId = user?.id || "";
  const myIssues = maintenanceIssues.filter(issue => 
    !issue.deletedAt && issue.createdBy === currentUserId
  );
  const selectedIssue = selectedIssueId ? myIssues.find(i => i.id === selectedIssueId) : null;
  const selectedIssueComments = selectedIssueId ? getIssueComments(selectedIssueId) : [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-600 dark:text-red-400";
      case "high": return "text-orange-600 dark:text-orange-400";
      case "medium": return "text-yellow-600 dark:text-yellow-400";
      case "low": return "text-green-600 dark:text-green-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-500";
      case "in_progress": return "bg-yellow-500";
      case "resolved": return "bg-green-500";
      case "closed": return "bg-gray-500";
      default: return "bg-gray-400";
    }
  };

  if (!isAuthenticated || isLoading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-indigo-900 dark:text-indigo-200">
              Tenant Portal
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome, {profile.firstName || "Tenant"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-full bg-white dark:bg-gray-700 shadow hover:shadow-lg transition"
            >
              {profile.themePreference === "light" ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              )}
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-3 rounded-full bg-white dark:bg-gray-700 shadow hover:shadow-lg transition"
            >
              <Settings className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </button>
            <button
              onClick={handleLogout}
              className="p-3 rounded-full bg-white dark:bg-gray-700 shadow hover:shadow-lg transition"
            >
              <LogOut className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <Wrench className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Maintenance Requests
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Submit maintenance requests and track their status
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRequestModalOpen(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                New Request
              </button>
              <button
                onClick={() => setIssueListModalOpen(true)}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
              >
                View My Requests ({myIssues.length})
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Quick Info
              </h2>
            </div>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Active Requests:</strong> {myIssues.filter(i => i.status === "open" || i.status === "in_progress").length}</p>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {requestModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex justify-center items-center p-4 z-50"
          >
            <motion.form
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onSubmit={handleSubmitRequest}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-lg space-y-4"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                New Maintenance Request
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Property/Unit
                </label>
                <select
                  className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={requestForm.projectId}
                  onChange={(e) =>
                    setRequestForm((f) => ({ ...f, projectId: Number(e.target.value) }))
                  }
                  required
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Issue Title
                </label>
                <input
                  className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Brief description of the issue"
                  value={requestForm.title}
                  onChange={(e) =>
                    setRequestForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Please describe the issue in detail..."
                  value={requestForm.description}
                  onChange={(e) =>
                    setRequestForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={requestForm.category}
                  onChange={(e) =>
                    setRequestForm((f) => ({ ...f, category: e.target.value as any }))
                  }
                >
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="hvac">HVAC</option>
                  <option value="appliance">Appliance</option>
                  <option value="structural">Structural</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                Priority will be automatically assigned based on the urgency of your request
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}

        {issueListModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex justify-center items-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  My Maintenance Requests
                </h2>
                <button
                  onClick={() => setIssueListModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                {myIssues.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No maintenance requests yet
                  </p>
                ) : (
                  myIssues.map((issue) => (
                    <div
                      key={issue.id}
                      onClick={() => {
                        setSelectedIssueId(issue.id);
                        setIssueListModalOpen(false);
                      }}
                      className="p-4 border dark:border-gray-700 rounded-xl hover:shadow-lg transition cursor-pointer bg-gray-50 dark:bg-gray-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {issue.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusColor(issue.status)}`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {issue.description}
                      </p>
                      <div className="flex gap-3 text-xs">
                        <span className={`font-semibold ${getPriorityColor(issue.priority)}`}>
                          {issue.priority.toUpperCase()}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {issue.category}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {selectedIssueId && selectedIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex justify-center items-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Request Details
                </h2>
                <button
                  onClick={() => setSelectedIssueId(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {selectedIssue.title}
                  </h3>
                  <div className="flex gap-3 mt-2">
                    <span className={`px-3 py-1 text-sm rounded-full text-white ${getStatusColor(selectedIssue.status)}`}>
                      {selectedIssue.status.replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1 text-sm rounded-full font-semibold ${getPriorityColor(selectedIssue.priority)}`}>
                      {selectedIssue.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedIssue.description}
                  </p>
                </div>

                <div className="border-t dark:border-gray-700 pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Updates ({selectedIssueComments.length})
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedIssueComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {comment.comment}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(comment.createdAt || "").toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex justify-center items-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-md space-y-4"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Settings
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name
                </label>
                <input
                  className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, firstName: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, lastName: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
