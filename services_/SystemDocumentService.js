import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const defaultHeaders = {
  Accept: "application/json",
  "X-Requested-With": "XMLHttpRequest",
};

const Commands = {
  storeSystemDocument: (data) =>
    commandApi.post("/api/system-doc", data, {
      headers: {
        ...defaultHeaders,
        "Content-Type": "multipart/form-data",
      },
    }),

  updateSystemDocument: (id, data) =>
    commandApi.post(`/api/system-doc/${id}`, data, {
      headers: {
        ...defaultHeaders,
        "Content-Type": "multipart/form-data",
      },
    }),

  deleteSystemDocument: (id) =>
    commandApi.delete(`/api/system-doc/${id}`, {
      headers: defaultHeaders,
    }),
};

const Queries = {
  getSystemDocuments: (params) => commandApi.get("/api/system-doc", { params }),
};

const SystemDocumentService = {
  Commands,
  Queries,
};

export default SystemDocumentService;
