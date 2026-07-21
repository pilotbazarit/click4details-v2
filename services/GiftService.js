import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Commands = {
    storeGift: (data) => commandApi.post("/api/gift", data, {
        headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
        }
    }),

    updateGift: (id, data) => commandApi.post(`/api/gift/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
        }
    }),

    deleteGift: (id) => commandApi.delete(`/api/gift/${id}`),
};

const Queries = {
    getGifts: (params) => commandApi.get(`/api/gift`, { params }),
    getGiftById: (id) => commandApi.get(`/api/gift/${id}`),
};

export default {
    Commands,
    Queries
};
