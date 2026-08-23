"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SelectBase from "react-select";
import { Check, Pencil, X } from "lucide-react";
import { getMenuPortalTarget, sharedSelectStyles } from "./sales-team-activity/selectConfig";

const Select = (props) => (
  <SelectBase
    {...props}
    menuPortalTarget={getMenuPortalTarget()}
    menuPosition="fixed"
    styles={inlineSelectStyles}
  />
);

const inlineSelectStyles = {
  ...sharedSelectStyles,
  control: (base, state) => ({
    ...sharedSelectStyles.control(base, state),
    minHeight: 32,
    fontSize: 13,
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 6px",
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: 30,
  }),
  menuPortal: (base) => ({ ...base, zIndex: 90 }),
};

const getSeriousnessEditValue = (customer, options = []) => {
  const value = customer?.client_seriousness;
  if (value && typeof value === "object" && value.md_id != null) {
    return String(value.md_id);
  }
  if (value != null && value !== "" && typeof value !== "object") {
    return String(value);
  }
  const display = customer?.client_seriousness_display;
  if (display) {
    const matched = options.find((opt) => String(opt.label) === String(display));
    if (matched) return String(matched.value);
  }
  return "";
};

const getAttitudeEditValues = (customer) => {
  const raw = customer?.client_attitude;
  if (raw == null || raw === "") return [];
  if (typeof raw === "object" && raw.md_id != null) return [String(raw.md_id)];
  return String(raw)
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
};

export const InlineSeriousnessCell = ({
  customer,
  canEdit,
  options,
  displayValue,
  saving,
  onSave,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!editing) setDraft(getSeriousnessEditValue(customer, options));
  }, [customer, options, editing]);

  if (!canEdit) {
    return <span>{displayValue}</span>;
  }

  if (editing) {
    const selected = options.find((opt) => String(opt.value) === String(draft)) || null;
    return (
      <div className="flex items-start gap-1 min-w-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex-1 min-w-[120px]">
          <Select
            isClearable
            isDisabled={saving}
            options={options}
            value={selected}
            onChange={(option) => setDraft(option?.value ? String(option.value) : "")}
            placeholder="Select"
            className="text-sm"
            classNamePrefix="react-select"
          />
        </div>
        <button
          type="button"
          disabled={saving}
          className="inline-flex items-center justify-center w-6 h-6 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          onClick={() => onSave(draft, () => setEditing(false))}
          title="Save"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          disabled={saving}
          className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50"
          onClick={() => setEditing(false)}
          title="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="group/inline w-full text-left inline-flex items-center gap-1.5 hover:text-indigo-700"
      onClick={() => {
        setDraft(getSeriousnessEditValue(customer, options));
        setEditing(true);
      }}
      title="Click to edit"
    >
      <span className="truncate">{displayValue}</span>
      <Pencil className="w-3 h-3 shrink-0 opacity-0 group-hover/inline:opacity-60" />
    </button>
  );
};

export const InlineAttitudeCell = ({
  customer,
  canEdit,
  options,
  displayValue,
  saving,
  onSave,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState([]);

  useEffect(() => {
    if (!editing) setDraft(getAttitudeEditValues(customer));
  }, [customer, editing]);

  const selected = useMemo(
    () => options.filter((opt) => draft.map(String).includes(String(opt.value))),
    [options, draft]
  );

  if (!canEdit) {
    return <span>{displayValue}</span>;
  }

  if (editing) {
    return (
      <div className="flex items-start gap-1 min-w-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex-1 min-w-[140px]">
          <Select
            isMulti
            isDisabled={saving}
            options={options}
            value={selected}
            onChange={(selectedOptions) => setDraft((selectedOptions || []).map((opt) => String(opt.value)))}
            placeholder="Select"
            className="text-sm"
            classNamePrefix="react-select"
          />
        </div>
        <button
          type="button"
          disabled={saving}
          className="inline-flex items-center justify-center w-6 h-6 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          onClick={() => onSave(draft.join(","), () => setEditing(false))}
          title="Save"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          disabled={saving}
          className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50"
          onClick={() => setEditing(false)}
          title="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="group/inline w-full text-left inline-flex items-center gap-1.5 hover:text-indigo-700"
      onClick={() => {
        setDraft(getAttitudeEditValues(customer));
        setEditing(true);
      }}
      title="Click to edit"
    >
      <span className="truncate">{displayValue}</span>
      <Pencil className="w-3 h-3 shrink-0 opacity-0 group-hover/inline:opacity-60" />
    </button>
  );
};

export const InlineNoteCell = ({
  customer,
  canEdit,
  saving,
  onSave,
  isExpanded,
  onToggleExpand,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const textareaRef = useRef(null);

  const description = customer?.description || "";
  const activityNote = customer?.latest_activity?.note || "";
  const hasContent = description || activityNote;
  const needsToggle = (description?.length ?? 0) + (activityNote?.length ?? 0) > 80;

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(draft.length, draft.length);
    }
  }, [editing, draft.length]);

  if (!canEdit && !hasContent) {
    return <span className="text-gray-400">-</span>;
  }

  if (editing) {
    return (
      <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
        <textarea
          ref={textareaRef}
          value={draft}
          disabled={saving}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          className="w-full min-w-[160px] border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
          placeholder="Enter note / description"
        />
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={saving}
            className="inline-flex items-center justify-center w-6 h-6 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            onClick={() => onSave(draft, () => setEditing(false))}
            title="Save"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={saving}
            className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50"
            onClick={() => setEditing(false)}
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        className={`group/inline w-full text-left ${canEdit ? "hover:text-indigo-700" : ""}`}
        onClick={() => {
          if (!canEdit) return;
          setDraft(description);
          setEditing(true);
        }}
        title={canEdit ? "Click to edit description" : undefined}
        disabled={!canEdit}
      >
        {!hasContent ? (
          <span className="text-gray-400 inline-flex items-center gap-1">
            - {canEdit ? <Pencil className="w-3 h-3 opacity-40" /> : null}
          </span>
        ) : (
          <div>
            {description ? (
              <div className={`text-gray-700 ${!isExpanded && needsToggle ? "line-clamp-2" : ""}`}>
                <span className="font-medium">Description:</span> {description}
                {canEdit ? <Pencil className="w-3 h-3 inline ml-1 opacity-0 group-hover/inline:opacity-60" /> : null}
              </div>
            ) : canEdit ? (
              <div className="text-gray-400 text-xs inline-flex items-center gap-1">
                Add description <Pencil className="w-3 h-3 opacity-40" />
              </div>
            ) : null}
            {activityNote ? (
              <div className={`text-gray-500 ${!isExpanded && needsToggle ? "line-clamp-2" : ""} ${description ? "mt-1" : ""}`}>
                <span className="font-medium">Note:</span> {activityNote}
              </div>
            ) : null}
          </div>
        )}
      </button>
      {needsToggle && hasContent ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          className="text-blue-500 text-xs hover:underline"
        >
          {isExpanded ? "less" : "more"}
        </button>
      ) : null}
    </div>
  );
};
