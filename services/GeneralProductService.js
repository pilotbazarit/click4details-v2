import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Commands = {
    createGeneralProduct: (data) => commandApi.post("/api/product", data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),


    updateGeneralProduct: (id, data) => commandApi.post(`/api/product/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
        }
    }),

};

const Queries = {

    getGeneralProducts: (params) => commandApi.get(`/api/product`, {params}),
    getGeneralProductBySlug: (slug) => commandApi.get(`/api/product/${slug}`),

    getGeneralProductDetailById: (id, params) => commandApi.get(`/api/product/${id}`, {params}),
    
    // getVehicles: () => commandApi.get("/api/partner-vehicle", {}), getVehiclesWithLogin
    // getVehiclesWithoutLogin: (params) => commandApi.get(`/api/partner-vehicle`, {params}),

    // getAdvanceFilterProducts: (params) => commandApi.get(`/api/get-advance-filter-products`, {params}),

    // getVehiclesWithLogin: (params) => commandApi.get(`/api/vehicle`, {params}),

    // getVehicleDetailById: (id, params) => commandApi.get(`/api/vehicle/${id}`, {params}),

    // getVehicleCodeByShopeId: (id) => commandApi.get(`/api/vehicle/code/${id}`),


    // getMemberShopVehicle: (params) => commandApi.get(`/api/user-member-vehicles`, {params}),

    // getUserPartnerVehicle: (params) => commandApi.get(`/api/user-partner-vehicles`, {params}),
};

export default {
    Commands,
    Queries
};
