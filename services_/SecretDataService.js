import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Queries = {
    search: (params) => commandApi.get(`/api/secret-data/search`, { params }),
    show: (type, id) => commandApi.get(`/api/secret-data/${type}/${id}`),
};

export default {
    Queries
};
