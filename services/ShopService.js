import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Commands = {
    storeShop: (data) => commandApi.post("/api/shop", data, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    }),

    updateShop: (id, data) =>
        commandApi.post(`/api/shop/${id}`, data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }),

    // deleteBlog: (id) => commandApi.delete(`/api/shop/delete/${id}`)
};

const Queries = {
    getShops: (params) => commandApi.get("/api/shop", {params}),
    getCompanyShops: (id) => commandApi.get(`/api/user/shopAsEmployee/${id}`),

    getShopEmployee: (id) => commandApi.get(`/api/shop/shopEmployee/${id}`),
};

export default {
    Commands,
    Queries
};
