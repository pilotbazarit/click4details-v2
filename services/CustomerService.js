import { API_URL } from "@/helpers/apiUrl";
import { createApiRequest } from "@/helpers/axios";

const commandApi = createApiRequest(API_URL);

const Commands = {
  storeCustomer: (data) =>
    commandApi.post("/api/customers", data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }),

  updateCustomer: (id, data) =>
    commandApi.put(`/api/customers/${id}`, data, {
      headers: {
        Accept: "application/json",
      },
    }),

  deleteCustomer: (id) =>
    commandApi.delete(`/api/customers/${id}`, {
      headers: {
        Accept: "application/json",
      },
    }),

  saveCustomerInfo: (data) =>
    commandApi.post("/api/customers/save-info", data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }),
};

const Queries = {
  getCustomers: (params) => commandApi.get(`/api/customers`, { params }),

  getCustomerById: (id) => commandApi.get(`/api/customers/${id}`),
};

export default {
  Commands,
  Queries,
};
