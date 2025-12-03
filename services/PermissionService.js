import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Commands = {
    storePermission: (data) => commandApi.post("/api/permission", data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),

    storeUserPermission: (data) => commandApi.post("/api/user-role-permission", data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),

    updateUserPermission: (id, data) => commandApi.post(`/api/user-role-permission/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),

    updatePermission: (id, data) => commandApi.post(`/api/permission/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),

    deletePermission: (id) => commandApi.delete(`/api/permission/${id}`),
};

const Queries = {
    // getVehicles: () => commandApi.get("/api/partner-vehicle", {}),


    getPermissions: (params) => commandApi.get(`/api/permission`, { params }),
    
    getSingleUserRolePermission: (id) => commandApi.get(`/api/user-role-permission/${id}`),
    // getPackageById: (params) => commandApi.get(`/api/package`, { params }),

    // getFeatureByPackageId: (id) => commandApi.get(`/api/feature-specification/byPackage/${id}`),

    // getFeatureByPackage: (id, productId) => commandApi.get(`/api/feature-specification/byPackage/${id}?_all=0&_v_id=${productId}`),

    // getVehicleDetailById: (id) => commandApi.get(`/api/vehicle/${id}`),
};

export default {
    Commands,
    Queries
};
