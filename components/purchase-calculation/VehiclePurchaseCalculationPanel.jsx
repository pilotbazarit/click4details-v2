"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import PurchasePaymentService from "@/services/PurchasePaymentService";
import PresetSuggestionService from "@/services/PresetSuggestionService";
import SystemDocumentService from "@/services/SystemDocumentService";
import { formatPrice } from "@/helpers/functions";

const CALCULATION_TYPES = ["exporter", "importer", "dealer", "retailer", "seller"];
const CURRENCIES = ["BDT", "USD", "YEN"];
// same preset-suggestion buckets the vehicle form's costing rows use
const PURCHASE_EXPENDITURE_SUGGESTION_TYPE_ID = 476;
const OTHER_CHARGES_SUGGESTION_TYPE_ID = 477;
// same reference tax document used by the vehicle form's "BD Tax Doc" button
const SYSTEM_DOC_TYPE_ID = 475;

const formatAmount = (value) => {
  if (value === null || value === undefined || value === "") return "0.00";
  return formatPrice(Number(value).toFixed(2));
};

const getPresetSuggestionRows = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

// ---- amount-field magnitude suggestions (same idea as the vehicle pricing
// form's Purchase Price / Tax / Other Charges inputs): typing "5" suggests
// 5 / 50 / 500 / 5,000 / 50,000 so staff can quickly pick the right scale ----
const formatIndianNumber = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const digits = raw.replace(/\D+/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("en-IN").format(Number(digits));
};

const numberWordsUnderTwenty = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const numberWordsTens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const numberToWordsBelowThousand = (num) => {
  if (num < 20) return numberWordsUnderTwenty[num];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return unit ? `${numberWordsTens[ten]} ${numberWordsUnderTwenty[unit]}` : numberWordsTens[ten];
  }
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  return remainder
    ? `${numberWordsUnderTwenty[hundred]} Hundred ${numberToWordsBelowThousand(remainder)}`
    : `${numberWordsUnderTwenty[hundred]} Hundred`;
};

const numberToIndianWords = (value) => {
  const numeric = Number(String(value).replace(/\D+/g, ""));
  if (!numeric) return "";
  if (numeric < 1000) return numberToWordsBelowThousand(numeric);
  const parts = [];
  const units = [
    { value: 10000000, label: "Crore" },
    { value: 100000, label: "Lakh" },
    { value: 1000, label: "Thousand" },
  ];
  let remaining = numeric;
  units.forEach((unit) => {
    if (remaining >= unit.value) {
      const count = Math.floor(remaining / unit.value);
      parts.push(`${numberToIndianWords(count)} ${unit.label}`);
      remaining %= unit.value;
    }
  });
  if (remaining > 0) parts.push(numberToWordsBelowThousand(remaining));
  return parts.join(" ").replace(/\s+/g, " ").trim();
};

const buildAmountOptions = (baseValue) => {
  if (baseValue === null || baseValue === undefined) return [];
  const normalized = String(baseValue).split(".")[0].replace(/\D+/g, "").trim();
  if (normalized.length === 0 || normalized.startsWith("0") || !/^\d+$/.test(normalized)) return [];
  return Array.from({ length: 5 }, (_, i) => {
    const value = `${normalized}${"0".repeat(i)}`;
    return { value, label: formatIndianNumber(value), words: numberToIndianWords(value) };
  });
};

const getCurrentMonthDateRange = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const format = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return {
    fromDate: format(new Date(now.getFullYear(), now.getMonth(), 1)),
    toDate: format(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };
};

const emptyNewRow = { date: "", reason: "", amount: "", conv_rate: "", toAmount: "", lastEditedSide: "from", docs: [] };

// rows with differing from/to currencies get two directly-editable amount
// fields (from-currency + to-currency) kept in sync via the conversion rate.
// `lastEditedSide` remembers which amount field the user actually typed into
// ("from" or "to") so that editing the rate always recomputes the *other*
// field from that anchor - without it, once both fields hold a value, a
// naive "recompute whichever is non-empty" rule flips direction on every
// keystroke and the anchor field drifts as the rate is typed digit by digit.
const applyRowFieldChange = (row, field, value) => {
  const rate = field === "conv_rate" ? Number(value) : Number(row.conv_rate);

  if (field === "amount") {
    const toAmount = value === "" ? "" : rate > 0 ? (Number(value) * rate).toFixed(2) : row.toAmount;
    return { ...row, amount: value, toAmount, lastEditedSide: "from" };
  }

  if (field === "toAmount") {
    const amount = value === "" ? "" : rate > 0 ? (Number(value) / rate).toFixed(2) : row.amount;
    return { ...row, toAmount: value, amount, lastEditedSide: "to" };
  }

  // field === "conv_rate": recompute the non-anchor field from the anchor,
  // never touch the field the user is actively treating as the source
  const next = { ...row, conv_rate: value };
  if (rate > 0) {
    if (row.lastEditedSide === "to" && row.toAmount !== "") {
      next.amount = (Number(row.toAmount) / rate).toFixed(2);
    } else if (row.amount !== "") {
      next.toAmount = (Number(row.amount) * rate).toFixed(2);
    }
  }
  return next;
};

