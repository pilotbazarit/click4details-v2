"use client";

import { API_URL } from "@/helpers/apiUrl";
import { createApiRequest } from "@/helpers/axios";
import { CheckCircle, ChevronDown, Clipboard, Eye, Headset, MessageSquare, Phone, Plus, RefreshCcw, User } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import FeedbackListModal from "../modals/FeedbackListModal.jsx";
import FeedbackModal from "../modals/FeedbackModal.jsx";
import FollowupMessageListModal from "../modals/FollowupMessageListModal.jsx";
import FollowupMessageModal from "../modals/FollowupMessageModal.jsx";
import EditCustomerModal from "../modals/EditCustomerModal.jsx";
import FollowupModal from "../modals/FollowupModal.jsx";
import TransferFollowupModal from "../modals/TransferFollowupModal.jsx";

const ACTIVITY_SCROLL_BATCH = 15;

const TAB_FOLLOWUPS = "followups";
const TAB_ACTIVITIES = "activities";

const CustomerCareDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMessageListModalOpen, setIsMessageListModalOpen] = useState(false);
  const [recentFollowups, setRecentFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState(null);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedFeedbackFollowup, setSelectedFeedbackFollowup] = useState(null);
  const [isFeedbackListModalOpen, setIsFeedbackListModalOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  // New state to hold the followup_detail_id when opening feedback modal
  const [selectedFollowupDetailId, setSelectedFollowupDetailId] = useState(null);

  // New state for followup entry
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [selectedFollowupForEdit, setSelectedFollowupForEdit] = useState(null);
  const [followupModalKey, setFollowupModalKey] = useState(0);

  // State for complete confirmation modal
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [completeFollowupId, setCompleteFollowupId] = useState(null);

  // State for transfer modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferFollowupId, setTransferFollowupId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [jobsTodayTotal, setJobsTodayTotal] = useState(0);
  const [customersTodayTotal, setCustomersTodayTotal] = useState(0);

  // Sorting state
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Search state
  const [search, setSearch] = useState("");

  const [dashboardTab, setDashboardTab] = useState(TAB_FOLLOWUPS);
  const [salesActivities, setSalesActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [activitySearch, setActivitySearch] = useState("");
  const [activityVisibleCount, setActivityVisibleCount] = useState(ACTIVITY_SCROLL_BATCH);
  const [activityDetailOpen, setActivityDetailOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [editCustomerModalOpen, setEditCustomerModalOpen] = useState(false);
  const [editModalCustomer, setEditModalCustomer] = useState(null);
  const [loadingEditCustomerId, setLoadingEditCustomerId] = useState(null);
  /** Full customer snapshot for the activity detail sidebar (parity with Edit customer modal fields). */
  const [detailPanelCustomer, setDetailPanelCustomer] = useState(null);
  const [detailPanelCustomerLoading, setDetailPanelCustomerLoading] = useState(false);
  const activityScrollRootRef = useRef(null);
  const activityLoadMoreSentinelRef = useRef(null);

  const commandApi = useMemo(() => createApiRequest(API_URL), []);

  const handleEditCustomerFromActivity = async (row) => {
    if (!row?.customer_id) {
      toast.error("No linked customer to edit.");
      return;
    }
    setLoadingEditCustomerId(row.id);
    try {
      const res = await commandApi.get(`api/customers/${row.customer_id}`);
      if (res?.status === "success" && res.data) {
        setEditModalCustomer(res.data);
        setEditCustomerModalOpen(true);
      } else {
        toast.error(res?.message || "Could not load customer.");
      }
    } catch (error) {
      const payload = error?.response?.data ?? error;
      toast.error(payload?.message || "Could not load customer.");
    } finally {
      setLoadingEditCustomerId(null);
    }
  };

  const closeEditCustomerModal = () => {
    setEditCustomerModalOpen(false);
    setEditModalCustomer(null);
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copied to clipboard!");
      })
      .catch((err) => {
        console.log("Failed to copy: ", err);
        toast.error("Failed to copy to clipboard.");
      });
  };

  const handleOpenModal = (followup) => {
    setSelectedFollowup(followup);
    setCurrentMessage(null); // Ensure add mode
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFollowup(null);
    setCurrentMessage(null);
  };

  // New handlers for followup entry
  const handleOpenFollowupModal = (followup = null) => {
    setFollowupModalKey((prevKey) => prevKey + 1); // Increment key to force re-mount
    setSelectedFollowupForEdit(followup);
    setIsFollowupModalOpen(true);
  };

  const handleCloseFollowupModal = () => {
    setIsFollowupModalOpen(false);
    setSelectedFollowupForEdit(null);
  };

  const handleFollowupSuccess = () => {
    toast.success(selectedFollowupForEdit ? "Followup updated successfully!" : "Followup created successfully!");
    fetchRecentFollowups(); // Refresh the list
    handleCloseFollowupModal();
  };

  const handleSubmitPackageDetails = ({ selectedFollowupPackage, stage, startDate, visitDate }) => {
    console.log("Package to send:", selectedFollowupPackage);
    console.log("Stage:", stage);
    console.log("Start Date:", startDate);
    console.log("Visit Date:", visitDate);
    // Here you would typically send the package details to your backend or perform other actions
    handleCloseModal();
  };

  const handleMessageCountClick = async (followup) => {
    setSelectedFollowup(followup);
    setIsMessageListModalOpen(true);
    setLoadingMessages(true);
    try {
      const response = await commandApi.get(`/api/followup-messages/by-followup/${followup.id}`);
      if (response.status === "success") {
        setMessages(response.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch messages.");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSubmitMessageDetails = async (messageDetails) => {
    if (!selectedFollowup) {
      console.log("No followup selected");
      return;
    }

    const payload = {
      ...messageDetails,
      customer_id: selectedFollowup.customer.id,
      followup_id: selectedFollowup.id,
    };

    try {
      const response = await commandApi.post("/api/followup-messages", payload);
      toast.success(response.message || "Followup message saved successfully!");
      // Optionally, you can refresh the followups list here
      // fetchRecentFollowups();
    } catch (error) {
      console.log("Failed to save followup message:", error.response ? error.response.data : error.message);
      toast.error(error.response?.data?.message || "Failed to save followup message.");
    } finally {
      handleCloseModal();
    }
  };

  const handleOpenFeedbackModal = (followup, followupDetailId = null) => {
    setSelectedFeedbackFollowup(followup);
    setSelectedFollowupDetailId(followupDetailId);
    setIsFeedbackModalOpen(true);
  };

  const handleCloseFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setSelectedFeedbackFollowup(null);
  };

  const handleMarkAsComplete = (followupId) => {
    setCompleteFollowupId(followupId);
    setShowCompleteConfirm(true);
  };

  const confirmComplete = async () => {
    try {
      const response = await commandApi.put(`/api/followups/${completeFollowupId}/complete`);
      if (response.status === "success") {
        toast.success("Followup marked as complete!");
        fetchRecentFollowups(); // Refresh the list
      } else {
        toast.error(response.message || "Failed to mark followup as complete.");
      }
      fetchRecentFollowups(); // Refresh the list
    } catch (error) {
      console.log("Error marking followup as complete:", error);
      toast.error("Failed to mark followup as complete.");
    } finally {
      setShowCompleteConfirm(false);
      setCompleteFollowupId(null);
    }
  };

  const handleTransfer = (followupId) => {
    setTransferFollowupId(followupId);
    setIsTransferModalOpen(true);
  };

  const handleTransferSuccess = () => {
    fetchRecentFollowups();
    setIsTransferModalOpen(false);
    setTransferFollowupId(null);
  };

  const handleFeedbackSuccess = () => {
    toast.success("Feedback saved successfully!");
    // Refresh the followups list to update feedback count
    fetchRecentFollowups();
  };

  const handleFeedbackCountClick = async (followup, followup_detail_id) => {
    setSelectedFeedbackFollowup(followup);
    setIsFeedbackListModalOpen(true);
    setLoadingFeedbacks(true);
    try {
      const response = await commandApi.get(`/api/feedbacks/by-followup/${followup_detail_id}`);
      if (response.status === "success") {
        setFeedbacks(response.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch feedbacks.");
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const fetchRecentFollowups = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        perPage: perPage,
        sortBy: sortBy,
        sortOrder: sortOrder,
        page_name: "customer_care_dashboard",
      });

      if (search && search.trim()) {
        params.append("search", search.trim());
      }

      const response = await commandApi.get(`/api/followups?${params.toString()}`);

      if (response && response.status === "success") {
        setRecentFollowups(response.data?.data || []);
        setTotal(response.data.pagination.total);
        setLastPage(response.data.pagination.last_page);
        const stats = response.data?.stats;
        if (stats && typeof stats === "object") {
          setJobsTodayTotal(Number(stats.jobs_today_total) || 0);
          setCustomersTodayTotal(Number(stats.customers_today_total) || 0);
        } else {
          setJobsTodayTotal(response.data.pagination.total);
          setCustomersTodayTotal(response.data.pagination.total);
        }
      }
    } catch (error) {
      console.log("Error fetching recent followups:", error);
      setRecentFollowups([]);
      setTotal(0);
      setLastPage(1);
      setJobsTodayTotal(0);
      setCustomersTodayTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, sortBy, sortOrder, search, commandApi]);

  useEffect(() => {
    fetchRecentFollowups();
  }, [fetchRecentFollowups]);

  // Separate useEffect for search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRecentFollowups();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, fetchRecentFollowups]);

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

  const fetchSalesActivities = useCallback(async () => {
    setLoadingActivities(true);
    try {
      const body = await commandApi.get("/api/sales-team-activities");
      const list = Array.isArray(body) ? body : body?.data?.data || body?.data || body?.rows || [];
      setSalesActivities(Array.isArray(list) ? list : []);
    } catch (err) {
      console.log("Error fetching sales team activities:", err);
      setSalesActivities([]);
      toast.error("Failed to load sales team activities.");
    } finally {
      setLoadingActivities(false);
    }
  }, [commandApi]);

  const handleEditCustomerModalSuccess = useCallback(() => {
    closeEditCustomerModal();
    fetchSalesActivities();
  }, [fetchSalesActivities]);

  useEffect(() => {
    if (dashboardTab !== TAB_ACTIVITIES) {
      return;
    }
    fetchSalesActivities();
  }, [dashboardTab, fetchSalesActivities]);

  useEffect(() => {
    if (dashboardTab !== TAB_ACTIVITIES) {
      setActivityDetailOpen(false);
      setSelectedActivity(null);
    }
  }, [dashboardTab]);

  useEffect(() => {
    if (!activityDetailOpen) {
      setDetailPanelCustomer(null);
      setDetailPanelCustomerLoading(false);
      return;
    }
    const cid = selectedActivity?.customer_id;
    if (!cid) {
      setDetailPanelCustomer(null);
      setDetailPanelCustomerLoading(false);
      return;
    }
    let cancelled = false;
    setDetailPanelCustomerLoading(true);
    setDetailPanelCustomer(null);
    commandApi
      .get(`api/customers/${cid}`)
      .then((res) => {
        if (cancelled) return;
        if (res?.status === "success" && res.data) {
          setDetailPanelCustomer(res.data);
        } else {
          setDetailPanelCustomer(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDetailPanelCustomer(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDetailPanelCustomerLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activityDetailOpen, selectedActivity?.customer_id, commandApi]);

  const filteredActivities = useMemo(() => {
    const q = activitySearch.trim().toLowerCase();
    if (!q) {
      return salesActivities;
    }
    return salesActivities.filter((row) => {
      const parts = [
        row.client_name,
        row.phone_number,
        row.seriousness_level_display,
        masterDataLabel(row.customer?.client_seriousness),
        row.customer?.name,
        row.customer?.search,
        row.customer_updated_by_name,
        row.note,
      ];
      return parts.some((v) => String(v ?? "").toLowerCase().includes(q));
    });
  }, [salesActivities, activitySearch]);

  const displayedActivities = useMemo(
    () => filteredActivities.slice(0, activityVisibleCount),
    [filteredActivities, activityVisibleCount]
  );

  const activityHasMoreToScroll = activityVisibleCount < filteredActivities.length;

  useEffect(() => {
    setActivityVisibleCount(Math.min(ACTIVITY_SCROLL_BATCH, filteredActivities.length));
  }, [filteredActivities]);

  useEffect(() => {
    if (dashboardTab !== TAB_ACTIVITIES) {
      return;
    }
    const root = activityScrollRootRef.current;
    const sentinel = activityLoadMoreSentinelRef.current;
    if (!root || !sentinel || !activityHasMoreToScroll) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActivityVisibleCount((n) => Math.min(n + ACTIVITY_SCROLL_BATCH, filteredActivities.length));
        }
      },
      { root, rootMargin: "100px", threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [dashboardTab, activityHasMoreToScroll, filteredActivities.length, activityVisibleCount]);

  const handleActivitySearchChange = (e) => {
    setActivitySearch(e.target.value);
  };

  /**
   * Seriousness label from customers.client_seriousness (via API nested customer or seriousness_level_display).
   */
  const displayActivitySeriousness = (row) => {
    const fromCustomer = masterDataLabel(row?.customer?.client_seriousness);
    if (fromCustomer !== "—") {
      return fromCustomer;
    }
    const resolved = row?.seriousness_level_display;
    if (resolved != null && String(resolved).trim() !== "") {
      return String(resolved).trim();
    }
    return "—";
  };

  const getInitials = (name) => {
    if (!name || !String(name).trim()) {
      return "?";
    }
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const formatMessageTimestamp = (value) => {
    if (!value) {
      return "";
    }
    try {
      return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return String(value);
    }
  };

  const getCustomerSearchText = (row) => String(row?.customer?.search ?? "").trim();

  const getActivityNoteText = (row) => String(row?.note ?? "").trim();

  /** Both DB columns: `customers.search` + `sales_team_activities.note` */
  const buildActivityCopyText = (row) => {
    if (!row) return "";
    const customerSearch = getCustomerSearchText(row);
    const noteText = getActivityNoteText(row);
    const parts = [];
    if (customerSearch) parts.push(`Customer search:\n${customerSearch}`);
    if (noteText) parts.push(`Activity note:\n${noteText}`);
    return parts.join("\n\n");
  };

  const formatDetailDateOnly = (value) => {
    if (!value) {
      return "—";
    }
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) {
        return String(value);
      }
      return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return String(value);
    }
  };

  const masterDataLabel = (field, relationAlt) => {
    const rel = relationAlt ?? (typeof field === "object" && field !== null ? field : null);
    if (rel != null && typeof rel === "object" && rel.md_title != null && String(rel.md_title).trim() !== "") {
      return String(rel.md_title);
    }
    if (field == null || field === "") {
      return "—";
    }
    if (typeof field === "object" && field !== null && field.md_title != null && String(field.md_title).trim() !== "") {
      return String(field.md_title);
    }
    return String(field);
  };

  const displayClientLevel = (customer) => {
    if (!customer) return "—";
    const fromDisplay = customer.client_level_display;
    if (fromDisplay != null && String(fromDisplay).trim() !== "") {
      return String(fromDisplay).trim();
    }
    return masterDataLabel(customer.client_level, customer.clientLevel);
  };

  const displayOrDash = (v) => (v != null && String(v).trim() !== "" ? String(v).trim() : "—");

  const formatVisitSummary = (dateValue, nameValue) => {
    const datePart = formatDetailDateOnly(dateValue);
    const namePart = displayOrDash(nameValue);
    if (datePart === "—" && namePart === "—") {
      return "—";
    }
    return `${datePart} · ${namePart}`;
  };

  const formatYesNo = (v) => (v ? "Yes" : "No");

  const formatReadyBudgetRange = (raw) => {
    if (raw == null || raw === "") {
      return "—";
    }
    try {
      const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(arr) && arr.length >= 2) {
        return `${Number(arr[0]).toLocaleString()} – ${Number(arr[1]).toLocaleString()}`;
      }
    } catch {
      /* ignore */
    }
    return String(raw);
  };

  /** Two-column dense layout: each cell keeps label | value on one line. */
  const DetailDl = ({ children }) => (
    <dl className="grid grid-cols-1 gap-x-4 gap-y-0 md:grid-cols-2 md:gap-x-5">{children}</dl>
  );

  /** `fullWidth` spans both columns on md+ for long text (address, description, …). */
  const DetailField = ({ label, value, fullWidth = false, className = "" }) => (
    <div
      className={`flex flex-row items-start gap-2 border-b border-gray-100 py-2 md:gap-2.5 ${
        fullWidth ? "md:col-span-2" : ""
      } ${className}`}
    >
      <dt className="w-[36%] max-w-[9.5rem] shrink-0 pt-px text-[11px] font-medium leading-snug text-gray-500 md:max-w-[7.75rem]">
        {label}
      </dt>
      <dd className="min-w-0 flex-1 text-xs leading-snug text-gray-900 break-words [&_a]:font-medium">{value}</dd>
    </div>
  );

  const maybeLink = (href, label) => {
    if (!href || String(href).trim() === "") {
      return displayOrDash(null);
    }
    const raw = String(href).trim();
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return (
      <a href={normalized} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
        {label || raw}
      </a>
    );
  };

  return (
    <div className="w-full  p-6 space-y-6 ">
      {/* Next.js and Tailwind CSS implementation */}
      <img
        src="https://static.vecteezy.com/system/resources/thumbnails/000/701/690/small/abstract-polygonal-banner-background.jpg"
        alt="Banner"
        className="w-full h-[200px] mb-6"
      />
      <div className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Today's Tasks</h3>
          {dashboardTab === TAB_FOLLOWUPS && (
            <button
              onClick={() => handleOpenFollowupModal()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Followup
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* KPI Card 1: Total Customers Today */}
        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Headset className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Customers Today</p>
            <h2 className="text-2xl font-bold text-gray-800">{customersTodayTotal}</h2>
          </div>
        </div>

        {/* KPI Card 2: Total Jobs Today */}
        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Jobs Today</p>
            <h2 className="text-2xl font-bold text-gray-800">{jobsTodayTotal}</h2>
          </div>
        </div>
      </div>

      {/* Follow-ups / Sales activities */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 pt-4 flex flex-wrap items-end justify-between gap-3 border-b border-gray-200">
          <div className="flex gap-6" role="tablist" aria-label="Dashboard section">
            <button
              type="button"
              role="tab"
              aria-selected={dashboardTab === TAB_FOLLOWUPS}
              onClick={() => setDashboardTab(TAB_FOLLOWUPS)}
              className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                dashboardTab === TAB_FOLLOWUPS
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              Today&apos;s follow-ups
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={dashboardTab === TAB_ACTIVITIES}
              onClick={() => setDashboardTab(TAB_ACTIVITIES)}
              className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                dashboardTab === TAB_ACTIVITIES
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              Team sales activities
            </button>
          </div>
          {dashboardTab === TAB_FOLLOWUPS ? (
            <a href="/dashboard/followups" className="pb-3 text-sm text-blue-600 hover:text-blue-800 shrink-0">
              View all follow-ups →
            </a>
          ) : (
            <a href="/dashboard/sales-team-activity" className="pb-3 text-sm text-blue-600 hover:text-blue-800 shrink-0">
              Full sales activity →
            </a>
          )}
        </div>

        {dashboardTab === TAB_FOLLOWUPS && (
          <>
            {/* Search and Controls */}
            <div className="p-4 flex items-center justify-between space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search followups..."
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

            <div className="p-4 w-full">
              {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Loading recent followups...</span>
            </div>
          ) : recentFollowups.length > 0 ? (
            <>
              <table className="min-w-full border-collapse border-2 border-gray-200">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-center font-medium text-gray-700 border-2 border-gray-200">#</th>
                    <th
                      className="px-2 py-1 text-center font-medium text-gray-700 border-2 border-gray-200 cursor-pointer"
                      onClick={() => handleSort("customer_name")}
                    >
                      Customer Name {sortBy === "customer_name" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-2 py-1 text-center font-medium text-gray-700 border-2 border-gray-200 w-[50%]">Message</th>
                    <th className="px-2 py-1 text-center font-medium text-gray-700 border-2 border-gray-200">What's App</th>
                    <th className="px-2 py-1 text-center font-medium text-gray-700 border-2 border-gray-200">Call</th>
                    <th className="px-2 py-1 text-center font-medium text-gray-700 border-2 border-gray-200">Feedback</th>
                    <th className="px-2 py-1 text-center font-medium text-gray-700 border-2 border-gray-200">Transferred To</th>
                    <th className="px-2 py-1 text-center font-medium text-gray-700 border-2 border-gray-200 w-[15%]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentFollowups.map((recentFollowup, index) => (
                    <tr key={recentFollowup.id} className={`hover:bg-gray-50 ${recentFollowup.status === 1 ? "bg-green-50" : ""}`}>
                      <td className="px-2 py-1 border-2 border-gray-200 text-center">{(currentPage - 1) * perPage + index + 1}</td>
                      <td className="px-2 py-1 border border-gray-200">
                        {recentFollowup.followup.customer?.id ? (
                          <a href={`/dashboard/customers/${recentFollowup.followup.customer.id}`} className="text-blue-600 hover:underline font-medium">
                            {recentFollowup.followup.customer.name}
                          </a>
                        ) : (
                          <span>{recentFollowup.followup.customer?.name || "Unknown Customer"}</span>
                        )}
                        <br />
                        <small className="text-gray-500">{recentFollowup.followup.customer?.mobile || "N/A"}</small>
                      </td>
                      <td className="px-2 py-1 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs">{recentFollowup.message_template}</span>
                          {recentFollowup.message_template && (
                            <button
                              type="button"
                              onClick={() => handleCopyToClipboard(recentFollowup.message_template)}
                              className="ml-2 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              title="Copy message to clipboard"
                            >
                              <Clipboard className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {recentFollowup.followup.followup_messages_count > 0 && (
                          <button className="text-blue-600 hover:text-blue-800" onClick={() => handleMessageCountClick(recentFollowup)}>
                            <span className="text-gray-500 ml-1">({recentFollowup.followup.followup_messages_count})</span>
                          </button>
                        )}
                      </td>
                      <td className="px-2 py-1 border border-gray-200 text-center">
                        <a
                          href={`https://wa.me/${recentFollowup.followup.customer?.mobile || ""}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                          </svg>
                        </a>
                      </td>
                      <td className="px-2 py-1 border border-gray-200 text-center">
                        {recentFollowup.include_call === 1 && (
                          <button className="text-blue-600 hover:text-blue-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                stroke="currentColor"
                                strokeWidth="2"
                                d="M22 16.92V19a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.13 1.06.37 2.09.72 3.08a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.58 6.58l1.27-1.27a2 2 0 0 1 2.11-.45c.99.35 2.02.59 3.08.72A2 2 0 0 1 22 16.92z"
                              />
                            </svg>
                          </button>
                        )}
                      </td>
                      <td className="px-2 py-1 border border-gray-200 text-center">
                        {recentFollowup.status !== 1 && (
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleOpenFeedbackModal(recentFollowup.followup, recentFollowup.id)}
                            title="Add Feedback"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleFeedbackCountClick(recentFollowup.followup, recentFollowup.id)}
                        >
                          <span className="text-gray-500 ml-1">({recentFollowup.feedbacks?.length})</span>
                        </button>
                      </td>
                      <td className="px-2 py-1 border border-gray-200 text-center">{recentFollowup.transferred_to && recentFollowup.transferred_to.name}</td>
                      <td className="px-2 py-1 space-x-2 border border-gray-200 text-center">
                        {recentFollowup.status !== 1 && (
                          <>
                            <button
                              className="inline-flex items-center px-3 py-1.5 border border-green-300 text-xs font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-colors duration-200"
                              onClick={() => handleMarkAsComplete(recentFollowup.id)}
                              title="Mark as Complete"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Complete
                            </button>
                            <button
                              className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-200"
                              onClick={() => handleTransfer(recentFollowup.id)}
                              title="Transfer"
                            >
                              <RefreshCcw className="w-3 h-3 mr-1" />
                              Transfer
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
            </>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent followups found</p>
              <p className="text-sm text-gray-400 mt-1">Followups will appear here once created</p>
            </div>
          )}
            </div>
          </>
        )}

        {dashboardTab === TAB_ACTIVITIES && (
          <div className="grid grid-cols-12 gap-0 md:gap-3">
            <div className="col-span-12 md:col-span-5 min-w-0">
              <div className="border-b border-gray-200 bg-slate-50/80 px-2.5 py-2">
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-gray-900">Team sales activities</h3>
                  <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                    Recent activity for your team. Click the view icon on a row to open details on the right.
                  </p>
                </div>
              </div>
              <div className="p-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white border-b border-gray-100">
                <div className="flex-1 min-w-0">
                  <label htmlFor="team-messages-search" className="sr-only">
                    Search activities
                  </label>
                  <input
                    id="team-messages-search"
                    type="search"
                    placeholder="Search by customer, phone, teammate, or note…"
                    value={activitySearch}
                    onChange={handleActivitySearchChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md bg-gray-50/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-400"
                  />
                </div>
                <div className="shrink-0 text-[11px] text-gray-500 tabular-nums">
                  {filteredActivities.length > 0
                    ? `Showing ${displayedActivities.length} of ${filteredActivities.length}`
                    : "0 activities"}
                </div>
              </div>
              <div className="p-0 sm:p-2 w-full bg-slate-50/60 md:pr-0">
              {loadingActivities ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-7 w-7 border-2 border-gray-200 border-t-blue-600"></div>
                  <span className="ml-2 text-xs text-gray-600">Loading team activities…</span>
                </div>
              ) : displayedActivities.length > 0 ? (
                <>
                  <div className="flex flex-col rounded-none sm:rounded-xl border-0 sm:border border-gray-200 bg-white sm:shadow-sm overflow-hidden">
                    <div
                      ref={activityScrollRootRef}
                      className="max-h-[min(52vh,440px)] overflow-y-auto overscroll-y-contain"
                    >
                  <ul className="divide-y divide-gray-200/90">
                    {displayedActivities.map((row) => {
                      const customerLabel = row.client_name || row.customer?.name || "Unknown customer";
                      const senderName = row.customer_updated_by_name?.trim() || "Team member";
                      const customerSearch = getCustomerSearchText(row);
                      const noteText = getActivityNoteText(row);
                      const copyText = buildActivityCopyText(row);
                      const ts = formatMessageTimestamp(row.updated_at);

                      const isSelected = selectedActivity?.id === row.id;

                      return (
                        <li
                          key={row.id}
                          className={`group px-2.5 py-3 sm:px-3 transition-colors ${
                            isSelected ? "bg-blue-50/60 hover:bg-blue-50/80" : "hover:bg-slate-50/70"
                          }`}
                        >
                          <div className="flex min-w-0 gap-2">
                            <div
                              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-[10px] font-semibold text-white ring-1 ring-white"
                              aria-hidden
                            >
                              {getInitials(senderName)}
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex min-w-0 items-center justify-between gap-2">
                                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                  <p className="truncate text-sm font-semibold text-gray-900 leading-tight">{senderName}</p>
                                  {ts ? (
                                    <time dateTime={row.updated_at} className="shrink-0 text-[10px] text-gray-400 tabular-nums">
                                      {ts}
                                    </time>
                                  ) : null}
                                </div>
                                <span className="inline-flex shrink-0 items-center gap-0.5" role="group" aria-label="Row actions">
                                  <button
                                    type="button"
                                    disabled={!row.customer_id || loadingEditCustomerId === row.id}
                                    onClick={() => handleEditCustomerFromActivity(row)}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-slate-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-35"
                                    title={
                                      row.customer_id ? "Edit customer & activity" : "No linked customer — cannot edit"
                                    }
                                    aria-label="Edit customer and activity"
                                  >
                                    {loadingEditCustomerId === row.id ? (
                                      <span
                                        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
                                        aria-hidden
                                      />
                                    ) : (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                      >
                                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                      </svg>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedActivity(row);
                                      setActivityDetailOpen(true);
                                    }}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-blue-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                    title="View details"
                                    aria-label="View message details"
                                  >
                                    <Eye className="h-4 w-4" aria-hidden />
                                  </button>
                                </span>
                              </div>

                              <div className="flex min-w-0 items-center justify-between gap-2 text-[11px] text-gray-600 leading-tight">
                                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1">
                                  <span className="inline-flex items-center gap-1 min-w-0 text-gray-500" title="Customer">
                                    <User className="w-3 h-3 shrink-0 text-gray-400" aria-hidden />
                                    {row.customer_id ? (
                                      <a
                                        href={`/dashboard/customers/${row.customer_id}`}
                                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[min(100%,220px)]"
                                      >
                                        {customerLabel}
                                      </a>
                                    ) : (
                                      <span className="font-medium text-gray-800 truncate max-w-[min(100%,220px)]">{customerLabel}</span>
                                    )}
                                  </span>
                                  {row.phone_number ? (
                                    <>
                                      <span className="text-gray-300 shrink-0" aria-hidden>
                                        ·
                                      </span>
                                      <span className="inline-flex shrink-0 items-center gap-1 tabular-nums text-gray-700">
                                        <Phone className="w-3 h-3 shrink-0 text-gray-400" aria-hidden />
                                        {row.phone_number}
                                      </span>
                                    </>
                                  ) : null}
                                </div>
                                <span
                                  className="inline-flex max-w-[min(100%,10rem)] shrink-0 items-center justify-center self-center rounded-full bg-slate-100 px-2 py-0.5 text-center text-[10px] font-semibold leading-tight text-slate-800 ring-1 ring-slate-200/90"
                                  title={`Seriousness: ${displayActivitySeriousness(row)}`}
                                >
                                  <span className="truncate">{displayActivitySeriousness(row)}</span>
                                </span>
                              </div>

                              <div className="rounded border border-slate-200/90 bg-slate-50/90 px-2 py-1.5">
                                <div className="flex items-start justify-between gap-1.5">
                                  <div className="min-w-0 flex-1 space-y-2">
                                    {customerSearch ? (
                                      <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-0.5">
                                          Customer search
                                        </p>
                                        <p
                                          className={`text-xs leading-snug break-words text-gray-900 ${
                                            activityDetailOpen ? "line-clamp-2" : "whitespace-pre-wrap"
                                          }`}
                                        >
                                          {customerSearch}
                                        </p>
                                      </div>
                                    ) : null}
                                    {noteText ? (
                                      <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-0.5">
                                          Activity note
                                        </p>
                                        <p
                                          className={`text-xs leading-snug break-words text-gray-900 ${
                                            activityDetailOpen ? "line-clamp-3" : "whitespace-pre-wrap"
                                          }`}
                                        >
                                          {noteText}
                                        </p>
                                      </div>
                                    ) : null}
                                    {!customerSearch && !noteText ? (
                                      <p className="text-xs leading-snug text-gray-400 italic">No customer search or activity note</p>
                                    ) : null}
                                  </div>
                                  <button
                                    type="button"
                                    disabled={!copyText}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyToClipboard(copyText);
                                    }}
                                    className="shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-700 hover:bg-slate-200/80 focus:outline-none focus:ring-1 focus:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-35"
                                    title={copyText ? "Copy customer search & activity note" : "Nothing to copy"}
                                    aria-label="Copy customer search and activity note to clipboard"
                                  >
                                    <Clipboard className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                    {activityHasMoreToScroll ? (
                      <div ref={activityLoadMoreSentinelRef} className="h-8 w-full shrink-0" aria-hidden />
                    ) : null}
                    </div>
                    {!loadingActivities && filteredActivities.length > 0 ? (
                      <div className="border-t border-gray-100 bg-slate-50/95 px-2 py-1.5">
                        {activityHasMoreToScroll ? (
                          <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-600">
                            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-blue-600" aria-hidden />
                            <span>
                              More activities — scroll the list to load ({filteredActivities.length - displayedActivities.length}{" "}
                              more)
                            </span>
                          </p>
                        ) : (
                          <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
                            <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-600" aria-hidden />
                            <span>End of list — all {filteredActivities.length} activit{filteredActivities.length === 1 ? "y" : "ies"} loaded</span>
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-8 text-center mx-2 sm:mx-0">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                    <MessageSquare className="h-5 w-5 text-slate-400" aria-hidden />
                  </div>
                  <p className="text-xs font-medium text-gray-900">No activities yet</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 max-w-sm mx-auto leading-snug">
                    Nothing matches your search, or there are no sales team activities for your team. Entries use the same access rules as Sales Team Activity.
                  </p>
                </div>
              )}
              </div>
            </div>
            {activityDetailOpen && (
              <aside className="col-span-12 md:col-span-7 min-w-0 flex flex-col border-t md:border-t-0 md:border-l border-gray-200 bg-white shadow-sm md:rounded-lg overflow-hidden max-h-[min(70vh,560px)] md:max-h-[min(85vh,720px)]">
                <div className="shrink-0 flex items-center justify-between gap-2 border-b border-gray-200 bg-slate-50 px-3 py-2">
                  <span className="text-xs font-semibold text-gray-900">Message detail</span>
                  <button
                    type="button"
                    onClick={() => setActivityDetailOpen(false)}
                    className="text-xs font-medium text-gray-500 hover:text-gray-800"
                  >
                    Close
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-3">
                  {!selectedActivity ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <Eye className="w-10 h-10 text-gray-200 mb-2" aria-hidden />
                      <p className="text-sm font-medium text-gray-700">Nothing selected</p>
                      <p className="text-xs text-gray-500 mt-1 max-w-xs leading-snug">
                        Click the view icon on a message row to see full details here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-semibold text-white">
                          {getInitials(selectedActivity.customer_updated_by_name?.trim() || "Team member")}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">Last updated by</p>
                          <p className="text-sm font-medium text-gray-800">
                            {selectedActivity.customer_updated_by_name?.trim() || "Team member"}
                          </p>
                          {selectedActivity.updated_at ? (
                            <time dateTime={selectedActivity.updated_at} className="text-xs text-gray-500">
                              {formatMessageTimestamp(selectedActivity.updated_at)}
                            </time>
                          ) : null}
                        </div>
                      </div>

                      <section className="rounded-lg border border-gray-100 bg-gray-50/80 p-3 space-y-3">
                        <div>
                          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-1">
                            Customer search
                          </h4>
                          <p className="text-sm leading-relaxed text-gray-900 whitespace-pre-wrap break-words">
                            {String(
                              detailPanelCustomer?.search ?? selectedActivity.customer?.search ?? ""
                            ).trim() || "—"}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-1">
                            Activity note
                          </h4>
                          <p className="text-sm leading-relaxed text-gray-900 whitespace-pre-wrap break-words">
                            {selectedActivity.note?.trim() || "—"}
                          </p>
                        </div>
                        <div className="flex justify-end pt-0.5">
                          <button
                            type="button"
                            disabled={!buildActivityCopyText(selectedActivity)}
                            onClick={() => handleCopyToClipboard(buildActivityCopyText(selectedActivity))}
                            className="inline-flex items-center gap-1.5 shrink-0 rounded-md px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:pointer-events-none disabled:opacity-40"
                            title={
                              buildActivityCopyText(selectedActivity)
                                ? "Copy customer search & activity note"
                                : "Nothing to copy"
                            }
                            aria-label="Copy customer search and activity note to clipboard"
                          >
                            <Clipboard className="w-4 h-4" />
                            Copy both
                          </button>
                        </div>
                      </section>

                      <section>
                        <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-2 border-b border-gray-100 pb-1">
                          Sales activity (this record)
                        </h4>
                        <DetailDl>
                          <DetailField label="Collect by" value={displayOrDash(selectedActivity.data_collect_by_name)} />
                          <DetailField label="Visit 1" value={formatVisitSummary(selectedActivity.first_visit_date, selectedActivity.first_visit_by_name)} />
                          <DetailField label="Visit 2" value={formatVisitSummary(selectedActivity.second_visit_date, selectedActivity.second_visit_by_name)} />
                          <DetailField label="Visit 3" value={formatVisitSummary(selectedActivity.third_visit_date, selectedActivity.third_visit_by_name)} />
                          <DetailField label="Sold" value={formatVisitSummary(selectedActivity.sold_date, selectedActivity.sold_by_name)} />
                          <DetailField label="Follow-ups linked" value={selectedActivity.followups_count != null ? String(selectedActivity.followups_count) : "—"} />
                          <DetailField label="Bot message" value={formatYesNo(selectedActivity.bot_message)} />
                          <DetailField
                            label="Interested"
                            value={
                              selectedActivity.not_interested == null
                                ? "—"
                                : selectedActivity.not_interested
                                  ? "Not interested"
                                  : "Interested"
                            }
                          />
                          <DetailField label="Sale done" value={formatYesNo(selectedActivity.sale_done)} />
                        </DetailDl>
                      </section>

                      {detailPanelCustomerLoading ? (
                        <p className="text-xs text-gray-500 py-4">Loading customer profile…</p>
                      ) : selectedActivity.customer_id ? (
                        detailPanelCustomer ? (
                          <section>
                            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-2 border-b border-gray-100 pb-1">
                              Customer profile (same fields as edit customer)
                            </h4>
                            <DetailDl>
                              <DetailField label="Customer name" value={displayOrDash(detailPanelCustomer.name)} />
                              <DetailField label="Mobile" value={displayOrDash(detailPanelCustomer.mobile)} />
                              <DetailField label="Email" value={displayOrDash(detailPanelCustomer.email)} />
                              <DetailField label="Address" fullWidth value={displayOrDash(detailPanelCustomer.address)} />
                              <DetailField label="Date of birth" value={formatDetailDateOnly(detailPanelCustomer.date_of_birth)} />
                              <DetailField label="Anniversary" value={formatDetailDateOnly(detailPanelCustomer.anniversary_date)} />
                              <DetailField label="Purchase reason" value={masterDataLabel(detailPanelCustomer.purchase_reason)} />
                              <DetailField label="Ready budget (range)" value={formatReadyBudgetRange(detailPanelCustomer.ready_budget)} />
                              <DetailField label="Interested for loan" value={displayOrDash(detailPanelCustomer.interested_for_loan)} />
                              <DetailField label="Bank loan amount" value={masterDataLabel(detailPanelCustomer.bank_loan_amount)} />
                              <DetailField label="Car available" value={masterDataLabel(detailPanelCustomer.car_available)} />
                              <DetailField label="Client attitude (ids)" value={displayOrDash(detailPanelCustomer.client_attitude)} />
                              <DetailField label="Client profession" value={masterDataLabel(detailPanelCustomer.client_profession)} />
                              <DetailField label="Client income / month" value={masterDataLabel(detailPanelCustomer.client_income_per_month)} />
                              <DetailField
                                label="Client company transaction / year"
                                value={masterDataLabel(detailPanelCustomer.client_company_transaction)}
                              />
                              <DetailField
                                label="Facebook ID link"
                                fullWidth
                                value={maybeLink(detailPanelCustomer.facebook_id_link, displayOrDash(detailPanelCustomer.facebook_id_link))}
                              />
                              <DetailField
                                label="Messenger link"
                                fullWidth
                                value={maybeLink(detailPanelCustomer.facebook_messenger_link, displayOrDash(detailPanelCustomer.facebook_messenger_link))}
                              />
                              <DetailField label="Client level" value={displayClientLevel(detailPanelCustomer)} />
                              <DetailField
                                label="Client seriousness"
                                value={masterDataLabel(
                                  detailPanelCustomer.client_seriousness_display ?? detailPanelCustomer.client_seriousness,
                                  detailPanelCustomer.clientSeriousness
                                )}
                              />
                              <DetailField
                                label="Car exchange category / year"
                                value={masterDataLabel(detailPanelCustomer.car_exchange_category_per_year)}
                              />
                              <DetailField label="Last purchase date" value={formatDetailDateOnly(detailPanelCustomer.client_last_purchase_date)} />
                              <DetailField label="Description" fullWidth value={displayOrDash(detailPanelCustomer.description)} />
                            </DetailDl>

                              <div className="mt-3 border-t border-gray-100 pt-3">
                                {(() => {
                                  const urlish =
                                    detailPanelCustomer.visiting_card_image_url ?? detailPanelCustomer.visiting_card_image;
                                  const cardSrc =
                                    typeof urlish === "string" && /^https?:\/\//i.test(urlish.trim())
                                      ? urlish.trim()
                                      : null;
                                  return cardSrc ? (
                                    <div>
                                      <h5 className="text-[11px] font-medium text-gray-500 mb-1">Visiting card</h5>
                                      <img
                                        src={cardSrc}
                                        alt=""
                                        className="max-h-36 max-w-full rounded border border-gray-200 object-contain"
                                      />
                                    </div>
                                  ) : (
                                    <p className="text-[11px] text-gray-400">No visiting card image (or URL not absolute).</p>
                                  );
                                })()}
                              </div>
                          </section>
                        ) : (
                          <p className="text-xs text-amber-700">Customer record could not be loaded.</p>
                        )
                      ) : (
                        <p className="text-xs text-gray-500">No customer linked — only activity fields apply.</p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-gray-100 pt-3">
                        {selectedActivity.customer_id ? (
                          <button
                            type="button"
                            onClick={() => handleEditCustomerFromActivity(selectedActivity)}
                            disabled={loadingEditCustomerId === selectedActivity.id}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          >
                            Edit customer & activity →
                          </button>
                        ) : null}
                        <a
                          href="/dashboard/sales-team-activity"
                          className="inline-block text-xs font-medium text-gray-600 hover:text-gray-900"
                        >
                          Open sales team activity grid →
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            )}
          </div>
        )}
      </div>

      {editCustomerModalOpen && editModalCustomer ? (
        <EditCustomerModal
          isOpen={editCustomerModalOpen}
          onClose={closeEditCustomerModal}
          customer={editModalCustomer}
          onSuccess={handleEditCustomerModalSuccess}
        />
      ) : null}

      <FollowupMessageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmitMessageDetails={handleSubmitMessageDetails}
        currentMessage={currentMessage}
      />
      <FollowupMessageListModal
        isOpen={isMessageListModalOpen}
        onClose={() => setIsMessageListModalOpen(false)}
        messages={messages}
        loading={loadingMessages}
      />
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={handleCloseFeedbackModal}
        onSuccess={handleFeedbackSuccess}
        feedback={null} // Always create new feedback
        initialData={{
          customer: selectedFeedbackFollowup?.customer,
          followup: selectedFeedbackFollowup,
          followup_detail_id: selectedFollowupDetailId, // Pass followup_detail_id
        }}
      />
      <FeedbackListModal
        isOpen={isFeedbackListModalOpen}
        onClose={() => setIsFeedbackListModalOpen(false)}
        feedbacks={feedbacks}
        loading={loadingFeedbacks}
        followup={selectedFeedbackFollowup}
      />
      {/* Followup Modal for creating/editing followups */}
      <FollowupModal
        key={followupModalKey}
        isOpen={isFollowupModalOpen}
        onClose={handleCloseFollowupModal}
        onSuccess={handleFollowupSuccess}
        followup={selectedFollowupForEdit}
      />

      <TransferFollowupModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={handleTransferSuccess}
        followupId={transferFollowupId}
      />

      {/* Complete Confirmation Modal */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Completion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to mark this followup as complete?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteConfirm(false)}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                onClick={confirmComplete}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCareDashboard;
