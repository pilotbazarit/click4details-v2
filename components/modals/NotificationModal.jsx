import ConversationService from "@/services/ConversationService";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import NotificationService from "@/services/NotificationService";
import { Bell, Car, MessageCircle, Package, Search, UserPlus, X } from "lucide-react";

const PER_PAGE = 5;

const NOTIFICATION_TABS = [
  {
    key: "product",
    label: "Product",
    type: "App\\Models\\Product\\Vehicle",
    icon: Package,
  },
  {
    key: "vehicle",
    label: "Vehicle",
    type: "App\\Models\\Product\\Product",
    icon: Car,
  },
  {
    key: "partner",
    label: "Request Partner",
    type: "want_to_be_partner",
    icon: UserPlus,
  },
  {
    key: "search",
    label: "Search Notification",
    icon: Search,
  },
];

const NOTIFICATION_TYPE_META = {
  Vehicle: { icon: Car, iconClass: "bg-blue-50 text-blue-600" },
  Product: { icon: Package, iconClass: "bg-purple-50 text-purple-600" },
  ConversationNotification: { icon: MessageCircle, iconClass: "bg-teal-50 text-teal-600" },
  want_to_be_partner: { icon: UserPlus, iconClass: "bg-amber-50 text-amber-600" },
  SearchNotification: { icon: Search, iconClass: "bg-sky-50 text-sky-600" },
};

const getTypeMeta = (type) => NOTIFICATION_TYPE_META[type] || { icon: Bell, iconClass: "bg-gray-100 text-gray-500" };

const formatSearchNotificationTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
};

