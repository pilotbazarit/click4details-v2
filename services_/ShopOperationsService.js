import { createApiRequest } from "@/helpers/axios";
import { API_URL } from "@/helpers/apiUrl";

const commandApi = createApiRequest(API_URL);

const Queries = {
  getOperationShops: (params) => commandApi.get("/api/shop-operations/shops", { params }),
  getStock: (params) => commandApi.get("/api/shop-operations/stock", { params }),
  getInventory: (params) => commandApi.get("/api/shop-operations/inventory", { params }),
  getPurchases: (params) => commandApi.get("/api/shop-operations/purchases", { params }),
  getPurchase: (id) => commandApi.get(`/api/shop-operations/purchases/${id}`),
};

const Commands = {
  adjustStock: (data) => commandApi.post("/api/shop-operations/stock/adjust", data),
  createPurchase: (data) => commandApi.post("/api/shop-operations/purchases", data),
  updatePurchase: (id, data) => commandApi.put(`/api/shop-operations/purchases/${id}`, data),
  deletePurchase: (id) => commandApi.delete(`/api/shop-operations/purchases/${id}`),
  receivePurchase: (id, data = {}) => commandApi.post(`/api/shop-operations/purchases/${id}/receive`, data),
};

export default {
  Queries,
  Commands,
};
