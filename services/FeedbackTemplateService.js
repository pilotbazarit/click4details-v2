import { API_URL } from "@/helpers/apiUrl";
import { createApiRequest } from "@/helpers/axios";

const commandApi = createApiRequest(API_URL);

const Commands = {
  storeFeedbackTemplate: (data) =>
    commandApi.post("/api/feedback-templates", data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    }),

  updateFeedbackTemplate: (id, data) =>
    commandApi.post(`/api/feedback-templates/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    }),

  deleteFeedbackTemplate: (id) =>
    commandApi.delete(`/api/feedback-templates/${id}`, {
      headers: {
        Accept: "application/json",
      },
    }),
};

const Queries = {
  getFeedbackTemplates: (params) => commandApi.get(`/api/feedback-templates`, { params }),

  getFeedbackTemplateList: (params) => commandApi.get(`/api/feedback-templates/feedback-list`, { params }),

  getFeedbackTemplateById: (id) => commandApi.get(`/api/feedback-templates/${id}`),
};

export default {
  Commands,
  Queries,
};
