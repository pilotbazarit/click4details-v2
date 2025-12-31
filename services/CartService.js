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


    saveAddress: (data) => commandApi.post("/api/address", data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),

    // clearCart: (data) => commandApi.post("/api/cart/clear", data, {
    //     headers: {
    //         "Content-Type": "multipart/form-data",
    //          Accept: "application/json",
    //     }
    // }),


    clearCart: (cartId) => commandApi.delete(`/api/cart/${cartId}`, {}),
};

const Queries = {
    // getVehicles: () => commandApi.get("/api/partner-vehicle", {}),
    getCartList: (params) => commandApi.get(`/api/cart`, { params }),

    getDistrictList: (params) => commandApi.get(`/api/address/dropdown-data`, { params }),

    getUserAddresses: (params) => commandApi.get(`/api/address`, { params }),
};

export default {
    Commands,
    Queries
};
