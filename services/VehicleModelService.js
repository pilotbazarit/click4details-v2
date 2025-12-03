import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Commands = {
    storeModel: (data) => commandApi.post("/api/vehicle-model", data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),

    updateModel: (id, data) => commandApi.post(`/api/vehicle-model/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),

    deleteModel: (id) => commandApi.delete(`/api/vehicle-model/${id}`),
};

const Queries = {
    // getVehicles: () => commandApi.get("/api/partner-vehicle", {}),
    getModels: (params) => commandApi.get(`/api/vehicle-model`, { params }),

    getModelsByBrand: (params) => commandApi.get(`/api/vehicle-model`, { params }),
    // getModelsByBrand: (brandId) => commandApi.get(`/api/vehicle-model`, { params: { p_brand_id: brandId } }),
    // getVehicleDetailById: (id) => commandApi.get(`/api/vehicle/${id}`),

    // getVehicleCodeByShopeId: (id) => commandApi.get(`/api/vehicle/code/${id}`)
};

export default {
    Commands,
    Queries
};
