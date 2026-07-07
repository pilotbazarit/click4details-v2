import { createApiRequest } from "@/helpers/axios";
import { API_URL } from "@/helpers/apiUrl";

const commandApi = createApiRequest(API_URL);

const Commands = {
    storeMessage: (data) => commandApi.post("/api/messages", data, {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        }
    }),

    updateMessage: (id, data) => commandApi.put(`/api/messages/${id}`, data, {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        }
    }),

    deleteMessage: (id) => commandApi.delete(`/api/messages/${id}`, {
        headers: {
            Accept: "application/json",
        }
    }),
};

const Queries = {
    getMessages: (params) => commandApi.get(`/api/messages`, { params }),
    
    getMessageById: (id) => commandApi.get(`/api/messages/${id}`),
};

export default {
    Commands,
    Queries
}; 