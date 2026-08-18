"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  User,
  Shield,
  Clock,
  Globe,
  Layers,
  ArrowRight,
  X,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import UserActivityLogService from "@/services/UserActivityLogService";

const DATE_PRESETS = [
  { id: "all", label: "All Time" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last_week", label: "Last Week" },
  { id: "last_month", label: "Last Month" },
  { id: "custom", label: "Custom Date" },
];

export default function UserActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
    from: 0,
    to: 0,
  });

  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    modules: [],
    actions: [],
    users: [],
  });

  // Active filters
  const [dateFilter, setDateFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Modal for viewing JSON diff
  const [selectedLogForDetail, setSelectedLogForDetail] = useState(null);

  // Load filter options once
  useEffect(() => {
    async function loadOptions() {
      try {
        const res = await UserActivityLogService.Queries.getFilterOptions();
        if (res?.status === "success" && res?.data) {
          setFilterOptions({
            modules: res.data.modules || [],
            actions: res.data.actions || [],
            users: res.data.users || [],
          });
        }
      } catch (err) {
        console.error("Failed to load activity filter options", err);
      }
    }
    loadOptions();
  }, []);

  // Fetch logs
  const fetchLogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = {
          page,
          per_page: pagination.per_page,
        };

        if (dateFilter !== "all") {
          params.date_filter = dateFilter;
        }
        if (dateFilter === "custom") {
          if (fromDate) params.from_date = fromDate;
          if (toDate) params.to_date = toDate;
        }
        if (selectedUser) params.user_id = selectedUser;
        if (selectedModule) params.module = selectedModule;
        if (selectedAction) params.action = selectedAction;
        if (searchQuery) params.search = searchQuery;

        const res = await UserActivityLogService.Queries.getLogs(params);
        if (res?.status === "success" && res?.data) {
          const paginated = res.data;
          setLogs(paginated.data || []);
          setPagination({
            current_page: paginated.current_page || 1,
            last_page: paginated.last_page || 1,
            per_page: paginated.per_page || 20,
            total: paginated.total || 0,
            from: paginated.from || 0,
            to: paginated.to || 0,
          });
        } else {
          setLogs([]);
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to fetch activity logs.");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    },
    [dateFilter, fromDate, toDate, selectedUser, selectedModule, selectedAction, searchQuery, pagination.per_page]
  );

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleResetFilters = () => {
    setDateFilter("all");
    setFromDate("");
    setToDate("");
    setSelectedUser("");
    setSelectedModule("");
    setSelectedAction("");
    setSearchQuery("");
    setSearchInput("");
  };

  const handleDownloadPdf = async () => {
    try {
      setExportingPdf(true);
      toast.loading("Generating activity log PDF report...", { id: "pdf-gen" });

      const params = {};
      if (dateFilter !== "all") params.date_filter = dateFilter;
      if (dateFilter === "custom") {
        if (fromDate) params.from_date = fromDate;
        if (toDate) params.to_date = toDate;
      }
      if (selectedUser) params.user_id = selectedUser;
      if (selectedModule) params.module = selectedModule;
      if (selectedAction) params.action = selectedAction;
      if (searchQuery) params.search = searchQuery;

      const response = await UserActivityLogService.Queries.downloadPdf(params);
      const blob = response instanceof Blob ? response : (response?.data instanceof Blob ? response.data : new Blob([response?.data || response], { type: "application/pdf" }));
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `user-activity-log-${new Date().toISOString().split("T")[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF report downloaded successfully!", { id: "pdf-gen" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to generate PDF report.", { id: "pdf-gen" });
    } finally {
      setExportingPdf(false);
    }
  };

  const getActionBadgeClass = (action = "") => {
    const act = action.toLowerCase();
    if (act.includes("create") || act.includes("add") || act.includes("store")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (act.includes("update") || act.includes("edit")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (act.includes("delete") || act.includes("remove") || act.includes("destroy")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (act.includes("approve")) {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    if (act.includes("reject")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Activity Logs</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Audit trail of system changes, data modifications, and user actions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchLogs(pagination.current_page)}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition flex items-center gap-2"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={exportingPdf || loading || pagination.total === 0}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{exportingPdf ? "Generating PDF..." : "Export Full PDF"}</span>
          </button>
        </div>
      </div>

      {/* Date Presets Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Date:
          </span>
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setDateFilter(preset.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                dateFilter === preset.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Date Pickers */}
        {dateFilter === "custom" && (
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 bg-slate-50"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 bg-slate-50"
              />
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          {/* User selector */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 bg-slate-50 text-slate-700"
            >
              <option value="">All Users</option>
              {filterOptions.users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.phone || u.email || `ID: ${u.id}`})
                </option>
              ))}
            </select>
          </div>

          {/* Module selector */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Module / Entity</label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 bg-slate-50 text-slate-700"
            >
              <option value="">All Modules</option>
              {filterOptions.modules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Action selector */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Action</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 bg-slate-50 text-slate-700"
            >
              <option value="">All Actions</option>
              {filterOptions.actions.map((a) => (
                <option key={a} value={a}>
                  {a.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Search bar */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Search Details</label>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search keywords..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-8 pr-8 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 bg-slate-50"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Active Filter summary & reset */}
        {(dateFilter !== "all" || selectedUser || selectedModule || selectedAction || searchQuery) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Showing filtered results: <strong className="text-slate-800">{pagination.total}</strong> activity log(s)
            </span>
            <button
              onClick={handleResetFilters}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="text-sm font-medium">Loading user activity logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <AlertCircle className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-base font-semibold text-slate-700">No activity logs found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No activity records match your current filter settings. Try adjusting the date range or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Date &amp; Time</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                  <th className="py-3.5 px-4">Module / Entity</th>
                  <th className="py-3.5 px-4">Description &amp; Changes</th>
                  <th className="py-3.5 px-4">IP Address</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">
                        {new Date(log.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {log.user?.name ? log.user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">
                            {log.user?.name || "System / Guest"}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {log.user?.phone || log.user?.email || `ID: #${log.user_id || "N/A"}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getActionBadgeClass(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        {log.module}
                      </div>
                      {log.entity_id && (
                        <div className="text-[10px] text-slate-400 ml-5">ID: #{log.entity_id}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-xs sm:max-w-md">
                      <div className="text-slate-800 line-clamp-2">{log.description || "Action performed"}</div>
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            {Object.keys(log.changes).length} field(s) modified
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-slate-600 font-mono text-[11px] flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-400" />
                        {log.ip_address || "N/A"}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {log.changes && Object.keys(log.changes).length > 0 ? (
                        <button
                          onClick={() => setSelectedLogForDetail(log)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg font-medium transition inline-flex items-center gap-1 text-[11px]"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Changes
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && pagination.total > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 text-xs">
            <span className="text-slate-500">
              Showing <strong className="text-slate-800">{pagination.from}</strong> to{" "}
              <strong className="text-slate-800">{pagination.to}</strong> of{" "}
              <strong className="text-slate-800">{pagination.total}</strong> records
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchLogs(pagination.current_page - 1)}
                disabled={pagination.current_page <= 1}
                className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-700 disabled:opacity-40 transition flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>

              <span className="px-3 py-1.5 font-semibold text-slate-800">
                Page {pagination.current_page} of {pagination.last_page}
              </span>

              <button
                onClick={() => fetchLogs(pagination.current_page + 1)}
                disabled={pagination.current_page >= pagination.last_page}
                className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-700 disabled:opacity-40 transition flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Change Detail Modal */}
      {selectedLogForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Activity Change Details</h3>
                  <p className="text-xs text-slate-500">
                    {selectedLogForDetail.module} #{selectedLogForDetail.entity_id || "N/A"} -{" "}
                    {selectedLogForDetail.action}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLogForDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Performed By</span>
                  <span className="font-semibold text-slate-800">
                    {selectedLogForDetail.user?.name || "System"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Date &amp; Time</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedLogForDetail.created_at).toLocaleString("en-GB")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">IP Address</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {selectedLogForDetail.ip_address || "N/A"}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Modified Fields &amp; Diffs
                </h4>

                {selectedLogForDetail.changes && typeof selectedLogForDetail.changes === "object" ? (
                  <div className="space-y-2">
                    {Object.entries(selectedLogForDetail.changes)
                      .filter(([field, diff]) => {
                        if (!diff) return false;
                        const oldVal = typeof diff === "object" && "old" in diff ? diff.old : null;
                        const newVal = typeof diff === "object" && "new" in diff ? diff.new : diff;
                        const isOldNull = oldVal === null || oldVal === undefined || oldVal === "" || String(oldVal).toLowerCase() === "null";
                        const isNewNull = newVal === null || newVal === undefined || newVal === "" || String(newVal).toLowerCase() === "null";
                        return !isOldNull && !isNewNull && String(oldVal) !== String(newVal);
                      })
                      .map(([field, diff]) => {
                      const oldVal = diff && typeof diff === "object" && "old" in diff ? diff.old : "N/A";
                      const newVal = diff && typeof diff === "object" && "new" in diff ? diff.new : diff;

                      return (
                        <div
                          key={field}
                          className="p-3 border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition text-xs"
                        >
                          <div className="font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                            <span>{field.replace(/^(v_|vp_|ed_|p_|s_)/, "").replace(/_/g, " ").toUpperCase()}</span>
                            <span className="text-[10px] font-mono text-slate-400">{field}</span>
                          </div>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <div className="flex-1 bg-rose-50 border border-rose-100 rounded-lg p-2 text-rose-700 w-full line-through">
                              <span className="text-[9px] uppercase block font-bold text-rose-400">Old</span>
                              {typeof oldVal === "object" ? JSON.stringify(oldVal) : String(oldVal ?? "null")}
                            </div>

                            <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block shrink-0" />

                            <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-lg p-2 text-emerald-800 font-semibold w-full">
                              <span className="text-[9px] uppercase block font-bold text-emerald-500">New</span>
                              {typeof newVal === "object" ? JSON.stringify(newVal) : String(newVal ?? "null")}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No structured diff payload available.</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedLogForDetail(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
