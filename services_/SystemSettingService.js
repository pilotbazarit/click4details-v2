import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Commands = {
    updateSystemSetting: (key, data) =>
        commandApi.put(`/api/system-settings/${encodeURIComponent(key)}`, data, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        }),
};

const Queries = {
    getSystemSettings: () => commandApi.get("/api/system-settings"),

    getSystemSetting: (key) =>
        commandApi.get(`/api/system-settings/${encodeURIComponent(key)}`),
};

const SystemSettingService = {
    Commands,
    Queries,
};

export default SystemSettingService;
