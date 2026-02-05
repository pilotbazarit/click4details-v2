import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Commands = {
    login: (data) => commandApi.post("/api/login", data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),

    registration: (data) => commandApi.post("/api/register", data, {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),


    logout: () => commandApi.post("/api/logout", {
        headers: {
            "Content-Type": "multipart/form-data",
             Accept: "application/json",
        }
    }),

    forgotPassword: (data) => commandApi.post("/api/forgot-password", data, {
        headers: {
            "Content-Type": "application/json",
             Accept: "application/json",
        }
    }),

    resetPassword: (data) => commandApi.post("/api/reset-password", data, {
        headers: {
            "Content-Type": "application/json",
             Accept: "application/json",
        }
    }),


    sendOtp: (data) => commandApi.post(`/api/send-otp`, data, {
        headers: {
            "Content-Type": "application/json",
             Accept: "application/json",
        }
    }),

    verifyOtp: (data) => commandApi.post("/api/verify-otp", data, {
        headers: {
            "Content-Type": "application/json",
             Accept: "application/json",
        }
    }),

    
};

const Queries = {
    isVerifyPhone: (params) => commandApi.get(`/api/is-verify-phone/${params}`),
};

export default {
    Commands,
    Queries
};
