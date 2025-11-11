"use client";
import React, { useState, useEffect } from "react";
import { Briefcase, Plus, Trash, Edit, Wrench, MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/router";
import { withRoleProtection } from "@/hoc/withRoleProtection";

type ProjectStatus = "In Progress" | "Completed" | "Pending";

function ProjectsPage() {
  const router = useRouter();
  const projects = useAppStore((state) => state.projects);
  const addProject = useAppStore((state) => state.addProject);
  const updateProject = useAppStore((state) => state.updateProject);
  const deleteProject = useAppStore((state) => state.deleteProject);
  
  const getProjectIssues = useAppStore((state) => state.getProjectIssues);
  const addMaintenanceIssue = useAppStore((state) => state.addMaintenanceIssue);
  const updateMaintenanceIssue = useAppStore((state) => state.updateMaintenanceIssue);
  const deleteMaintenanceIssue = useAppStore((state) => state.deleteMaintenanceIssue);
  const getIssueComments = useAppStore((state) => state.getIssueComments);
  const addMaintenanceComment = useAppStore((state) => state.addMaintenanceComment);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  
  const [issuesModalOpen, setIssuesModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [addIssueModalOpen, setAddIssueModalOpen] = useState(false);
  const [issueDetailModalOpen, setIssueDetailModalOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);

  useEffect(() => {
    if (router.query.projectId && router.query.openMaintenance === 'true') {
      const projectId = Number(router.query.projectId);
      setSelectedProjectId(projectId);
      setIssuesModalOpen(true);
      router.replace('/projects', undefined, { shallow: true });
    }
  }, [router.query]);

  const [form, setForm] = useState({
    name: "",
    externalClient: "",
    budget: "",
    amountPaid: "",
    status: "In Progress" as ProjectStatus,
  });
  
  const [issueForm, setIssueForm] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    category: "other" as "plumbing" | "electrical" | "hvac" | "appliance" | "structural" | "other",
  });
  
  const [commentText, setCommentText] = useState("");
  const [activeTab, setActiveTab] = useState<"projects" | "maintenance">("projects");
  const maintenanceIssues = useAppStore((state) => state.maintenanceIssues);

  const resetForm = () => {
    setForm({
      name: "",
      externalClient: "",
      budget: "",
      amountPaid: "",
      status: "In Progress",
    });
    setEditingProjectId(null);
  };

  const openEditModal = (project: any) => {
    setEditingProjectId(project.id);
    setForm({
      name: project.name,
      externalClient: project.externalClient,
      budget: project.budget.toString(),
      amountPaid: project.amountPaid.toString(),
      status: project.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.externalClient) return;

    const projectData = {
      name: form.name,
      externalClient: form.externalClient,
      budget: Number(form.budget),
      amountPaid: Number(form.amountPaid),
      status: form.status,
    };

    if (editingProjectId !== null) {
      updateProject(editingProjectId, projectData);
    } else {
      addProject(projectData);
    }

    resetForm();
    setModalOpen(false);
  };
  
  const openIssuesModal = (projectId: number) => {
    setSelectedProjectId(projectId);
    setIssuesModalOpen(true);
  };
  
  const openAddIssueModal = () => {
    setAddIssueModalOpen(true);
  };
  
  const handleAddIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.title || !selectedProjectId) return;
    
    await addMaintenanceIssue({
      projectId: selectedProjectId,
      title: issueForm.title,
      description: issueForm.description,
      priority: issueForm.priority,
      category: issueForm.category,
      status: "open",
    });
    
    setIssueForm({
      title: "",
      description: "",
      priority: "medium",
      category: "other",
    });
    setAddIssueModalOpen(false);
  };
  
  const openIssueDetail = (issueId: number) => {
    setSelectedIssueId(issueId);
    setIssuesModalOpen(false);
    setIssueDetailModalOpen(true);
  };
  
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText || !selectedIssueId) return;
    
    await addMaintenanceComment(selectedIssueId, commentText);
    setCommentText("");
  };

  const handleStatusChange = async (issueId: number, newStatus: string) => {
    if (newStatus === "closed" || newStatus === "resolved") {
      await updateMaintenanceIssue(issueId, { 
        status: newStatus,
        deletedAt: new Date().toISOString()
      } as any);
      setIssueDetailModalOpen(false);
      setIssuesModalOpen(true);
    } else {
      await updateMaintenanceIssue(issueId, { status: newStatus as any });
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-red-500 dark:bg-red-600";
      case "in_progress": return "bg-yellow-500 dark:bg-yellow-600";
      case "resolved": return "bg-green-500 dark:bg-green-600";
      case "closed": return "bg-gray-500 dark:bg-gray-600";
      default: return "bg-gray-500 dark:bg-gray-600";
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-600 dark:text-red-400";
      case "high": return "text-orange-600 dark:text-orange-400";
      case "medium": return "text-yellow-600 dark:text-yellow-400";
      case "low": return "text-green-600 dark:text-green-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  const getProjectName = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  // ✅ RETURN UI (this was missing)
  return (
  <div className="p-6">
    {/* Header */}
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
        <Briefcase className="w-7 h-7 text-gray-800 dark:text-gray-100" />
        Projects
      </h1>

      <button
        onClick={() => setModalOpen(true)}
        className="px-4 py-2 rounded-xl bg-blue-600 dark:bg-blue-700 text-white flex items-center gap-2 hover:bg-blue-700 dark:hover:bg-blue-600"
      >
        <Plus className="w-5 h-5" />
        New Project
      </button>
    </div>

    {/* Tabs */}
    <div className="mb-6 border-b dark:border-gray-700">
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab("projects")}
          className={`pb-3 px-2 text-sm font-medium transition ${
            activeTab === "projects"
              ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Briefcase className="w-4 h-4 inline mr-2" />
          Projects
        </button>
        <button
          onClick={() => setActiveTab("maintenance")}
          className={`pb-3 px-2 text-sm font-medium transition ${
            activeTab === "maintenance"
              ? "border-b-2 border-purple-600 text-purple-600 dark:text-purple-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Wrench className="w-4 h-4 inline mr-2" />
          All Maintenance Issues
        </button>
      </div>
    </div>

    {/* Projects List */}
    {activeTab === "projects" && (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {projects.map((project) => {
        const issues = getProjectIssues(project.id);
        const openIssues = issues.filter(i => i.status === "open" || i.status === "in_progress");
        
        return (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border dark:border-gray-700 rounded-xl shadow bg-white dark:bg-gray-800"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{project.name}</h2>
              <p className="text-gray-600 dark:text-gray-300">{project.externalClient}</p>
            </div>
            {openIssues.length > 0 && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                {openIssues.length} {openIssues.length === 1 ? 'Issue' : 'Issues'}
              </span>
            )}
          </div>

          <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
            <p>Budget: ${project.budget}</p>
            <p>Paid: ${project.amountPaid}</p>
            <p>Status: {project.status}</p>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => openIssuesModal(project.id)}
              className="flex items-center gap-1 px-3 py-2 rounded bg-purple-500 dark:bg-purple-600 text-white hover:bg-purple-600 dark:hover:bg-purple-500 text-sm"
            >
              <Wrench className="w-4 h-4" />
              Maintenance
            </button>
            
            <button
              onClick={() => openEditModal(project)}
              className="p-2 rounded bg-yellow-400 dark:bg-yellow-600 text-white hover:bg-yellow-500 dark:hover:bg-yellow-500"
            >
              <Edit className="w-4 h-4" />
            </button>

            <button
              onClick={() => deleteProject(project.id)}
              className="p-2 rounded bg-red-500 dark:bg-red-700 text-white hover:bg-red-600 dark:hover:bg-red-600"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
        );
      })}
    </div>
    )}

    {/* Maintenance Tab */}
    {activeTab === "maintenance" && (
      <div className="space-y-4">
        {maintenanceIssues.filter(issue => !issue.deletedAt).length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No maintenance issues yet
          </p>
        ) : (
          maintenanceIssues.filter(issue => !issue.deletedAt).map((issue) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => {
                setSelectedProjectId(issue.projectId);
                setSelectedIssueId(issue.id);
                setIssueDetailModalOpen(true);
              }}
              className="p-4 border dark:border-gray-700 rounded-xl shadow bg-white dark:bg-gray-800 cursor-pointer hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{issue.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusColor(issue.status)}`}>
                  {issue.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{issue.description}</p>
              <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Project: {getProjectName(issue.projectId)}</span>
                <span className={`font-semibold ${getPriorityColor(issue.priority)}`}>
                  {issue.priority.toUpperCase()}
                </span>
                <span>{issue.category}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    )}

    {/* Modal */}
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex justify-center items-center p-4"
        >
          <motion.form
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md space-y-4"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {editingProjectId ? "Edit Project" : "New Project"}
            </h2>

            <input
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Project Name"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
            />

            <input
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="External Client"
              value={form.externalClient}
              onChange={(e) =>
                setForm((f) => ({ ...f, externalClient: e.target.value }))
              }
            />

            <input
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              type="number"
              placeholder="Budget"
              value={form.budget}
              onChange={(e) =>
                setForm((f) => ({ ...f, budget: e.target.value }))
              }
            />

            <input
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              type="number"
              placeholder="Amount Paid"
              value={form.amountPaid}
              onChange={(e) =>
                setForm((f) => ({ ...f, amountPaid: e.target.value }))
              }
            />

            <select
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as ProjectStatus,
                }))
              }
            >
              <option>In Progress</option>
              <option>Completed</option>
              <option>Pending</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 border dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  resetForm();
                  setModalOpen(false);
                }}
              >
                Cancel
              </button>

              <button type="submit" className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600">
                Save
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Issues List Modal */}
    <AnimatePresence>
      {issuesModalOpen && selectedProjectId !== null && (
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
            className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Maintenance Issues</h2>
              <button
                onClick={() => setIssuesModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <button
              onClick={openAddIssueModal}
              className="w-full mb-4 px-4 py-2 rounded-xl bg-purple-600 dark:bg-purple-700 text-white flex items-center justify-center gap-2 hover:bg-purple-700 dark:hover:bg-purple-600"
            >
              <Plus className="w-5 h-5" />
              Add Issue
            </button>

            <div className="space-y-3">
              {getProjectIssues(selectedProjectId).map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => openIssueDetail(issue.id)}
                  className="p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{issue.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusColor(issue.status)}`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{issue.description}</p>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className={`font-semibold ${getPriorityColor(issue.priority)}`}>
                      {issue.priority.toUpperCase()}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {issue.category}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {getIssueComments(issue.id).length} comments
                    </span>
                  </div>
                </div>
              ))}
              {getProjectIssues(selectedProjectId).length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No maintenance issues yet</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Add Issue Modal */}
    <AnimatePresence>
      {addIssueModalOpen && (
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
            onSubmit={handleAddIssue}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md space-y-4"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">New Maintenance Issue</h2>

            <input
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Issue Title"
              value={issueForm.title}
              onChange={(e) => setIssueForm((f) => ({ ...f, title: e.target.value }))}
              required
            />

            <textarea
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Description"
              rows={4}
              value={issueForm.description}
              onChange={(e) => setIssueForm((f) => ({ ...f, description: e.target.value }))}
              required
            />

            <select
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={issueForm.priority}
              onChange={(e) => setIssueForm((f) => ({ ...f, priority: e.target.value as any }))}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>

            <select
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={issueForm.category}
              onChange={(e) => setIssueForm((f) => ({ ...f, category: e.target.value as any }))}
            >
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="hvac">HVAC</option>
              <option value="appliance">Appliance</option>
              <option value="structural">Structural</option>
              <option value="other">Other</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 border dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setAddIssueModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded hover:bg-purple-700 dark:hover:bg-purple-600">
                Create Issue
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Issue Detail Modal with Comments */}
    <AnimatePresence>
      {issueDetailModalOpen && selectedIssueId !== null && (() => {
        const issue = getProjectIssues(selectedProjectId || 0).find(i => i.id === selectedIssueId);
        if (!issue) return null;
        const comments = getIssueComments(selectedIssueId);

        return (
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
              className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{issue.title}</h2>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusColor(issue.status)}`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold ${getPriorityColor(issue.priority)}`}>
                      {issue.priority.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300">
                      {issue.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIssueDetailModalOpen(false);
                    setIssuesModalOpen(true);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4">{issue.description}</p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Update Status
                </label>
                <select
                  className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={issue.status}
                  onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="border-t dark:border-gray-700 pt-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <MessageSquare className="w-5 h-5" />
                  Comments ({comments.length})
                </h3>

                <div className="space-y-3 mb-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-800 dark:text-gray-200">{comment.comment}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'Just now'}
                      </p>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No comments yet</p>
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    className="flex-1 p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded hover:bg-purple-700 dark:hover:bg-purple-600"
                  >
                    Send
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        );
      })()}
    </AnimatePresence>
  </div>
);

}

export default withRoleProtection(ProjectsPage, "property_manager");
