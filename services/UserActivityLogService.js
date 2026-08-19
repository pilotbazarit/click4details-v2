import { createApiRequest } from "@/helpers/axios";
const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Queries = {
    getLogs: (params) => commandApi.get(`/api/user-activity-logs`, { params }),
    getMyLogs: (params) => commandApi.get(`/api/user-activity-logs/my-activity`, { params }),
    getFilterOptions: () => commandApi.get(`/api/user-activity-logs/filter-options`),
    downloadPdf: (params) => commandApi.get(`/api/user-activity-logs/export-pdf`, { params: { ...params, _is_down: 1 }, responseType: "blob" }),
    downloadMyPdf: (params) => commandApi.get(`/api/user-activity-logs/my-activity/export-pdf`, { params: { ...params, _is_down: 1 }, responseType: "blob" }),
};

export default {
    Queries
};
