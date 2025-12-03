"use client";

import CustomDatePicker from "@/components/CustomDatePicker";
import { useAppContext } from "@/context/AppContext";
import { API_URL } from "@/helpers/apiUrl";
import { createApiRequest } from "@/helpers/axios";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";

const FollowupModal = ({ isOpen, onClose, onSuccess, customer = null, customerID = null }) => {
  const { user } = useAppContext();
  const parsedUser = JSON.parse(user);

  const [formData, setFormData] = useState({
    followup_date: null,
    followup_end_date: null,
    customer_id: customer ? customer.id : customerID ? customerID : null,
    description: "",
    followup_by: null,
    followup_package_id: null,
    visit_date: null,
    purchase_date: null,
    customer_info: {},
    stage_dates: {},
  });

  const [editableStages, setEditableStages] = useState([]);

  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [followupPackages, setFollowupPackages] = useState([]);
  const [selectedFollowupPackage, setSelectedFollowupPackage] = useState(null); // New state for selected package
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [openStageMenu, setOpenStageMenu] = useState(null);

  const commandApi = createApiRequest(API_URL);

  const calculateAndSetStages = (currentFormData, currentSelectedFollowupPackage) => {
    if (currentFormData.followup_date && currentSelectedFollowupPackage && currentSelectedFollowupPackage.stages) {
      const newStages = currentSelectedFollowupPackage.stages.map((stage) => {
        let calculatedDate = null;
        const startDate = currentFormData.followup_date ? new Date(currentFormData.followup_date) : null;
        if (startDate) startDate.setHours(0, 0, 0, 0);

        const endDate = currentFormData.followup_end_date ? new Date(currentFormData.followup_end_date) : null;
        if (endDate) endDate.setHours(0, 0, 0, 0);

        if (stage.trigger_event_type === "followup_date") {
          calculatedDate = calculateStageDateFromStartDate(currentFormData.followup_date, stage.day, stage.day_of_week);
        } else if (stage.trigger_event_type === "visit_date") {
          calculatedDate = calculateStageDateFromVisitDate(currentFormData.visit_date, stage.day_offset);
        }

        // Ensure calculated date is not before Followup Start Date
        if (calculatedDate && startDate) {
          if (calculatedDate < startDate) {
            calculatedDate = null; // Set to null if before start date
          }
        }

        // Ensure calculated date is not after Followup End Date
        if (calculatedDate && endDate) {
          if (calculatedDate > endDate) {
            calculatedDate = null; // Set to null if after end date
          }
        }

        return {
          ...stage,
          followup_date: calculatedDate,
        };
      });
      setEditableStages(newStages);
    } else if (!currentSelectedFollowupPackage) {
      setEditableStages([]);
    }
  };

  // Custom styles for react-select
  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "42px",
      borderColor: state.isFocused ? "#3b82f6" : errors[state.name] ? "#ef4444" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#3b82f6" : "#9ca3af",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "#f3f4f6" : "white",
      color: state.isSelected ? "white" : "#374151",
      "&:hover": {
        backgroundColor: state.isSelected ? "#3b82f6" : "#f3f4f6",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  useEffect(() => {
    if (isOpen) {
      const initialize = async () => {
        await fetchUsers();
        await fetchFollowupPackages();

        if (!customer) {
          await fetchCustomers();
        }

        // Reset form for new followup
        setFormData({
          followup_date: null,
          followup_end_date: null,
          customer_id: customer ? customer.id : customerID ? customerID : null,
          description: "",
          followup_by: parsedUser?.id,
          followup_package_id: null,
          visit_date: null, // Reset visit_date
          purchase_date: null,
        });
        setEditableStages([]); // Reset editable stages for new followup
        setSelectedFollowupPackage(null); // Reset selected package
        setErrors({});
      };
      initialize();
    }
  }, [isOpen, customer, customerID]);

  // Effect to calculate stage dates when follow-up start date, end date, or selected package changes
  useEffect(() => {
    calculateAndSetStages(formData, selectedFollowupPackage);
  }, [formData.followup_date, formData.followup_end_date, selectedFollowupPackage, formData.visit_date]);

  const fetchCustomers = async () => {
    try {
      const response = await commandApi.get("/api/customers/list");
      const customersData = response.data.data || response.data || [];
      setCustomers(customersData);
    } catch (error) {
      toast.error("Failed to fetch customers");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await commandApi.get("/api/user/list");
      const usersData = response.data.data || response.data || [];
      setUsers(usersData);
    } catch (error) {
      toast.error("Failed to fetch users");
    }
  };

  const fetchFollowupPackages = async () => {
    try {
      const response = await commandApi.get("/api/followup-package-templates");
      const packagesData = response.data.data || response.data || [];
      setFollowupPackages(packagesData);
    } catch (error) {
      console.error("Error fetching followup package templates:", error);
      toast.error("Failed to fetch followup package templates");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [field]: value,
      };

      let newSelectedFollowupPackage = selectedFollowupPackage;
      if (field === "followup_package_id") {
        newSelectedFollowupPackage = followupPackages.find((p) => p.id === value);
        setSelectedFollowupPackage(newSelectedFollowupPackage);
      }

      // Recalculate stages if relevant fields change
      if (field === "followup_date" || field === "followup_end_date" || field === "followup_package_id" || field === "visit_date") {
        calculateAndSetStages(newFormData, newSelectedFollowupPackage);
      }

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [field]: null,
        }));
      }
      return newFormData;
    });
  };

  // New handler for stage-specific dates
  const handleStageDateChange = (stageId, date) => {
    setEditableStages((prevStages) => prevStages.map((stage) => (stage.id === stageId ? { ...stage, followup_date: date } : stage)));
  };

  const handleEditStage = (stage) => {
    // For now, we'll just show an alert. In a real implementation, you might want to open a modal
    // or navigate to a stage editing page
    alert(`Edit stage: ${stage.stage_name}\n\nThis would open a stage editing modal or form.`);
  };

  const handleDeleteStage = (stageId) => {
    // Remove the stage from editableStages
    setEditableStages((prevStages) => prevStages.filter((stage) => stage.id !== stageId));

    // Close the dropdown menu after deletion
    setOpenStageMenu(null);
  };

  const handleToggleStageMenu = (stageId) => {
    setOpenStageMenu(openStageMenu === stageId ? null : stageId);
  };

  const handleDeleteEmptyDate = (stageId) => {
    setEditableStages((prevStages) => prevStages.map((stage) => (stage.id === stageId ? { ...stage, followup_date: null } : stage)));
  };

  const handleBulkDeleteEmptyDates = () => {
    setEditableStages((prevStages) => prevStages.filter((stage) => stage.followup_date !== null));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openStageMenu && !event.target.closest(".stage-menu-container")) {
        setOpenStageMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openStageMenu]);

  // Helper function to calculate stage date based on visit date and day offset
  const calculateStageDateFromVisitDate = (visitDate, dayOffset) => {
    if (!visitDate || dayOffset === null || dayOffset === undefined) {
      return null;
    }

    let resultDate = new Date(visitDate);
    resultDate.setHours(0, 0, 0, 0);
    resultDate.setDate(resultDate.getDate() + dayOffset);
    return resultDate;
  };

  // Helper function to calculate stage date based on follow-up start date and stage properties
  const calculateStageDateFromStartDate = (followupStartDate, targetDayName, targetDayOfWeekOccurrence) => {
    if (!followupStartDate || !targetDayName || targetDayOfWeekOccurrence === null) {
      return null;
    }

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const targetDayIndex = daysOfWeek.indexOf(targetDayName);

    if (targetDayIndex === -1) {
      console.warn(`Invalid day name: ${targetDayName}`);
      return null;
    }

    // Start from the follow-up start date
    let resultDate = new Date(followupStartDate);
    resultDate.setHours(0, 0, 0, 0);

    // Calculate the target date based on day of week and occurrence
    const currentDayOfWeek = resultDate.getDay();
    let daysToAdd = (targetDayIndex - currentDayOfWeek + 7) % 7;

    // If we're on the target day, move to the next occurrence
    if (daysToAdd === 0) {
      daysToAdd = 7;
    }

    resultDate.setDate(resultDate.getDate() + daysToAdd);

    // Adjust for the Nth occurrence (add additional weeks)
    resultDate.setDate(resultDate.getDate() + (targetDayOfWeekOccurrence - 1) * 7);

    return resultDate;
  };

  // Helper function to calculate stage date within a specific date range
  const calculateStageDateWithinRange = (startDate, endDate, targetDayName, targetDayOfWeekOccurrence) => {
    if (!startDate || !endDate || !targetDayName || targetDayOfWeekOccurrence === null) {
      return null;
    }

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const targetDayIndex = daysOfWeek.indexOf(targetDayName);

    if (targetDayIndex === -1) {
      console.warn(`Invalid day name: ${targetDayName}`);
      return null;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Try to find a date within the range
    let resultDate = new Date(start);

    // Calculate based on day of week and occurrence within the range
    let currentOccurrence = 0;
    let foundDate = null;

    // Search for the target occurrence within the date range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === targetDayIndex) {
        currentOccurrence++;
        if (currentOccurrence === targetDayOfWeekOccurrence) {
          foundDate = new Date(d);
          break;
        }
      }
    }

    // If we found a date within range, use it
    if (foundDate) {
      resultDate = foundDate;
    } else {
      // If not found, use the last occurrence within range
      for (let d = new Date(end); d >= start; d.setDate(d.getDate() - 1)) {
        if (d.getDay() === targetDayIndex) {
          resultDate = new Date(d);
          break;
        }
      }
    }

    return resultDate;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.followup_date) {
      newErrors.followup_date = "Followup date is required";
    }

    if (!formData.customer_id) {
      newErrors.customer_id = "Customer is required";
    }

    if (!formData.followup_by) {
      newErrors.followup_by = "Followup by is required";
    }

    if (!formData.followup_package_id) {
      newErrors.followup_package_id = "Followup package is required";
    }

    // Check if any stage dates exceed follow-up end date or are before start date
    const invalidDates = editableStages.filter((stage) => {
      const date = stage.followup_date;
      return date && (isDateExceedingEndDate(date) || isDateBeforeStartDate(date));
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        followup_date: formData.followup_date
          ? formData.followup_date.toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-")
          : null,
        followup_end_date: formData.followup_end_date
          ? formData.followup_end_date.toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-")
          : null,
        customer_id: formData.customer_id,
        description: formData.description,
        followup_by: formData.followup_by,
        followup_package_id: formData.followup_package_id,
        visit_date: formData.visit_date
          ? formData.visit_date.toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-")
          : null,
        purchase_date: formData.purchase_date
          ? formData.purchase_date.toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-")
          : null,

        customer_info: formData.customer_info,
        stage_dates: editableStages.map((stage) => ({
          id: stage.id, // Include ID for existing details
          followup_date: stage.followup_date
            ? stage.followup_date.toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-")
            : null,
          stage_name: stage.stage_name,
          message_template: stage.message_template,
          include_call: stage.include_call,
          day_of_week: stage.day_of_week,
          day: stage.day,
          trigger_event_type: stage.trigger_event_type, // Ensure trigger_event_type is sent
          day_offset: stage.day_offset, // Ensure day_offset is sent
        })),
      };

      // Create new followup
      await commandApi.post("/api/followups", submitData);

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving followup:", error);
      const errorMessage = error.response?.data?.message || "Failed to save followup";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Followup Day Count
  const followupDayCount = useMemo(() => {
    if (formData.followup_date && formData.followup_end_date) {
      const startDate = new Date(formData.followup_date);
      const endDate = new Date(formData.followup_end_date);
      // Set hours to 0 to avoid issues with timezones and daylight saving
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0; // Or null, or '-'
  }, [formData.followup_date, formData.followup_end_date]);

  // Sort stages by date in ascending order
  const sortedStages = useMemo(() => {
    return [...editableStages].sort((a, b) => {
      // Handle null dates - push them to the end
      if (!a.followup_date && !b.followup_date) return 0;
      if (!a.followup_date) return 1;
      if (!b.followup_date) return -1;
      
      // Sort by date in ascending order
      return new Date(a.followup_date) - new Date(b.followup_date);
    });
  }, [editableStages]);

  // Helper function to check if a date exceeds follow-up end date
  const isDateExceedingEndDate = (date) => {
    if (!formData.followup_end_date || !date) {
      return false;
    }
    const endDate = new Date(formData.followup_end_date);
    endDate.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate > endDate;
  };

  // Helper function to check if a date is before follow-up start date
  const isDateBeforeStartDate = (date) => {
    if (!formData.followup_date || !date) {
      return false;
    }
    const startDate = new Date(formData.followup_date);
    startDate.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < startDate;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg md:max-w-4xl lg:max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Followup</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-x-6 gap-y-6">
            {/* Customer and Followup By fields in a two-column layout */}
            <div className="md:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer *</label>
                <Select
                  value={
                    customer
                      ? { value: customer.id, label: `${customer.name} - ${customer.mobile}` }
                      : formData.customer_id && customers.length > 0
                      ? customers.find((c) => c.id === formData.customer_id)
                        ? {
                            value: formData.customer_id,
                            label: `${customers.find((c) => c.id === formData.customer_id).name} - ${
                              customers.find((c) => c.id === formData.customer_id).mobile
                            }`,
                          }
                        : null
                      : null
                  }
                  onChange={(option) => handleInputChange("customer_id", option?.value)}
                  options={
                    customer
                      ? [{ value: customer.id, label: `${customer.name} - ${customer.mobile}` }]
                      : customers.map((c) => ({ value: c.id, label: `${c.name} - ${c.mobile}` }))
                  }
                  placeholder="Select customer"
                  styles={customStyles}
                  isClearable={!customer && !customerID}
                  isDisabled={!!customer || !!customerID}
                  name="customer_id"
                />
                {errors.customer_id && <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>}
              </div>

              {/* Followup By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Followup By *</label>
                <Select
                  value={users.find((u) => u.id === (formData.followup_by ?? parsedUser?.id)) ?? null}
                  onChange={(option) => handleInputChange("followup_by", option?.id)}
                  options={users}
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.id}
                  placeholder="Select user"
                  styles={customStyles}
                  isClearable
                  name="followup_by"
                />
                {errors.followup_by && <p className="mt-1 text-sm text-red-600">{errors.followup_by}</p>}
              </div>
            </div>

            {/* Followup Dates, Visit Date, and Purchase Date in four columns */}
            <div className="md:col-span-5 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Followup Start Date *</label>
                <CustomDatePicker
                  selected={formData.followup_date}
                  onChange={(date) => handleInputChange("followup_date", date)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.followup_date ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholderText="Select followup date"
                />
                {errors.followup_date && <p className="mt-1 text-sm text-red-600">{errors.followup_date}</p>}
              </div>

              {/* Visit Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visit Date</label>
                <CustomDatePicker
                  selected={formData.visit_date}
                  onChange={(date) => handleInputChange("visit_date", date)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.visit_date ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholderText="Select visit date"
                />
                {errors.visit_date && <p className="mt-1 text-sm text-red-600">{errors.visit_date}</p>}
              </div>

              {/* Purchase Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                <CustomDatePicker
                  selected={formData.purchase_date}
                  onChange={(date) => handleInputChange("purchase_date", date)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.purchase_date ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholderText="Select purchase date"
                />
                {errors.purchase_date && <p className="mt-1 text-sm text-red-600">{errors.purchase_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Followup End Date</label>
                <CustomDatePicker
                  selected={formData.followup_end_date}
                  onChange={(date) => handleInputChange("followup_end_date", date)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.followup_end_date ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholderText="Select followup end date"
                />
                {errors.followup_end_date && <p className="mt-1 text-sm text-red-600">{errors.followup_end_date}</p>}
              </div>
            </div>

            {/* Followup Day Count Label - Full Width */}
            <div className="md:col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Followup Day Count:{followupDayCount} {followupDayCount === 1 ? "Day" : "Days"}
              </label>
            </div>

            {/* Followup Package Template - Full Width */}
            <div className="md:col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Followup Package *</label>
              <Select
                value={followupPackages.find((p) => p.id === formData.followup_package_id)}
                onChange={(option) => handleInputChange("followup_package_id", option?.id)}
                options={followupPackages}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                placeholder="Select followup package"
                styles={customStyles}
                isClearable
                name="followup_package_id"
              />
              {errors.followup_package_id && <p className="mt-1 text-sm text-red-600">{errors.followup_package_id}</p>}
            </div>

            {/* Display Stages - Full Width */}
            <div className="md:col-span-5">
              {editableStages && editableStages.length > 0 && (
                <div className="p-1 border border-gray-200 rounded-md bg-gray-50">
                  {errors.stage_dates && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center text-red-800 text-sm">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{errors.stage_dates}</span>
                      </div>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Stage & Date</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                            <button
                              type="button"
                              onClick={handleBulkDeleteEmptyDates}
                              className="flex items-center text-xs text-red-600 hover:text-red-800 font-bold p-1 rounded-md"
                              title="Delete Empty Dates for All Stages"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Delete
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sortedStages.map((stage, index) => {
                          const stageDate = stage.followup_date;
                          const isExceeding = stageDate && isDateExceedingEndDate(stageDate);
                          const isBeforeStart = stageDate && isDateBeforeStartDate(stageDate);
                          const hasError = isExceeding || isBeforeStart;

                          return (
                            <tr key={stage.id || `new-${index}`} className={`hover:bg-gray-50 ${hasError ? "bg-red-50" : ""} align-top`}>
                              <td className="px-3 py-2 text-sm text-gray-900 break-words">
                                <div className="flex items-center">
                                  <span className="font-medium">{stage.stage_name}</span>
                                  {isExceeding && <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Exceeds End Date</span>}
                                </div>
                                <CustomDatePicker
                                  selected={stageDate}
                                  onChange={(date) => handleStageDateChange(stage.id, date)}
                                  className={`w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1 text-xs ${
                                    hasError ? "border-red-300 bg-red-50" : ""
                                  }`}
                                  placeholderText="Select date"
                                />
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900 break-words">
                                <div className="space-y-2">
                                  <div>
                                    {stage.include_call ? (
                                      <span className="flex items-center">
                                        <span className="font-bold text-blue-600">Call</span>
                                        <span className="mx-1">+</span>
                                        <span>{stage.message_template || "-"}</span>
                                      </span>
                                    ) : (
                                      <span>{stage.message_template || "-"}</span>
                                    )}
                                  </div>
                                  
                                  {/* Stage Information Badges */}
                                  <div className="flex flex-wrap gap-1.5 text-xs">
                                    <span className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded">
                                      <span className="font-medium">Trigger:</span>
                                      <span className="ml-1">{stage.trigger_event_type === 'visit_date' ? 'Visit Date' : 'Followup Date'}</span>
                                    </span>
                                    {stage.day && (
                                      <span className="inline-flex items-center px-2 py-0.5 bg-green-50 text-green-700 rounded">
                                        <span className="font-medium">Day:</span>
                                        <span className="ml-1">{stage.day}</span>
                                      </span>
                                    )}
                                    {stage.day_of_week && (
                                      <span className="inline-flex items-center px-2 py-0.5 bg-amber-50 text-amber-700 rounded">
                                        <span className="font-medium">Week:</span>
                                        <span className="ml-1">{stage.day_of_week}</span>
                                      </span>
                                    )}
                                    {(stage.day_offset !== null && stage.day_offset !== undefined) && (
                                      <span className="inline-flex items-center px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded">
                                        <span className="font-medium">Offset:</span>
                                        <span className="ml-1">{stage.day_offset}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="text-sm font-medium text-center">
                                <div className="flex items-center space-x-2 justify-center">
                                  <button
                                    type="button"
                                    className="inline-flex items-center justify-center w-6 h-6 rounded text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                                    onClick={() => handleDeleteStage(stage.id)}
                                    title="Delete Stage"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FollowupModal;
