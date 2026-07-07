import SelectBase from "react-select";
import { useDelayedVisibility } from "./useDelayedVisibility";
import { DEFAULT_FILTERS } from "./constants";
import { sharedSelectStyles, getMenuPortalTarget } from "./selectConfig";

const Select = ({ ...props }) => (
  <SelectBase
    {...props}
    menuPortalTarget={getMenuPortalTarget()}
    menuPosition="fixed"
    styles={sharedSelectStyles}
  />
);

export const ActivityFilterDrawer = ({
  isOpen,
  onClose,
  draftFilters,
  setDraftFilters,
  filterOptions,
  teamSelectOptions,
  selectedTeamOptions,
  teamMemberSelectOptions,
  selectedTeamMemberOptions,
  seriousnessSelectOptions,
  selectedSeriousnessOptions,
  onApply,
}) => {
  const isVisible = useDelayedVisibility(isOpen);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      onTransitionEnd={() => {
        if (!isVisible) onClose();
      }}
    >
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ease-out ${isVisible ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl border-l border-gray-200 flex flex-col transition-all duration-300 ease-out ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
        }`}
      >
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-violet-50 to-fuchsia-50">
          <h2 className="text-base font-semibold text-gray-800">Filter Data</h2>
          <button type="button" onClick={onClose} className="text-sm text-gray-600 hover:text-gray-900">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Basic Filters */}
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Basic Filters</p>
            <div className="grid grid-cols-1 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">Team</span>
                <Select isMulti options={teamSelectOptions} value={selectedTeamOptions}
                  onChange={(s) => setDraftFilters((p) => ({ ...p, teams: (s || []).map((o) => o.value) }))}
                  placeholder="All Teams" className="text-sm" classNamePrefix="react-select" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">Team Member</span>
                <Select isMulti options={teamMemberSelectOptions} value={selectedTeamMemberOptions}
                  onChange={(s) => setDraftFilters((p) => ({ ...p, dataCollectors: (s || []).map((o) => o.value) }))}
                  placeholder="All Team Members" className="text-sm" classNamePrefix="react-select" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">Profile Level</span>
                <select value={draftFilters.profileLevel}
                  onChange={(e) => setDraftFilters((p) => ({ ...p, profileLevel: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">All Profile Levels</option>
                  {filterOptions.profileLevels.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">Seriousness</span>
                <Select isMulti options={seriousnessSelectOptions} value={selectedSeriousnessOptions}
                  onChange={(s) => setDraftFilters((p) => ({ ...p, seriousnessLevel: (s || []).map((o) => o.value) }))}
                  placeholder="All Seriousness" className="text-sm" classNamePrefix="react-select" />
              </label>
              {[
                { key: "hasFacebookLink", label: "Facebook Link" },
                { key: "hasMessengerLink", label: "Messenger Link" },
              ].map(({ key, label }) => (
                <label key={key} className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">{label}</span>
                  <select value={draftFilters[key]}
                    onChange={(e) => setDraftFilters((p) => ({ ...p, [key]: e.target.value }))}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
                    <option value="all">All</option>
                    <option value="yes">Exists</option>
                    <option value="no">Empty</option>
                  </select>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Status Filters</p>
            <div className="grid grid-cols-1 gap-3">
              {[
                { key: "botMessage", label: "Bot Message" },
                { key: "notInterested", label: "Interested" },
                { key: "saleDone", label: "Sale Done" },
              ].map(({ key, label }) => (
                <label key={key} className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">{label}</span>
                  <select value={draftFilters[key]}
                    onChange={(e) => setDraftFilters((p) => ({ ...p, [key]: e.target.value }))}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
                    <option value="all">All</option>
                    <option value="true">Checked</option>
                    <option value="false">Unchecked</option>
                  </select>
                </label>
              ))}
            </div>
          </div>

          {/* Date Filter */}
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Date Filter</p>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">Month</span>
              <input type="month" value={draftFilters.activityMonth}
                onChange={(e) => setDraftFilters((p) => ({ ...p, activityMonth: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
            </label>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex gap-2">
          <button type="button" onClick={() => setDraftFilters(DEFAULT_FILTERS)}
            className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm font-medium bg-white hover:bg-slate-100">
            Reset Filters
          </button>
          <button type="button" onClick={onApply}
            className="flex-1 border border-indigo-600 rounded-md px-3 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700">
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
};
