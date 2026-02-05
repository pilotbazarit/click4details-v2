import { API_URL } from "@/helpers/apiUrl";
import { createApiRequest } from "@/helpers/axios";

const commandApi = createApiRequest(API_URL);

const Commands = {
  storeFeedbackTemplate: (data) =>
    commandApi.post("/api/preset-que-ans", data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    }),

  updateFeedbackTemplate: (id, data) =>
    commandApi.post(`/api/preset-que-ans/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    }),

  deleteFeedbackTemplate: (id) =>
    commandApi.delete(`/api/preset-que-ans/${id}`, {
      headers: {
        Accept: "application/json",
      },
    }),
};

const Queries = {
  getPresetQuestionAnswerList: (params) => commandApi.get(`/api/preset-que-ans`, { params }),

  // getFeedbackTemplates

  // getFeedbackTemplateList: (params) => commandApi.get(`/api/preset-que-ans/feedback-list`, { params }),

  getFeedbackTemplateById: (id) => commandApi.get(`/api/preset-que-ans/${id}`),
};

export default {
  Commands,
  Queries,
};
