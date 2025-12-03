import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Commands = {
    storeCart: (data) => commandApi.post("/api/cart/add-item", data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),

    updateCart: (id, data) => commandApi.post(`/api/cart/update/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),


    deleteCart: (data) => commandApi.post("/api/cart/remove-item", data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),
};

const Queries = {
    // getVehicles: () => commandApi.get("/api/partner-vehicle", {}),
    getCartList: (params) => commandApi.get(`/api/cart`, { params }),
};

export default {
    Commands,
    Queries
};
