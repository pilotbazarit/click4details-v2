"use client";

import { useEffect, useMemo, useState } from "react";
import SelectBase from "react-select";
import { X } from "lucide-react";
import FilterProductService from "@/services/FilterProductService";
import UserService from "@/services/UserService";
import { getMenuPortalTarget, sharedSelectStyles } from "./sales-team-activity/selectConfig";

const Select = (props) => (
  <SelectBase
    {...props}
    menuPortalTarget={getMenuPortalTarget()}
    menuPosition="fixed"
    styles={compactSelectStyles}
  />
);

export const DEFAULT_CUSTOMER_FILTERS = {
  name: "",
  mobile: "",
  hasFacebook: false,
  hasMessenger: false,
  clientSeriousness: "",
  clientAttitude: [],
  customerSearch: "",
  createdBy: "",
  createdFrom: "",
  createdTo: "",
  note: "",
};

const fieldClass = "w-full min-w-0 border border-gray-300 rounded-sm px-2 py-1 text-sm bg-white focus:outline-none focus:border-blue-500";
const labelClass = "w-[110px] shrink-0 text-right text-[13px] text-gray-600 pr-2";
const rowClass = "flex items-center gap-2";

const compactSelectStyles = {
  ...sharedSelectStyles,
  control: (base, state) => ({
    ...sharedSelectStyles.control(base, state),
    minHeight: 30,
    height: 30,
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 8px",
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: 30,
  }),
};

const CustomerFilterDrawer = ({
  isOpen,
  onClose,
  draftFilters,
  setDraftFilters,
  onApply,
  onReset,
  showCreatedByFilter,
}) => {
  const [seriousnessOptions, setSeriousnessOptions] = useState([]);
  const [attitudeOptions, setAttitudeOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    const loadOptions = async () => {
      try {
        const [seriousness, attitude, usersResponse] = await Promise.all([
          FilterProductService.Queries.getClientSeriousnessOptions(),
          FilterProductService.Queries.getClientAttitudeOptions(),
          UserService.Queries.getUserList({ user_mode: "pbl" }),
        ]);

        setSeriousnessOptions((seriousness || []).filter((opt) => opt.value !== ""));
        setAttitudeOptions((attitude || []).filter((opt) => opt.value !== ""));

        const users = Array.isArray(usersResponse?.data) ? usersResponse.data : [];
        setUserOptions(
          users
            .map((user) => ({
              value: String(user?.id ?? ""),
              label: String(user?.name ?? user?.email ?? ""),
            }))
            .filter((opt) => opt.value && opt.label)
        );
      } catch {
        setSeriousnessOptions([]);
        setAttitudeOptions([]);
        setUserOptions([]);
      }
    };

    loadOptions();
  }, [isOpen]);

  const selectedAttitudeOptions = useMemo(
    () => attitudeOptions.filter((opt) => draftFilters.clientAttitude.map(String).includes(String(opt.value))),
    [attitudeOptions, draftFilters.clientAttitude]
  );

  const selectedCreatedByOption = useMemo(
    () => userOptions.find((opt) => opt.value === String(draftFilters.createdBy)) || null,
    [userOptions, draftFilters.createdBy]
  );

  if (!isOpen) return null;

  const updateFilter = (key, value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl border-l border-gray-200 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close filters"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-2.5">
            <label className={rowClass}>
              <span className={labelClass}>Name</span>
              <input
                type="text"
                value={draftFilters.name}
                onChange={(e) => updateFilter("name", e.target.value)}
                className={fieldClass}
                placeholder="-None-"
              />
            </label>

            <label className={rowClass}>
              <span className={labelClass}>Mobile</span>
              <input
                type="text"
                value={draftFilters.mobile}
                onChange={(e) => updateFilter("mobile", e.target.value)}
                className={fieldClass}
                placeholder="-None-"
              />
            </label>

            <div className={rowClass}>
              <span className={labelClass}>Facebook</span>
              <input
                type="checkbox"
                checked={!!draftFilters.hasFacebook}
                onChange={(e) => updateFilter("hasFacebook", e.target.checked)}
                className="h-4 w-4 rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className={rowClass}>
              <span className={labelClass}>Messenger</span>
              <input
                type="checkbox"
                checked={!!draftFilters.hasMessenger}
                onChange={(e) => updateFilter("hasMessenger", e.target.checked)}
                className="h-4 w-4 rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <label className={rowClass}>
              <span className={labelClass}>Seriousness</span>
              <select
                value={draftFilters.clientSeriousness}
                onChange={(e) => updateFilter("clientSeriousness", e.target.value)}
                className={fieldClass}
              >
                <option value="">-None-</option>
                {seriousnessOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <div className={rowClass}>
              <span className={labelClass}>Attitude</span>
              <div className="flex-1 min-w-0">
                <Select
                  isMulti
                  options={attitudeOptions}
                  value={selectedAttitudeOptions}
                  onChange={(selected) => updateFilter("clientAttitude", (selected || []).map((opt) => opt.value))}
                  placeholder="-None-"
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>
            </div>

            <label className={rowClass}>
              <span className={labelClass}>Search</span>
              <input
                type="text"
                value={draftFilters.customerSearch}
                onChange={(e) => updateFilter("customerSearch", e.target.value)}
                className={fieldClass}
                placeholder="-None-"
              />
            </label>

            {showCreatedByFilter && (
              <div className={rowClass}>
                <span className={labelClass}>Created By</span>
                <div className="flex-1 min-w-0">
                  <Select
                    isClearable
                    isSearchable
                    options={userOptions}
                    value={selectedCreatedByOption}
                    onChange={(option) => updateFilter("createdBy", option?.value || "")}
                    placeholder="-None-"
                    className="text-sm"
                    classNamePrefix="react-select"
                  />
                </div>
              </div>
            )}

            <div className={rowClass}>
              <span className={labelClass}>Created Time</span>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <input
                  type="date"
                  value={draftFilters.createdFrom}
                  onChange={(e) => updateFilter("createdFrom", e.target.value)}
                  className={fieldClass}
                  aria-label="Created from"
                />
                <span className="text-gray-400 text-sm shrink-0">-</span>
                <input
                  type="date"
                  value={draftFilters.createdTo}
                  onChange={(e) => updateFilter("createdTo", e.target.value)}
                  className={fieldClass}
                  aria-label="Created to"
                />
              </div>
            </div>

            <label className={rowClass}>
              <span className={labelClass}>Note</span>
              <input
                type="text"
                value={draftFilters.note}
                onChange={(e) => updateFilter("note", e.target.value)}
                className={fieldClass}
                placeholder="-None-"
              />
            </label>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onReset}
            className="border border-slate-300 rounded-md px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-100"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onApply}
            className="border border-indigo-600 rounded-md px-2.5 py-1 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerFilterDrawer;
