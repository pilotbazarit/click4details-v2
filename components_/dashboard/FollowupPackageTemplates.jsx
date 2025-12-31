"use client";

import { useAppContext } from "@/context/AppContext";
import { API_URL } from "@/helpers/apiUrl";
import { createApiRequest } from "@/helpers/axios";
import { ChevronDown, ChevronRight, Clock, Edit, MessageSquare, Plus, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const FollowupPackageTemplates = () => {
  const { user } = useAppContext();
  const parsedUser = JSON.parse(user);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPackages, setExpandedPackages] = useState({});

  // Modal states
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [currentStage, setCurrentStage] = useState(null);
  const [editingPackageId, setEditingPackageId] = useState(null);

  // Delete confirmation
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(""); // 'package' or 'stage'

  // Create API instance at component level
  const api = createApiRequest(API_URL);

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("api/followup-package-templates");
      setPackages(response.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      const errorMessage = err.message || "Failed to fetch packages";
      setError(errorMessage);
      toast.error(errorMessage);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, []); // Remove api dependency to prevent unnecessary re-renders

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const togglePackageExpansion = (packageId) => {
    setExpandedPackages((prev) => ({
      ...prev,
      [packageId]: !prev[packageId],
    }));
  };

  const handleAddPackage = () => {
    setCurrentPackage(null);
    setEditingPackageId(null);
    setShowPackageModal(true);
  };

  const handleEditPackage = (pkg) => {
    setCurrentPackage(pkg);
    setEditingPackageId(pkg.id);
    setShowPackageModal(true);
  };

  const handleAddStage = (packageId) => {
    setCurrentStage(null);
    setEditingPackageId(packageId);
    setShowStageModal(true);
  };

  const handleEditStage = (stage, packageId) => {
    setCurrentStage(stage);
    setEditingPackageId(packageId);
    setShowStageModal(true);
  };

  const handleDelete = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteType === "package") {
        await api.delete(`api/followup-package-templates/${itemToDelete.id}`);
        toast.success("Package deleted successfully");
      } else if (deleteType === "stage") {
        await api.delete(`api/followup-package-templates/${editingPackageId}/stages/${itemToDelete.id}`);
        toast.success("Stage deleted successfully");
      }
      fetchPackages();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setShowConfirmDialog(false);
      setItemToDelete(null);
      setDeleteType("");
    }
  };

  const handlePackageSubmit = async (packageData) => {
    try {
      if (editingPackageId) {
        await api.put(`api/followup-package-templates/${editingPackageId}`, packageData);
        toast.success("Package updated successfully");
      } else {
        await api.post("api/followup-package-templates", packageData);
        toast.success("Package created successfully");
      }
      setShowPackageModal(false);
      fetchPackages();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStageSubmit = async (stageData) => {
    try {
      if (currentStage) {
        await api.put(`api/followup-package-templates/${editingPackageId}/stages/${currentStage.id}`, stageData);
        toast.success("Stage updated successfully");
      } else {
        await api.post(`api/followup-package-templates/${editingPackageId}/stages`, stageData);
        toast.success("Stage created successfully");
      }
      setShowStageModal(false);
      fetchPackages();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="w-full p-6 space-y-6 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">Followup Package Templates</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2" onClick={handleAddPackage}>
          <Plus className="w-4 h-4" />
          Add New Template
        </button>
      </div>

      {/* Packages List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {packages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No followup package templates found.</p>
            <p className="text-sm">Create your first template to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {packages.map((pkg) => (
              <div key={pkg.id} className="p-6">
                {/* Package Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-1 items-start gap-3">
                    <button onClick={() => togglePackageExpansion(pkg.id)} className="flex-shrink-0 rounded p-1 hover:bg-gray-100 mt-1">
                      {expandedPackages[pkg.id] ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </button>
                    <div className="w-full">
                      <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                      <p className="text-sm text-gray-500">{pkg.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className="text-sm text-gray-500">{pkg.stages?.length || 0} stages</span>
                    <button
                      onClick={() => handleAddStage(pkg.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Stage
                    </button>
                    {(parsedUser?.id === pkg.created_by || parsedUser?.user_mode === "supreme") && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEditPackage(pkg)} className="bg-yellow-500 text-white px-3 py-2 rounded text-sm hover:bg-yellow-600">
                          <Edit className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDelete(pkg, "package")} className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Package Stages */}
                {expandedPackages[pkg.id] && (
                  <div className="mt-4 ml-8">
                    {pkg.stages && pkg.stages.length > 0 ? (
                      <div className="space-y-3">
                        {pkg.stages.map((stage, index) => (
                          <div key={stage.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">{stage.stage_name}</span>
                                </div>
                                {stage.message_type && stage.message_type !== "message" && (
                                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                    {stage.message_type.charAt(0).toUpperCase() + stage.message_type.slice(1)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {stage.include_call && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">+ Call</span>}
                                <button
                                  onClick={() => handleEditStage(stage, pkg.id)}
                                  className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDelete(stage, "stage")}
                                  className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div className="mt-2 space-y-2">
                              <p className="text-sm text-gray-700 line-clamp-2">{stage.message_template}</p>
                              
                              {/* Additional Stage Information */}
                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="inline-flex items-center px-2 py-1 bg-indigo-50 text-indigo-700 rounded">
                                  <span className="font-medium">Trigger:</span>
                                  <span className="ml-1">{stage.trigger_event_type === 'visit_date' ? 'Visit Date' : 'Followup Date'}</span>
                                </span>
                                {stage.day && (
                                  <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 rounded">
                                    <span className="font-medium">Day:</span>
                                    <span className="ml-1">{stage.day}</span>
                                  </span>
                                )}
                                {stage.day_of_week && (
                                  <span className="inline-flex items-center px-2 py-1 bg-amber-50 text-amber-700 rounded">
                                    <span className="font-medium">Week:</span>
                                    <span className="ml-1">{stage.day_of_week}</span>
                                  </span>
                                )}
                                {(stage.day_offset !== null && stage.day_offset !== undefined) && (
                                  <span className="inline-flex items-center px-2 py-1 bg-cyan-50 text-cyan-700 rounded">
                                    <span className="font-medium">Offset:</span>
                                    <span className="ml-1">{stage.day_offset}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p>No stages added yet.</p>
                        <button onClick={() => handleAddStage(pkg.id)} className="text-blue-500 hover:text-blue-600 text-sm mt-1">
                          Add your first stage
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Package Modal */}
      {showPackageModal && (
        <PackageModal isOpen={showPackageModal} onClose={() => setShowPackageModal(false)} onSubmit={handlePackageSubmit} package={currentPackage} />
      )}

      {/* Stage Modal */}
      {showStageModal && <StageModal isOpen={showStageModal} onClose={() => setShowStageModal(false)} onSubmit={handleStageSubmit} stage={currentStage} />}

      {/* Delete Confirmation */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-4">
              Are you sure you want to delete this {deleteType}?{deleteType === "package" && " This will also delete all associated stages."}
            </p>
            <div className="flex justify-end space-x-4">
              <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Package Modal Component
const PackageModal = ({ isOpen, onClose, onSubmit, package: pkg }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      if (pkg) {
        setName(pkg.name || "");
        setDescription(pkg.description || "");
      } else {
        setName("");
        setDescription("");
      }
    }
  }, [isOpen, pkg]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter a package name");
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{pkg ? "Edit Package Template" : "Add Package Template"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Package Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 15-day followup, 8-day followup"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the purpose of this template..."
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            {pkg ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Stage Modal Component
const StageModal = ({ isOpen, onClose, onSubmit, stage }) => {
  const [dayOffset, setDayOffset] = useState("");
  const [stageName, setStageName] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("");
  const [includeCall, setIncludeCall] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState(""); // Changed to empty string
  const [day, setDay] = useState(""); // Changed to string
  const [triggerEventType, setTriggerEventType] = useState("followup_date"); // Default to followup_date

  React.useEffect(() => {
    if (isOpen) {
      if (stage) {
        setDayOffset(stage.day_offset?.toString() || "");
        setStageName(stage.stage_name || "");
        setMessageTemplate(stage.message_template || "");
        setIncludeCall(stage.include_call || false);
        setDayOfWeek(stage.day_of_week || ""); // Populate new state
        setDay(stage.day || ""); // Populate new state for Day
        setTriggerEventType(stage.trigger_event_type || "followup_date"); // Populate trigger event type
      } else {
        setDayOffset("");
        setStageName("");
        setMessageTemplate("");
        setIncludeCall(false);
        setDayOfWeek(""); // Reset new state
        setDay(""); // Reset new state for Day
        setTriggerEventType("followup_date"); // Reset to default
      }
    }
  }, [isOpen, stage]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!stageName.trim() || !messageTemplate.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const submitData = {
      stage_name: stageName.trim(),
      message_template: messageTemplate.trim(),
      include_call: includeCall,
      trigger_event_type: triggerEventType,
    };

    if (triggerEventType === "visit_date") {
      submitData.day_offset = parseInt(dayOffset);
      submitData.day_of_week = null; // Clear if not relevant
      submitData.day = null; // Clear if not relevant
    } else {
      // followup_date
      submitData.day_of_week = parseInt(dayOfWeek);
      submitData.day = day;
      submitData.day_offset = null; // Clear if not relevant
    }

    onSubmit(submitData);
  };

  const dayOffsetOptions = Array.from({ length: 31 }, (_, i) => ({
    value: -i,
    label: i === 0 ? "Visit Day" : `V-${i}`,
  }));

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{stage ? "Edit Stage" : "Add Stage"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage Name *</label>
              <input
                type="text"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., প্রথম সোমবার, দ্বিতিয় সোমবার"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Event Type</label>
            <select
              value={triggerEventType}
              onChange={(e) => setTriggerEventType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="followup_date">Followup Start Date</option>
              <option value="visit_date">Visit Date</option>
            </select>
          </div>

          {triggerEventType === "visit_date" ? (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visit Day</label>
                <select
                  value={dayOffset}
                  onChange={(e) => setDayOffset(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {dayOffsetOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(parseInt(e.target.value) || "")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  <option value="1">First</option>
                  <option value="2">Second</option>
                  <option value="3">Third</option>
                  <option value="4">Fourth</option>
                  <option value="5">Fifth</option>
                  <option value="6">Sixth</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  <option value="Sunday">Sunday</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Template *</label>
              <textarea
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the message template for this stage..."
              />
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeCall"
              checked={includeCall}
              onChange={(e) => setIncludeCall(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeCall" className="ml-2 block text-sm text-gray-900">
              Include phone call (+ call)
            </label>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            {stage ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowupPackageTemplates;
