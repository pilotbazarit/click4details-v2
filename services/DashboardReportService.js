import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");

const commandApi = createApiRequest(API_URL);

const Queries = {
  getDashboardReports: (params) => commandApi.get("/api/dashboard-reports", { params }),
};

const DashboardReportService = {
  Queries,
};

export default DashboardReportService;
