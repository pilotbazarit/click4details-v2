import { API_URL } from "@/helpers/apiUrl";
import { createApiRequest } from "@/helpers/axios";
import { get, post } from "../lib/api";

const commandApi = createApiRequest(API_URL);

const SearchHistoryService = {
  Queries: {
    updateSearchHistory: (id, data) => commandApi.put(`/api/search-history/${id}`, data),
    deleteSearchHistory: (id) => commandApi.delete(`/api/search-history/${id}`),
    saveSearchHistory: async (data) => {
      const formData = new FormData();
      for (const key in data) {
        if (key === "search_params" || key === "customer_info") {
          formData.append(key, JSON.stringify(data[key]));
        } else if (key === "visiting_card_image" && data[key]) {
          formData.append(key, data[key]);
        } else if (key === "birthDate" || key === "anniversaryDate") {
          formData.append(key, data[key] ? dayjs(data[key]).format("YYYY-MM-DD") : "");
        } else {
          formData.append(key, data[key]);
        }
      }
      return await post("search-history", formData, { "Content-Type": "multipart/form-data" });
    },
    getCustomerByMobile: async (mobile) => {
      const response = await get(`search-customer-by-mobile?customer_mobile=${mobile}`);
      return response;
    },
    getCustomerByEmail: async (email) => {
      const response = await get(`search-customer-by-email?customer_email=${encodeURIComponent(email)}`);
      return response;
    },
    searchCustomer: async ({ mobile, name }) => {
      const query = new URLSearchParams();
      if (mobile) query.append("customer_mobile", mobile);
      if (name) query.append("customer_name", name);
      const response = await get(`search-customer?${query.toString()}`);
      return response;
    },
    searchCustomersForSelect: async (q) => {
      const response = await commandApi.get("/api/search-customers-select", { params: { q } });
      return response;
    },
    getSearchHistory: async (mobile) => {
      const response = await get(`search-history?customer_mobile=${mobile}`);
      return response;
    },
    getSearchHistoryByCustomerId: async (customerId) => {
      const response = await get("search-history/by-customer-id", { customer_id: customerId });
      return response;
    },
  },
};

export default SearchHistoryService;
