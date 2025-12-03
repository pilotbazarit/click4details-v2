import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Commands = {
    storeCategory: (data) => commandApi.post("/api/category", data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),

    updateCategory: (id, data) => commandApi.post(`/api/category/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),

    deleteCategory: (id) => commandApi.delete(`/api/category/${id}`),
};

const Queries = {
    // getVehicles: () => commandApi.get("/api/partner-vehicle", {}),
    getCategories: (params) => commandApi.get(`/api/category`, { params }),

    // getModelsByBrand: (params) => commandApi.get(`/api/vehicle-model`, { params }),
    // getModelsByBrand: (brandId) => commandApi.get(`/api/vehicle-model`, { params: { p_brand_id: brandId } }),
    // getVehicleDetailById: (id) => commandApi.get(`/api/vehicle/${id}`),

    // getVehicleCodeByShopeId: (id) => commandApi.get(`/api/vehicle/code/${id}`)
};

export default {
    Commands,
    Queries
};
