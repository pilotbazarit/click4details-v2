import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const multipartHeaders = {
    headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
    }
};

const Commands = {
    // FormData-capable so payment documents (pp_docs[]) can be attached
    createPurchasePayment: (data) => commandApi.post("/api/purchase-payment", data, multipartHeaders),

    updatePurchasePayment: (id, data) => commandApi.post(`/api/purchase-payment/${id}`, data, multipartHeaders),

    deletePurchasePayment: (id) => commandApi.delete(`/api/purchase-payment/${id}`),

    createCalculation: (data) => commandApi.post("/api/purchase-payment/calculations", data),
    updateCalculation: (id, data) => commandApi.put(`/api/purchase-payment/calculations/${id}`, data),
    activateCalculation: (id) => commandApi.post(`/api/purchase-payment/calculations/${id}/activate`),
    deleteCalculation: (id) => commandApi.delete(`/api/purchase-payment/calculations/${id}`),

    addCostingItem: (calculationId, data) => commandApi.post(`/api/purchase-payment/calculations/${calculationId}/items`, data, multipartHeaders),
    updateCostingItem: (itemId, data) => commandApi.post(`/api/purchase-payment/costing-items/${itemId}`, data, multipartHeaders),
    deleteCostingItem: (itemId) => commandApi.delete(`/api/purchase-payment/costing-items/${itemId}`),
};

const Queries = {
    getPurchasePayments: (params) => commandApi.get(`/api/purchase-payment`, { params }),
    getPurchasePaymentById: (id) => commandApi.get(`/api/purchase-payment/${id}`),
    searchEntities: (params) => commandApi.get(`/api/purchase-payment/entities`, { params }),
    getEntityPricing: (params) => commandApi.get(`/api/purchase-payment/pricing`, { params }),
    getFilterOptions: (params) => commandApi.get(`/api/purchase-payment/filter-options`, { params }),
    getCalculations: (params) => commandApi.get(`/api/purchase-payment/calculations`, { params }),
    downloadPurchasePaymentPdf: (params) => commandApi.get(`/api/purchase-payment/download-pdf`, { params, responseType: "blob" }),
    downloadVehicleReportPdf: (params) => commandApi.get(`/api/purchase-payment/reports/vehicle-pdf`, { params, responseType: "blob" }),
    downloadReasonWisePdf: (params) => commandApi.get(`/api/purchase-payment/reports/reason-wise-pdf`, { params, responseType: "blob" }),
    downloadAllProductsPdf: (params) => commandApi.get(`/api/purchase-payment/reports/all-products-pdf`, { params, responseType: "blob" }),
    downloadMoneyReceiptPdf: (params) => commandApi.get(`/api/purchase-payment/money-receipt`, { params, responseType: "blob" }),
};

export default {
    Commands,
    Queries
};
