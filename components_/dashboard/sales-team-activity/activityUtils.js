import { EMPTY_TEXT } from "./constants";

export const hasValue = (value) => value !== null && value !== undefined && value !== "";

export const isCustomerMetricEligible = (row) => {
  if (!hasValue(row?.customer_id)) return false;
  if (row?.client_name === null || row?.client_name === undefined) return false;
  return !String(row.client_name).includes("No Name -");
};

export const toDisplayValue = (value) => {
  if (value === null || value === undefined || value === "") return EMPTY_TEXT;
  return value;
};

export const toCustomerFieldValue = (value) => {
  if (value === null || value === undefined || value === "") return "";
  return value;
};

export const formatDate = (value) => {
  if (!value) return EMPTY_TEXT;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

export const normalizeProfileLevel = (value) => {
  const text = String(value ?? "").trim().toLowerCase();
  if (!text) return "";
  if (text === "low") return "Low";
  if (text === "high") return "High";
  if (text === "confusing" || text === "confu") return "Confusing";
  return String(value);
};

export const normalizeSeriousnessLevel = (value) => {
  const text = String(value ?? "").trim().toLowerCase();
  if (!text) return "";
  if (text === "low") return "Low";
  if (text === "high") return "High";
  if (text === "medium") return "Medium";
  if (text === "critical") return "Critical";
  if (text === "emergency") return "Emergency";
  return String(value);
};

export const getTeamValue = (row) =>
  row?.team_name ??
  row?.team ??
  row?.team_title ??
  row?.customer_care_team_name ??
  row?.customer_care_team?.name ??
  "";

export const getDataCollectByValue = (row) =>
  row?.data_collect_by_name ?? row?.data_collect_by ?? row?.data_collector ?? "";

export const getFirstVisitByValue = (row) => row?.first_visit_by_name ?? row?.first_visit_by ?? "";
export const getSecondVisitByValue = (row) => row?.second_visit_by_name ?? row?.second_visit_by ?? "";
export const getThirdVisitByValue = (row) => row?.third_visit_by_name ?? row?.third_visit_by ?? "";
export const getSoldDateValue = (row) => row?.sold_date ?? "";
export const getSoldByValue = (row) => row?.sold_by_name ?? row?.sold_by_user?.name ?? row?.sold_by ?? "";

export const getFollowupValue = (row) =>
  row?.followups_count ?? row?.followup_count ?? row?.followup ?? row?.follow_up ?? row?.follow_up_setup ?? "";

export const toUserId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const getTeamNameFromTeamRecord = (team) =>
  team?.name ?? team?.team_name ?? team?.title ?? team?.team_title ?? "";

export const getUserDisplayName = (user) =>
  user?.name ?? user?.full_name ?? user?.username ?? user?.user_name ?? user?.nick_name ?? "";

export const boolBadgeClass = (value) =>
  value
    ? "bg-green-100 text-green-700 border-green-200"
    : "bg-gray-100 text-gray-600 border-gray-200";