const CostingSection = ({
  calculation,
  section,
  title,
  suggestionTypeId,
  canCreate,
  canUpdate,
  canDelete,
  onChanged,
  className = "mt-4",
}) => {
  const [newRow, setNewRow] = useState(emptyNewRow);
  const [savingRow, setSavingRow] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editRow, setEditRow] = useState(emptyNewRow);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionTarget, setSuggestionTarget] = useState(null); // 'new' | itemId
  const [suggestionAnchorRect, setSuggestionAnchorRect] = useState(null);
  const suggestionTimeoutRef = useRef(null);
  const suggestionRequestRef = useRef(0);
  const fileInputRef = useRef(null);
  const suggestionInputRef = useRef(null); // tracks the active reason input for scroll repositioning
  const [amountDropdownTarget, setAmountDropdownTarget] = useState(null); // 'new' | itemId
  const [amountAnchorRect, setAmountAnchorRect] = useState(null);
  const amountInputRef = useRef(null); // tracks the active amount input for scroll repositioning
  const [isTaxDocDownloading, setIsTaxDocDownloading] = useState(false);

  const sameCurrency = calculation.vpc_from_currency === calculation.vpc_to_currency;
  // any differing currency pair (BDT/USD/YEN, either direction) gets the
  // two-way editable amount fields
  const dualCurrency = !sameCurrency;
  const items = (calculation.items || []).filter((item) => item.vpci_section === section);
  const summary = calculation.summary || {};
  const totalAmount = section === "purchase_costing" ? summary.purchase_costing_amount : summary.other_costing_amount;
  const totalConv = section === "purchase_costing" ? summary.purchase_costing_total : summary.other_costing_total;
  const paid = section === "purchase_costing" ? summary.purchase_costing_paid : summary.other_costing_paid;
  const due = section === "purchase_costing" ? summary.purchase_costing_due : summary.other_costing_due;

  const fetchSuggestions = useCallback(
    (query, target) => {
      const trimmed = String(query ?? "").trim();
      setSuggestionTarget(target);
      if (trimmed.length < 1) {
        setSuggestions([]);
        return;
      }

      if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
      suggestionTimeoutRef.current = setTimeout(async () => {
        const requestId = suggestionRequestRef.current + 1;
        suggestionRequestRef.current = requestId;
        try {
          const response = await PresetSuggestionService.Queries.getPresetSuggestionList({
            _suggestion: trimmed,
            _type_id: suggestionTypeId,
          });
          if (suggestionRequestRef.current !== requestId) return;
          const rows = getPresetSuggestionRows(response);
          const next = Array.from(
            new Map(
              rows
                .map((item, index) => {
                  const suggestion = String(item?.ps_suggestion || "").trim();
                  if (!suggestion) return null;
                  return [suggestion.toLowerCase(), { id: item?.ps_id || `${suggestion}-${index}`, label: suggestion }];
                })
                .filter(Boolean)
            ).values()
          );
          setSuggestions(next);
        } catch {
          if (suggestionRequestRef.current === requestId) setSuggestions([]);
        }
      }, 350);
    },
    [suggestionTypeId]
  );

  const clearSuggestions = () => {
    setSuggestions([]);
    setSuggestionTarget(null);
    setSuggestionAnchorRect(null);
    suggestionInputRef.current = null;
  };

  // Reposition the reason suggestion dropdown on scroll/resize
  useEffect(() => {
    if (!suggestionTarget) return;
    const updateRect = () => {
      if (suggestionInputRef.current) {
        setSuggestionAnchorRect(suggestionInputRef.current.getBoundingClientRect());
      }
    };
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [suggestionTarget]);

  // Reposition the amount suggestion dropdown on scroll/resize
  useEffect(() => {
    if (!amountDropdownTarget) return;
    const updateRect = () => {
      if (amountInputRef.current) {
        setAmountAnchorRect(amountInputRef.current.getBoundingClientRect());
      }
    };
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [amountDropdownTarget]);

  // downloads this month's reference BD tax document - same source as the
  // vehicle pricing form's "Tax (BDT) / BD Tax Doc" button
  const handleViewTaxDoc = async () => {
    if (isTaxDocDownloading) return;
    setIsTaxDocDownloading(true);
    const toastId = "purchase-calc-tax-doc";
    try {
      toast.loading("Preparing tax document...", { id: toastId });
      const { fromDate, toDate } = getCurrentMonthDateRange();
      const response = await SystemDocumentService.Queries.getSystemDocuments({
        _page: 1,
        _perPage: 1,
        _type_id: SYSTEM_DOC_TYPE_ID,
        _from_date: fromDate,
        _to_date: toDate,
      });
      const documentItem = response?.data?.data?.[0];
      const documentFile = documentItem?.sd_docs?.[0];
      const url = documentFile?.url || documentFile?.secure_url;
      if (!url) {
        throw new Error("No tax document found for this month.");
      }
      window.open(url, "_blank", "noopener,noreferrer");
      toast.success("Tax document opened.", { id: toastId });
    } catch (error) {
      toast.error(error?.message || "Failed to load tax document.", { id: toastId });
    } finally {
      setIsTaxDocDownloading(false);
    }
  };

  const buildFormData = (row, includeSection = true) => {
    const formData = new FormData();
    if (includeSection) formData.append("section", section);
    if (row.date) formData.append("date", row.date);
    formData.append("reason", row.reason || "");
    formData.append("amount", row.amount || "");
    if (!sameCurrency && row.conv_rate) formData.append("conv_rate", row.conv_rate);
    (row.docs || []).forEach((file) => formData.append("docs[]", file));
    return formData;
  };

  const handleAddRow = async () => {
    if (!newRow.reason.trim() || !newRow.amount) {
      toast.error("Reason and amount are required.");
      return;
    }
    if (!sameCurrency && !newRow.conv_rate) {
      toast.error("Conversion rate is required.");
      return;
    }

    try {
      setSavingRow(true);
      await PurchasePaymentService.Commands.addCostingItem(calculation.vpc_id, buildFormData(newRow));
      setNewRow(emptyNewRow);
      if (fileInputRef.current) fileInputRef.current.value = "";
      clearSuggestions();
      toast.success("Row added.");
      onChanged?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to add row");
    } finally {
      setSavingRow(false);
    }
  };

  const handleStartEdit = (item) => {
    setEditingItemId(item.vpci_id);
    setEditRow({
      date: item.vpci_date ? String(item.vpci_date).slice(0, 10) : "",
      reason: item.vpci_reason || "",
      amount: item.vpci_amount || "",
      conv_rate: item.vpci_conv_rate || "",
      toAmount: item.vpci_conv_amount || "",
      lastEditedSide: "from",
      docs: [],
    });
  };

  const handleSaveEdit = async () => {
    if (!sameCurrency && !editRow.conv_rate) {
      toast.error("Conversion rate is required.");
      return;
    }

    try {
      setSavingRow(true);
      await PurchasePaymentService.Commands.updateCostingItem(editingItemId, buildFormData(editRow, false));
      setEditingItemId(null);
      clearSuggestions();
      toast.success("Row updated.");
      onChanged?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to update row");
    } finally {
      setSavingRow(false);
    }
  };

  const handleDeleteRow = async (item) => {
    const result = await Swal.fire({
      title: "Delete this row?",
      text: `${item.vpci_reason} — ${formatAmount(item.vpci_conv_amount)} ${calculation.vpc_to_currency}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f766e",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;

    try {
      await PurchasePaymentService.Commands.deleteCostingItem(item.vpci_id);
      toast.success("Row deleted.");
      onChanged?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to delete row");
    }
  };

  const renderSuggestionList = (target, applyValue) =>
    suggestionTarget === target &&
    suggestions.length > 0 &&
    suggestionAnchorRect && (
      <div
        style={{
          position: "fixed",
          top: suggestionAnchorRect.bottom + 2,
          left: suggestionAnchorRect.left,
          width: Math.max(suggestionAnchorRect.width, 200),
          zIndex: 9999,
        }}
        className="bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto"
      >
        {suggestions.map((s) => (
          <button
            key={s.id}
            type="button"
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-teal-50"
            onMouseDown={(e) => {
              e.preventDefault();
              applyValue(s.label);
              clearSuggestions();
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    );

  const renderAmountSuggestionList = (target, currentValue, applyValue) =>
    amountDropdownTarget === target &&
    buildAmountOptions(currentValue).length > 0 &&
    amountAnchorRect && (
      <div
        style={{
          position: "fixed",
          top: amountAnchorRect.bottom + 2,
          left: amountAnchorRect.left,
          width: Math.max(amountAnchorRect.width, 220),
          zIndex: 9999,
        }}
        className="bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
      >
        {buildAmountOptions(currentValue).map((option) => (
          <button
            key={option.value}
            type="button"
            className="flex w-full flex-col items-start gap-0.5 border-b border-gray-100 px-3 py-1.5 text-left last:border-b-0 hover:bg-teal-50"
            onMouseDown={(e) => {
              e.preventDefault();
              applyValue(option.value);
              setAmountDropdownTarget(null);
              setAmountAnchorRect(null);
              amountInputRef.current = null;
            }}
          >
            <span className="text-xs font-semibold text-gray-900">{option.label}</span>
            <span className="text-[11px] text-gray-500">{option.words}</span>
          </button>
        ))}
      </div>
    );

  const sectionColor = section === "purchase_costing" ? "border-blue-200 bg-blue-50/30" : "border-amber-200 bg-amber-50/30";
  const sectionTitleColor = section === "purchase_costing" ? "text-blue-700" : "text-amber-700";

  return (
    <div className={`${className} rounded-lg border ${sectionColor} p-4`}>
      <div className="flex items-center justify-center gap-3 mb-3">
        <h4 className={`text-sm font-bold uppercase tracking-wide ${sectionTitleColor}`}>{title}</h4>
        {section === "purchase_costing" && (
          <button
            type="button"
            onClick={handleViewTaxDoc}
            disabled={isTaxDocDownloading}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
            title="View this month's reference BD Tax document"
          >
            {isTaxDocDownloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            BD Tax Doc
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-md border border-gray-300 bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-300 text-left">
              <th className="px-3 py-2 border-r border-gray-200 w-[110px]">Date</th>
              <th className="px-3 py-2 border-r border-gray-200">Reason</th>
              <th className="px-3 py-2 border-r border-gray-200 text-right">Amount</th>
              {!sameCurrency && <th className="px-3 py-2 border-r border-gray-200 text-right">Conversion Rate</th>}
              <th className="px-3 py-2 border-r border-gray-200 text-right">Conversion Amount</th>
              <th className="px-3 py-2 border-r border-gray-200">Docs</th>
              <th className="px-3 py-2 text-right w-[80px]"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) =>
              editingItemId === item.vpci_id ? (
                <tr key={item.vpci_id} className="border-b border-gray-200 bg-amber-50/40">
                  <td className="px-2 py-1.5 border-r border-gray-200">
                    <input
                      type="date"
                      className="w-full border rounded px-1.5 py-1 text-xs"
                      value={editRow.date}
                      onChange={(e) => setEditRow({ ...editRow, date: e.target.value })}
                    />
                  </td>
                  <td className="px-2 py-1.5 border-r border-gray-200 relative">
                    <input
                      ref={suggestionInputRef}
                      type="text"
                      className="w-full border rounded px-1.5 py-1 text-xs"
                      value={editRow.reason}
                      onChange={(e) => {
                        suggestionInputRef.current = e.target;
                        setSuggestionAnchorRect(e.target.getBoundingClientRect());
                        setEditRow({ ...editRow, reason: e.target.value });
                        fetchSuggestions(e.target.value, item.vpci_id);
                      }}
                      onBlur={() => setTimeout(clearSuggestions, 150)}
                    />
                    {renderSuggestionList(item.vpci_id, (label) => setEditRow((r) => ({ ...r, reason: label })))}
                  </td>
                  <td className="px-2 py-1.5 border-r border-gray-200 relative">
                    <div className="flex items-center gap-1">
                      <input
                        ref={amountInputRef}
                        type="number"
                        step="0.01"
                        className="w-full border rounded px-1.5 py-1 text-xs text-right"
                        value={editRow.amount}
                        onChange={(e) => {
                          amountInputRef.current = e.target;
                          setAmountAnchorRect(e.target.getBoundingClientRect());
                          setEditRow((r) => applyRowFieldChange(r, "amount", e.target.value));
                          setAmountDropdownTarget(item.vpci_id);
                        }}
                        onFocus={(e) => {
                          amountInputRef.current = e.target;
                          setAmountAnchorRect(e.target.getBoundingClientRect());
                          setAmountDropdownTarget(item.vpci_id);
                        }}
                        onBlur={() => setTimeout(() => { setAmountDropdownTarget(null); setAmountAnchorRect(null); amountInputRef.current = null; }, 150)}
                      />
                      <span className="text-xs text-gray-500">{calculation.vpc_from_currency}</span>
                    </div>
                    {renderAmountSuggestionList(item.vpci_id, editRow.amount, (value) => setEditRow((r) => applyRowFieldChange(r, "amount", value)))}
                  </td>
                  {!sameCurrency && (
                    <td className="px-2 py-1.5 border-r border-gray-200">
                      <input
                        type="number"
                        step="0.000001"
                        className="w-full border rounded px-1.5 py-1 text-xs text-right"
                        value={editRow.conv_rate}
                        onChange={(e) => setEditRow((r) => applyRowFieldChange(r, "conv_rate", e.target.value))}
                      />
                    </td>
                  )}
                  <td className="px-2 py-1.5 border-r border-gray-200 text-right text-xs">
                    {dualCurrency ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          step="0.01"
                          className="w-full border rounded px-1.5 py-1 text-xs text-right"
                          value={editRow.toAmount}
                          onChange={(e) => setEditRow((r) => applyRowFieldChange(r, "toAmount", e.target.value))}
                        />
                        <span className="text-gray-500">{calculation.vpc_to_currency}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        {formatAmount(Number(editRow.amount || 0) * (sameCurrency ? 1 : Number(editRow.conv_rate || 0)))}
                        <span className="text-gray-500">{calculation.vpc_to_currency}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-1.5 border-r border-gray-200">
                    <input
                      type="file"
                      multiple
                      className="text-xs w-32"
                      onChange={(e) => setEditRow({ ...editRow, docs: Array.from(e.target.files || []) })}
                    />
                  </td>
                  <td className="px-2 py-1.5 text-right whitespace-nowrap">
                    <button onClick={handleSaveEdit} disabled={savingRow} className="text-emerald-600 hover:text-emerald-800 mr-2" aria-label="Save row">
                      {savingRow ? <Loader2 size={16} className="animate-spin inline" /> : "✓"}
                    </button>
                    <button onClick={() => setEditingItemId(null)} className="text-gray-500 hover:text-gray-700" aria-label="Cancel edit">
                      <X size={16} className="inline" />
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={item.vpci_id} className="border-b border-gray-200">
                  <td className="px-3 py-2 border-r border-gray-200 text-xs">
                    {item.vpci_date ? String(item.vpci_date).slice(0, 10) : "-"}
                  </td>
                  <td className="px-3 py-2 border-r border-gray-200">{item.vpci_reason}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-right">
                    {formatAmount(item.vpci_amount)} <span className="text-xs text-gray-500">{calculation.vpc_from_currency}</span>
                  </td>
                  {!sameCurrency && (
                    <td className="px-3 py-2 border-r border-gray-200 text-right text-xs">{item.vpci_conv_rate ?? "-"}</td>
                  )}
                  <td className="px-3 py-2 border-r border-gray-200 text-right font-medium">
                    {formatAmount(item.vpci_conv_amount)} <span className="text-xs text-gray-500">{calculation.vpc_to_currency}</span>
                  </td>
                  <td className="px-3 py-2 border-r border-gray-200">
                    {(item.docs || []).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.docs.map((doc, i) => (
                          <a
                            key={i}
                            href={doc?.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                          >
                            <FileText size={12} /> {i + 1}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {canUpdate && (
                      <button onClick={() => handleStartEdit(item)} className="text-blue-600 hover:text-blue-800 mr-2" aria-label="Edit row">
                        <Pencil size={15} className="inline" />
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => handleDeleteRow(item)} className="text-red-600 hover:text-red-800" aria-label="Delete row">
                        <Trash2 size={15} className="inline" />
                      </button>
                    )}
                  </td>
                </tr>
              )
            )}

            {items.length === 0 && (
              <tr className="border-b border-gray-200">
                <td colSpan={sameCurrency ? 6 : 7} className="px-3 py-3 text-center text-gray-400 text-sm">
                  No rows yet.
                </td>
              </tr>
            )}

            {/* add row */}
            {canCreate && (
              <tr className="bg-teal-50/40">
                <td className="px-2 py-1.5 border-r border-gray-200">
                  <input
                    type="date"
                    className="w-full border rounded px-1.5 py-1 text-xs"
                    value={newRow.date}
                    onChange={(e) => setNewRow({ ...newRow, date: e.target.value })}
                  />
                </td>
                <td className="px-2 py-1.5 border-r border-gray-200 relative">
                  <input
                    ref={suggestionInputRef}
                    type="text"
                    placeholder="Enter reason"
                    className="w-full border rounded px-1.5 py-1 text-xs"
                    value={newRow.reason}
                    onChange={(e) => {
                      suggestionInputRef.current = e.target;
                      setSuggestionAnchorRect(e.target.getBoundingClientRect());
                      setNewRow({ ...newRow, reason: e.target.value });
                      fetchSuggestions(e.target.value, "new");
                    }}
                    onBlur={() => setTimeout(clearSuggestions, 150)}
                  />
                  {renderSuggestionList("new", (label) => setNewRow((r) => ({ ...r, reason: label })))}
                </td>
                <td className="px-2 py-1.5 border-r border-gray-200 relative">
                  <div className="flex items-center gap-1">
                    <input
                      ref={amountInputRef}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full border rounded px-1.5 py-1 text-xs text-right"
                      value={newRow.amount}
                      onChange={(e) => {
                        amountInputRef.current = e.target;
                        setAmountAnchorRect(e.target.getBoundingClientRect());
                        setNewRow((r) => applyRowFieldChange(r, "amount", e.target.value));
                        setAmountDropdownTarget("new");
                      }}
                      onFocus={(e) => {
                        amountInputRef.current = e.target;
                        setAmountAnchorRect(e.target.getBoundingClientRect());
                        setAmountDropdownTarget("new");
                      }}
                      onBlur={() => setTimeout(() => { setAmountDropdownTarget(null); setAmountAnchorRect(null); amountInputRef.current = null; }, 150)}
                    />
                    <span className="text-xs text-gray-500">{calculation.vpc_from_currency}</span>
                  </div>
                  {renderAmountSuggestionList("new", newRow.amount, (value) => setNewRow((r) => applyRowFieldChange(r, "amount", value)))}
                </td>
                {!sameCurrency && (
                  <td className="px-2 py-1.5 border-r border-gray-200">
                    <input
                      type="number"
                      step="0.000001"
                      placeholder="0.00"
                      className="w-full border rounded px-1.5 py-1 text-xs text-right"
                      value={newRow.conv_rate}
                      onChange={(e) => setNewRow((r) => applyRowFieldChange(r, "conv_rate", e.target.value))}
                    />
                  </td>
                )}
                <td className="px-2 py-1.5 border-r border-gray-200 text-right text-xs">
                  {dualCurrency ? (
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full border rounded px-1.5 py-1 text-xs text-right"
                        value={newRow.toAmount}
                        onChange={(e) => setNewRow((r) => applyRowFieldChange(r, "toAmount", e.target.value))}
                      />
                      <span className="text-gray-500">{calculation.vpc_to_currency}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-1">
                      {formatAmount(Number(newRow.amount || 0) * (sameCurrency ? 1 : Number(newRow.conv_rate || 0)))}
                      <span className="text-gray-500">{calculation.vpc_to_currency}</span>
                    </div>
                  )}
                </td>
                <td className="px-2 py-1.5 border-r border-gray-200">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="text-xs w-32"
                    onChange={(e) => setNewRow({ ...newRow, docs: Array.from(e.target.files || []) })}
                  />
                </td>
                <td className="px-2 py-1.5 text-right">
                  <button
                    onClick={handleAddRow}
                    disabled={savingRow}
                    className="inline-flex items-center justify-center bg-blue-600 text-white w-7 h-7 rounded-full text-xs hover:bg-blue-700 disabled:opacity-50"
                    aria-label="Save row"
                    title="Save row"
                  >
                    {savingRow ? <Loader2 size={13} className="animate-spin" /> : <Save size={14} />}
                  </button>
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
              <td className="px-3 py-2 border-r border-gray-200"></td>
              <td className="px-3 py-2 border-r border-gray-200">Total</td>
              <td className="px-3 py-2 border-r border-gray-200 text-right">
                {formatAmount(totalAmount)} <span className="text-xs font-normal text-gray-500">{calculation.vpc_from_currency}</span>
              </td>
              {!sameCurrency && <td className="px-3 py-2 border-r border-gray-200"></td>}
              <td className="px-3 py-2 border-r border-gray-200 text-right">
                {formatAmount(totalConv)} <span className="text-xs font-normal text-gray-500">{calculation.vpc_to_currency}</span>
              </td>
              <td className="px-3 py-2 border-r border-gray-200"></td>
              <td className="px-3 py-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* paid/due chips */}
      <div className="flex gap-2 mt-2">
        <span className="px-2 py-1 rounded-full bg-gradient-to-r from-blue-50 to-slate-100 text-blue-800 border border-blue-200 text-xs font-semibold">
          Paid: {formatAmount(paid)} {calculation.vpc_to_currency}
        </span>
        <span className="px-2 py-1 rounded-full bg-gradient-to-r from-slate-100 to-blue-50 text-slate-700 border border-slate-300 text-xs font-semibold">
          Due: {formatAmount(due)} {calculation.vpc_to_currency}
        </span>
      </div>
    </div>
  );
};

const VehiclePurchaseCalculationPanel = ({ vehicleId, canCreate, canUpdate, canDelete, onChanged }) => {
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCalcId, setSelectedCalcId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ type: "", from_currency: "USD", to_currency: "BDT" });
  const [savingCalc, setSavingCalc] = useState(false);

  const fetchCalculations = useCallback(async () => {
    if (!vehicleId) return;
    try {
      setLoading(true);
      const response = await PurchasePaymentService.Queries.getCalculations({ vehicle_id: vehicleId });
      if (response?.status === "success") {
        const list = response.data || [];
        setCalculations(list);
        setSelectedCalcId((current) => {
          if (current && list.some((c) => c.vpc_id === current)) return current;
          const active = list.find((c) => c.vpc_is_active);
          return active?.vpc_id ?? list[0]?.vpc_id ?? null;
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load calculations");
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    setCalculations([]);
    setSelectedCalcId(null);
    setShowAddForm(false);
    fetchCalculations();
  }, [fetchCalculations]);

  const handleCalcChanged = () => {
    fetchCalculations();
    onChanged?.();
  };

  const usedTypes = useMemo(() => calculations.map((c) => c.vpc_type), [calculations]);
  const availableTypes = CALCULATION_TYPES.filter((t) => !usedTypes.includes(t));
  const selectedCalc = calculations.find((c) => c.vpc_id === selectedCalcId) || null;
  const calcHasItems = (selectedCalc?.items || []).length > 0;

  const grandTotal = useMemo(() => {
    if (!selectedCalc?.summary) return null;
    const s = selectedCalc.summary;
    return {
      fixedAmount: s.purchase_costing_amount,
      fixedConv: s.purchase_costing_total,
      otherAmount: s.other_costing_amount,
      otherConv: s.other_costing_total,
      grandAmount: (s.purchase_costing_amount || 0) + (s.other_costing_amount || 0),
      grandConv: (s.purchase_costing_total || 0) + (s.other_costing_total || 0),
    };
  }, [selectedCalc]);

  const handleAddCalculation = async () => {
    if (!addForm.type) {
      toast.error("Select an organization type.");
      return;
    }
    try {
      setSavingCalc(true);
      await PurchasePaymentService.Commands.createCalculation({
        vehicle_id: vehicleId,
        type: addForm.type,
        from_currency: addForm.from_currency,
        to_currency: addForm.to_currency,
      });
      setShowAddForm(false);
      setAddForm({ type: "", from_currency: "USD", to_currency: "BDT" });
      toast.success("Calculation created.");
      handleCalcChanged();
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to create calculation");
    } finally {
      setSavingCalc(false);
    }
  };

  const handleActivate = async (calc) => {
    try {
      await PurchasePaymentService.Commands.activateCalculation(calc.vpc_id);
      toast.success(`${calc.vpc_type} calculation is now active.`);
      handleCalcChanged();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to activate");
    }
  };

  const handleDeleteCalc = async (calc) => {
    const result = await Swal.fire({
      title: "Delete this calculation?",
      text: `All ${calc.vpc_type} costing rows will be removed. Payments must be deleted first.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f766e",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;

    try {
      await PurchasePaymentService.Commands.deleteCalculation(calc.vpc_id);
      toast.success("Calculation deleted.");
      handleCalcChanged();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete calculation");
    }
  };

  if (!vehicleId) return null;

  return (
    <div>
      {loading && (
        <div className="flex items-center gap-2 text-emerald-600 mb-3">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      )}

      {/* type pills to switch between existing calculations for this vehicle */}
      {calculations.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {calculations.map((calc) => (
            <button
              key={calc.vpc_id}
              onClick={() => setSelectedCalcId(calc.vpc_id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition ${selectedCalcId === calc.vpc_id
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-emerald-400"
                }`}
            >
              {calc.vpc_type.charAt(0).toUpperCase() + calc.vpc_type.slice(1)}
              <span className="text-xs opacity-75">
                {calc.vpc_from_currency}→{calc.vpc_to_currency}
              </span>
              {calc.vpc_is_active && (
                <span className={`text-[10px] font-bold uppercase tracking-wide ${selectedCalcId === calc.vpc_id ? "text-white/90" : "text-amber-600"}`}>
                  Active
                </span>
              )}
            </button>
          ))}
          {canCreate && availableTypes.length > 0 && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border border-dashed border-emerald-400 text-emerald-700 hover:bg-emerald-50"
            >
              <Plus size={14} /> Add another
            </button>
          )}
        </div>
      )}

      {/* Organization Type & Currency box - shown for creating the first/next calculation */}
      {(showAddForm || calculations.length === 0) && canCreate && availableTypes.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-4 mb-4">
          <div className="text-center mb-3">
            <h4 className="text-sm font-bold uppercase tracking-wide text-blue-700">Organization Type &amp; Currency</h4>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Select Organization Type</label>
              <select
                className="border rounded px-3 py-2 text-sm bg-white"
                value={addForm.type}
                onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
              >
                <option value="">Select type</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Select Currency Conversion for the Calculator</label>
              <div className="flex items-center gap-2">
                <select
                  className="border rounded px-3 py-2 text-sm bg-white"
                  value={addForm.from_currency}
                  onChange={(e) => setAddForm({ ...addForm, from_currency: e.target.value })}
                >
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="text-gray-500 text-sm">→</span>
                <select
                  className="border rounded px-3 py-2 text-sm bg-white"
                  value={addForm.to_currency}
                  onChange={(e) => setAddForm({ ...addForm, to_currency: e.target.value })}
                >
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <Button onClick={handleAddCalculation} disabled={savingCalc} className="bg-blue-600 text-white hover:bg-blue-700 h-10">
              {savingCalc ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
            </Button>
            {calculations.length > 0 && (
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700 h-10 px-2" aria-label="Cancel">
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* selected calculation detail */}
      {selectedCalc && (
        <div>
          {/* Organization Type & Currency - read only summary once created */}
          <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-4 mb-1">
            <div className="text-center mb-3">
              <h4 className="text-sm font-bold uppercase tracking-wide text-blue-700">Organization Type &amp; Currency</h4>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <span className="text-gray-500">Organization Type: </span>
                  <span className="font-semibold capitalize">{selectedCalc.vpc_type}</span>
                  {selectedCalc.vpc_is_active && (
                    <span className="ml-2 text-[11px] font-semibold uppercase tracking-wide text-amber-600">Active</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-500">Currency Conversion: </span>
                  <span className="font-semibold">{selectedCalc.vpc_from_currency} → {selectedCalc.vpc_to_currency}</span>
                </div>
                {calcHasItems && (
                  <span className="inline-flex items-center justify-between gap-1.5 text-xs text-gray-500">
                    <span>currency locked</span>
                    <Lock size={12} />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {canUpdate && !selectedCalc.vpc_is_active && (
                  <button
                    onClick={() => handleActivate(selectedCalc)}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-amber-400 text-amber-700 hover:bg-amber-50"
                  >
                    Set Active
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDeleteCalc(selectedCalc)}
                    className="inline-flex items-center justify-center p-1.5 rounded border border-red-300 text-red-600 hover:bg-red-50"
                    aria-label="Delete calculation"
                    title="Delete calculation"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <CostingSection
            className="mt-4"
            calculation={selectedCalc}
            section="purchase_costing"
            title="Fixed Cost"
            suggestionTypeId={PURCHASE_EXPENDITURE_SUGGESTION_TYPE_ID}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onChanged={handleCalcChanged}
          />

          <CostingSection
            className="mt-8"
            calculation={selectedCalc}
            section="other_costing"
            title="General Cost"
            suggestionTypeId={OTHER_CHARGES_SUGGESTION_TYPE_ID}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onChanged={handleCalcChanged}
          />

          {/* Grand Total Costing */}
          {grandTotal && (
            <div className="mt-8 rounded-lg border border-indigo-200 overflow-hidden">
              <div className="text-center py-2 bg-indigo-100">
                <h4 className="text-sm font-bold uppercase tracking-wide text-indigo-800">Grand Total Costing</h4>
              </div>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-indigo-50 border-b border-indigo-200">
                    <th className="px-3 py-2 text-left">Section</th>
                    <th className="px-3 py-2 text-right">Total Amount</th>
                    <th className="px-3 py-2 text-right">Total Conversion Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-indigo-100 bg-white">
                    <td className="px-3 py-2">Total Fixed Cost</td>
                    <td className="px-3 py-2 text-right font-medium">
                      {formatAmount(grandTotal.fixedAmount)} {selectedCalc.vpc_from_currency}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      {formatAmount(grandTotal.fixedConv)} {selectedCalc.vpc_to_currency}
                    </td>
                  </tr>
                  <tr className="border-b border-indigo-100 bg-white">
                    <td className="px-3 py-2">Total General Cost</td>
                    <td className="px-3 py-2 text-right font-medium">
                      {formatAmount(grandTotal.otherAmount)} {selectedCalc.vpc_from_currency}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      {formatAmount(grandTotal.otherConv)} {selectedCalc.vpc_to_currency}
                    </td>
                  </tr>
                  <tr className="bg-indigo-600 text-white font-bold">
                    <td className="px-3 py-2.5">Grand Total</td>
                    <td className="px-3 py-2.5 text-right">
                      {formatAmount(grandTotal.grandAmount)} {selectedCalc.vpc_from_currency}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {formatAmount(grandTotal.grandConv)} {selectedCalc.vpc_to_currency}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!loading && calculations.length === 0 && !showAddForm && (
        <p className="text-sm text-gray-500">No purchase calculations yet for this vehicle.</p>
      )}
    </div>
  );
};

export default VehiclePurchaseCalculationPanel;
