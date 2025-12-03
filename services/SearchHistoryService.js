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
    getSearchHistory: async (mobile) => {
      const response = await get(`search-history?customer_mobile=${mobile}`);
      return response;
    },
  },
};

export default SearchHistoryService;
