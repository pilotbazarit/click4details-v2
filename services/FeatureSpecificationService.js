import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Commands = {
    storeFeatureSpecification: (data) => commandApi.post("/api/feature-specification", data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),

    updateFeatureSpecification: (id, data) => commandApi.post(`/api/feature-specification/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),

    deleteFeatureSpecification: (id) => commandApi.delete(`/api/feature-specification/${id}`),


    storeFeatureSpecificationMapping: (data) => commandApi.post("/api/feature-specification/ed_fs_mapping", data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),

};

const Queries = {
    // getVehicles: () => commandApi.get("/api/partner-vehicle", {}),
    getFeatureSpecification: (params) =>
        commandApi.get(`/api/feature-specification`, { params }),

    // getVehicleDetailById: (id) => commandApi.get(`/api/vehicle/${id}`),
};

export default {
    Commands,
    Queries
};
