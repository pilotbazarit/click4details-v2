import { API_URL } from "@/helpers/apiUrl";
import { createApiRequest } from "@/helpers/axios";

const commandApi = createApiRequest(API_URL);

const Commands = {
  storePresetSuggestion: (data) =>
    commandApi.post("/api/preset-suggestions", data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    }),

  updatePresetSuggestion: (id, data) =>
    commandApi.post(`/api/preset-suggestions/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    }),

  deletePresetSuggestion: (id) =>
    commandApi.delete(`/api/preset-suggestions/${id}`, {
      headers: {
        Accept: "application/json",
      },
    }),
};

const Queries = {
  getPresetSuggestionList: (params) =>
    commandApi.get("/api/preset-suggestions", { params }),

  getPresetSuggestionById: (id) => commandApi.get(`/api/preset-suggestions/${id}`),
};

export default {
  Commands,
  Queries,
};
