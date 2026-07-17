import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Queries = {
    show: (type, id) => commandApi.get(`/api/pbl-history/${type}/${id}`),
};

export default {
    Queries
};
