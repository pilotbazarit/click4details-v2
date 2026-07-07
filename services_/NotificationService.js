import { createApiRequest } from "@/helpers/axios";
import { API_URL } from "@/helpers/apiUrl";

const api = createApiRequest(API_URL);

const Queries = {
  getNotifications: (params) =>
    api.get("/api/search-history-notifications", {
      params: {
        filter: params?.filter ?? "unread",
        page: params?.page ?? 1,
        per_page: params?.per_page ?? 10,
      },
      headers: { Accept: "application/json" },
    }),
  getNotificationById: (id) =>
    api.get(`/api/search-history-notifications/${id}`, {
      headers: { Accept: "application/json" },
    }),
};

const Commands = {
  markAsRead: (id) =>
    api.post(`/api/search-history-notifications/${id}/mark-read`, {}, {
      headers: { Accept: "application/json" },
    }),
  markAsUnread: (id) =>
    api.post(`/api/search-history-notifications/${id}/mark-unread`, {}, {
      headers: { Accept: "application/json" },
    }),
  markAllAsRead: () =>
    api.post("/api/search-history-notifications/mark-all-read", {}, {
      headers: { Accept: "application/json" },
    }),


  //vehicle notification read and unread // Aminul
  vehicleNotificationRead: (id) =>
    api.post(`/api/notifications/mark-as-read/${id}`, {}, {
      headers: { Accept: "application/json" },
    }),
};

export default { Queries, Commands };
