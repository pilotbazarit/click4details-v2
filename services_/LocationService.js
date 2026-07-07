import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Commands = {
  storeLocation: (data) =>
    commandApi.post("/api/location", data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    }),

  updateLocation: (id, data) =>
    commandApi.post(`/api/location/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    }),

  // deleteModel: (id) => commandApi.delete(`/api/location/${id}`),
};

const Queries = {
  getLocationall: (params) => commandApi.get(`/api/location`, { params }),
  getAllLocation: () => commandApi.get(`/api/location/all`),

  // getModelsByBrand: (params) => commandApi.get(`/api/vlocation`, { params }),

  getLocationByCountryId: (params) => commandApi.get(`/api/location`, { params }),
};

export default {
  Commands,
  Queries,
};
