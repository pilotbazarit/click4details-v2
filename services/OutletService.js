import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Commands = {
    storeOutlet: (data) => commandApi.post("/api/user-outlet", data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),

    updateOutlet: (id, data) => commandApi.post(`/api/user-outlet/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),

    deleteOutlet: (id) => commandApi.delete(`/api/user-outlet/${id}`),
};

const Queries = {
    // getVehicles: () => commandApi.get("/api/partner-vehicle", {}),
    // getModels: (params) => commandApi.get(`/api/vehicle-model`, { params }),

    // getModelsByBrand: (params) => commandApi.get(`/api/vehicle-model`, { params }),

    getOutletByShopId: (params) => commandApi.get(`/api/user-outlet`, { params }),

    getAllOutlets: (params) => commandApi.get(`/api/user-outlet`, { params }),

    getDistricts: (params) => commandApi.get(`/api/address/dropdown-data`, {
        params: {
            _entity: 'district',
            _page: 1,
            _perPage: 1000,
            ...params
        }
    }),
};

export default {
    Commands,
    Queries
};
