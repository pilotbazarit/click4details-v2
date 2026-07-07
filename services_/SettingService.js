import ChangePassword from "@/app/dashboard/change-password/page";
import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Commands = {
    ChangePassword: (data) => commandApi.post("/api/user/change-password", data, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    }),
};

const Queries = {
    //
};

export default {
    Commands,
    Queries
};
