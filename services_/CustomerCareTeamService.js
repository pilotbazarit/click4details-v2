import { createApiRequest } from "@/helpers/axios";

const { API_URL } = require("@/helpers/apiUrl");
const commandApi = createApiRequest(API_URL);

const Queries = {
  getTeams: () => commandApi.get("/api/customer-care-teams"),
  getRotationLogs: (teamId) => commandApi.get(`/api/customer-care-teams/${teamId}/rotation-logs`),
};

const Commands = {
  createTeam: (data) => commandApi.post("/api/customer-care-teams", data),
  updateTeam: (teamId, data) => commandApi.put(`/api/customer-care-teams/${teamId}`, data),
  deleteTeam: (teamId) => commandApi.delete(`/api/customer-care-teams/${teamId}`),
  setMembers: (teamId, data) => commandApi.put(`/api/customer-care-teams/${teamId}/members`, data),
  addRotationLog: (teamId, data) => commandApi.post(`/api/customer-care-teams/${teamId}/rotation-logs`, data),
};

export default {
  Queries,
  Commands,
};

