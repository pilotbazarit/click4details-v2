"use client";

import EditFollowupModal from "@/components/modals/EditFollowupModal"; // Import new edit modal
import FollowupModal from "@/components/modals/FollowupModal";
import { useAppContext } from "@/context/AppContext";
import { API_URL } from "@/helpers/apiUrl";
import { createApiRequest } from "@/helpers/axios";
import { formatDate } from "@/helpers/functions";
import { useCallback, useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../ui/LoadingSpinner";

const FollowupsDataTable = () => {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // For creation
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // For editing
  const [selectedFollowup, setSelectedFollowup] = useState(null); // For editing
  const [initialCustomerIdForCreate, setInitialCustomerIdForCreate] = useState(null); // New state for customer ID in create modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { user } = useAppContext();
  const parsedUser = JSON.parse(user);

  const commandApi = useMemo(() => createApiRequest(API_URL), []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage,
        perPage,
        sortBy,
        sortOrder,
        ...(search && { search }),
      });

      const response = await commandApi.get(`/api/followups?${params}`);

      if (response && response.status === "success") {
        setFollowups(response.data?.data || []);
        setTotalPages(response.data?.pagination?.last_page || 1);
        setTotalRecords(response.data?.pagination?.total || 0);
      } else {
        setError("Failed to fetch followups - invalid response format");
      }
    } catch (err) {
      console.error("Error fetching followups:", err);
      setError(err?.message || "Failed to fetch followups");
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, sortBy, sortOrder, search, commandApi]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setCurrentPage(1);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
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

  const handlePerPageChange = (e) => {
    setPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleAddNew = () => {
    // This is for the main "Add New Followup" button at the top
    setSelectedFollowup(null);
    setInitialCustomerIdForCreate(null); // Ensure no customer is pre-selected for global "Add New"
    setIsModalOpen(true);
  };

  const handleAddFollowupForCustomer = (customerId) => {
    // New function for row-specific "Add"
    setSelectedFollowup(null); // Ensure no existing followup data is passed to create modal
    setInitialCustomerIdForCreate(customerId);
    setIsModalOpen(true);
  };

  const handleEdit = (followup) => {
    setSelectedFollowup(followup);
    setIsEditModalOpen(true); // Open edit modal
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await commandApi.delete(`/api/followups/${deleteId}`);
      if (response.status === "success") {
        fetchData();
        setShowDeleteConfirm(false);
        setDeleteId(null);
      }
    } catch (error) {
      console.error("Error deleting followup:", error);
    }
  };

  const handleModalSuccess = async () => {
    // Made async
    await fetchData(); // Ensure data is refetched
    // After data is refetched, update the selectedFollowup if the edit modal is open
    if (isEditModalOpen && selectedFollowup) {
      // Find the updated followup in the newly fetched list
      const updatedFollowup = followups.find((f) => f.id === selectedFollowup.id);
      if (updatedFollowup) {
        setSelectedFollowup(updatedFollowup); // Update selectedFollowup with fresh data
      }
    }
  };

  const getSerialNumber = (index) => {
    return (currentPage - 1) * perPage + index + 1;
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortOrder === "asc" ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>;
  };

  if (error) {
    return (
      <div className="w-full p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-400">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Followups</h1>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          onClick={handleAddNew}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Followup
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search followups, customers, users, or packages..."
              value={search}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Show:</label>
          <select value={perPage} onChange={handlePerPageChange} className="border border-gray-300 rounded-md px-2 py-1 text-sm">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-600">entries</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center gap-1">
                    ID <SortIcon column="id" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("customer_id")}
                >
                  <div className="flex items-center gap-1">
                    Customer <SortIcon column="customer_id" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("followup_date")}
                >
                  <div className="flex items-center gap-1">
                    Followup Date <SortIcon column="followup_date" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("visit_date")}
                >
                  <div className="flex items-center gap-1">
                    Visit Date <SortIcon column="visit_date" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("followup_by")}
                >
                  <div className="flex items-center gap-1">
                    Followup By <SortIcon column="followup_by" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("followup_package_id")}
                >
                  <div className="flex items-center gap-1">
                    Followup Package <SortIcon column="followup_package_id" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center gap-1">
                    Created At <SortIcon column="created_at" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <LoadingSpinner message="Loading followups update" />
                  </td>
                </tr>
              )}
              {followups.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <p className="text-gray-500">No followups found</p>
                  </td>
                </tr>
              )}

              {followups.length > 0 &&
                !loading &&
                followups.map((followup, index) => (
                  <tr key={followup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getSerialNumber(index)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {followup.customer?.id ? (
                        <a href={`/dashboard/customers/${followup.customer.id}`} className="text-blue-600 hover:underline font-medium">
                          {followup.customer.name}
                        </a>
                      ) : (
                        <span>{followup.customer?.name || "Unknown Customer"}</span>
                      )}
                      <br />
                      <small className="text-gray-500">{followup.customer?.mobile || "N/A"}</small>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {followup.followup_date ? formatDate(followup.followup_date, "DD MMM, YYYY") : ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {followup.visit_date ? formatDate(followup.visit_date, "DD MMM, YYYY") : ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{followup.followup_by?.name || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{followup.followup_package ? followup.followup_package.name : ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(followup.created_at, "MMM DD, YYYY, h:mm A")}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      {(parsedUser?.id === followup.followup_by?.id || parsedUser?.user_mode === "supreme") && (
                        <div className="flex gap-1">
                          <button
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-green-600 hover:bg-green-100 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-colors duration-200"
                            onClick={() => handleEdit(followup)}
                            title="Edit followup"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>

                          {/* Delete button */}
                          <button
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-red-600 hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors duration-200"
                            onClick={() => handleDelete(followup.id)}
                            title="Delete followup"
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
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * perPage + 1}</span> to{" "}
                <span className="font-medium">{Math.min(currentPage * perPage, totalRecords)}</span> of <span className="font-medium">{totalRecords}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page ? "z-10 bg-blue-50 border-blue-500 text-blue-600" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* {followups.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No followups found.</p>
        </div>
      )} */}

      {/* Followup Modal */}
      <FollowupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        initialCustomerId={initialCustomerIdForCreate} // Pass the new state
      />

      {/* Edit Followup Modal */}
      <EditFollowupModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSuccess={handleModalSuccess} followupData={selectedFollowup} />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this followup? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowupsDataTable;
