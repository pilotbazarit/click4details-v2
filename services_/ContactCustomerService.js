import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const formHeaders = {
  "Content-Type": "multipart/form-data",
  Accept: "application/json",
  "X-Requested-With": "XMLHttpRequest",
};

const jsonHeaders = {
  Accept: "application/json",
  "X-Requested-With": "XMLHttpRequest",
};

const Commands = {
  storeContactCustomer: (data) =>
    commandApi.post("/api/customer-contact-info", data, {
      headers: formHeaders,
    }),

  updateContactCustomer: (id, data) =>
    commandApi.post(`/api/customer-contact-info/${id}`, data, {
      headers: formHeaders,
    }),

  deleteContactCustomer: (id) =>
    commandApi.delete(`/api/customer-contact-info/${id}`, {
      headers: jsonHeaders,
    }),
};

const Queries = {
  getContactCustomers: (params) =>
    commandApi.get("/api/customer-contact-info", {
      params,
      headers: jsonHeaders,
    }),

  getContactCustomerById: (id) =>
    commandApi.get(`/api/customer-contact-info/${id}`, {
      headers: jsonHeaders,
    }),
};

const ContactCustomerService = {
  Commands,
  Queries,
};

export default ContactCustomerService;
