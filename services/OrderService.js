import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Commands = {
    createOrder: (data, token = null) => {
        const headers = {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
        };

        // Add Bearer token if provided
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return commandApi.post("/api/order", data, { headers });
    },

    // updateCart: (id, data) => commandApi.post(`/api/cart/update/${id}`, data, {
    //     headers: {
    //         "Content-Type": "multipart/form-data",
    //          Accept: "application/json",
    //     }
    // }),

    updateOrder: (id, data) => commandApi.put(`/api/order/${id}`, data, {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        }
    }),

    deleteOrderItem: (data) => commandApi.post("/api/order/remove-item", data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),


    // saveAddress: (data) => commandApi.post("/api/address", data, {
    //     headers: {
    //         "Content-Type": "multipart/form-data",
    //          Accept: "application/json",
    //     }
    // }),
};

const Queries = {
    // getVehicles: () => commandApi.get("/api/partner-vehicle", {}),
    getOrderList: (params) => commandApi.get(`/api/order`, { params }),

    // getDistrictList: (params) => commandApi.get(`/api/address/dropdown-data`, { params }),

    // getUserAddresses: (params) => commandApi.get(`/api/address`, { params }),

    getOrderDetails: (orderId) => commandApi.get(`/api/order/${orderId}`),
};

export default {
    Commands,
    Queries
};
