import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Commands = {
    storePackage: (data) => commandApi.post("/api/package", data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),

    updatePackage: (id, data) => commandApi.post(`/api/package/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),

    deletePackage: (id) => commandApi.delete(`/api/package/${id}`),
};

const Queries = {
    // getVehicles: () => commandApi.get("/api/partner-vehicle", {}),


    getPackages: (params) => commandApi.get(`/api/package`, { params }),
    
    getDependentPackages: (brandIds, modelIds) => {
        return commandApi.get(`/api/package/by-brands-and-models`, { params: { brand_ids: brandIds, model_ids: modelIds } });
    }, 

    getPackageById: (params) => commandApi.get(`/api/package`, { params }),

    getFeatureByPackageId: (id) => commandApi.get(`/api/feature-specification/byPackage/${id}`),

    getFeatureByPackage: (id, productId) => commandApi.get(`/api/feature-specification/byPackage/${id}?_all=0&_v_id=${productId}`),

    // getVehicleDetailById: (id) => commandApi.get(`/api/vehicle/${id}`),
};

export default {
    Commands,
    Queries
};
