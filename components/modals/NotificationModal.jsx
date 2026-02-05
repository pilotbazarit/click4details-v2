import ConversationService from "@/services/ConversationService";
import React, { useCallback, useEffect, useRef, useState } from "react";

const PER_PAGE = 5;

const NotificationModal = ({ isOpen, onClose, onOpenChat }) => {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const scrollContainerRef = useRef(null);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const userIdRef = useRef(null);

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
    return {
      id: item.id,
      title: item.title,
      description: item?.data?.message,
      time: item?.created_at,
      unreadCount: item.read_at || 0,
      conversationId: item?.data?.conversation_id || 0,
      product: { v_user_id: item?.data?.product_id } || null,
    };
  }, []);

  const fetchNotificationsPage = useCallback(async ({ nextPage, replace }) => {
    try {
      const userId = userIdRef.current;
      if (!userId) return;

      if (loadingRef.current) return;
      loadingRef.current = true;
      if (replace) setIsLoading(true);
      else setIsLoadingMore(true);

      const params = {
        _page: nextPage,
        _perPage: PER_PAGE,
        _notifiable_id: userId,
        _orderBy: "updated_at",
        _order: "desc",
      };
      const response = await ConversationService.Queries.getNotificationList(params);

      // console.log("::::response::::", response);

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
      loadingRef.current = false;
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [normalizeNotificationItem]);

  useEffect(() => {
    if (!isOpen) {
      setNotifications([]);
      setUser(null);
      pageRef.current = 1;
      setHasMore(true);
      hasMoreRef.current = true;
      setIsLoading(false);
      setIsLoadingMore(false);
      loadingRef.current = false;
      userIdRef.current = null;
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
    setHasMore(true);
    hasMoreRef.current = true;
    fetchNotificationsPage({ nextPage: 1, replace: true });
  }, [fetchNotificationsPage, isOpen, user?.id]);

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


  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4">
      <div className="relative bg-[#f6f4f8] w-full max-w-md h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between gap-3 px-5 py-4 bg-[#f6f4f8] border-b border-gray-200/60">

          <h3 className="text-lg font-semibold text-gray-900">Notification List</h3>

          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-white/80 text-gray-700"
            aria-label="Close"
          >
            {"x"}
          </button>
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="p-4 space-y-4 overflow-y-auto flex-1"
        >
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">
              {isLoading ? "Loading..." : "No notifications found."}
            </p>
          ) : (
            notifications.map((item, index) => {
              const unreadCount = Number(item.unreadCount || 0);
              const isUnread = unreadCount === 0;
              const initial = (item.title || "U").trim().charAt(0).toUpperCase();

              return (
                <button
                  key={item.id || index}
                  type="button"
                  onClick={() => onOpenChat && onOpenChat(item)}
                  className="w-full text-left flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-full bg-yellow-400 flex items-center justify-center text-white font-semibold shadow">
                    {initial}
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-semibold text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-600">{item.description}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs font-semibold text-gray-500">
                      {formatNotificationTime(item.time)}
                    </span>
                    {isUnread && (
                      <span
                        className="h-2.5 w-2.5 rounded-full bg-red-500"
                        aria-label="Unread"
                      />
                    )}
                    {unreadCount > 0 && (
                      <span className="min-w-[24px] h-6 px-2 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}

          {!isLoading && !isLoadingMore && notifications.length > 0 && hasMore && (
            <div className="pt-2 text-center text-xs text-gray-500">Scroll to load more...</div>
          )}
          {isLoadingMore && (
            <div className="pt-2 text-center text-xs text-gray-500">Loading more...</div>
          )}
          {!isLoading && notifications.length > 0 && !hasMore && (
            <div className="pt-2 text-center text-xs text-gray-500">No more notifications.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
