"use client";

import FeedbackCategoryService from "@/services/FeedbackCategoryService";
import FeedbackTemplateService from "@/services/FeedbackTemplateService";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Select from "react-select";

const FeedbackTemplateModal = ({ isOpen, onClose, onSuccess, editingTemplate }) => {
  const [feedbackCategoryOptions, setFeedbackCategoryOptions] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    status: "active",
    category: "",
    instruction: "",
    audio: null,
    audio_preview: "",
  });

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "#f3f4f6" : "white",
      color: state.isSelected ? "white" : "#374151",
    }),
  };

  const fetchFeedbackCategories = async () => {
    try {
      const response = await FeedbackCategoryService.Queries.getFeedbackCategories();
      if (response && response.success) {
        const options = response.data.map((category) => ({
          value: category.name,
          label: category.name,
        }));
        setFeedbackCategoryOptions(options);
      } else {
        toast.error("Failed to load categories for dropdown");
      }
    } catch (error) {
      toast.error("Failed to fetch categories for dropdown");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFeedbackCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingTemplate) {
      setFormData({
        title: editingTemplate.title,
        message: editingTemplate.message,
        status: editingTemplate.status,
        category: editingTemplate.category || "",
        instruction: editingTemplate.instruction || "",
        audio: null,
        audio_preview: editingTemplate.audio ? editingTemplate.audio.url : "",
      });
    } else {
      resetForm();
    }
  }, [editingTemplate, isOpen]);

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      status: "active",
      category: "",
      instruction: "",
      audio: null,
      audio_preview: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("message", formData.message);
    data.append("status", formData.status);
    data.append("category", formData.category);
    data.append("instruction", formData.instruction);
    if (formData.audio) {
      data.append("audio", formData.audio);
    }

    try {
      if (editingTemplate) {
        data.append("_method", "PUT");
        const response = await FeedbackTemplateService.Commands.updateFeedbackTemplate(editingTemplate.id, data);
        if (response.data) {
          toast.success("Feedback template updated successfully");
          resetForm();
          onSuccess();
          onClose();
        }
      } else {
        const response = await FeedbackTemplateService.Commands.storeFeedbackTemplate(data);
        if (response.data) {
          toast.success("Feedback template created successfully");
          resetForm();
          onSuccess();
          onClose();
        }
      }
    } catch (error) {
      toast.error(editingTemplate ? "Failed to update feedback template" : "Failed to create feedback template");
      console.error("Error:", error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">{editingTemplate ? "Edit Feedback Template" : "Add New Feedback Template"}</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Feedback Category *</label>
              <Select
                value={feedbackCategoryOptions.find((option) => option.value === formData.category)}
                onChange={(option) => setFormData({ ...formData, category: option ? option.value : "" })}
                options={feedbackCategoryOptions}
                placeholder="Select Feedback Category"
                isSearchable
                isClearable
                styles={customStyles}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instruction</label>
              <textarea
                value={formData.instruction}
                onChange={(e) => setFormData({ ...formData, instruction: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Audio</label>
              <input
                type="file"
                onChange={(e) => setFormData({ ...formData, audio: e.target.files[0] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.audio_preview && (
                <div className="mt-2">
                  <audio controls src={formData.audio_preview} />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {editingTemplate ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackTemplateModal;