const NotificationModal = ({ isOpen, onClose, onOpenChat }) => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [canScroll, setCanScroll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState(NOTIFICATION_TABS[0].key);

  const scrollContainerRef = useRef(null);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const userIdRef = useRef(null);
  const requestIdRef = useRef(0);

  const parseLocalUser = useCallback(() => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) return null;
      const parsed = JSON.parse(userData);
      return typeof parsed === "string" ? JSON.parse(parsed) : parsed;
    } catch (error) {
      console.error("Failed to parse user data:", error);
      return null;
    }
  }, []);

  const formatNotificationTime = (value) => {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const normalizeNotificationItem = useCallback((item) => {
    const rawType = item?.type ? String(item.type) : "";
    const shortType = rawType.split("\\").pop() || rawType;

    const description =
      item?.data?.message ||
      item?.data?.vehicle_title ||
      item?.data?.product_title ||
      (item?.data?.requested_by ? `Requested by ${item.data.requested_by}` : "");

    return {
      id: item.id,
      title: item.title,
      description,
      time: item?.created_at,
      unreadCount: item.read_at || 0,
      priority: item?.priority || "normal",
      conversationId: item?.data?.conversation_id || 0,
      userInfo: item?.data || null,
      vehicleId: item?.data?.vehicle_id || null,
      productId: item?.data?.product_id || null,
      type: shortType
    };
  }, []);

  const normalizeSearchNotificationItem = useCallback((item) => ({
    id: item.id,
    title: item?.customer_name ?? "-",
    description: item?.search_history ?? "-",
    time: item?.search_date_time,
    timeText: formatSearchNotificationTime(item?.search_date_time),
    unreadCount: item?.is_read ? "read" : 0,
    isUnread: !item?.is_read,
    type: "SearchNotification",
  }), []);

  const updateScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    const nextCanScroll = Boolean(el && el.scrollHeight > el.clientHeight + 1);
    setCanScroll((prevCanScroll) => (
      prevCanScroll === nextCanScroll ? prevCanScroll : nextCanScroll
    ));
    return nextCanScroll;
  }, []);

  const fetchNotificationsPage = useCallback(async ({ nextPage, replace }) => {
    let requestId = null;

    try {
      const userId = userIdRef.current;
      if (!userId) return;

      if (loadingRef.current && !replace) return;
      requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      loadingRef.current = true;
      if (replace) setIsLoading(true);
      else setIsLoadingMore(true);

      const selectedTab = NOTIFICATION_TABS.find((tab) => tab.key === activeTab) || NOTIFICATION_TABS[0];

      if (selectedTab.key === "search") {
        const response = await NotificationService.Queries.getNotifications({
          filter: "unread",
          page: nextPage,
          per_page: PER_PAGE,
        });

        if (requestId !== requestIdRef.current) return;

        const ok = response?.status === "success" || response?.success;
        const payload = response?.data ?? response;

        if (ok && payload) {
          const itemData = Array.isArray(payload.data) ? payload.data : [];
          const normalized = itemData.map(normalizeSearchNotificationItem);
          const meta = payload.meta || {};
          const currentPage = Number(meta.current_page || nextPage);
          const lastPage = Number(meta.last_page || 0);
          const nextHasMore = lastPage > 0 ? currentPage < lastPage : normalized.length === PER_PAGE;

          setHasMore(nextHasMore);
          hasMoreRef.current = nextHasMore;
          pageRef.current = nextPage;

          if (replace) {
            setNotifications(normalized);
          } else {
            setNotifications((prevItems) => {
              const map = new Map();
              prevItems.forEach((n) => map.set(n.id, n));
              normalized.forEach((n) => map.set(n.id, n));
              return Array.from(map.values());
            });
          }
        }

        return;
      }

      const params = {
        _page: nextPage,
        _perPage: PER_PAGE,
        _notifiable_id: userId,
        _orderBy: "updated_at",
        _order: "desc",
        _type: selectedTab.type,
      };

      const response = await ConversationService.Queries.getNotificationList(params);

      if (requestId !== requestIdRef.current) return;

      if (response.status === "success") {
        const itemData = Array.isArray(response.data?.data) ? response.data.data : [];

        const normalized = itemData.map(normalizeNotificationItem);
        const nextHasMore = normalized.length === PER_PAGE;

        setHasMore(nextHasMore);
        hasMoreRef.current = nextHasMore;
        pageRef.current = nextPage;

        if (replace) {
          setNotifications(normalized);
        } else {
          setNotifications((prevItems) => {
            const map = new Map();
            prevItems.forEach((n) => map.set(n.id, n));
            normalized.forEach((n) => map.set(n.id, n));
            return Array.from(map.values());
          });
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      if (requestId !== null && requestIdRef.current === requestId) {
        loadingRef.current = false;
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [activeTab, normalizeNotificationItem, normalizeSearchNotificationItem]);

  useEffect(() => {
    if (!isOpen) {
      setNotifications([]);
      setUser(null);
      pageRef.current = 1;
      setHasMore(true);
      setCanScroll(false);
      hasMoreRef.current = true;
      setIsLoading(false);
      setIsLoadingMore(false);
      loadingRef.current = false;
      userIdRef.current = null;
      requestIdRef.current += 1;
      setActiveTab(NOTIFICATION_TABS[0].key);
      return;
    }
    const parsedUser = parseLocalUser();
    if (parsedUser) {
      setUser(parsedUser);
    }
  }, [isOpen, parseLocalUser]);

  useEffect(() => {
    if (!isOpen || !user?.id) return;
    userIdRef.current = user.id;
    pageRef.current = 1;
    setNotifications([]);
    setHasMore(true);
    setCanScroll(false);
    hasMoreRef.current = true;
    fetchNotificationsPage({ nextPage: 1, replace: true });
  }, [activeTab, fetchNotificationsPage, isOpen, user?.id]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleResize = () => {
      updateScrollability();
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, updateScrollability]);

  useEffect(() => {
    if (!isOpen) return undefined;

    if (notifications.length === 0) {
      setCanScroll(false);
      return undefined;
    }

    if (isLoading || isLoadingMore) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      const isScrollable = updateScrollability();

      if (!isScrollable && hasMoreRef.current && !loadingRef.current) {
        fetchNotificationsPage({ nextPage: pageRef.current + 1, replace: false });
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [
    fetchNotificationsPage,
    isLoading,
    isLoadingMore,
    isOpen,
    notifications.length,
    updateScrollability,
  ]);

  if (!isOpen) return null;

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (loadingRef.current || !hasMoreRef.current) return;

    const threshold = 120;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
    if (!nearBottom) return;

    fetchNotificationsPage({ nextPage: pageRef.current + 1, replace: false });
  };

  const handleNotificationClick = async(item) => {

    // console.log("item", item);
    if (item?.type === "SearchNotification") {
      onClose && onClose();
      router.push(`/dashboard/notifications?highlight=${item?.id}`);
      return;
    }

    if (item?.type === "ConversationNotification") {
      onOpenChat && onOpenChat(item);
      return;
    }

    if (item?.type === "Vehicle") {
      onClose && onClose();
      await NotificationService.Commands.vehicleNotificationRead(item?.id);
      router.push(`/dashboard/requested-product/${item?.vehicleId}/`);
    } else if (item?.type === "Product") {
      onClose && onClose();
      await NotificationService.Commands.vehicleNotificationRead(item?.id);
      router.push(`/dashboard/requested-general-product/${item?.productId}/`);
    } else if (item?.type === "want_to_be_partner") {

      onClose && onClose();
      await NotificationService.Commands.vehicleNotificationRead(item?.id);
      router.push(`/dashboard/user-details/${item?.userInfo?.user_id}`);
    }
  };


  const handleTabChange = (tabKey) => {
    if (tabKey === activeTab) return;
    setActiveTab(tabKey);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-[2px]">
      <div className="relative flex h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-white px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-orange-600">
              <Bell className="h-4.5 w-4.5" />
            </span>
            <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-3">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-white p-1 shadow-sm ring-1 ring-gray-100 sm:grid-cols-4">
            {NOTIFICATION_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const TabIcon = tab.icon;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex min-h-10 items-center justify-center gap-2 rounded-md px-2 py-2 text-xs font-semibold transition sm:text-sm ${
                    isActive
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                  aria-pressed={isActive}
                >
                  <TabIcon className="h-4 w-4 shrink-0" />
                  <span className="text-center leading-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto"
        >
          {notifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-300">
                <Bell className="h-6 w-6" />
              </span>
              <p className="text-sm text-gray-500">
                {isLoading ? "Loading notifications..." : "No notifications found."}
              </p>
            </div>
          ) : (
            notifications.map((item, index) => {
              const unreadCount = Number(item.unreadCount || 0);
              const isUnread = typeof item.isUnread === "boolean" ? item.isUnread : unreadCount === 0;
              const isHighPriority = item.priority === "high";
              const hasUnreadCount = Number.isFinite(unreadCount) && unreadCount > 0;
              const { icon: TypeIcon, iconClass } = getTypeMeta(item.type);

              return (
                <button
                  key={item.id || index}
                  type="button"
                  onClick={() => handleNotificationClick(item)}
                  className={`group relative flex w-full items-start gap-3 px-5 py-3.5 text-left transition hover:bg-orange-50/60 ${
                    isUnread ? "bg-orange-50/30" : "bg-white"
                  }`}
                >
                  {isUnread && (
                    <span className="absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-orange-500" />
                  )}

                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClass}`}
                  >
                    <TypeIcon className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-gray-900">{item.title}</p>
                      {isHighPriority && (
                        <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">
                          Urgent
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="mt-0.5 truncate text-xs text-gray-500">{item.description}</p>
                    )}
                    <p className="mt-1 text-[11px] text-gray-400">{item.timeText || formatNotificationTime(item.time)}</p>
                  </div>

                  {hasUnreadCount && (
                    <span className="mt-0.5 flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[11px] font-semibold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}

          {!isLoading && !isLoadingMore && notifications.length > 0 && hasMore && canScroll && (
            <div className="py-3 text-center text-xs text-gray-400">Scroll to load more...</div>
          )}
          {isLoadingMore && (
            <div className="py-3 text-center text-xs text-gray-400">Loading more...</div>
          )}
          {!isLoading && notifications.length > 0 && !hasMore && (
            <div className="py-3 text-center text-xs text-gray-400">No more notifications.</div>
          )}
          {activeTab === "search" && notifications.length > 0 && (
            <div className="sticky bottom-0 border-t border-gray-100 bg-white px-5 py-3 text-center">
              <button
                type="button"
                onClick={() => {
                  onClose && onClose();
                  router.push("/dashboard/notifications");
                }}
                className="text-sm font-semibold text-[#0167a2] transition hover:opacity-80"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
