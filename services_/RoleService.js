import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Commands = {

    // updateUser: (id, data) => commandApi.post(`/api/user/${id}`, data, {
    //     headers: {
    //         "Content-Type": "multipart/form-data",
    //          Accept: "application/json",
    //     }
    // }),

    // addRole: (data) => commandApi.post("/api/role", data, {
    //     headers: {
    //         "Content-Type": "multipart/form-data",
    //          Accept: "application/json",
    //     }
    // }),

    // updateUserMode: (id, data) => commandApi.post(`/api/user/${id}`, data, {
    //     headers: {
    //         "Content-Type": "multipart/form-data",
    //          Accept: "application/json",
    //     }
    // }),

   

    deleteRole: (id) => commandApi.delete(`/api/role/${id}`, {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        }
    }),
};

const Queries = {
   
    getRoles: (params) => commandApi.get(`/api/role`, { params }),

    getUserRolePermission: (id) => commandApi.get(`/api/shop/shopEmployee/${id}`),

    // getUserPermissionName: (params) => commandApi.get(`/api/permission-name-list`, { params }),

    // getUserById: (id) => commandApi.get(`/api/user/${id}`),
    // getModelsByBrand: (id) => commandApi.get(`/api/vehicle-model?_brand_id=${id}`),
 
};

export default {
    Commands,
    Queries
};
