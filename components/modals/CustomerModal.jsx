import { useAppContext } from "@/context/AppContext";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const CustomerModal = ({ isOpen, onClose, onSubmitCustomer, customer }) => {
  const { user } = useAppContext();
  const parsedUser = JSON.parse(user);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [anniversaryDate, setAnniversaryDate] = useState("");
  const [facebookLink, setFacebookLink] = useState("");
  const [createdBy, setCreatedBy] = useState(null);
  const [updatedBy, setUpdatedBy] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Update form fields when customer prop changes (for edit mode)
  useEffect(() => {
    if (customer) {
      // Edit mode - populate form with existing data
      setName(customer.name || "");
      setMobile(customer.mobile || "");
      setEmail(customer.email || "");
      setDateOfBirth(customer.date_of_birth || "");
      setAnniversaryDate(customer.anniversary_date || "");
      setFacebookLink(customer.facebook_link || "");
      setAddress(customer.address || "");
      setUpdatedBy(parsedUser?.id || null);
    } else {
      // Add mode - reset form
      setName("");
      setMobile("");
      setEmail("");
      setDateOfBirth("");
      setAnniversaryDate("");
      setFacebookLink("");
      setAddress("");
      setCreatedBy(parsedUser?.id || null);
    }
    // Clear errors when modal opens or customer changes
    setErrors({});
  }, [customer]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    // Reset errors
    const newErrors = {};

    // Validate name
    if (!name.trim()) {
      newErrors.name = "Customer name is required";
    }

    // Validate mobile
    if (!mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[0-9+\-\s()]+$/.test(mobile.trim())) {
      newErrors.mobile = "Please enter a valid mobile number";
    }

    // Validate email if provided
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate Facebook link if provided
    if (facebookLink.trim() && !/^https?:\/\/.+/.test(facebookLink.trim())) {
      newErrors.facebookLink = "Please enter a valid URL (must start with http:// or https://)";
    }

    // Set errors and return if validation fails
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Also show toast for first error
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return;
    }

    // Clear errors if validation passes
    setErrors({});
    setIsSubmitting(true);

    try {
      await onSubmitCustomer({
        name: name.trim(),
        mobile: mobile.trim(),
        email: email.trim() || null,
        date_of_birth: dateOfBirth.trim() || null,
        anniversary_date: anniversaryDate.trim() || null,
        facebook_link: facebookLink.trim() || null,
        address: address.trim() || null,
        created_by: createdBy,
        updated_by: updatedBy,
      });

      setUpdatedBy(null);
      // Clear form and errors on success
      if (!customer) {
        setName("");
        setMobile("");
        setEmail("");
        setDateOfBirth("");
        setAnniversaryDate("");
        setFacebookLink("");
        setAddress("");
      }
      setErrors({});
    } catch (error) {
      console.error("Error response data:", error.response?.data);
      
      // Handle backend validation errors - check multiple possible error structures
      const errorData = error.response?.data || error.data || error || {};
      
      // Check if it's a validation error (has errors object)
      if (errorData.errors && typeof errorData.errors === 'object') {
        // Convert Laravel validation errors format (arrays) to simple strings
        const formattedErrors = {};
        Object.keys(errorData.errors).forEach((key) => {
          // Extract first error message from array
          formattedErrors[key] = Array.isArray(errorData.errors[key])
            ? errorData.errors[key][0]
            : errorData.errors[key];
        });
        setErrors(formattedErrors);
        
        // Show toast with first error message instead of generic "Validation failed"
        const firstErrorKey = Object.keys(formattedErrors)[0];
        if (firstErrorKey && formattedErrors[firstErrorKey]) {
          toast.error(formattedErrors[firstErrorKey]);
        } else {
          // Don't show "Validation failed" - let field errors speak for themselves
          // Only show if there are no field errors
          if (Object.keys(formattedErrors).length === 0) {
            toast.error(errorData.message || "Validation failed");
          }
        }
      } else if (errorData.message && errorData.message !== "Validation failed") {
        // Handle general error messages (not validation)
        // Skip "Validation failed" message as it's generic
        toast.error(errorData.message);
      } else if (!errorData.errors) {
        // Only show generic error if no validation errors
        toast.error("An error occurred while saving the customer");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear error when field is changed
  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <h5 className="text-lg font-semibold">{customer ? "Edit Customer" : "Add New Customer"}</h5>
          <button type="button" className="text-gray-400 hover:text-gray-600" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearError("name");
              }}
              placeholder="Enter customer name"
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              className={`block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.mobile ? "border-red-500" : "border-gray-300"
              }`}
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value);
                clearError("mobile");
              }}
              placeholder="Enter mobile number"
              required
            />
            {errors.mobile && (
              <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              className={`block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError("email");
              }}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Anniversary Date</label>
            <input
              type="date"
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={anniversaryDate}
              onChange={(e) => setAnniversaryDate(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Link</label>
            <input
              type="text"
              className={`block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.facebookLink ? "border-red-500" : "border-gray-300"
              }`}
              value={facebookLink}
              onChange={(e) => {
                setFacebookLink(e.target.value);
                clearError("facebookLink");
              }}
              placeholder="Enter Facebook profile link"
            />
            {errors.facebookLink && (
              <p className="mt-1 text-sm text-red-600">{errors.facebookLink}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter customer address"
            />
          </div>
        </div>
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            type="button"
            className={`px-4 py-2 text-white rounded-md ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : (customer ? "Update" : "Add") + " Customer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;
