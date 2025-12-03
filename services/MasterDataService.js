import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Commands = {
    //Master Data
    storeMasterData: (data) => commandApi.post("/api/master-data", data, {
        headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
        }
    }),


    updateMasterData: (id, data) => commandApi.post(`/api/master-data/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
        }
    }),

    deleteMasterData: (id) => commandApi.delete(`/api/master-data/${id}`),

    //Master Data Type
    storeMasterDataType: (data) => commandApi.post("/api/master-data-type", data, {
        headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
        }
    }),


    updateMasterDataType: (id, data) => commandApi.post(`/api/master-data-type/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
        }
    }),

    deleteMasterDataType: (id) => commandApi.delete(`/api/master-data-type/${id}`),
};

const Queries = {
    getMasterDataByTypeCode: (code) => commandApi.get(`/api/master-data-type/by-code/${code}`),

    getMasterDataByTypeCodeParam: (params) => {
        const { code, ...query } = params;
        const queryString = new URLSearchParams(query).toString();
        return commandApi.get(`/api/master-data-type/by-code/${code}?${queryString}`);
    },

    getModelsByBrand: (brand_ids) => {
        if (Array.isArray(brand_ids)) {
            // Handle array of brand IDs
            return commandApi.get(`/api/vehicle-model/by-brands`, { params: { brand_ids } });
        } else {
            // Handle single brand ID
            return commandApi.get(`/api/vehicle-model?_brand_id=${brand_ids}`);
        }
    },
    getMasterData: (params) => commandApi.get(`/api/master-data`, { params }),
    getMaterDatatype: (params) => commandApi.get(`/api/master-data-type`, { params }),
};

export default {
    Commands,
    Queries
};
