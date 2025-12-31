"use client";

import { API_URL } from "@/helpers/apiUrl";
import { createApiRequest } from "@/helpers/axios";
import FeedbackCategoryService from "@/services/FeedbackCategoryService";
import FeedbackTemplateService from "@/services/FeedbackTemplateService";
import FeedbackTemplateModal from "@/components/modals/FeedbackTemplateModal";
import { useEffect, useMemo, useState, useRef } from "react";
import Select from "react-select";
import { Plus, Mic, StopCircle, Trash2, Upload } from "lucide-react";
import { toast } from "react-hot-toast";

const FeedbackModal = ({ isOpen, onClose, onSuccess, feedback, initialData }) => {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    comment: "",
    instruction: "",
    customer_id: null,
    followup_id: null,
    followup_detail_id: null, // New field
    category: "",
    message_template_id: null, // New field for template ID
    audio: null,
    audio_preview: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [feedbackTemplates, setFeedbackTemplates] = useState([]);
  const [feedbackCategoryOptions, setFeedbackCategoryOptions] = useState([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Audio recording states
  const [recordingMode, setRecordingMode] = useState("upload"); // 'upload' or 'record'
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const audioStreamRef = useRef(null);

  const commandApi = useMemo(() => createApiRequest(API_URL), []);

  // Customer options for select
  const customerOptions = useMemo(() => {
    return customers.map((customer) => ({
      value: customer.id,
      label: `${customer.name} - ${customer.mobile || customer.email || "No contact"}`,
    }));
  }, [customers]);

  // Followup options for select
  const followupOptions = useMemo(() => {
    return followups.map((followup) => ({
      value: followup.id,
      label: `${followup.title || "Followup"} - ${followup.customer?.name || "Unknown Customer"}`,
    }));
  }, [followups]);

  // Feedback Template options for select
  const feedbackTemplateOptions = useMemo(() => {
    if (!formData.category) {
      return [];
    }
    const selectedCategoryValue = formData.category.value;
    return feedbackTemplates
      .filter((template) => template.category === selectedCategoryValue)
      .map((template) => ({
        value: template.id,
        label: template.title,
        message: template.message,
        instruction: template.instruction,
      }));
  }, [feedbackTemplates, formData.category]);

  // Custom styles for react-select
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

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await commandApi.get("/api/customers/list");
      if (response && response.status === "success") {
        setCustomers(response.data || []);

        // Update customer label if we have initialData
        if (initialData?.customer_id && formData.customer_id?.value === initialData.customer_id) {
          const customer = response.data?.find((c) => c.id === initialData.customer_id);
          if (customer) {
            setFormData((prev) => ({
              ...prev,
              customer_id: {
                value: customer.id,
                label: `${customer.name} - ${customer.mobile || customer.email || "No contact"}`,
              },
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  // Fetch followups
  const fetchFollowups = async () => {
    try {
      const response = await commandApi.get("/api/followups");
      if (response && response.status === "success") {
        setFollowups(response.data?.data || []);
      }
    } catch (error) {
      console.error("Error fetching followups:", error);
    }
  };

  // Fetch feedback templates
  const fetchFeedbackTemplates = async () => {
    try {
      const response = await FeedbackTemplateService.Queries.getFeedbackTemplates();
      if (response && response.status === "success") {
        setFeedbackTemplates(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching feedback templates:", error);
    }
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
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(audioBlob);
        
        // Convert blob to File object and set preview URL
        const audioFile = new File([audioBlob], 'recorded-audio.webm', { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setFormData(prev => ({
          ...prev,
          audio: audioFile,
          audio_preview: audioUrl
        }));

        // Stop all tracks
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone. Please ensure you have granted permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const clearRecording = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    setFormData(prev => ({
      ...prev,
      audio: null,
      audio_preview: ""
    }));
    
    // Revoke object URL to prevent memory leaks
    if (formData.audio_preview && formData.audio_preview.startsWith('blob:')) {
      URL.revokeObjectURL(formData.audio_preview);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isOpen) {
      // Only fetch all customers if a specific customer isn't provided
      if (!initialData?.customer) {
        fetchCustomers();
      }
      // Only fetch all followups if a specific followup isn't provided
      if (!initialData?.followup) {
        fetchFollowups();
      }
      fetchFeedbackTemplates(); // Fetch feedback templates when modal opens
      fetchFeedbackCategories();
    }
  }, [isOpen, initialData?.customer, initialData?.followup]);

  useEffect(() => {
    if (feedback) {
      // Edit mode
      const selectedFollowup = followups.find((f) => f.id === feedback.followup_id);
      setFormData({
        title: feedback.title || "",
        message: feedback.message || "",
        comment: feedback.comment || "",
        instruction: feedback.instruction || "",
        customer_id: feedback.customer_id
          ? {
              value: feedback.customer_id,
              label: feedback.customer ? `${feedback.customer.name} - ${feedback.customer.mobile || feedback.customer.email || "No contact"}` : "Customer",
            }
          : null,
        followup_id: selectedFollowup
          ? {
              value: selectedFollowup.id,
              label: `${selectedFollowup.title || "Followup"} - ${selectedFollowup.customer?.name || "Unknown Customer"}`,
            }
          : null,
        category: feedback.category
          ? {
              value: feedback.category,
              label: feedback.category,
            }
          : null,
        followup_detail_id: feedback.followup_detail_id || null, // Set for edit mode
        message_template_id: feedback.message_template_id || null, // Set for edit mode
        audio: null,
        audio_preview: feedback.audio ? feedback.audio.url : "",
      });
    } else {
      // New mode
      const customer = initialData?.customer;
      const followup = initialData?.followup;
      setFormData({
        title: "",
        message: "",
        comment: "",
        instruction: "",
        customer_id: customer
          ? {
              value: customer.id,
              label: `${customer.name} - ${customer.mobile || customer.email || "No contact"}`,
            }
          : null,
        followup_id: followup
          ? {
              value: followup.id,
              label: `${followup.title || "Followup"} - ${followup.customer?.name || "Unknown Customer"}`,
            }
          : null,
        followup_detail_id: initialData?.followup_detail_id || null, // Set for new mode from initialData
        category: "",
        message_template_id: null, // Reset for new mode
        audio: null,
        audio_preview: "",
      });
    }
    setErrors({});
  }, [feedback, isOpen, initialData, followups]);

  // Cleanup audio recording on unmount or modal close
  useEffect(() => {
    return () => {
      // Stop recording if active
      if (isRecording && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      
      // Clear timer
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      
      // Stop all audio tracks
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Revoke object URL
      if (formData.audio_preview && formData.audio_preview.startsWith('blob:')) {
        URL.revokeObjectURL(formData.audio_preview);
      }
    };
  }, [isRecording, formData.audio_preview]);

  // Reset recording state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRecordingMode("upload");
      setIsRecording(false);
      setRecordedBlob(null);
      setRecordingTime(0);
      
      // Stop recording if active
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      
      // Clear timer
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      
      // Stop all audio tracks
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // if (!formData.message.trim()) {
    //   newErrors.message = "Message is required";
    // }

    if (!formData.customer_id) {
      newErrors.customer_id = "Customer is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.comment.trim()) {
      newErrors.comment = "Comment is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("message", formData.message);
    data.append("comment", formData.comment);
    data.append("instruction", formData.instruction);
    data.append("customer_id", formData.customer_id?.value || formData.customer_id);
    data.append("followup_id", formData.followup_id?.value || formData.followup_id);
    data.append("followup_detail_id", formData.followup_detail_id);
    data.append("category", formData.category?.value || formData.category);
    data.append("message_template_id", formData.message_template_id || null);
    if (formData.audio) {
        data.append("audio", formData.audio);
    }

    try {
        let response;
        if (feedback) {
            data.append("_method", "PUT");
            response = await commandApi.post(`/api/feedbacks/${feedback.id}`, data);
        } else {
            response = await commandApi.post("/api/feedbacks", data);
        }

      if (response && response.status === "success") {
        onSuccess();
        onClose();
      } else {
        setErrors({ submit: response?.message || "Failed to save feedback" });
      }
    } catch (error) {
      console.error("Error saving feedback:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ submit: error.response?.data?.message || "Failed to save feedback" });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{feedback ? "Edit Feedback" : "Add New Feedback"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter feedback title"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feedback Category *</label>
            <Select
              value={formData.category}
              onChange={(option) => {
                handleInputChange("category", option);
                // Clear dependent fields when category changes
                handleInputChange("message_template_id", null);
                handleInputChange("message", "");
                handleInputChange("comment", "");
                handleInputChange("instruction", "");
              }}
              options={feedbackCategoryOptions}
              placeholder="Select Feedback Category"
              isSearchable
              isClearable
              styles={customStyles}
              className="react-select-container"
              classNamePrefix="react-select"
            />
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
            {/* New Select for Feedback Templates */}
            <Select
              value={formData.message_template_id ? feedbackTemplateOptions.find((opt) => opt.value === formData.message_template_id) : null}
              onChange={(option) => {
                handleInputChange("message_template_id", option?.value || null);
                handleInputChange("message", option?.label || ""); // Populate message from selected template
                handleInputChange("comment", option?.message || ""); // Populate comment from selected template's message
                handleInputChange("instruction", option?.instruction || ""); // Populate instruction from selected template's instruction
              }}
              options={feedbackTemplateOptions}
              placeholder="Select a Feedback Template (Optional)"
              isSearchable
              isClearable
              styles={customStyles}
              className="react-select-container mb-2"
              classNamePrefix="react-select"
            />

            {/* Add New Feedback Template Button */}
            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(true)}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 mb-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Feedback Template
            </button>

            {/* Original Comment Textarea (now populated by template or for custom input) */}
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
            <textarea
              value={formData.comment}
              onChange={(e) => handleInputChange("comment", e.target.value)}
              rows={4}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.comment ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter feedback comment or it will be filled by template"
            />
            {errors.comment && <p className="text-red-500 text-sm mt-1">{errors.comment}</p>}
          </div>

          {/* Instruction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instruction</label>
            <textarea
              value={formData.instruction}
              onChange={(e) => handleInputChange("instruction", e.target.value)}
              rows={3}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.instruction ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter instruction"
            />
          </div>

          {/* Audio Upload/Record */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Audio</label>
            
            {/* Mode Toggle Buttons */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  setRecordingMode("upload");
                  clearRecording();
                }}
                className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  recordingMode === "upload"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecordingMode("record");
                  handleInputChange("audio", null);
                  handleInputChange("audio_preview", "");
                }}
                className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  recordingMode === "record"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Mic className="w-4 h-4 mr-2" />
                Record Audio
              </button>
            </div>

            {/* Upload Mode */}
            {recordingMode === "upload" && (
              <div>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleInputChange("audio", file);
                      handleInputChange("audio_preview", URL.createObjectURL(file));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Record Mode */}
            {recordingMode === "record" && (
              <div className="space-y-3">
                {!isRecording && !recordedBlob && (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </button>
                )}

                {isRecording && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center p-4 bg-red-50 border-2 border-red-300 rounded-md">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                        <span className="text-red-600 font-semibold text-lg">
                          Recording: {formatTime(recordingTime)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="w-full flex items-center justify-center px-4 py-3 bg-gray-700 text-white text-sm font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                    >
                      <StopCircle className="w-5 h-5 mr-2" />
                      Stop Recording
                    </button>
                  </div>
                )}

                {!isRecording && recordedBlob && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={clearRecording}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear
                    </button>
                    <span className="text-sm text-gray-600 flex-1">
                      Recorded: {formatTime(recordingTime)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Audio Preview */}
            {formData.audio_preview && (
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <audio controls src={formData.audio_preview} className="w-full" />
              </div>
            )}
          </div>

          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
            {initialData?.customer ? (
              <div className="w-full p-2 border rounded-md bg-gray-100">
                <p className="text-gray-800 font-semibold">{initialData.customer.name}</p>
                <p className="text-sm text-gray-600">{initialData.customer.mobile || initialData.customer.email}</p>
              </div>
            ) : (
              <Select
                value={formData.customer_id}
                onChange={(option) => handleInputChange("customer_id", option)}
                options={customerOptions}
                placeholder="Select Customer"
                isSearchable
                isClearable
                styles={customStyles}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            )}
            {errors.customer_id && <p className="text-red-500 text-sm mt-1">{errors.customer_id}</p>}
          </div>

          {/* Followup */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Related Followup</label>
            {initialData?.followup ? (
              <div className="w-full p-2 border rounded-md bg-gray-100">
                <p className="text-gray-800 font-semibold">{initialData.followup.title || "No Title"}</p>
                <p className="text-sm text-gray-600">{initialData.followup.customer?.name || "Unknown Customer"}</p>
              </div>
            ) : (
              <Select
                value={formData.followup_id}
                onChange={(option) => handleInputChange("followup_id", option)}
                options={followupOptions}
                placeholder="Select Followup (Optional)"
                isSearchable
                isClearable
                styles={customStyles}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            )}
            {errors.followup_id && <p className="text-red-500 text-sm mt-1">{errors.followup_id}</p>}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : feedback ? "Update Feedback" : "Create Feedback"}
            </button>
          </div>
        </form>
      </div>

      {/* Feedback Template Modal */}
      <FeedbackTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSuccess={() => {
          fetchFeedbackTemplates();
          setIsTemplateModalOpen(false);
        }}
        editingTemplate={null}
      />
    </div>
  );
};

export default FeedbackModal;
