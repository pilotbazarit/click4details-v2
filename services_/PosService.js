import { createApiRequest } from "@/helpers/axios";
import { API_URL } from "@/helpers/apiUrl";

const api = createApiRequest(API_URL);

const Queries = {
    getShops: (params) => api.get("/api/pos/shops", { params }),

    searchProducts: (params) => api.get("/api/pos/search-products", { params }),

    getSales: (params) => api.get("/api/pos", { params }),

    getSale: (id) => api.get(`/api/pos/${id}`),
};

const Commands = {
    createSale: (data) =>
        api.post("/api/pos", data, {
            headers: { "Content-Type": "application/json" },
        }),

    updateSale: (id, data) =>
        api.put(`/api/pos/${id}`, data, {
            headers: { "Content-Type": "application/json" },
        }),

    deleteSale: (id) => api.delete(`/api/pos/${id}`),
};

export default { Queries, Commands };
