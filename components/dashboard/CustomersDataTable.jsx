"use client";

import { useAppContext } from "@/context/AppContext";
import { parseStoredUser } from "@/lib/parseStoredUser";
import { API_URL } from "@/helpers/apiUrl";
import { createApiRequest } from "@/helpers/axios";
import CustomerService from "@/services/CustomerService";
import { AlignJustify, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ExternalLink, Filter, Pencil, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import EditCustomerModal from "../modals/EditCustomerModal";
import LoadingSpinner from "../ui/LoadingSpinner";
import { hasPermission } from "@/lib/utils";
import { FacebookIcon, MessengerIcon } from "./sales-team-activity/ActivityIcons";
import CustomerFilterDrawer, { DEFAULT_CUSTOMER_FILTERS } from "./CustomerFilterDrawer";
import {
  InlineAttitudeCell,
  InlineNoteCell,
  InlineSeriousnessCell,
} from "./CustomerInlineEditableCells";
import FilterProductService from "@/services/FilterProductService";

const CUSTOMER_COLUMN_STORAGE_KEY = "customers_list_visible_columns_v1";

const CUSTOMER_TABLE_COLUMNS = [
  { key: "customer", label: "Customer", defaultVisible: true, sortable: "name", minWidth: 220 },
  { key: "email", label: "Email", defaultVisible: false, sortable: "email", minWidth: 180 },
  { key: "address", label: "Address", defaultVisible: false, sortable: "address", minWidth: 200 },
  { key: "seriousness", label: "Seriousness", defaultVisible: true, sortable: "client_seriousness", minWidth: 160 },
  { key: "attitude", label: "Attitude", defaultVisible: true, sortable: "client_attitude", minWidth: 180 },
  { key: "level", label: "Level", defaultVisible: false, sortable: "client_level", minWidth: 120 },
  { key: "profession", label: "Profession", defaultVisible: false, sortable: "client_profession", minWidth: 140 },
  { key: "income", label: "Income / Month", defaultVisible: false, sortable: "client_income_per_month", minWidth: 150 },
  { key: "companyTxn", label: "Company Txn", defaultVisible: false, sortable: "client_company_transaction", minWidth: 140 },
  { key: "purchaseReason", label: "Purchase Reason", defaultVisible: false, sortable: "purchase_reason", minWidth: 160 },
  { key: "interestedLoan", label: "Interested Loan", defaultVisible: false, sortable: "interested_for_loan", minWidth: 140 },
  { key: "bankLoan", label: "Bank Loan Amount", defaultVisible: false, sortable: "bank_loan_amount", minWidth: 160 },
  { key: "carAvailable", label: "Car Available", defaultVisible: false, sortable: "car_available", minWidth: 140 },
  { key: "carExchange", label: "Car Exchange", defaultVisible: false, sortable: "car_exchange_category_per_year", minWidth: 140 },
  { key: "dob", label: "Date of Birth", defaultVisible: false, sortable: "date_of_birth", minWidth: 130 },
  { key: "anniversary", label: "Anniversary", defaultVisible: false, sortable: "anniversary_date", minWidth: 130 },
  { key: "lastPurchase", label: "Last Purchase", defaultVisible: false, sortable: "client_last_purchase_date", minWidth: 130 },
  { key: "search", label: "Search Data", defaultVisible: true, sortable: "search", minWidth: 220 },
  { key: "created", label: "Created", defaultVisible: true, sortable: "created_at", minWidth: 160 },
  { key: "note", label: "Note", defaultVisible: true, sortable: "description", minWidth: 240 },
];

const ACTIONS_COLUMN_WIDTH = 112;
const LOCKED_VISIBLE_COLUMNS = ["customer"];

const stickyCustomerThClass =
  "sticky left-0 z-20 bg-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.35)]";
const stickyCustomerTdClass =
  "sticky left-0 z-10 bg-white group-hover:bg-gray-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.12)]";
const stickyActionsThClass =
  "sticky right-0 z-20 bg-slate-800 shadow-[-6px_0_12px_-8px_rgba(15,23,42,0.35)]";
const stickyActionsTdClass =
  "sticky right-0 z-10 bg-white group-hover:bg-slate-50/80 shadow-[-6px_0_12px_-8px_rgba(15,23,42,0.18)]";

const DEFAULT_VISIBLE_COLUMNS = CUSTOMER_TABLE_COLUMNS.filter((col) => col.defaultVisible).map((col) => col.key);

const loadVisibleCustomerColumns = () => {
  if (typeof window === "undefined") return DEFAULT_VISIBLE_COLUMNS;
  try {
    const raw = window.localStorage.getItem(CUSTOMER_COLUMN_STORAGE_KEY);
    if (!raw) return DEFAULT_VISIBLE_COLUMNS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_VISIBLE_COLUMNS;
    const validKeys = new Set(CUSTOMER_TABLE_COLUMNS.map((col) => col.key));
    const filtered = parsed.filter((key) => validKeys.has(key));
    const withLocked = Array.from(new Set([...LOCKED_VISIBLE_COLUMNS, ...filtered]));
    return withLocked.length ? withLocked : DEFAULT_VISIBLE_COLUMNS;
  } catch {
    return DEFAULT_VISIBLE_COLUMNS;
  }
};

const formatCustomerDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatCustomerDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const masterTitle = (value) => {
  if (value == null || value === "") return "-";
  if (typeof value === "object") {
    const title = value.md_title ?? value.label ?? null;
    return title != null && String(title).trim() !== "" ? String(title) : "-";
  }
  return String(value);
};

const displayMasterField = (customer, displayKey, valueKey) => {
  const display = customer?.[displayKey];
  if (display != null && String(display).trim() !== "") {
    return String(display).trim();
  }
  return masterTitle(customer?.[valueKey]);
};

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
    if (key === "clientSeriousnessTo" && (filters.clientSeriousnessFrom || filters.clientSeriousnessTo)) {
      // Count from/to seriousness as a single active filter.
      return filters.clientSeriousnessFrom ? count : count + 1;
    }
    if (key === "clientSeriousnessFrom") {
      return value ? count + 1 : count;
    }
    if (key === "bankLoanAmountTo" && (filters.bankLoanAmountFrom || filters.bankLoanAmountTo)) {
      return filters.bankLoanAmountFrom ? count : count + 1;
    }
    if (key === "bankLoanAmountFrom") {
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
  const [visibleColumns, setVisibleColumns] = useState(() => loadVisibleCustomerColumns());
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [seriousnessOptions, setSeriousnessOptions] = useState([]);
  const [attitudeOptions, setAttitudeOptions] = useState([]);
  const [inlineSavingKey, setInlineSavingKey] = useState(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const columnMenuRef = useRef(null);

  const commandApi = useMemo(() => createApiRequest(API_URL), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => setIsMobileViewport(media.matches);
    syncViewport();
    media.addEventListener("change", syncViewport);
    return () => media.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CUSTOMER_COLUMN_STORAGE_KEY, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    const loadInlineOptions = async () => {
      try {
        const [seriousness, attitude] = await Promise.all([
          FilterProductService.Queries.getClientSeriousnessOptions(),
          FilterProductService.Queries.getClientAttitudeOptions(),
        ]);
        setSeriousnessOptions((seriousness || []).filter((opt) => opt.value !== "" && opt.value != null));
        setAttitudeOptions((attitude || []).filter((opt) => opt.value !== "" && opt.value != null));
      } catch {
        setSeriousnessOptions([]);
        setAttitudeOptions([]);
      }
    };
    loadInlineOptions();
  }, []);

  useEffect(() => {
    if (!isColumnMenuOpen) return;
    const handleOutsideClick = (event) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target)) {
        setIsColumnMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isColumnMenuOpen]);

  const isColumnVisible = useCallback((key) => visibleColumns.includes(key), [visibleColumns]);

  const visibleDataColumns = useMemo(
    () => CUSTOMER_TABLE_COLUMNS.filter((col) => isColumnVisible(col.key)),
    [isColumnVisible]
  );

  // One column absorbs extra width when fewer columns are visible so the table stays full width.
  const flexColumnKey = useMemo(() => {
    const preference = ["note", "search", "address"];
    for (const key of preference) {
      if (isColumnVisible(key)) return key;
    }
    const last = [...visibleDataColumns].reverse().find((col) => col.key !== "customer");
    return last?.key ?? "customer";
  }, [visibleDataColumns, isColumnVisible]);

  const tableMinWidth = useMemo(() => {
    const customerWidth = isMobileViewport ? 168 : null;
    const actionsWidth = isMobileViewport ? 96 : ACTIONS_COLUMN_WIDTH;
    const columnsWidth = visibleDataColumns.reduce((sum, col) => {
      if (col.key === "customer" && customerWidth != null) return sum + customerWidth;
      return sum + col.minWidth;
    }, 0);
    return columnsWidth + actionsWidth;
  }, [visibleDataColumns, isMobileViewport]);

  const customerColumnWidth = isMobileViewport ? 168 : 220;
  const actionsColumnWidth = isMobileViewport ? 96 : ACTIONS_COLUMN_WIDTH;
  const stickyCustomerTh = isMobileViewport ? "bg-slate-800" : stickyCustomerThClass;
  const stickyCustomerTd = isMobileViewport ? "bg-white group-hover:bg-gray-50" : stickyCustomerTdClass;
  const stickyActionsTh = isMobileViewport ? "bg-slate-800" : stickyActionsThClass;
  const stickyActionsTd = isMobileViewport ? "bg-white group-hover:bg-slate-50/80" : stickyActionsTdClass;

  const tableColSpan = visibleDataColumns.length + 1;

  const toggleColumnVisibility = (columnKey) => {
    if (LOCKED_VISIBLE_COLUMNS.includes(columnKey)) return;

    setVisibleColumns((prev) => {
      if (prev.includes(columnKey)) {
        if (prev.length <= 1) {
          toast.error("Keep at least one column visible");
          return prev;
        }
        return prev.filter((key) => key !== columnKey);
      }
      return [...prev, columnKey];
    });
  };

  const toggleAllColumns = () => {
    if (visibleColumns.length === CUSTOMER_TABLE_COLUMNS.length) {
      setVisibleColumns([...LOCKED_VISIBLE_COLUMNS]);
      return;
    }
    setVisibleColumns(CUSTOMER_TABLE_COLUMNS.map((col) => col.key));
  };

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

  /** Same gate for Actions Edit/Delete and inline edit (Seriousness / Attitude / Note). */
  const canModifyCustomer = (customer) =>
    isPrivilegedUser ||
    Number(parsedUser?.id) === Number(customer?.created_user?.id) ||
    parsedUser?.role_name === "Admin";

  const canShowAddCategoryButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Customer", "ShowCustomerAddButton");


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
      if (appliedFilters.email.trim()) params.append("email", appliedFilters.email.trim());
      if (appliedFilters.address.trim()) params.append("address", appliedFilters.address.trim());
      if (appliedFilters.hasFacebook) params.append("has_facebook", "yes");
      if (appliedFilters.hasMessenger) params.append("has_messenger", "yes");
      if (appliedFilters.clientSeriousnessFrom) {
        params.append("client_seriousness_from", appliedFilters.clientSeriousnessFrom);
      }
      if (appliedFilters.clientSeriousnessTo) {
        params.append("client_seriousness_to", appliedFilters.clientSeriousnessTo);
      }
      if (appliedFilters.clientAttitude.length) params.append("client_attitude", appliedFilters.clientAttitude.join(","));
      if (appliedFilters.clientLevel.length) params.append("client_level", appliedFilters.clientLevel.join(","));
      if (appliedFilters.clientProfession.length) {
        params.append("client_profession", appliedFilters.clientProfession.join(","));
      }
      if (appliedFilters.clientIncome.length) {
        params.append("client_income_per_month", appliedFilters.clientIncome.join(","));
      }
      if (appliedFilters.clientCompanyTransaction) {
        params.append("client_company_transaction", appliedFilters.clientCompanyTransaction);
      }
      if (appliedFilters.purchaseReason.length) {
        params.append("purchase_reason", appliedFilters.purchaseReason.join(","));
      }
      if (appliedFilters.interestedForLoan) params.append("interested_for_loan", appliedFilters.interestedForLoan);
      if (appliedFilters.bankLoanAmountFrom) {
        params.append("bank_loan_amount_from", appliedFilters.bankLoanAmountFrom);
      }
      if (appliedFilters.bankLoanAmountTo) {
        params.append("bank_loan_amount_to", appliedFilters.bankLoanAmountTo);
      }
      if (appliedFilters.carAvailable.length) {
        params.append("car_available", appliedFilters.carAvailable.join(","));
      }
      if (appliedFilters.carExchangeCategory.length) {
        params.append("car_exchange_category_per_year", appliedFilters.carExchangeCategory.join(","));
      }
      if (appliedFilters.customerSearch.trim()) params.append("customer_search", appliedFilters.customerSearch.trim());
      if (appliedFilters.dateOfBirthFrom) params.append("date_of_birth_from", appliedFilters.dateOfBirthFrom);
      if (appliedFilters.dateOfBirthTo) params.append("date_of_birth_to", appliedFilters.dateOfBirthTo);
      if (appliedFilters.anniversaryDateFrom) {
        params.append("anniversary_date_from", appliedFilters.anniversaryDateFrom);
      }
      if (appliedFilters.anniversaryDateTo) {
        params.append("anniversary_date_to", appliedFilters.anniversaryDateTo);
      }
      if (appliedFilters.lastPurchaseFrom) params.append("last_purchase_from", appliedFilters.lastPurchaseFrom);
      if (appliedFilters.lastPurchaseTo) params.append("last_purchase_to", appliedFilters.lastPurchaseTo);
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

  const handleInlineSave = async (customerId, field, value, onDone) => {
    const savingKey = `${customerId}:${field}`;
    setInlineSavingKey(savingKey);
    try {
      const response = await CustomerService.Commands.updateCustomerInline(customerId, {
        [field]: value,
      });
      if (response?.status !== "success") {
        toast.error(response?.message || "Failed to update");
        return;
      }

      const updated = response.data || {};
      setData((prev) =>
        prev.map((row) => {
          if (Number(row.id) !== Number(customerId)) return row;
          const next = { ...row, ...updated };
          if (field === "description") {
            next.description = value;
          }
          if (field === "client_seriousness") {
            next.client_seriousness = updated.client_seriousness ?? value;
            next.client_seriousness_display =
              updated.client_seriousness_display ||
              seriousnessOptions.find((opt) => String(opt.value) === String(value))?.label ||
              row.client_seriousness_display;
          }
          if (field === "client_attitude") {
            next.client_attitude = value;
            next.client_attitude_display =
              updated.client_attitude_display ||
              attitudeOptions
                .filter((opt) =>
                  String(value)
                    .split(",")
                    .map((id) => id.trim())
                    .includes(String(opt.value))
                )
                .map((opt) => opt.label)
                .join(", ");
          }
          return next;
        })
      );
      toast.success("Updated");
      onDone?.();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to update");
    } finally {
      setInlineSavingKey(null);
    }
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
    <div className="w-full p-3 sm:p-4 md:p-6 space-y-3 bg-gray-50 min-w-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Customers</h1>
        
        {canShowAddCategoryButton && (
          <button
            className="self-start sm:self-auto bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 text-sm whitespace-nowrap"
            onClick={openAddModal}
          >
            Add New Customer
          </button>
        )}
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col gap-2 sm:relative sm:flex-row sm:items-center sm:justify-center">
        <div className="w-full sm:w-1/2 sm:max-w-xl min-w-0">
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
          className="inline-flex items-center justify-center gap-1.5 self-stretch sm:self-auto sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2 px-2.5 py-2 sm:py-1 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 text-sm"
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
      <div className="bg-white rounded-lg shadow overflow-hidden min-w-0">
        {isMobileViewport ? (
          <p className="px-3 py-1.5 text-[11px] text-slate-500 bg-slate-50 border-b border-slate-100">
            Swipe sideways to see more columns
          </p>
        ) : null}
        <div className="overflow-x-auto overscroll-x-contain" style={{ WebkitOverflowScrolling: "touch" }}>
          <table className="w-full table-fixed" style={{ minWidth: tableMinWidth }}>
            <colgroup>
              {visibleDataColumns.map((column) => {
                const isFlexColumn = column.key === flexColumnKey;
                return (
                  <col
                    key={column.key}
                    style={
                      isFlexColumn
                        ? { minWidth: column.minWidth }
                        : {
                            width: column.key === "customer" ? customerColumnWidth : column.minWidth,
                            minWidth: column.key === "customer" ? customerColumnWidth : column.minWidth,
                          }
                    }
                  />
                );
              })}
              <col style={{ width: actionsColumnWidth, minWidth: actionsColumnWidth }} />
            </colgroup>
            <thead className="bg-slate-800">
              <tr>
                {visibleDataColumns.map((column) => {
                  const isSortable = !!column.sortable;
                  const isActiveSort = sortBy === column.sortable;
                  const isCustomerColumn = column.key === "customer";
                  const isFlexColumn = column.key === flexColumnKey;
                  return (
                    <th
                      key={column.key}
                      className={`px-3 py-3 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider whitespace-nowrap ${
                        isSortable ? "cursor-pointer hover:bg-slate-700" : ""
                      } ${isCustomerColumn ? stickyCustomerTh : ""}`}
                      style={
                        isFlexColumn
                          ? { minWidth: column.minWidth }
                          : {
                              width: isCustomerColumn ? customerColumnWidth : column.minWidth,
                              minWidth: isCustomerColumn ? customerColumnWidth : column.minWidth,
                            }
                      }
                      onClick={() => {
                        if (isSortable) handleSort(column.sortable);
                      }}
                    >
                      <span className="inline-flex items-center gap-1 max-w-full">
                        <span className="truncate">{column.label}</span>
                        {isSortable ? (
                          <span
                            className={`inline-block w-3 text-center shrink-0 ${isActiveSort ? "text-white" : "text-transparent"}`}
                            aria-hidden={!isActiveSort}
                          >
                            {isActiveSort && sortOrder === "desc" ? "↓" : "↑"}
                          </span>
                        ) : null}
                      </span>
                    </th>
                  );
                })}
                <th
                  className={`px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-[0.08em] whitespace-nowrap relative ${stickyActionsTh}`}
                  style={{ width: actionsColumnWidth }}
                >
                  <div className="flex w-full items-center justify-between gap-2" ref={columnMenuRef}>
                    <span className="leading-none">Actions</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsColumnMenuOpen((open) => !open);
                      }}
                      className="inline-flex items-center justify-center shrink-0 text-slate-300 hover:text-white transition-colors duration-150"
                      title="Show / hide columns"
                      aria-label="Show or hide columns"
                      aria-expanded={isColumnMenuOpen}
                    >
                      <AlignJustify className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    {isColumnMenuOpen && (
                      <div className="absolute right-2 top-full mt-1 z-30 w-56 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg text-left normal-case tracking-normal font-normal">
                        <label className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 text-sm text-gray-800 hover:bg-gray-50 cursor-pointer sticky top-0 bg-white">
                          <input
                            type="checkbox"
                            checked={visibleColumns.length === CUSTOMER_TABLE_COLUMNS.length}
                            onChange={toggleAllColumns}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-medium">Select All</span>
                        </label>
                        {CUSTOMER_TABLE_COLUMNS.map((column) => {
                          const isLocked = LOCKED_VISIBLE_COLUMNS.includes(column.key);
                          return (
                            <label
                              key={column.key}
                              className={`flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 ${
                                isLocked ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isColumnVisible(column.key)}
                                disabled={isLocked}
                                onChange={() => toggleColumnVisibility(column.key)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                              />
                              <span>
                                {column.label}
                                {isLocked ? " (fixed)" : ""}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={tableColSpan} className="px-6 py-8 text-center text-gray-500">
                    <LoadingSpinner message="Loading customers..." />
                  </td>
                </tr>
              )}
              {data.length === 0 && !loading && (
                <tr>
                  <td colSpan={tableColSpan} className="px-6 py-8 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              )}
              {data.length > 0 &&
                !loading &&
                data.map((customer) => {
                  const canModify = canModifyCustomer(customer);
                  const facebookHref = toExternalHref(customer.facebook_id_link);
                  const messengerHref = toExternalHref(customer.facebook_messenger_link);

                  const cellByKey = {
                    customer: (
                      <td key="customer" className={`px-4 py-4 text-sm text-gray-900 overflow-hidden ${stickyCustomerTd}`}>
                        <div className="space-y-1.5 min-w-0">
                          <Link
                            href={`/dashboard/customers/${customer.id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer flex items-center gap-1 min-w-0"
                          >
                            <span className="truncate">{customer.name || "-"}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </Link>
                          <div className="text-gray-700 whitespace-nowrap">{customer.mobile || "-"}</div>
                          <div className="flex items-center gap-2">
                            {facebookHref ? (
                              <a
                                href={facebookHref}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex hover:opacity-80"
                                title="Open Facebook"
                                aria-label="Open Facebook"
                              >
                                <FacebookIcon />
                              </a>
                            ) : null}
                            {messengerHref ? (
                              <a
                                href={messengerHref}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex hover:opacity-80"
                                title="Open Messenger"
                                aria-label="Open Messenger"
                              >
                                <MessengerIcon />
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </td>
                    ),
                    email: (
                      <td key="email" className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.email || "-"}
                      </td>
                    ),
                    address: (
                      <td key="address" className="px-3 py-4 text-sm text-gray-900 overflow-hidden">
                        <span className="line-clamp-2 break-words">{customer.address || "-"}</span>
                      </td>
                    ),
                    seriousness: (
                      <td key="seriousness" className="px-3 py-4 text-sm text-gray-900">
                        <InlineSeriousnessCell
                          customer={customer}
                          canEdit={canModify}
                          options={seriousnessOptions}
                          displayValue={displayMasterField(customer, "client_seriousness_display", "client_seriousness")}
                          saving={inlineSavingKey === `${customer.id}:client_seriousness`}
                          onSave={(value, done) => handleInlineSave(customer.id, "client_seriousness", value, done)}
                        />
                      </td>
                    ),
                    attitude: (
                      <td key="attitude" className="px-3 py-4 text-sm text-gray-900">
                        <InlineAttitudeCell
                          customer={customer}
                          canEdit={canModify}
                          options={attitudeOptions}
                          displayValue={customer.client_attitude_display || masterTitle(customer.client_attitude)}
                          saving={inlineSavingKey === `${customer.id}:client_attitude`}
                          onSave={(value, done) => handleInlineSave(customer.id, "client_attitude", value, done)}
                        />
                      </td>
                    ),
                    level: (
                      <td key="level" className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {displayMasterField(customer, "client_level_display", "client_level")}
                      </td>
                    ),
                    profession: (
                      <td key="profession" className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {displayMasterField(customer, "client_profession_display", "client_profession")}
                      </td>
                    ),
                    income: (
                      <td key="income" className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {displayMasterField(customer, "client_income_per_month_display", "client_income_per_month")}
                      </td>
                    ),
                    companyTxn: (
                      <td key="companyTxn" className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {displayMasterField(customer, "client_company_transaction_display", "client_company_transaction")}
                      </td>
                    ),
                    purchaseReason: (
                      <td key="purchaseReason" className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {displayMasterField(customer, "purchase_reason_display", "purchase_reason")}
                      </td>
                    ),
                    interestedLoan: (
                      <td key="interestedLoan" className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {customer.interested_for_loan || "-"}
                      </td>
                    ),
                    bankLoan: (
                      <td key="bankLoan" className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {displayMasterField(customer, "bank_loan_amount_display", "bank_loan_amount")}
                      </td>
                    ),
                    carAvailable: (
                      <td key="carAvailable" className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {displayMasterField(customer, "car_available_display", "car_available")}
                      </td>
                    ),
                    carExchange: (
                      <td key="carExchange" className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {displayMasterField(customer, "car_exchange_category_per_year_display", "car_exchange_category_per_year")}
                      </td>
                    ),
                    dob: (
                      <td key="dob" className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCustomerDate(customer.date_of_birth)}
                      </td>
                    ),
                    anniversary: (
                      <td key="anniversary" className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.anniversary_date || "-"}
                      </td>
                    ),
                    lastPurchase: (
                      <td key="lastPurchase" className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCustomerDate(customer.client_last_purchase_date)}
                      </td>
                    ),
                    search: (
                      <td key="search" className="px-4 py-4 text-sm text-gray-900 overflow-hidden">
                        <span className="line-clamp-3 break-words">{customer?.search || "-"}</span>
                      </td>
                    ),
                    created: (
                      <td key="created" className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{customer.created_user?.name || "-"}</div>
                        <div className="text-xs text-gray-400">{formatCustomerDateTime(customer.created_at)}</div>
                      </td>
                    ),
                    note: (
                      <td key="note" className="px-4 py-4 text-sm text-gray-900 overflow-hidden">
                        <InlineNoteCell
                          customer={customer}
                          canEdit={canModify}
                          saving={inlineSavingKey === `${customer.id}:description`}
                          isExpanded={expandedNotes.has(customer.id)}
                          onToggleExpand={() => toggleNote(customer.id)}
                          onSave={(value, done) => handleInlineSave(customer.id, "description", value, done)}
                        />
                      </td>
                    ),
                  };

                  return (
                    <tr key={customer.id} className="group hover:bg-gray-50">
                      {visibleDataColumns.map((column) => cellByKey[column.key])}
                      <td className={`px-4 py-3.5 whitespace-nowrap overflow-hidden ${stickyActionsTd}`}>
                        {canModify && (
                          <div className="inline-flex items-center gap-3">
                            <button
                              type="button"
                              className="inline-flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors duration-150"
                              onClick={() => openEditModal(customer)}
                              title="Edit"
                              aria-label="Edit customer"
                            >
                              <Pencil className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors duration-150"
                              onClick={() => handleDelete(customer.id)}
                              title="Delete"
                              aria-label="Delete customer"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
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
        <div className="border-t border-slate-200 bg-slate-50/80 px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
              <label className="inline-flex items-center gap-2">
                <span className="text-slate-500">Rows</span>
                <select
                  value={perPage}
                  onChange={(e) => handlePerPageChange(Number(e.target.value))}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </label>
              <span className="hidden h-4 w-px bg-slate-200 sm:block" aria-hidden />
              <p className="text-slate-500">
                {total === 0 ? (
                  "No results"
                ) : (
                  <>
                    <span className="font-medium text-slate-700">
                      {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, total)}
                    </span>
                    {" of "}
                    <span className="font-medium text-slate-700">{total}</span>
                  </>
                )}
              </p>
            </div>

            <nav className="flex w-full items-center justify-between gap-1 sm:w-auto sm:justify-end sm:gap-2" aria-label="Pagination">
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage <= 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                  title="First page"
                  aria-label="First page"
                >
                  <ChevronsLeft className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-sm text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
                  <span className="hidden sm:inline">Prev</span>
                </button>
              </div>

              <div className="flex max-w-[45vw] items-center gap-1 overflow-x-auto px-0.5 sm:max-w-none">
                {getPaginationNumbers(currentPage, lastPage).map((page, index) =>
                  typeof page !== "number" ? (
                    <span key={`ellipsis-${index}`} className="px-1.5 text-sm text-slate-400 select-none">
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      onClick={() => handlePageChange(page)}
                      aria-current={page === currentPage ? "page" : undefined}
                      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2.5 text-sm font-medium transition ${
                        page === currentPage
                          ? "bg-slate-800 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-slate-300 hover:text-slate-900"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= lastPage || lastPage === 0}
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-sm text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(lastPage)}
                  disabled={currentPage >= lastPage || lastPage === 0}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Last page"
                  aria-label="Last page"
                >
                  <ChevronsRight className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </nav>
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
