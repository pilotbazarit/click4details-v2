import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Commands = {
    storeVehicle: (data) => commandApi.post("/api/vehicle", data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),


    updateVehicle: (id, data) => commandApi.post(`/api/vehicle/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
        }
    }),

    individualVehicleUpdate: (id, data) => commandApi.post(`/api/vehicle/keyUpdate/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
        }
    }),



    cloneVehicle: (id, shopId) => commandApi.post(`/api/vehicle/takeVihicle/${id}?_shop_id=${shopId}`, {
        headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
        }
    }),
};

const Queries = {
    // getVehicles: () => commandApi.get("/api/partner-vehicle", {}), getVehiclesWithLogin
    getVehiclesWithoutLogin: (params) => commandApi.get(`/api/partner-vehicle`, {params}),

    stockListDownload: (params) => commandApi.get(`/api/vehicle/stock-vehicle-download`, {params, responseType: 'blob'}),

    getAdvanceFilterProducts: (params) => commandApi.get(`/api/get-advance-filter-products`, {params}),

    getVehiclesWithLogin: (params) => commandApi.get(`/api/vehicle`, {params}),

    getVehiclesSortBYBrandModalPackage: (params) => commandApi.get(`/api/vehicle/sortByBrandModelPackage`, {params}),


    getCompanyShopVehicle: (params) => commandApi.get(`/api/vehicle`, {params}),

    getVehicleDetailById: (id, params) => commandApi.get(`/api/vehicle/${id}`, {params}),

    getVehicleCodeByShopeId: (id) => commandApi.get(`/api/vehicle/code/${id}`),

    getPriceHistory: (params) => commandApi.get(`/api/history`, {params}),

    // getMemberShopVehicle: (params) => commandApi.get(`/api/user-member-vehicles`, {params}),
    getMemberShopVehicle: (params) => commandApi.get(`/api/vehicle`, {params}),

    // getUserPartnerVehicle: (params) => commandApi.get(`/api/user-partner-vehicles`, {params}),
    getUserPartnerVehicle: (params) => commandApi.get(`/api/vehicle`, {params}),
};

export default {
    Commands,
    Queries
};
