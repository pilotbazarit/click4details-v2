'use client';

/**
 * Search history notifications page.
 * Access: user_mode supreme, pbl, admin, user, member, or partner (same roles that see the Notifications menu in the sidebar).
 */
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Bell, ChevronLeft, ChevronRight, Copy, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import NotificationService from "@/services/NotificationService";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

const getCardBorderByRole = (role) => {
  const roleLower = (role || "").toLowerCase();
  if (roleLower === "customer") return "border-l-blue-500";
  if (roleLower === "guest") return "border-l-gray-400";
  if (roleLower === "admin") return "border-l-amber-500";
  if (roleLower === "member" || roleLower === "partner") return "border-l-emerald-500";
  return "border-l-slate-400";
};

const getValidSearchDateTime = (value) => {
  if (value == null || (typeof value === "string" && value.trim() === "")) return "â€”";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Invalid date";
  return value;
};

const NotificationsPageClient = () => {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const [filter, setFilter] = useState("unread");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, from: null, to: null });
  const [counts, setCounts] = useState({ total: 0, read: 0, unread: 0 });
  const [togglingId, setTogglingId] = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);
  const [highlightedNotification, setHighlightedNotification] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await NotificationService.Queries.getNotifications({
        filter,
        page,
        per_page: pageSize,
      });
      const ok = response?.status === "success" || response?.success;
      const payload = response?.data ?? response;
      if (ok && payload) {
        setData(Array.isArray(payload.data) ? payload.data : []);
        setMeta(payload.meta ?? meta);
        setCounts(payload.counts ?? counts);
      } else {
        setData([]);
        toast.error("Failed to load notifications");
      }
    } catch (err) {
      setData([]);
      toast.error(err?.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [filter, page, pageSize]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // When opened with ?highlight=id, fetch that notification so we can show it even if it's read or on another page
  useEffect(() => {
    if (!highlightId) {
      setHighlightedNotification(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await NotificationService.Queries.getNotificationById(highlightId);
        if (cancelled) return;
        const ok = res?.status === "success" || res?.success;
        const payload = res?.data ?? res;
        if (ok && payload) setHighlightedNotification(payload);
        else setHighlightedNotification(null);
      } catch {
        if (!cancelled) setHighlightedNotification(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [highlightId]);

  // When opened from bell with ?highlight=id: if the notification is in the current list, scroll to it and highlight
  useEffect(() => {
    if (!highlightId || loading || data.length === 0) return;
    const id = Number(highlightId) || highlightId;
    const el = document.getElementById(`notification-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedId(id);
      const t = setTimeout(() => setHighlightedId(null), 2500);
      return () => clearTimeout(t);
    }
  }, [highlightId, loading, data]);

  const copyMobileNumber = (number) => {
    navigator.clipboard.writeText(String(number || "")).then(
      () => toast.success("Phone number copied"),
      () => toast.error("Failed to copy")
    );
  };

  const toggleRead = async (id, isRead) => {
    if (togglingId) return;
    setTogglingId(id);
    try {
      if (isRead) {
        await NotificationService.Commands.markAsUnread(id);
        toast.success("Marked as unread");
      } else {
        await NotificationService.Commands.markAsRead(id);
        toast.success("Marked as read");
      }
      await fetchNotifications();
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("notificationsUpdated"));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update");
    } finally {
      setTogglingId(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.Commands.markAllAsRead();
      toast.success("All notifications marked as read");
      await fetchNotifications();
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("notificationsUpdated"));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to mark all as read");
    }
  };

  const totalCount = counts.total ?? 0;
  const readCount = counts.read ?? 0;
  const unreadCount = counts.unread ?? 0;
  const totalPages = Math.max(1, meta.last_page ?? 1);
  const currentPage = meta.current_page ?? 1;
  const from = meta.from ?? 0;
  const to = meta.to ?? 0;
  const totalFiltered = meta.total ?? data.length;

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-wrap items-center gap-4 border-b border-gray-100 pb-6">
        <Bell className="w-8 h-8 shrink-0" style={{ color: 'rgb(1 103 162)' }} />
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Notifications</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <div className="relative group">
            <button
              type="button"
              onClick={() => setFilter("all")}
              disabled={loading}
              className={`px-3 py-2 rounded-lg transition border-2 ${filter === "all" ? "bg-gray-800 text-white border-gray-800 ring-2 ring-gray-400 ring-offset-2 shadow font-semibold" : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-transparent"}`}
              aria-label="Show all notifications"
            >
              Total: {totalCount}
            </button>
            <span role="tooltip" className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-800 rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
              Show all notifications
            </span>
          </div>
          <div className="relative group">
            <button
              type="button"
              onClick={() => setFilter("read")}
              disabled={loading}
              className={`px-3 py-2 rounded-lg transition border-2 ${filter === "read" ? "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300 ring-offset-2 shadow font-semibold" : "bg-blue-50 text-blue-700 hover:bg-blue-100 border-transparent"}`}
              aria-label="Show read notifications"
            >
              Read: {readCount}
            </button>
            <span role="tooltip" className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-800 rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
              Show read notifications
            </span>
          </div>
          <div className="relative group">
            <button
              type="button"
              onClick={() => setFilter("unread")}
              disabled={loading}
              className={`px-3 py-2 rounded-lg transition border-2 ${filter === "unread" ? "bg-orange-500 text-white border-orange-500 ring-2 ring-orange-300 ring-offset-2 shadow font-semibold" : "bg-amber-50 text-amber-700 hover:bg-amber-100 border-transparent"}`}
              aria-label="Show unread notifications"
            >
              Unread: {unreadCount}
            </button>
            <span role="tooltip" className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-800 rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
              Show unread notifications
            </span>
          </div>
          {unreadCount > 0 && (
            <div className="relative group">
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={loading}
                className="px-3 py-2 rounded-lg text-sm font-medium transition border-2 border-transparent bg-[#0167a2] text-white hover:bg-[#015a8f] disabled:opacity-50"
                aria-label="Mark all as read"
              >
                Mark all as read
              </button>
              <span role="tooltip" className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-800 rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
                Mark all unread as read
              </span>
            </div>
          )}
        </div>
      </div>

      {/* When opened with ?highlight=id but that notification is read or on another page, show it here */}
      {highlightedNotification && !data.some((n) => n.id === highlightedNotification.id) && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-3">Notification you clicked (it may be on another page or filter)</p>
          <div
            id={`notification-${highlightedNotification.id}`}
            className={`relative rounded-xl border-2 border-[#0167a2] ring-2 ring-[#0167a2]/30 ring-offset-2 bg-white shadow-sm overflow-hidden ${getCardBorderByRole(highlightedNotification.search_by_user_role)} ${highlightedNotification.is_read ? "opacity-80" : ""}`}
          >
            <div className="absolute top-3 right-3 group">
              <button
                type="button"
                onClick={() => toggleRead(highlightedNotification.id, !!highlightedNotification.is_read)}
                disabled={togglingId === highlightedNotification.id}
                className="p-1.5 rounded-md transition text-gray-500 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50"
                aria-label={highlightedNotification.is_read ? "Mark as unread" : "Mark as read"}
              >
                {highlightedNotification.is_read ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5" style={{ color: "rgb(1 103 162)" }} />
                )}
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 text-sm">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Customer Name</p>
                  <p className="font-medium text-gray-900 truncate">{highlightedNotification.customer_name ?? "â€”"}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Mobile Number</p>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 truncate">{highlightedNotification.mobile_number ?? "â€”"}</p>
                    <button type="button" onClick={() => copyMobileNumber(highlightedNotification.mobile_number)} className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-[#0167a2]" title="Copy phone number" aria-label="Copy phone number">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Search By</p>
                  <p className="text-gray-900">{highlightedNotification.search_by ?? "â€”"}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Search By User Role</p>
                  <p className="font-medium text-gray-900">{highlightedNotification.search_by_user_role ?? "â€”"}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Search Date and Time</p>
                  <p className="text-gray-600 text-sm">{getValidSearchDateTime(highlightedNotification.search_date_time)}</p>
                </div>
              </div>
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-xs font-medium text-[#0167a2] uppercase tracking-wide mb-1.5">Search History</p>
                <p className="text-gray-900 text-sm leading-relaxed" title={highlightedNotification.search_history}>{highlightedNotification.search_history ?? "â€”"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <p className="text-lg">Loading notificationsâ€¦</p>
        </div>
      ) : totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-white rounded-xl shadow p-6">
          <Bell className="w-16 h-16 mb-4 opacity-40" />
          <p className="text-lg">No notifications yet.</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-white rounded-xl shadow p-6">
          <Bell className="w-16 h-16 mb-4 opacity-40" />
          <p className="text-lg">No notifications match this filter.</p>
        </div>
      ) : (
        <>
          <ul className="w-full space-y-5">
            {data.map((n) => {
              const isRead = !!n.is_read;
              const busy = togglingId === n.id;
              const isHighlighted = highlightedId === n.id;
              return (
                <li
                  id={`notification-${n.id}`}
                  key={n.id}
                  className={`relative rounded-xl border-2 bg-white shadow-sm overflow-hidden hover:shadow transition ${getCardBorderByRole(n.search_by_user_role)} ${isRead ? "opacity-80" : ""} ${isHighlighted ? "border-[#0167a2] ring-2 ring-[#0167a2]/30 ring-offset-2" : "border border-gray-200 border-l-4"}`}
                >
                  <div className="absolute top-3 right-3 group">
                    <button
                      type="button"
                      onClick={() => toggleRead(n.id, isRead)}
                      disabled={busy}
                      className="p-1.5 rounded-md transition text-gray-500 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50"
                      aria-label={isRead ? "Mark as unread" : "Mark as read"}
                    >
                      {isRead ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5" style={{ color: 'rgb(1 103 162)' }} />
                      )}
                    </button>
                    <span role="tooltip" className="absolute right-0 top-full mt-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-800 rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
                      {isRead ? "Mark as unread" : "Mark as read"}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 text-sm">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Customer Name</p>
                        <p className="font-medium text-gray-900 truncate">{n.customer_name ?? "â€”"}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Mobile Number</p>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-900 truncate">{n.mobile_number ?? "â€”"}</p>
                          <button
                            type="button"
                            onClick={() => copyMobileNumber(n.mobile_number)}
                            className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-[#0167a2]"
                            title="Copy phone number"
                            aria-label="Copy phone number"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Search By</p>
                        <p className="text-gray-900">{n.search_by ?? "â€”"}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Search By User Role</p>
                        <p className="font-medium text-gray-900">{n.search_by_user_role ?? "â€”"}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Search Date and Time</p>
                        <p className="text-gray-600 text-sm">{getValidSearchDateTime(n.search_date_time)}</p>
                      </div>
                    </div>
                    <div className="mt-5 pt-5 border-t border-gray-100">
                      <p className="text-xs font-medium text-[#0167a2] uppercase tracking-wide mb-1.5">Search History</p>
                      <p className="text-gray-900 text-sm leading-relaxed" title={n.search_history}>{n.search_history ?? "â€”"}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {totalFiltered > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span>
                  Showing {from}â€“{to} of {totalFiltered}
                </span>
                <label className="flex items-center gap-2">
                  <span>Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-[#0167a2] focus:outline-none focus:ring-1 focus:ring-[#0167a2]"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || loading}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || loading}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationsPageClient;
