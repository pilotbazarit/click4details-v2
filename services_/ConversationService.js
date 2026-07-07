import { createApiRequest } from "@/helpers/axios";
import { API_URL } from "@/helpers/apiUrl";

const commandApi = createApiRequest(API_URL);

const Commands = {
    addConversation: (data) => commandApi.post("/api/conversation", data, {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        }
    }),


    unreadAllConversations: (id) => commandApi.post(`/api/conversation/items/mark-all-as-read/${id}`),

    // updateMessage: (id, data) => commandApi.put(`/api/messages/${id}`, data, {
    //     headers: {
    //         "Content-Type": "application/json",
    //         Accept: "application/json",
    //     }
    // }),

    // deleteMessage: (id) => commandApi.delete(`/api/messages/${id}`, {
    //     headers: {
    //         Accept: "application/json",
    //     }
    // }),
};

const Queries = {
    getConversationList: (params) => commandApi.get(`/api/conversation`, { params }),
    
    getSingleConversation: (id) => commandApi.get(`/api/conversation/${id}`),

    getNotificationList: (params) => commandApi.get(`/api/notifications`, { params }),

    getUnreadNotifications: (params) => commandApi.get(`/api/notifications/unread-count`, { params }),
};

export default {
    Commands,
    Queries
}; 