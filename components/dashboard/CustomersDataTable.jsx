"use client";

import { useAppContext } from "@/context/AppContext";
import { API_URL } from "@/helpers/apiUrl";
import { createApiRequest } from "@/helpers/axios";
import CustomerService from "@/services/CustomerService";
import { ExternalLink } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import CustomerModal from "../modals/CustomerModal";
import EditCustomerModal from "../modals/EditCustomerModal";
import LoadingSpinner from "../ui/LoadingSpinner";

const getPaginationNumbers = (currentPage, lastPage) => {
  const delta = 2;
  const range = [];
  for (let i = Math.max(2, currentPage - delta); i <= Math.min(lastPage - 1, currentPage + delta); i++) {
    range.push(i);
  }

  if (currentPage - delta > 2) {
    range.unshift("...");
  }
  if (currentPage + delta < lastPage - 1) {
    range.push("...");
  }

  range.unshift(1);
  if (lastPage > 1) {
    range.push(lastPage);
  }

  return range;
};

const CustomersDataTable = () => {
  const { user } = useAppContext();
  const parsedUser = JSON.parse(user);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [customerToDeleteId, setCustomerToDeleteId] = useState(null);

  const commandApi = useMemo(() => createApiRequest(API_URL), []);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  // Sorting state
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Search state
  const [search, setSearch] = useState("");

  const CUSTOMERS_API = `${API_URL}api/customers`;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage,
        perPage: perPage,
        sortBy: sortBy,
        sortOrder: sortOrder,
      });

      if (search && search.trim()) {
        params.append("search", search.trim());
      }

      if (parsedUser?.id) {
        params.append("created_by", parsedUser.id);
      }
      const response = await commandApi.get(`/api/customers?${params}`);

      if (response.data.data) {
        setData(response.data.data);
        setTotal(response.data.pagination.total);
        setLastPage(response.data.pagination.last_page);
      } else {
        setData(response.data.data || []);
        setTotal(0);
        setLastPage(1);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch data";
      setError(errorMessage);
      toast.error(errorMessage);
      setData([]);
      setTotal(0);
      setLastPage(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, sortBy, sortOrder, search, CUSTOMERS_API, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle edit parameter from URL
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId && data.length > 0) {
      const customerToEdit = data.find((customer) => customer.id == editId);
      if (customerToEdit) {
        openEditModal(customerToEdit);
        // Remove the edit parameter from URL
        router.replace("/dashboard/customers");
      }
    }
  }, [searchParams, data, router]);

  // Separate useEffect for search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, fetchData]);

  const handleAddEdit = async (customerData) => {
    try {
      const formattedData = {
        name: customerData.name,
        mobile: customerData.mobile,
        email: customerData.email,
        date_of_birth: customerData.date_of_birth,
        anniversary_date: customerData.anniversary_date,
        facebook_link: customerData.facebook_link,
        address: customerData.address,
        created_by: customerData.created_by,
        updated_by: customerData.updated_by,
      };

      if (currentCustomer) {
        const response = await CustomerService.Commands.updateCustomer(currentCustomer.id, formattedData);
        toast.success(response.data.message || "Customer updated successfully");
      } else {
        const response = await CustomerService.Commands.storeCustomer(formattedData);
        toast.success(response.data.message || "Customer created successfully");
      }

      setCurrentCustomer(null);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      // Always re-throw the error so the modal can handle it properly
      // The modal will show appropriate error messages (validation or general)
      throw err;
    }
  };

  const handleDelete = async (id) => {
    setCustomerToDeleteId(id);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await CustomerService.Commands.deleteCustomer(customerToDeleteId);
      toast.success(response?.message);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setShowConfirmDialog(false);
      setCustomerToDeleteId(null);
    }
  };

  const openEditModal = (customer) => {
    setCurrentCustomer(customer);
    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    setCurrentCustomer(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCustomer(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentCustomer(null);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setCurrentPage(1);
  };

  const handleCustomerNameClick = (customerId) => {
    router.push(`/dashboard/customers/${customerId}`);
  };

  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="w-full p-6 space-y-6 bg-gray-50">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">Customers</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-600" onClick={openAddModal}>
          Add New Customer
        </button>
      </div>

      {/* Search and Controls */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Show:</label>
          <select value={perPage} onChange={(e) => handlePerPageChange(Number(e.target.value))} className="px-2 py-1 border border-gray-300 rounded text-sm">
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-600">
            Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, total)} of {total} entries
          </span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("name")}
                >
                  Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("mobile")}
                >
                  Mobile {sortBy === "mobile" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("client_seriousness")}
                >
                  Client Seriousness {sortBy === "client_seriousness" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("client_attitude")}
                >
                  Client Attitude {sortBy === "client_attitude" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-64"
                  onClick={() => handleSort("search")}
                >
                  Search {sortBy === "search" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">Created By</th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("created_at")}
                >
                  Created At {sortBy === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    <LoadingSpinner message="Loading customers..." />
                  </td>
                </tr>
              )}
              {data.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              )}
              {data.length > 0 &&
                !loading &&
                data.map((customer, index) => {
                  const canModify = parsedUser?.id === customer.created_user?.id || parsedUser?.role_name === "Admin";
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => handleCustomerNameClick(customer.id)}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer flex items-center space-x-1"
                        >
                          <span>{customer.name}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.mobile}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.client_seriousness?.md_title || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.client_attitude?.md_title || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{customer?.search || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.created_user?.name || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.created_at
                          ? new Date(customer.created_at).toLocaleString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {canModify && (
                          <div className="flex space-x-2">
                            <button
                              className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 text-sm"
                              onClick={() => openEditModal(customer)}
                            >
                              Edit
                            </button>
                            <button className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm" onClick={() => handleDelete(customer.id)}>
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === lastPage}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{lastPage}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {getPaginationNumbers(currentPage, lastPage).map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === "number" && handlePageChange(page)}
                    disabled={typeof page !== "number" || page === currentPage}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      page === currentPage ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600" : "text-gray-700 hover:bg-gray-50"
                    } ${typeof page !== "number" ? "cursor-default" : ""}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === lastPage}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(lastPage)}
                  disabled={currentPage === lastPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Last
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && <CustomerModal isOpen={isModalOpen} onClose={closeModal} onSubmitCustomer={handleAddEdit} customer={currentCustomer} />}

      {/* Edit Modal */}
      {isEditModalOpen && <EditCustomerModal isOpen={isEditModalOpen} onClose={closeEditModal} customer={currentCustomer} onSuccess={fetchData} />}

      {/* Delete Confirmation */}
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

export default CustomersDataTable;
