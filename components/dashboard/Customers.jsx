"use client";

import CustomerService from "@/services/CustomerService";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CustomerModal from "../modals/CustomerModal";

const Customers = ({ initialCustomers = [], serverError = null }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState(initialCustomers);
  const [loading, setLoading] = useState(!initialCustomers.length && !serverError);
  const [error, setError] = useState(serverError);
  const [currentCustomer, setCurrentCustomer] = useState(null); // For editing
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [customerToDeleteId, setCustomerToDeleteId] = useState(null);

  // Fetch customers on component mount only if no initial data
  useEffect(() => {
    if (!initialCustomers.length && !serverError) {
      fetchCustomers();
    }
  }, [initialCustomers.length, serverError]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await CustomerService.Queries.getCustomers();
      setCustomers(response.data || []);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Failed to fetch customers");
      setCustomers([]);
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh data (useful for after CRUD operations)
  const refreshData = async () => {
    await fetchCustomers();
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCustomer(null); // Reset current customer when closing modal
  };

  const handleSubmitCustomer = async (customerData) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading(currentCustomer ? "Updating customer..." : "Saving customer...");

      let response;
      if (currentCustomer) {
        // Update existing customer
        response = await CustomerService.Commands.updateCustomer(currentCustomer.id, customerData);
      } else {
        // Create new customer
        response = await CustomerService.Commands.storeCustomer(customerData);
      }

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show success message
      toast.success(response.message || (currentCustomer ? "Customer updated successfully!" : "Customer saved successfully!"));

      // Close modal and refresh the list
      handleCloseModal();
      refreshData();
    } catch (error) {
      // Don't show toast here if it's a validation error - let the modal handle it
      // Only show toast for non-validation errors
      if (!error.response?.data?.errors) {
        const errorMessage = error.response?.data?.message || error.message || "Failed to save customer";
        toast.error(errorMessage);
      }
      // Re-throw the error so the modal can handle validation errors
      throw error;
    }
  };

  const handleEditCustomer = (customer) => {
    setCurrentCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDeleteCustomer = (customerId) => {
    setCustomerToDeleteId(customerId);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    try {
      // Show loading toast
      const loadingToast = toast.loading("Deleting customer...");

      // Call the API to delete customer
      const response = await CustomerService.Commands.deleteCustomer(customerToDeleteId);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show success message
      toast.success(response.message || "Customer deleted successfully!");

      // Close dialog and refresh the list
      setShowConfirmDialog(false);
      setCustomerToDeleteId(null);
      refreshData();
    } catch (error) {
      // Show error message
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete customer";
      toast.error(errorMessage);
      console.error("Error deleting customer:", error);
    }
  };

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold">Customers</h1>
          {initialCustomers.length > 0 && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Server Rendered</span>}
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600" onClick={handleOpenModal}>
          Add New Customer
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Loading customers...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Error: {error}</div>
        </div>
      )}

      {/* Customer Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-900">ID</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-900">Name</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-900">Mobile</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-900">Email</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-900">Address</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-900">Created At</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 px-4 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{customer.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{customer.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{customer.mobile}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{customer.email || "-"}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {customer.address ? (
                        <span className="truncate max-w-xs block" title={customer.address}>
                          {customer.address}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(customer.created_at).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button
                          className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 text-xs"
                          onClick={() => handleEditCustomer(customer)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-xs"
                          onClick={() => handleDeleteCustomer(customer.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && <CustomerModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmitCustomer={handleSubmitCustomer} customer={currentCustomer} />}

      {/* Delete Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete this customer?</p>
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

export default Customers;
