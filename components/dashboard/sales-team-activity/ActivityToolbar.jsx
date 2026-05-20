import {
  ACTIVITY_TAB_ALL, ACTIVITY_TAB_EMPLOYEE, ACTIVITY_TAB_TEAM, ACTIVITY_TAB_USER_RATIO,
} from "./constants";

const TAB_DEFS = [
  { key: ACTIVITY_TAB_ALL, label: "All Activity", alwaysShow: true },
  { key: ACTIVITY_TAB_EMPLOYEE, label: "Employee Summary", alwaysShow: false },
  { key: ACTIVITY_TAB_TEAM, label: "Team Summary", alwaysShow: false },
  { key: ACTIVITY_TAB_USER_RATIO, label: "User Ratio", alwaysShow: false },
];

export const ActivityToolbar = ({
  activityTab,
  setActivityTab,
  canViewSummaryTabs,
  userMode,
  pblTeamInfos,
  search,
  setSearch,
  perPage,
  setPerPage,
  canShowFilterSalesTeamButton,
  canShowOverviewSalesTeamButton,
  canShowAddSalesTeamButton,
  onOpenFilterPanel,
  onOpenKpiModal,
  onOpenAddNewModal,
  onBulkDelete,
  selectedActivityIds,
  activityFlashMessage,
}) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    {/* Left: title + tabs + team info */}
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <h1 className="text-2xl font-bold text-[#0167a2] inline-flex items-center gap-2">
        <svg className="h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <path d="M14 3v6h6" />
          <path d="M8 13h8M8 17h8M8 9h2" />
        </svg>
        Sales Team Activity
      </h1>

      <div className="flex flex-wrap gap-1 border-b border-gray-200" role="tablist" aria-label="Activity view">
        {TAB_DEFS.map(({ key, label, alwaysShow }) => {
          if (!alwaysShow && !canViewSummaryTabs) return null;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activityTab === key}
              onClick={() => setActivityTab(key)}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activityTab === key
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {userMode === "pbl" && (
        <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-slate-700">
          {pblTeamInfos.length > 0 ? (
            <div className="space-y-1.5">
              {pblTeamInfos.map((team) => (
                <div key={team.teamName} className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sky-800">Team: {team.teamName}</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-700">Members:</span>
                  <span className="flex flex-wrap items-center gap-1.5">
                    {team.members.map((member) => (
                      <span
                        key={`${team.teamName}-${member.id ?? member.name}`}
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          member.isLeader
                            ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
                            : "bg-white text-slate-700 ring-1 ring-slate-200"
                        }`}
                      >
                        {member.name}{member.isLeader ? " (Leader)" : ""}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span>No team assignment found for your account.</span>
          )}
        </div>
      )}

      {activityFlashMessage && (
        <div
          className={`rounded-md border px-3 py-2 text-sm ${
            activityFlashMessage.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {activityFlashMessage.text}
        </div>
      )}
    </div>

    {/* Right: search, per-page, action buttons */}
    <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, collector, phone..."
        className="w-72 border border-gray-300 rounded-md px-3 py-2 text-sm"
      />
      <select
        value={perPage}
        onChange={(e) => setPerPage(Number(e.target.value))}
        className="border border-gray-300 rounded-md px-2 py-2 text-sm"
      >
        {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
      </select>

      {canShowFilterSalesTeamButton && (
        <button type="button" onClick={onOpenFilterPanel}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-50">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" />
          </svg>
          Filters
        </button>
      )}

      {canShowOverviewSalesTeamButton && (
        <button type="button" onClick={onOpenKpiModal}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-indigo-700 border border-indigo-200 bg-indigo-50 rounded-md hover:bg-indigo-100">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 19V10M12 19V5M20 19v-8" />
          </svg>
          Overview
        </button>
      )}

      {canShowAddSalesTeamButton && (
        <button type="button" onClick={onOpenAddNewModal}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-sky-700 border border-sky-200 bg-sky-50 rounded-md hover:bg-sky-100"
          title="Add a new activity">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add New
        </button>
      )}

      {activityTab === ACTIVITY_TAB_ALL && (
        <button type="button" onClick={onBulkDelete}
          disabled={selectedActivityIds.length === 0}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md ${
            selectedActivityIds.length > 0
              ? "text-rose-700 border border-rose-200 bg-rose-50 hover:bg-rose-100"
              : "text-gray-400 border border-gray-200 bg-gray-100 cursor-not-allowed"
          }`}
          title="Delete selected activity rows">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          Bulk Delete
        </button>
      )}
    </div>
  </div>
);
