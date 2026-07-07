import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Queries = {
    searchProducts: (params) => commandApi.get(`/api/search-products`, {params}),
};

export default {
    Queries
};
