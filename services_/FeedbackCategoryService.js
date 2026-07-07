import { createApiRequest } from "@/helpers/axios";
import { API_URL } from "@/helpers/apiUrl";

const commandApi = createApiRequest(API_URL);

const Commands = {
    storeFeedbackCategory: (data) => commandApi.post("/api/feedback-categories", data, {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        }
    }),

    updateFeedbackCategory: (id, data) => commandApi.put(`/api/feedback-categories/${id}`, data, {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        }
    }),

    deleteFeedbackCategory: (id) => commandApi.delete(`/api/feedback-categories/${id}`, {
        headers: {
            Accept: "application/json",
        }
    }),
};

const Queries = {
    getFeedbackCategories: (params) => commandApi.get(`/api/feedback-categories`, { params }),
    
    getFeedbackCategoryById: (id) => commandApi.get(`/api/feedback-categories/${id}`),
};

export default {
    Commands,
    Queries
};