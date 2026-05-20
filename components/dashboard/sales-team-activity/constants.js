export const EMPTY_TEXT = "-";
export const TABLE_COLUMN_COUNT = 15;
export const EMPLOYEE_ACTIVITY_COLUMN_COUNT = 13;

export const ACTIVITY_TAB_ALL = "all";
export const ACTIVITY_TAB_EMPLOYEE = "employee-wise";
export const ACTIVITY_TAB_TEAM = "team-wise";
export const ACTIVITY_TAB_USER_RATIO = "user-ratio";

export const EMPLOYEE_SORT_DEFAULT = { key: "records", direction: "desc" };

export const PROFILE_LEVEL_OPTIONS = ["Low", "High", "Confusing"];
export const SERIOUSNESS_OPTIONS = ["Low", "High", "Medium", "Critical", "Emergency"];

export const DEFAULT_FILTERS = {
  profileLevel: "",
  seriousnessLevel: [],
  dataCollectors: [],
  teams: [],
  activityMonth: "",
  hasFacebookLink: "all",
  hasMessengerLink: "all",
  saleDone: "all",
  notInterested: "all",
  botMessage: "all",
};

export const PRIMARY_KPI_LABELS = new Set([
  "Total Records",
  "Customer",
  "Customer Mobile Number",
  "Total Sold",
]);

export const kpiColorClasses = [
  "bg-blue-50 border-blue-200 text-blue-700",
  "bg-indigo-50 border-indigo-200 text-indigo-700",
  "bg-emerald-50 border-emerald-200 text-emerald-700",
  "bg-violet-50 border-violet-200 text-violet-700",
  "bg-amber-50 border-amber-200 text-amber-700",
  "bg-pink-50 border-pink-200 text-pink-700",
  "bg-cyan-50 border-cyan-200 text-cyan-700",
  "bg-lime-50 border-lime-200 text-lime-700",
];
