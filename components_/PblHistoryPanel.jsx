"use client";

import React, { useEffect, useState } from "react";
import { Clock, Loader2 } from "lucide-react";
import PblHistoryService from "@/services/PblHistoryService";

const ACTION_LABELS = {
  approved: { label: "Approved for PBL sale", color: "bg-green-100 text-green-700" },
  rejected: { label: "Removed from PBL sale", color: "bg-red-100 text-red-700" },
  pbl_expired: { label: "Partnership expired (auto-removed)", color: "bg-amber-100 text-amber-700" },
};

// hl_value comes back double-JSON-encoded (a pre-existing quirk in how
// GeneralService::log() combines with HistoryLog's own 'json' cast) - parse
// defensively and fall back to the raw string if it's ever fixed upstream.
const parseHistoryValue = (value) => {
  if (value && typeof value === "object") return value;
  if (typeof value !== "string") return null;
  try {
    const once = JSON.parse(value);
    if (once && typeof once === "object") return once;
    if (typeof once === "string") return JSON.parse(once);
    return null;
  } catch {
    return null;
  }
};

const PblHistoryPanel = ({ type, id }) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const response = await PblHistoryService.Queries.show(type, id);
        if (!cancelled && response?.status === "success") {
          setHistory(Array.isArray(response.data) ? response.data : []);
        }
      } catch {
        // silently no-op - history is a nice-to-have panel, not critical path
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoaded(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [type, id]);

  if (!id) return null;

  return (
    <div className="mt-4 rounded-md border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Clock className="h-4 w-4" />
        PBL Status History
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading history...
        </div>
      ) : !loaded || history.length === 0 ? (
        <p className="py-2 text-sm text-slate-500">No PBL status changes recorded yet.</p>
      ) : (
        <ul className="space-y-2">
          {history.map((entry) => {
            const meta = ACTION_LABELS[entry.hl_action] || { label: entry.hl_action, color: "bg-slate-100 text-slate-700" };
            const parsedValue = parseHistoryValue(entry.hl_value);
            const changeKey = parsedValue ? Object.keys(parsedValue)[0] : null;
            const change = changeKey ? parsedValue[changeKey] : null;

            return (
              <li key={entry.hl_id} className="flex flex-col gap-1 rounded border border-slate-100 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.color}`}>
                    {meta.label}
                  </span>
                  {change ? (
                    <span className="text-xs text-slate-500">
                      {String(change.old)} &rarr; {String(change.new)}
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-slate-400">
                  {entry.user?.name ? `${entry.user.name} · ` : ""}
                  {entry.hl_created_at ? new Date(entry.hl_created_at).toLocaleString() : ""}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default PblHistoryPanel;
