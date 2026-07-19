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

    deleteVehicle: (id) => commandApi.delete(`/api/vehicle/${id}`, {
        headers: {
            Accept: "application/json",
        }
    }),



    cloneVehicle: (id, shopId) => commandApi.post(`/api/vehicle/takeVihicle/${id}?_shop_id=${shopId}`, {
        headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
        }
    }),


    approvedVehicle: (id, data) => commandApi.post(`/api/vehicle/approve-sale-by-pbl/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
        }
    }),

    createPayment: (data) => commandApi.post(`/api/payment`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
        }
    }),

    updatePayment: (id, data) => commandApi.post(`/api/payment/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
        }
    }),

    deletePayment: (id) => commandApi.delete(`/api/payment/${id}`, {
        headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
        }
    }),
};

const Queries = {
    // getVehicles: () => commandApi.get("/api/partner-vehicle", {}), getVehiclesWithLogin
    getVehiclesWithoutLogin: (params) => commandApi.get(`/api/partner-vehicle`, {params}),

    stockListDownload: (params) => commandApi.get(`/api/vehicle/stock-vehicle-download`, {params, responseType: 'blob'}),

    getAdvanceFilterProducts: (params) => commandApi.get(`/api/get-advance-filter-products`, {params}),

    getVehiclesWithLogin: (params) => commandApi.get(`/api/vehicle`, {params}),


    getRequestedVehicles: (params) => commandApi.get(`/api/vehicle`, {params}),

    getVehiclesSortBYBrandModalPackage: (params) => commandApi.get(`/api/vehicle/sortByBrandModelPackage`, {params}),


    getCompanyShopVehicle: (params) => commandApi.get(`/api/vehicle`, {params}),

    getVehicleDetailById: (id, params) => commandApi.get(`/api/vehicle/${id}`, {params}),

    getVehicleCodeByShopeId: (id) => commandApi.get(`/api/vehicle/code/${id}`),

    getPriceHistory: (params) => commandApi.get(`/api/history`, {params}),

    getPaymentHistory: (params) => commandApi.get(`/api/payment`, {params}),

    // getMemberShopVehicle: (params) => commandApi.get(`/api/user-member-vehicles`, {params}),
    getMemberShopVehicle: (params) => commandApi.get(`/api/vehicle`, {params}),

    // getUserPartnerVehicle: (params) => commandApi.get(`/api/user-partner-vehicles`, {params}),
    getUserPartnerVehicle: (params) => commandApi.get(`/api/vehicle`, {params}),

    getVehiclesForCompare: (ids) => commandApi.get(`/api/vehicle/compare`, { params: { ids: ids.join(',') } }),
};

const VehicleService = {
    Commands,
    Queries
};

export default VehicleService;
