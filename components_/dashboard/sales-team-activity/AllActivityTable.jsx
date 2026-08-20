"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { CheckboxIcon, FacebookIcon, MessengerIcon } from "./ActivityIcons";
import { EMPTY_TEXT, TABLE_COLUMN_COUNT } from "./constants";
import {
  formatDate, toDisplayValue, toCustomerFieldValue, boolBadgeClass,
  getDataCollectByValue, getFirstVisitByValue, getSecondVisitByValue,
  getThirdVisitByValue, getSoldDateValue, getSoldByValue, getFollowupValue,
  normalizeProfileLevel, normalizeSeriousnessLevel, hasValue,
} from "./activityUtils";

export const AllActivityTable = ({
  loading,
  pagedRows,
  canManageActivityRow,
  selectedActivityIds,
  setSelectedActivityIds,
  selectablePagedRowIds,
  allSelectableRowsChecked,
  someSelectableRowsChecked,
  onEditRow,
  onDeleteRow,
  actionMenuRowId,
  setActionMenuRowId,
}) => {
  const [dropdownPos, setDropdownPos] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!actionMenuRowId) { setDropdownPos(null); return; }
    const close = () => setActionMenuRowId(null);
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, [actionMenuRowId, setActionMenuRowId]);

  const openMenu = (e, rowId) => {
    if (actionMenuRowId === rowId) {
      setActionMenuRowId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
      setActionMenuRowId(rowId);
    }
  };

  const activeRow = pagedRows.find((r) => r.id === actionMenuRowId);
  const showDropdown = mounted && actionMenuRowId && dropdownPos && activeRow && canManageActivityRow(activeRow);

  return (
    <>
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left text-xs uppercase tracking-wider text-gray-600">
            <th className="w-12 px-2 py-2 text-center whitespace-nowrap">
              <input
                type="checkbox"
                checked={allSelectableRowsChecked}
                ref={(el) => { if (el) el.indeterminate = someSelectableRowsChecked; }}
                onChange={(e) => {
                  const shouldSelect = e.target.checked;
                  setSelectedActivityIds((prev) => {
                    if (shouldSelect) return Array.from(new Set([...prev, ...selectablePagedRowIds]));
                    const s = new Set(selectablePagedRowIds);
                    return prev.filter((id) => !s.has(id));
                  });
                }}
                aria-label="Select all rows on current page"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </th>
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Data Collect By</th>
            <th className="px-3 py-2">Customer</th>
            <th className="px-3 py-2">Links</th>
            <th className="px-3 py-2">Followup</th>
            <th className="px-3 py-2">Profile Level</th>
            <th className="px-3 py-2">Seriousness</th>
            <th className="px-3 py-2">Visit Date</th>
            <th className="px-3 py-2">Sold Date</th>
            <th className="px-3 py-2">Sold By</th>
            <th className="w-20 px-2 py-2 text-center whitespace-nowrap">Bot Message</th>
            <th className="w-20 px-2 py-2 text-center whitespace-nowrap">Interested</th>
            <th className="w-20 px-2 py-2 text-center whitespace-nowrap">Sale Done</th>
            <th className="w-14 px-2 py-2 text-center whitespace-nowrap">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {!loading && pagedRows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 align-top">
              <td className="w-12 px-2 py-2 whitespace-nowrap text-center">
                <input
                  type="checkbox"
                  checked={selectedActivityIds.includes(row.id)}
                  disabled={!canManageActivityRow(row)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSelectedActivityIds((prev) => checked ? [...prev, row.id] : prev.filter((id) => id !== row.id));
                  }}
                  aria-label={`Select activity row ${row.id}`}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed"
                />
              </td>
              <td className="px-3 py-2 whitespace-nowrap">{formatDate(row.created_at)}</td>
              <td className="px-3 py-2 whitespace-nowrap">{toDisplayValue(getDataCollectByValue(row))}</td>
              <td className="px-3 py-2">
                <div className="flex flex-col">
                  {row.customer_id ? (
                    <Link href={`/dashboard/customers/${row.customer_id}`} className="text-blue-600 hover:underline whitespace-nowrap">
                      {toCustomerFieldValue(row.client_name)}
                    </Link>
                  ) : (
                    <span className="whitespace-nowrap">{toCustomerFieldValue(row.client_name)}</span>
                  )}
                  <span className="text-xs text-gray-500 whitespace-nowrap">{toCustomerFieldValue(row.phone_number)}</span>
                </div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="inline-flex items-center gap-2">
                  {row.facebook_id_link && (
                    <a href={row.facebook_id_link} target="_blank" rel="noreferrer" className="hover:opacity-80" title="Open Facebook">
                      <FacebookIcon />
                    </a>
                  )}
                  {row.chat_link && (
                    <a href={row.chat_link} target="_blank" rel="noreferrer" className="hover:opacity-80" title="Open Messenger">
                      <MessengerIcon />
                    </a>
                  )}
                  {!row.facebook_id_link && !row.chat_link && <span>{EMPTY_TEXT}</span>}
                </div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">{toDisplayValue(getFollowupValue(row))}</td>
              <td className="px-3 py-2 whitespace-nowrap">{toDisplayValue(normalizeProfileLevel(row.profile_level))}</td>
              <td className="px-3 py-2 whitespace-nowrap">{toDisplayValue(normalizeSeriousnessLevel(row.seriousness_level))}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="flex flex-col text-xs text-gray-700">
                  {row.first_visit_date && (
                    <div className="flex flex-col">
                      <span>V1: {formatDate(row.first_visit_date)}</span>
                      {hasValue(getFirstVisitByValue(row)) && <span className="text-[10px] text-gray-500">{getFirstVisitByValue(row)}</span>}
                    </div>
                  )}
                  {row.second_visit_date && (
                    <div className="flex flex-col">
                      <span>V2: {formatDate(row.second_visit_date)}</span>
                      {hasValue(getSecondVisitByValue(row)) && <span className="text-[10px] text-gray-500">{getSecondVisitByValue(row)}</span>}
                    </div>
                  )}
                  {row.third_visit_date && (
                    <div className="flex flex-col">
                      <span>V3: {formatDate(row.third_visit_date)}</span>
                      {hasValue(getThirdVisitByValue(row)) && <span className="text-[10px] text-gray-500">{getThirdVisitByValue(row)}</span>}
                    </div>
                  )}
                  {!row.first_visit_date && !row.second_visit_date && !row.third_visit_date && <span>{EMPTY_TEXT}</span>}
                </div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">{formatDate(getSoldDateValue(row))}</td>
              <td className="px-3 py-2 whitespace-nowrap">{toDisplayValue(getSoldByValue(row))}</td>
              {[row.bot_message, row.not_interested, row.sale_done].map((val, i) => (
                <td key={i} className="w-20 px-2 py-2 whitespace-nowrap text-center">
                  <span className={`inline-flex items-center justify-center rounded-md border p-1 ${boolBadgeClass(Boolean(val))}`}>
                    <CheckboxIcon checked={Boolean(val)} />
                  </span>
                </td>
              ))}
              <td className="w-14 px-2 py-2 whitespace-nowrap text-center">
                <button
                  type="button"
                  disabled={!canManageActivityRow(row)}
                  onClick={(e) => openMenu(e, row.id)}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-md border ${
                    canManageActivityRow(row)
                      ? "border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                      : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  title="Actions"
                  aria-label="Open row actions"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <circle cx="12" cy="5" r="1.8" />
                    <circle cx="12" cy="12" r="1.8" />
                    <circle cx="12" cy="19" r="1.8" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
          {!loading && pagedRows.length === 0 && (
            <tr><td className="px-3 py-8 text-center text-gray-500" colSpan={TABLE_COLUMN_COUNT}>No report rows found.</td></tr>
          )}
          {loading && (
            <tr><td className="px-3 py-8 text-center text-gray-500" colSpan={TABLE_COLUMN_COUNT}>Loading report data...</td></tr>
          )}
        </tbody>
      </table>

      {showDropdown && createPortal(
        <div
          style={{ position: "fixed", top: dropdownPos.top, right: dropdownPos.right, zIndex: 9999 }}
          className="min-w-[140px] rounded-md border border-slate-200 bg-white py-1 shadow-lg"
        >
          <button type="button" onClick={() => { onEditRow(activeRow); setActionMenuRowId(null); }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50">
            <svg className="h-4 w-4 shrink-0 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
          <button type="button" onClick={() => { onDeleteRow(activeRow); setActionMenuRowId(null); }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-rose-600 hover:bg-rose-50">
            <svg className="h-4 w-4 shrink-0 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            Delete
          </button>
        </div>,
        document.body
      )}
    </>
  );
};
