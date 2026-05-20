import SelectBase from "react-select";
import { useDelayedVisibility } from "./useDelayedVisibility";
import { PROFILE_LEVEL_OPTIONS } from "./constants";
import { sharedSelectStyles, getMenuPortalTarget } from "./selectConfig";

const Select = ({ ...props }) => (
  <SelectBase
    {...props}
    menuPortalTarget={getMenuPortalTarget()}
    menuPosition="fixed"
    styles={sharedSelectStyles}
  />
);

export const AddActivityModal = ({
  isOpen,
  onClose,
  draft,
  updateDraft,
  onSubmit,
  collectByOptions,
  seriousnessOptions,
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
        className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-300 ease-out ${isVisible ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`relative h-full w-full overflow-hidden border border-slate-200 bg-white shadow-2xl transition-all duration-300 ease-out ${
          isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
        }`}
      >
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-sky-50 via-indigo-50 to-violet-50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Add New Activity</h2>
              <p className="text-sm text-slate-600">Create a new sales team activity entry quickly.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              aria-label="Close add new activity modal"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>

        <form className="p-6 space-y-4 h-[calc(100vh-89px)] overflow-y-auto" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold tracking-wide uppercase text-slate-500">Customer Name</span>
              <input type="text" placeholder="Enter customer name" value={draft.customerName}
                onChange={(e) => updateDraft("customerName", e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold tracking-wide uppercase text-slate-500">Customer Mobile</span>
              <input type="text" placeholder="01XXXXXXXXX" value={draft.customerMobile}
                onChange={(e) => updateDraft("customerMobile", e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold tracking-wide uppercase text-slate-500">Collect By</span>
              <Select options={collectByOptions}
                value={collectByOptions.find((o) => o.value === draft.collectById) || null}
                onChange={(s) => updateDraft("collectById", s?.value || "")}
                placeholder="Select user" isClearable className="text-sm" classNamePrefix="react-select" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold tracking-wide uppercase text-slate-500">Facebook Link</span>
              <input type="text" placeholder="https://facebook.com/..." value={draft.facebookLink}
                onChange={(e) => updateDraft("facebookLink", e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold tracking-wide uppercase text-slate-500">Messenger Link</span>
              <input type="text" placeholder="https://m.me/..." value={draft.messengerLink}
                onChange={(e) => updateDraft("messengerLink", e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold tracking-wide uppercase text-slate-500">Profile Level</span>
              <select value={draft.profileLevel} onChange={(e) => updateDraft("profileLevel", e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400">
                <option value="">Select Profile Level</option>
                {PROFILE_LEVEL_OPTIONS.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold tracking-wide uppercase text-slate-500">Seriousness</span>
              <Select options={seriousnessOptions.map((l) => ({ value: l, label: l }))}
                value={seriousnessOptions.map((l) => ({ value: l, label: l })).find((o) => o.value === draft.seriousnessLevel) || null}
                onChange={(s) => updateDraft("seriousnessLevel", s?.value || "")}
                placeholder="Select seriousness" isClearable className="text-sm" classNamePrefix="react-select" />
            </label>

            {/* Visit Information */}
            <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">Visit Information</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: "Visit 1", dateField: "firstVisitDate", byField: "firstVisitById" },
                  { label: "Visit 2", dateField: "secondVisitDate", byField: "secondVisitById" },
                  { label: "Visit 3", dateField: "thirdVisitDate", byField: "thirdVisitById" },
                ].map(({ label, dateField, byField }) => (
                  <div key={label} className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                    <input type="date" value={draft[dateField]}
                      onChange={(e) => updateDraft(dateField, e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
                    <Select options={collectByOptions}
                      value={collectByOptions.find((o) => o.value === draft[byField]) || null}
                      onChange={(s) => updateDraft(byField, s?.value || "")}
                      placeholder="Select user" isClearable className="text-sm" classNamePrefix="react-select" />
                  </div>
                ))}
              </div>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold tracking-wide uppercase text-slate-500">Sold Date</span>
              <input type="date" value={draft.soldDate}
                onChange={(e) => updateDraft("soldDate", e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold tracking-wide uppercase text-slate-500">Sold By</span>
              <Select options={collectByOptions}
                value={collectByOptions.find((o) => o.value === draft.soldById) || null}
                onChange={(s) => updateDraft("soldById", s?.value || "")}
                placeholder="Select user" isClearable className="text-sm" classNamePrefix="react-select" />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { field: "botMessage", label: "Bot Message" },
              { field: "interested", label: "Interested" },
              { field: "saleDone", label: "Sale Done" },
            ].map(({ field, label }) => (
              <label key={field} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <input type="checkbox" checked={draft[field]}
                  onChange={(e) => updateDraft(field, e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                {label}
              </label>
            ))}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wide uppercase text-slate-500">Notes</span>
            <textarea rows={4} placeholder="Optional notes about this activity..." value={draft.note}
              onChange={(e) => updateDraft("note", e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
          </label>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit"
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700">
              Save Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
