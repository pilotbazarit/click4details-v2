import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Commands = {
  createSupplier: (data) => commandApi.post("/api/supplier", data, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  }),

  updateSupplier: (id, data) => commandApi.put(`/api/supplier/${id}`, data, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  }),

  deleteSupplier: (id) => commandApi.delete(`/api/supplier/${id}`),
};

const Queries = {
  getSuppliers: (params) => commandApi.get("/api/supplier", { params }),
  getSupplier: (id) => commandApi.get(`/api/supplier/${id}`),
};

export default {
  Commands,
  Queries,
};
