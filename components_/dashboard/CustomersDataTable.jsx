"use client";

import { useAppContext } from "@/context/AppContext";
import { parseStoredUser } from "@/lib/parseStoredUser";
import { API_URL } from "@/helpers/apiUrl";
import { createApiRequest } from "@/helpers/axios";
import CustomerService from "@/services/CustomerService";
import { ExternalLink, Filter, Pencil, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import EditCustomerModal from "../modals/EditCustomerModal";
import LoadingSpinner from "../ui/LoadingSpinner";
import { hasPermission } from "@/lib/utils";
import { FacebookIcon, MessengerIcon } from "./sales-team-activity/ActivityIcons";
import CustomerFilterDrawer, { DEFAULT_CUSTOMER_FILTERS } from "./CustomerFilterDrawer";

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

const toExternalHref = (url) => {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const countActiveCustomerFilters = (filters) =>
  Object.entries(filters).reduce((count, [key, value]) => {
    if (key === "hasFacebook" || key === "hasMessenger") {
      return value ? count + 1 : count;
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? count + 1 : count;
    }
    return value ? count + 1 : count;
  }, 0);

const CustomersDataTable = () => {
  const { permissionList, user } = useAppContext();
  const parsedUser = parseStoredUser(user);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNotes, setExpandedNotes] = useState(new Set());

  const toggleNote = (id) => setExpandedNotes(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [customerToDeleteId, setCustomerToDeleteId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_CUSTOMER_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_CUSTOMER_FILTERS);

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


  const userMode = parsedUser?.user_mode || user?.user_mode;
  const isPrivilegedUser = ["supreme", "admin", "pbl"].includes(userMode);

  const canShowAddCategoryButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Customer", "ShowCustomerAddButton")


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

      if (appliedFilters.name.trim()) params.append("name", appliedFilters.name.trim());
      if (appliedFilters.mobile.trim()) params.append("mobile", appliedFilters.mobile.trim());
      if (appliedFilters.hasFacebook) params.append("has_facebook", "yes");
      if (appliedFilters.hasMessenger) params.append("has_messenger", "yes");
      if (appliedFilters.clientSeriousness) params.append("client_seriousness", appliedFilters.clientSeriousness);
      if (appliedFilters.clientAttitude.length) params.append("client_attitude", appliedFilters.clientAttitude.join(","));
      if (appliedFilters.customerSearch.trim()) params.append("customer_search", appliedFilters.customerSearch.trim());
      if (appliedFilters.createdBy) params.append("created_by", appliedFilters.createdBy);
      if (appliedFilters.createdFrom) params.append("created_from", appliedFilters.createdFrom);
      if (appliedFilters.createdTo) params.append("created_to", appliedFilters.createdTo);
      if (appliedFilters.note.trim()) params.append("note", appliedFilters.note.trim());

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
  }, [currentPage, perPage, sortBy, sortOrder, search, appliedFilters, CUSTOMERS_API, user]);

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
    setIsEditModalOpen(true);
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

  const activeFilterCount = countActiveCustomerFilters(appliedFilters);

  const openFilterDrawer = () => {
    setDraftFilters(appliedFilters);
    setIsFilterOpen(true);
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setDraftFilters(DEFAULT_CUSTOMER_FILTERS);
    setAppliedFilters(DEFAULT_CUSTOMER_FILTERS);
    setCurrentPage(1);
  };

  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="w-full p-6 space-y-3 bg-gray-50">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        
        {canShowAddCategoryButton && (
          <button className="bg-blue-500 text-white px-2.5 py-1 rounded-md hover:bg-blue-600 text-sm" onClick={openAddModal}>
            Add New Customer
          </button>
        )}
      </div>

      {/* Search and Controls */}
      <div className="relative flex justify-center">
        <div className="w-1/2">
          <div className="relative group">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={handleSearchChange}
              className="w-full h-9 pl-9 pr-8 text-sm text-slate-800 placeholder:text-slate-400 bg-white border border-slate-200 rounded-full shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:border-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-5 h-5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={openFilterDrawer}
          className="absolute right-0 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-2.5 py-1 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 text-sm"
        >
          <Filter className="w-3.5 h-3.5" />
          Filter
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-indigo-600 text-white text-[10px]">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider cursor-pointer hover:bg-slate-700 w-40 max-w-[160px]"
                  onClick={() => handleSort("name")}
                >
                  Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider cursor-pointer hover:bg-slate-700 w-32"
                  onClick={() => handleSort("mobile")}
                >
                  Mobile {sortBy === "mobile" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider whitespace-nowrap w-px">
                  Facebook
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider whitespace-nowrap w-px">
                  Messenger
                </th>
                <th
                  className="px-3 py-3 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider cursor-pointer hover:bg-slate-700 w-24"
                  onClick={() => handleSort("client_seriousness")}
                >
                  Seriousness {sortBy === "client_seriousness" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-3 py-3 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider cursor-pointer hover:bg-slate-700 w-20"
                  onClick={() => handleSort("client_attitude")}
                >
                  Attitude {sortBy === "client_attitude" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider cursor-pointer hover:bg-slate-700 w-48"
                  onClick={() => handleSort("search")}
                >
                  Search {sortBy === "search" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider cursor-pointer hover:bg-slate-700 w-36"
                  onClick={() => handleSort("created_at")}
                >
                  Created {sortBy === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider w-48">Note</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider whitespace-nowrap w-px">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                    <LoadingSpinner message="Loading customers..." />
                  </td>
                </tr>
              )}
              {data.length === 0 && !loading && (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              )}
              {data.length > 0 &&
                !loading &&
                data.map((customer, index) => {
                  const canModify =
                    isPrivilegedUser ||
                    Number(parsedUser?.id) === Number(customer.created_user?.id) ||
                    parsedUser?.role_name === "Admin";
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900 w-40 max-w-[160px]">
                        <Link
                          href={`/dashboard/customers/${customer.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer flex items-center gap-1"
                        >
                          <span className="truncate">{customer.name}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.mobile}</td>
                      <td className="px-2 py-4 whitespace-nowrap w-px">
                        {toExternalHref(customer.facebook_id_link) ? (
                          <a
                            href={toExternalHref(customer.facebook_id_link)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex hover:opacity-80"
                            title="Open Facebook"
                            aria-label="Open Facebook"
                          >
                            <FacebookIcon />
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap w-px">
                        {toExternalHref(customer.facebook_messenger_link) ? (
                          <a
                            href={toExternalHref(customer.facebook_messenger_link)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex hover:opacity-80"
                            title="Open Messenger"
                            aria-label="Open Messenger"
                          >
                            <MessengerIcon />
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{customer.client_seriousness?.md_title || "-"}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.client_attitude_display || customer.client_attitude?.md_title || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{customer?.search || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{customer.created_user?.name || "-"}</div>
                        <div className="text-xs text-gray-400">
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
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 w-48">
                        {(() => {
                          const desc = customer.description;
                          const note = customer.latest_activity?.note;
                          const hasContent = desc || note;
                          const isExpanded = expandedNotes.has(customer.id);
                          const needsToggle = (desc?.length ?? 0) + (note?.length ?? 0) > 80;
                          if (!hasContent) return <span className="text-gray-400">-</span>;
                          return (
                            <div>
                              {desc && (
                                <div className={`text-gray-700 ${!isExpanded && needsToggle ? "line-clamp-2" : ""}`}>
                                  <span className="font-medium">Description:</span> {desc}
                                </div>
                              )}
                              {note && (
                                <div className={`text-gray-500 ${!isExpanded && needsToggle ? "line-clamp-2" : ""} ${desc ? "mt-1" : ""}`}>
                                  <span className="font-medium">Note:</span> {note}
                                </div>
                              )}
                              {needsToggle && (
                                <button
                                  onClick={() => toggleNote(customer.id)}
                                  className="text-blue-500 text-xs mt-1 hover:underline"
                                >
                                  {isExpanded ? "less" : "more"}
                                </button>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap w-px">
                        {canModify && (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-yellow-500 text-white hover:bg-yellow-600"
                              onClick={() => openEditModal(customer)}
                              title="Edit"
                              aria-label="Edit customer"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-red-500 text-white hover:bg-red-600"
                              onClick={() => handleDelete(customer.id)}
                              title="Delete"
                              aria-label="Delete customer"
                            >
                              <Trash2 className="w-3 h-3" />
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
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <label className="text-sm text-gray-600 whitespace-nowrap">Show:</label>
              <select value={perPage} onChange={(e) => handlePerPageChange(Number(e.target.value))} className="px-2 py-1 border border-gray-300 rounded text-sm">
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-gray-300">|</span>
              <p>
                Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{lastPage}</span>
              </p>
              <span className="text-gray-300">|</span>
              <p>
                Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, total)} of {total} entries
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

      {isEditModalOpen && (
        <EditCustomerModal isOpen={isEditModalOpen} onClose={closeEditModal} customer={currentCustomer} onSuccess={fetchData} />
      )}

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

      <CustomerFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        draftFilters={draftFilters}
        setDraftFilters={setDraftFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        showCreatedByFilter={isPrivilegedUser}
      />
    </div>
  );
};

export default CustomersDataTable;
