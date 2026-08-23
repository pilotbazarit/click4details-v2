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

  updateCustomerInline: (id, data) =>
    commandApi.patch(`/api/customers/${id}/inline`, data, {
      headers: {
        "Content-Type": "application/json",
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

  getCustomerList: (params) => commandApi.get(`/api/customers/list`, { params }),

  getCustomerById: (id) => commandApi.get(`/api/customers/${id}`),
};

const CustomerService = {
  Commands,
  Queries,
};

export default CustomerService;
