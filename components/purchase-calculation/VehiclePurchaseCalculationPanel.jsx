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
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import PurchasePaymentService from "@/services/PurchasePaymentService";
import PresetSuggestionService from "@/services/PresetSuggestionService";
import SystemDocumentService from "@/services/SystemDocumentService";
import { formatPrice } from "@/helpers/functions";
import { buildAmountOptions } from "@/helpers/amountSuggestions";

const CALCULATION_TYPES = ["exporter", "importer", "dealer", "retailer", "seller"];
const CURRENCIES = ["BDT", "USD", "YEN"];
// mirrors the backend's FIXED_COST_REASONS constant in VehiclePurchaseCalculationService
const FIXED_COST_REASONS = ["Purchase Price", "Tax", "Vat"];
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

const SIZE_CONFIGS = {
  normal: {
    text: "text-xs",
    headerText: "text-xs font-semibold",
    inputClass: "w-full border rounded px-1.5 py-1 text-xs",
    inputRightClass: "w-full border rounded px-1.5 py-1 text-xs text-right",
    unitText: "text-xs text-gray-500",
    btnSize: "px-2.5 py-1 text-xs",
    iconSize: 13,
    cellPadding: "px-2 py-1.5",
  },
  large: {
    text: "text-sm",
    headerText: "text-sm font-bold",
    inputClass: "w-full border-2 border-gray-300 rounded-md px-2.5 py-1.5 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
    inputRightClass: "w-full border-2 border-gray-300 rounded-md px-2.5 py-1.5 text-sm font-medium text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
    unitText: "text-xs text-gray-600 font-semibold",
    btnSize: "px-3.5 py-1.5 text-sm font-semibold",
    iconSize: 15,
    cellPadding: "px-3 py-2",
  },
  xl: {
    text: "text-base",
    headerText: "text-base font-bold",
    inputClass: "w-full border-2 border-gray-300 rounded-lg px-3.5 py-2 text-base font-semibold focus:border-blue-600 focus:ring-2 focus:ring-blue-500",
    inputRightClass: "w-full border-2 border-gray-300 rounded-lg px-3.5 py-2 text-base font-semibold text-right focus:border-blue-600 focus:ring-2 focus:ring-blue-500",
    unitText: "text-sm text-gray-700 font-bold",
    btnSize: "px-4 py-2 text-base font-bold",
    iconSize: 18,
    cellPadding: "px-4 py-2.5",
  },
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
  sizeMode = "large",
}) => {
  const sz = SIZE_CONFIGS[sizeMode] || SIZE_CONFIGS.large;
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
  const paidFrom = section === "purchase_costing" ? summary.purchase_costing_paid_amount : summary.other_costing_paid_amount;
  const dueFrom = section === "purchase_costing" ? summary.purchase_costing_due_amount : summary.other_costing_due_amount;

  // Fixed Cost reasons are constrained to these 3 values, each usable once
  // per calculation; General Cost stays free text (unchanged)
  const isFixedCost = section === "purchase_costing";
  const usedFixedReasons = isFixedCost
    ? items.map((item) => String(item.vpci_reason || "").trim().toLowerCase())
    : [];
  const availableFixedReasonsForNew = FIXED_COST_REASONS.filter(
    (reason) => !usedFixedReasons.includes(reason.toLowerCase())
  );
  const availableFixedReasonsForEdit = (currentValue) => {
    const options = FIXED_COST_REASONS.filter(
      (reason) => reason.toLowerCase() === String(currentValue || "").trim().toLowerCase() || !usedFixedReasons.includes(reason.toLowerCase())
    );
    // keep a legacy off-list reason selectable so the row stays editable
    if (currentValue && !FIXED_COST_REASONS.some((r) => r.toLowerCase() === String(currentValue).trim().toLowerCase())) {
      return [currentValue, ...options];
    }
    return options;
  };

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
            _type: suggestionTypeId,
            _page: 1,
            _perPage: 15,
          });
          if (suggestionRequestRef.current === requestId) {
            setSuggestions(getPresetSuggestionRows(response));
          }
        } catch {
          if (suggestionRequestRef.current === requestId) setSuggestions([]);
        }
      }, 250);
    },
    [suggestionTypeId]
  );

  const openSuggestions = (inputEl, query, target) => {
    if (inputEl) {
      suggestionInputRef.current = inputEl;
      setSuggestionAnchorRect(inputEl.getBoundingClientRect());
    }
    fetchSuggestions(query, target);
  };

  const closeSuggestions = () => {
    setSuggestions([]);
    setSuggestionTarget(null);
    setSuggestionAnchorRect(null);
    suggestionInputRef.current = null;
  };

  const selectSuggestion = (label) => {
    if (suggestionTarget === "new") {
      setNewRow((r) => ({ ...r, reason: label }));
    } else if (suggestionTarget) {
      setEditRow((r) => ({ ...r, reason: label }));
    }
    closeSuggestions();
  };

  const openAmountDropdown = (inputEl, target) => {
    if (inputEl) {
      amountInputRef.current = inputEl;
      setAmountAnchorRect(inputEl.getBoundingClientRect());
    }
    setAmountDropdownTarget(target);
  };

  const closeAmountDropdown = () => {
    setAmountDropdownTarget(null);
    setAmountAnchorRect(null);
    amountInputRef.current = null;
  };

  const selectAmountOption = (value) => {
    if (amountDropdownTarget === "new") {
      setNewRow((r) => applyRowFieldChange(r, "amount", String(value)));
    } else if (amountDropdownTarget) {
      setEditRow((r) => applyRowFieldChange(r, "amount", String(value)));
    }
    closeAmountDropdown();
  };

  // close dropdowns if clicking anywhere outside or re-anchor on scroll
  useEffect(() => {
    const handleWindowClick = (e) => {
      if (!e.target.closest?.("[data-suggestion-popover]") && !e.target.closest?.("[data-suggestion-input]")) {
        closeSuggestions();
      }
      if (!e.target.closest?.("[data-amount-popover]") && !e.target.closest?.("[data-amount-input]")) {
        closeAmountDropdown();
      }
    };
    const handleScrollOrResize = () => {
      if (suggestionInputRef.current) {
        setSuggestionAnchorRect(suggestionInputRef.current.getBoundingClientRect());
      }
      if (amountInputRef.current) {
        setAmountAnchorRect(amountInputRef.current.getBoundingClientRect());
      }
    };
    window.addEventListener("click", handleWindowClick);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("click", handleWindowClick);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, []);

  const handleDownloadTaxDoc = async () => {
    try {
      setIsTaxDocDownloading(true);
      const res = await SystemDocumentService.Queries.getSystemDocumentList({
        _type: SYSTEM_DOC_TYPE_ID,
        _page: 1,
        _perPage: 1,
      });
      const docs = res?.data?.data || res?.data || [];
      const fileUrl = docs[0]?.doc_file?.url || docs[0]?.doc_file_url || docs[0]?.file_url;
      if (!fileUrl) {
        toast.error("No tax document found.");
        return;
      }
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Failed to fetch tax document.");
    } finally {
      setIsTaxDocDownloading(false);
    }
  };

  const handleStartEdit = (item) => {
    setEditingItemId(item.vpci_id);
    const amountVal = item.vpci_amount !== null && item.vpci_amount !== undefined ? String(item.vpci_amount) : "";
    const toAmountVal = item.vpci_total_amount !== null && item.vpci_total_amount !== undefined ? String(item.vpci_total_amount) : "";
    setEditRow({
      date: item.vpci_date || "",
      reason: item.vpci_reason || "",
      amount: amountVal,
      conv_rate: item.vpci_conversion_rate !== null && item.vpci_conversion_rate !== undefined ? String(item.vpci_conversion_rate) : "",
      toAmount: toAmountVal,
      lastEditedSide: "from",
      docs: [],
    });
    closeSuggestions();
    closeAmountDropdown();
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditRow(emptyNewRow);
    closeSuggestions();
    closeAmountDropdown();
  };

  const buildFormData = (row) => {
    const fd = new FormData();
    fd.append("section", section);
    if (row.date) fd.append("date", row.date);
    if (row.reason) fd.append("reason", row.reason);

    const cleanAmount = String(row.amount ?? "").replace(/,/g, "").trim();
    const cleanRate = String(row.conv_rate ?? "").replace(/,/g, "").trim();
    const cleanToAmount = String(row.toAmount ?? "").replace(/,/g, "").trim();

    if (cleanAmount !== "") fd.append("amount", cleanAmount);
    if (cleanRate !== "") {
      fd.append("conv_rate", cleanRate);
      fd.append("conversion_rate", cleanRate);
    }
    if (cleanToAmount !== "") fd.append("total_amount", cleanToAmount);
    (row.docs || []).forEach((file) => fd.append("docs[]", file));
    return fd;
  };

  const handleAddRow = async () => {
    if (!newRow.reason) {
      toast.error(isFixedCost ? "Select a fixed cost reason." : "Reason is required.");
      return;
    }
    if (newRow.amount === "" && newRow.toAmount === "") {
      toast.error("Amount is required.");
      return;
    }
    try {
      setSavingRow(true);
      await PurchasePaymentService.Commands.addItem(calculation.vpc_id, buildFormData(newRow));
      setNewRow(emptyNewRow);
      closeSuggestions();
      closeAmountDropdown();
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Costing row added.");
      onChanged?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to add row");
    } finally {
      setSavingRow(false);
    }
  };

  const handleSaveEdit = async (itemId) => {
    if (!editRow.reason) {
      toast.error(isFixedCost ? "Select a fixed cost reason." : "Reason is required.");
      return;
    }
    if (editRow.amount === "" && editRow.toAmount === "") {
      toast.error("Amount is required.");
      return;
    }
    try {
      setSavingRow(true);
      const fd = buildFormData(editRow);
      fd.append("_method", "PUT");
      await PurchasePaymentService.Commands.updateItem(itemId, fd);
      setEditingItemId(null);
      setEditRow(emptyNewRow);
      closeSuggestions();
      closeAmountDropdown();
      toast.success("Costing row updated.");
      onChanged?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to update row");
    } finally {
      setSavingRow(false);
    }
  };

  const handleDeleteRow = async (item) => {
    const result = await Swal.fire({
      title: "Delete costing row?",
      text: `${item.vpci_reason || "This row"} will be removed. Payments must be deleted first.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f766e",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;

    try {
      await PurchasePaymentService.Commands.deleteItem(item.vpci_id);
      toast.success("Costing row deleted.");
      onChanged?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete row");
    }
  };

  const popoverPositionStyle = (rect, width = 240) => {
    if (!rect) return { display: "none" };
    return {
      position: "fixed",
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${Math.max(rect.width, width)}px`,
      zIndex: 9999,
    };
  };

  const showReasonDropdown = Boolean(suggestionTarget && suggestionAnchorRect && suggestions.length > 0);
  const activeAmountValue =
    amountDropdownTarget === "new"
      ? newRow.amount
      : amountDropdownTarget
      ? editRow.amount
      : "";
  const amountOptions = useMemo(() => buildAmountOptions(activeAmountValue), [activeAmountValue]);
  const showAmountDropdown = Boolean(amountDropdownTarget && amountAnchorRect);

  return (
    <div className={className}>
      {/* section header + optional Tax Doc action */}
      <div className="flex items-center justify-between mb-2">
        <h4 className={`${sz.headerText} font-bold uppercase tracking-wide text-gray-700`}>{title}</h4>
        {isFixedCost && (
          <button
            type="button"
            onClick={handleDownloadTaxDoc}
            disabled={isTaxDocDownloading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded border border-blue-400 text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50"
            title="Download Bangladesh Tax Reference Document"
          >
            {isTaxDocDownloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            <span>BD Tax Doc</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white shadow-xs">
        <table className={`min-w-full ${sz.text}`}>
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-gray-700 font-bold">
              <th className={`${sz.cellPadding} text-left`}>Date</th>
              <th className={`${sz.cellPadding} text-left`}>Reason</th>
              {dualCurrency ? (
                <>
                  <th className={`${sz.cellPadding} text-right`}>
                    Amount <span className={sz.unitText}>({calculation.vpc_from_currency})</span>
                  </th>
                  <th className={`${sz.cellPadding} text-right`}>
                    Rate <span className={sz.unitText}>({calculation.vpc_from_currency}→{calculation.vpc_to_currency})</span>
                  </th>
                  <th className={`${sz.cellPadding} text-right`}>
                    Total Amount <span className={sz.unitText}>({calculation.vpc_to_currency})</span>
                  </th>
                </>
              ) : (
                <th className={`${sz.cellPadding} text-right`}>
                  Amount <span className={sz.unitText}>({calculation.vpc_to_currency})</span>
                </th>
              )}
              <th className={`${sz.cellPadding} text-left`}>Attachment</th>
              <th className={`${sz.cellPadding} text-center`}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isEditing = editingItemId === item.vpci_id;
              const hasDocs = Array.isArray(item.docs) && item.docs.length > 0;

              if (isEditing) {
                return (
                  <tr key={item.vpci_id} className="bg-yellow-50/70 border-b border-yellow-200">
                    <td className={sz.cellPadding}>
                      <input
                        type="date"
                        className={sz.inputClass}
                        value={editRow.date}
                        onChange={(e) => setEditRow({ ...editRow, date: e.target.value })}
                      />
                    </td>
                    <td className={sz.cellPadding}>
                      {isFixedCost ? (
                        <select
                          className={sz.inputClass}
                          value={editRow.reason}
                          onChange={(e) => setEditRow({ ...editRow, reason: e.target.value })}
                        >
                          <option value="">Select reason</option>
                          {availableFixedReasonsForEdit(editRow.reason).map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          data-suggestion-input="true"
                          className={sz.inputClass}
                          placeholder="Type or select reason..."
                          value={editRow.reason}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditRow({ ...editRow, reason: val });
                            openSuggestions(e.currentTarget, val, item.vpci_id);
                          }}
                          onFocus={(e) => openSuggestions(e.currentTarget, e.target.value, item.vpci_id)}
                        />
                      )}
                    </td>
                    {dualCurrency ? (
                      <>
                        <td className={sz.cellPadding}>
                          <input
                            type="number"
                            step="any"
                            data-amount-input="true"
                            className={sz.inputRightClass}
                            placeholder="0.00"
                            value={editRow.amount}
                            onChange={(e) => setEditRow((r) => applyRowFieldChange(r, "amount", e.target.value))}
                            onFocus={(e) => openAmountDropdown(e.currentTarget, item.vpci_id)}
                          />
                        </td>
                        <td className={sz.cellPadding}>
                          <input
                            type="number"
                            step="any"
                            className={sz.inputRightClass}
                            placeholder="1.00"
                            value={editRow.conv_rate}
                            onChange={(e) => setEditRow((r) => applyRowFieldChange(r, "conv_rate", e.target.value))}
                          />
                        </td>
                        <td className={sz.cellPadding}>
                          <input
                            type="number"
                            step="any"
                            className={sz.inputRightClass}
                            placeholder="0.00"
                            value={editRow.toAmount}
                            onChange={(e) => setEditRow((r) => applyRowFieldChange(r, "toAmount", e.target.value))}
                          />
                        </td>
                      </>
                    ) : (
                      <td className={sz.cellPadding}>
                        <input
                          type="number"
                          step="any"
                          data-amount-input="true"
                          className={sz.inputRightClass}
                          placeholder="0.00"
                          value={editRow.amount}
                          onChange={(e) => setEditRow((r) => applyRowFieldChange(r, "amount", e.target.value))}
                          onFocus={(e) => openAmountDropdown(e.currentTarget, item.vpci_id)}
                        />
                      </td>
                    )}
                    <td className={sz.cellPadding}>
                      <input
                        type="file"
                        multiple
                        className={`text-gray-500 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:${sz.text} file:bg-gray-100 file:text-gray-700`}
                        onChange={(e) => setEditRow({ ...editRow, docs: Array.from(e.target.files || []) })}
                      />
                    </td>
                    <td className={`${sz.cellPadding} text-center`}>
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(item.vpci_id)}
                          disabled={savingRow}
                          className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                          title="Save"
                        >
                          {savingRow ? <Loader2 size={sz.iconSize} className="animate-spin" /> : <Save size={sz.iconSize} />}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="p-1 rounded text-gray-500 hover:bg-gray-100"
                          title="Cancel"
                        >
                          <X size={sz.iconSize} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={item.vpci_id} className="border-b border-gray-200 hover:bg-gray-50/60">
                  <td className={sz.cellPadding}>{item.vpci_date || "-"}</td>
                  <td className={`${sz.cellPadding} font-medium text-gray-800`}>{item.vpci_reason || "-"}</td>
                  {dualCurrency ? (
                    <>
                      <td className={`${sz.cellPadding} text-right font-medium`}>{formatAmount(item.vpci_amount)}</td>
                      <td className={`${sz.cellPadding} text-right text-gray-500`}>
                        {item.vpci_conversion_rate ? Number(item.vpci_conversion_rate).toFixed(4) : "-"}
                      </td>
                      <td className={`${sz.cellPadding} text-right font-semibold text-gray-900`}>
                        {formatAmount(item.vpci_total_amount)}
                      </td>
                    </>
                  ) : (
                    <td className={`${sz.cellPadding} text-right font-semibold text-gray-900`}>
                      {formatAmount(item.vpci_total_amount ?? item.vpci_amount)}
                    </td>
                  )}
                  <td className={sz.cellPadding}>
                    {hasDocs ? (
                      <div className="flex flex-wrap items-center gap-1">
                        {item.docs.map((doc, idx) => (
                          <a
                            key={doc.id || idx}
                            href={doc.doc_file?.url || doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200"
                            title={doc.title || doc.name || `Document ${idx + 1}`}
                          >
                            <FileText size={11} />
                            <span>{doc.title || `Doc ${idx + 1}`}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className={`${sz.cellPadding} text-center`}>
                    <div className="inline-flex items-center gap-1">
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="p-1 rounded text-blue-600 hover:bg-blue-50"
                          title="Edit"
                        >
                          <Pencil size={sz.iconSize} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(item)}
                          className="p-1 rounded text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={sz.iconSize} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* inline append row for new items */}
            {canCreate && (!isFixedCost || availableFixedReasonsForNew.length > 0) && (
              <tr className="bg-emerald-50/40 border-t-2 border-emerald-300">
                <td className={sz.cellPadding}>
                  <input
                    type="date"
                    className={sz.inputClass}
                    value={newRow.date}
                    onChange={(e) => setNewRow({ ...newRow, date: e.target.value })}
                  />
                </td>
                <td className={sz.cellPadding}>
                  {isFixedCost ? (
                    <select
                      className={sz.inputClass}
                      value={newRow.reason}
                      onChange={(e) => setNewRow({ ...newRow, reason: e.target.value })}
                    >
                      <option value="">Select reason</option>
                      {availableFixedReasonsForNew.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      data-suggestion-input="true"
                      className={sz.inputClass}
                      placeholder="Type or select reason..."
                      value={newRow.reason}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewRow({ ...newRow, reason: val });
                        openSuggestions(e.currentTarget, val, "new");
                      }}
                      onFocus={(e) => openSuggestions(e.currentTarget, e.target.value, "new")}
                    />
                  )}
                </td>
                {dualCurrency ? (
                  <>
                    <td className={sz.cellPadding}>
                      <input
                        type="number"
                        step="any"
                        data-amount-input="true"
                        className={sz.inputRightClass}
                        placeholder="0.00"
                        value={newRow.amount}
                        onChange={(e) => setNewRow((r) => applyRowFieldChange(r, "amount", e.target.value))}
                        onFocus={(e) => openAmountDropdown(e.currentTarget, "new")}
                      />
                    </td>
                    <td className={sz.cellPadding}>
                      <input
                        type="number"
                        step="any"
                        className={sz.inputRightClass}
                        placeholder="1.00"
                        value={newRow.conv_rate}
                        onChange={(e) => setNewRow((r) => applyRowFieldChange(r, "conv_rate", e.target.value))}
                      />
                    </td>
                    <td className={sz.cellPadding}>
                      <input
                        type="number"
                        step="any"
                        className={sz.inputRightClass}
                        placeholder="0.00"
                        value={newRow.toAmount}
                        onChange={(e) => setNewRow((r) => applyRowFieldChange(r, "toAmount", e.target.value))}
                      />
                    </td>
                  </>
                ) : (
                  <td className={sz.cellPadding}>
                    <input
                      type="number"
                      step="any"
                      data-amount-input="true"
                      className={sz.inputRightClass}
                      placeholder="0.00"
                      value={newRow.amount}
                      onChange={(e) => setNewRow((r) => applyRowFieldChange(r, "amount", e.target.value))}
                      onFocus={(e) => openAmountDropdown(e.currentTarget, "new")}
                    />
                  </td>
                )}
                <td className={sz.cellPadding}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    className={`text-gray-500 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:${sz.text} file:bg-gray-100 file:text-gray-700`}
                    onChange={(e) => setNewRow({ ...newRow, docs: Array.from(e.target.files || []) })}
                  />
                </td>
                <td className={`${sz.cellPadding} text-center`}>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    disabled={savingRow}
                    className={`inline-flex items-center gap-1 ${sz.btnSize} rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50`}
                    title="Add row"
                  >
                    {savingRow ? <Loader2 size={sz.iconSize} className="animate-spin" /> : <Plus size={sz.iconSize} />}
                    Add
                  </button>
                </td>
              </tr>
            )}

            {items.length === 0 && (!canCreate || (isFixedCost && availableFixedReasonsForNew.length === 0)) && (
              <tr>
                <td colSpan={dualCurrency ? 6 : 4} className="px-3 py-4 text-center text-gray-400">
                  No {title.toLowerCase()} items added yet.
                </td>
              </tr>
            )}
          </tbody>

          {/* section totals summary */}
          <tfoot>
            <tr className="bg-gray-100 border-t border-gray-300 font-semibold text-gray-800">
              <td colSpan={2} className={`${sz.cellPadding} text-right`}>Total {title}:</td>
              {dualCurrency ? (
                <>
                  <td className={`${sz.cellPadding} text-right`}>
                    {formatAmount(totalAmount)} {calculation.vpc_from_currency}
                  </td>
                  <td className={sz.cellPadding} />
                  <td className={`${sz.cellPadding} text-right font-bold`}>
                    {formatAmount(totalConv)} {calculation.vpc_to_currency}
                  </td>
                </>
              ) : (
                <td className={`${sz.cellPadding} text-right font-bold`}>
                  {formatAmount(totalConv)} {calculation.vpc_to_currency}
                </td>
              )}
              <td colSpan={2} className={sz.cellPadding} />
            </tr>
            <tr className="bg-emerald-50 border-t border-emerald-200 text-emerald-800 font-semibold">
              <td colSpan={2} className={`${sz.cellPadding} text-right`}>Paid:</td>
              {dualCurrency ? (
                <>
                  <td className={`${sz.cellPadding} text-right`}>
                    {formatAmount(paidFrom)} {calculation.vpc_from_currency}
                  </td>
                  <td className={sz.cellPadding} />
                  <td className={`${sz.cellPadding} text-right font-bold`}>
                    {formatAmount(paid)} {calculation.vpc_to_currency}
                  </td>
                </>
              ) : (
                <td className={`${sz.cellPadding} text-right font-bold`}>
                  {formatAmount(paid)} {calculation.vpc_to_currency}
                </td>
              )}
              <td colSpan={2} className={sz.cellPadding} />
            </tr>
            <tr className="bg-rose-50 border-t border-rose-200 text-rose-800 font-semibold">
              <td colSpan={2} className={`${sz.cellPadding} text-right`}>Due:</td>
              {dualCurrency ? (
                <>
                  <td className={`${sz.cellPadding} text-right`}>
                    {formatAmount(dueFrom)} {calculation.vpc_from_currency}
                  </td>
                  <td className={sz.cellPadding} />
                  <td className={`${sz.cellPadding} text-right font-bold`}>
                    {formatAmount(due)} {calculation.vpc_to_currency}
                  </td>
                </>
              ) : (
                <td className={`${sz.cellPadding} text-right font-bold`}>
                  {formatAmount(due)} {calculation.vpc_to_currency}
                </td>
              )}
              <td colSpan={2} className={sz.cellPadding} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* reason autocomplete popover */}
      {showReasonDropdown && (
        <div
          data-suggestion-popover="true"
          style={popoverPositionStyle(suggestionAnchorRect, 260)}
          className="bg-white border border-gray-300 rounded-md shadow-lg max-h-56 overflow-y-auto"
        >
          {suggestions.map((sug) => {
            const label = sug.ps_suggestion || sug.name || sug.title || "";
            return (
              <button
                key={sug.ps_id || label}
                type="button"
                onClick={() => selectSuggestion(label)}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 text-gray-700 border-b border-gray-100 last:border-b-0"
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* amount preset suggestions popover */}
      {showAmountDropdown && (
        <div
          data-amount-popover="true"
          style={popoverPositionStyle(amountAnchorRect, 220)}
          className="bg-white border border-blue-300 rounded-md shadow-xl max-h-60 overflow-y-auto"
        >
          <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border-b border-blue-200">
            Suggested Amounts
          </div>
          {amountOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => selectAmountOption(opt.value)}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 text-gray-700 border-b border-gray-100 last:border-b-0 flex items-center justify-between"
            >
              <span className="font-semibold text-gray-900">{opt.label}</span>
              <span className="text-[11px] text-gray-400">{opt.value.toLocaleString()}</span>
            </button>
          ))}
        </div>
      )}

      {/* Bottom Save button */}
      <div className="flex justify-end mt-2">
        {canCreate && (!isFixedCost || availableFixedReasonsForNew.length > 0) && (
          <button
            type="button"
            onClick={handleAddRow}
            disabled={savingRow}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {savingRow ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Save
          </button>
        )}
      </div>
    </div>
  );
};

const SectionHeader = ({ title, open, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full flex items-center justify-between px-4 py-2 bg-white border-b border-gray-400 text-sm font-bold tracking-wide text-gray-900 hover:bg-gray-50 transition-colors"
  >
    <span className="text-left">{title}</span>
    {open ? <ChevronUp className="w-5 h-5 text-red-600" /> : <ChevronDown className="w-5 h-5 text-red-600" />}
  </button>
);

const VehiclePurchaseCalculationPanel = ({ vehicleId, canCreate, canUpdate, canDelete, onChanged, refreshSignal }) => {
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCalcId, setSelectedCalcId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ type: "", from_currency: "USD", to_currency: "BDT" });
  const [savingCalc, setSavingCalc] = useState(false);
  const [sizeMode, setSizeMode] = useState("large"); // 'normal' | 'large' | 'xl'
  const [orgTypeOpen, setOrgTypeOpen] = useState(true);
  const [fixedGenCostOpen, setFixedGenCostOpen] = useState(true);
  const [grandTotalOpen, setGrandTotalOpen] = useState(true);
  const [orgWiseSummaryOpen, setOrgWiseSummaryOpen] = useState(true);

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

  // a payment made elsewhere (the Payment Section's modal) changes this
  // panel's paid/due figures - re-fetch without resetting the current tab
  useEffect(() => {
    if (refreshSignal === undefined || refreshSignal === 0) return;
    fetchCalculations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal]);

  const handleCalcChanged = () => {
    fetchCalculations();
    onChanged?.();
  };

  const usedTypes = useMemo(() => calculations.map((c) => c.vpc_type), [calculations]);
  const availableTypes = CALCULATION_TYPES.filter((t) => !usedTypes.includes(t));
  const selectedCalc = calculations.find((c) => c.vpc_id === selectedCalcId) || null;
  const calcHasItems = (selectedCalc?.items || []).length > 0;

  // Selected calculation single summary
  const grandTotal = useMemo(() => {
    if (!selectedCalc?.summary) return null;
    const s = selectedCalc.summary;
    const isLocked = selectedCalc.general_cost_locked;
    const fixedAmount = s.purchase_costing_amount || 0;
    const fixedConv = s.purchase_costing_total || 0;
    const otherAmount = isLocked ? 0 : (s.other_costing_amount || 0);
    const otherConv = isLocked ? 0 : (s.other_costing_total || 0);
    const grandAmount = fixedAmount + otherAmount;
    const grandConv = fixedConv + otherConv;
    const paidConv = (s.purchase_costing_paid || 0) + (isLocked ? 0 : (s.other_costing_paid || 0));
    const dueConv = (s.purchase_costing_due || 0) + (isLocked ? 0 : (s.other_costing_due || 0));
    const paidAmount = (s.purchase_costing_paid_amount || 0) + (isLocked ? 0 : (s.other_costing_paid_amount || 0));
    const dueAmount = (s.purchase_costing_due_amount || 0) + (isLocked ? 0 : (s.other_costing_due_amount || 0));

    return {
      fixedAmount,
      fixedConv,
      otherAmount,
      otherConv,
      grandAmount,
      grandConv,
      paidConv,
      dueConv,
      paidAmount,
      dueAmount,
    };
  }, [selectedCalc]);

  // Organization type wise calculations summary
  const allCalcsSummary = useMemo(() => {
    return calculations.map((calc) => {
      const s = calc.summary || {};
      const isLocked = calc.general_cost_locked;
      const fixedAmount = s.purchase_costing_amount || 0;
      const fixedConv = s.purchase_costing_total || 0;
      const otherAmount = isLocked ? 0 : (s.other_costing_amount || 0);
      const otherConv = isLocked ? 0 : (s.other_costing_total || 0);
      const totalAmount = fixedAmount + otherAmount;
      const totalConv = fixedConv + otherConv;
      const paidConv = (s.purchase_costing_paid || 0) + (isLocked ? 0 : (s.other_costing_paid || 0));
      const dueConv = (s.purchase_costing_due || 0) + (isLocked ? 0 : (s.other_costing_due || 0));

      return {
        calcId: calc.vpc_id,
        type: calc.vpc_type,
        isActive: calc.vpc_is_active,
        fromCurrency: calc.vpc_from_currency,
        toCurrency: calc.vpc_to_currency,
        locked: isLocked,
        fixedAmount,
        fixedConv,
        otherAmount,
        otherConv,
        totalAmount,
        totalConv,
        paidConv,
        dueConv,
      };
    });
  }, [calculations]);

  // Net Grand Total across all organization types
  const netGrandTotals = useMemo(() => {
    return allCalcsSummary.reduce(
      (acc, curr) => {
        acc.fixedConv += curr.fixedConv;
        acc.otherConv += curr.otherConv;
        acc.totalConv += curr.totalConv;
        acc.paidConv += curr.paidConv;
        acc.dueConv += curr.dueConv;
        return acc;
      },
      { fixedConv: 0, otherConv: 0, totalConv: 0, paidConv: 0, dueConv: 0 }
    );
  }, [allCalcsSummary]);

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
        <div className="flex items-center gap-2 text-emerald-600 mb-3 font-semibold">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading calculations...
        </div>
      )}

      {/* Organization Type Navigation Pills & Adjustable font/field size bar */}
      <div className="border border-gray-400 mb-4 bg-white">
        <SectionHeader title="Org Type & Currency" open={orgTypeOpen} onToggle={() => setOrgTypeOpen(v => !v)} />
        {orgTypeOpen && (
          <div className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-gray-50/90 p-3 rounded-xl border border-gray-200 shadow-xs">
        {calculations.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5">
            {calculations.map((calc) => {
              const isSelected = selectedCalcId === calc.vpc_id;
              return (
                <button
                  key={calc.vpc_id}
                  onClick={() => setSelectedCalcId(calc.vpc_id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-base font-bold border-2 transition ${
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]"
                      : "bg-white text-gray-800 border-gray-300 hover:border-emerald-500 hover:bg-emerald-50/50"
                  }`}
                >
                  <span className="capitalize">{calc.vpc_type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${isSelected ? "bg-emerald-700 text-white" : "bg-gray-100 text-gray-600"}`}>
                    {calc.vpc_from_currency}→{calc.vpc_to_currency}
                  </span>
                  {calc.vpc_is_active && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded shadow-xs">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
            {canCreate && availableTypes.length > 0 && !showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm sm:text-base font-bold border-2 border-dashed border-emerald-500 text-emerald-700 hover:bg-emerald-50 bg-white transition"
              >
                <Plus size={16} /> Add another
              </button>
            )}
          </div>
        )}

        {/* Font & Field Size Selector */}
        <div className="flex items-center gap-1.5 ml-auto text-xs font-semibold text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-xs">
          <span className="text-gray-500 uppercase tracking-wider text-[11px] mr-1">Font &amp; Field Size:</span>
          {[
            ["normal", "Normal"],
            ["large", "Large"],
            ["xl", "Extra Large"],
          ].map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSizeMode(mode)}
              className={`px-2.5 py-1 rounded transition ${
                sizeMode === mode
                  ? "bg-teal-600 text-white font-bold"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Organization Type & Currency box - Prominent & Bigger */}
      {(showAddForm || calculations.length === 0) && canCreate && availableTypes.length > 0 && (
        <div className="rounded-xl border-2 border-blue-300 bg-blue-50/70 p-5 mb-4 shadow-sm">
          <div className="text-center mb-4 pb-2 border-b border-blue-200">
            <h4 className="text-base font-extrabold uppercase tracking-wide text-blue-900">
              Organization Type &amp; Currency
            </h4>
          </div>
          <div className="flex flex-wrap items-end gap-5">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-base font-bold text-gray-800 mb-1.5">
                Select Organization Type <span className="text-red-500 text-lg">*</span>
              </label>
              <select
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-base font-semibold bg-white text-gray-900 shadow-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-400 outline-none"
                value={addForm.type}
                onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
              >
                <option value="">Select Organization Type</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[280px]">
              <label className="block text-base font-bold text-gray-800 mb-1.5">
                Select Currency Conversion <span className="text-red-500 text-lg">*</span>
              </label>
              <div className="flex items-center gap-2">
                <select
                  className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2.5 text-base font-semibold bg-white text-gray-900 shadow-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-400 outline-none"
                  value={addForm.from_currency}
                  onChange={(e) => setAddForm({ ...addForm, from_currency: e.target.value })}
                >
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="text-gray-600 text-xl font-bold px-1">→</span>
                <select
                  className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2.5 text-base font-semibold bg-white text-gray-900 shadow-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-400 outline-none"
                  value={addForm.to_currency}
                  onChange={(e) => setAddForm({ ...addForm, to_currency: e.target.value })}
                >
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleAddCalculation}
                disabled={savingCalc}
                className="bg-blue-600 text-white hover:bg-blue-700 h-11 px-6 text-base font-bold rounded-lg shadow-sm"
              >
                {savingCalc ? <Loader2 className="w-5 h-5 animate-spin mr-1" /> : <Plus className="w-5 h-5 mr-1" />}
                Create
              </Button>
              {calculations.length > 0 && (
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-800 h-11 px-3 rounded-lg hover:bg-blue-100/50 transition"
                  aria-label="Cancel"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedCalc && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          {/* Organization Type & Currency - Prominent read-only summary card */}
          <div className="rounded-xl border-2 border-blue-300 bg-blue-50/70 p-4 sm:p-5 mb-4 shadow-sm">
            <div className="text-center mb-3 pb-2 border-b border-blue-200">
              <h4 className="text-base font-extrabold uppercase tracking-wide text-blue-900">
                Organization Type &amp; Currency
              </h4>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-semibold text-gray-600">Organization Type:</span>
                  <span className="text-base sm:text-lg font-extrabold capitalize text-blue-950 bg-white px-3.5 py-1 rounded-lg border-2 border-blue-200 shadow-xs">
                    {selectedCalc.vpc_type}
                  </span>
                  {selectedCalc.vpc_is_active && (
                    <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider bg-amber-500 text-white px-2.5 py-0.5 rounded-md shadow-xs">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-semibold text-gray-600">Currency Conversion:</span>
                  <span className="text-base sm:text-lg font-extrabold text-blue-950 bg-white px-3.5 py-1 rounded-lg border-2 border-blue-200 shadow-xs">
                    {selectedCalc.vpc_from_currency} → {selectedCalc.vpc_to_currency}
                  </span>
                </div>
                {calcHasItems && (
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-500 bg-gray-200/80 px-2.5 py-1 rounded-md">
                    <span>Currency locked</span>
                    <Lock size={14} />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {canUpdate && !selectedCalc.vpc_is_active && (
                  <button
                    onClick={() => handleActivate(selectedCalc)}
                    className="inline-flex items-center gap-1.5 text-sm font-bold px-3.5 py-1.5 rounded-lg border-2 border-amber-500 text-amber-800 bg-amber-50 hover:bg-amber-100 transition shadow-xs"
                  >
                    Set Active
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDeleteCalc(selectedCalc)}
                    className="inline-flex items-center justify-center p-2 rounded-lg border-2 border-red-300 text-red-600 bg-white hover:bg-red-50 hover:border-red-400 transition"
                    aria-label="Delete calculation"
                    title="Delete calculation"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
          </div>
        )}
      </div>

      {/* selected calculation detail */}
      {selectedCalc && (
        <div>
          <div className="border border-gray-400 mb-4 bg-white">
            <SectionHeader title="Fixed & Gen Cost" open={fixedGenCostOpen} onToggle={() => setFixedGenCostOpen(v => !v)} />
            {fixedGenCostOpen && (
              <div className="p-4">
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
            sizeMode={sizeMode}
          />

          {!selectedCalc.general_cost_locked && (
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
              sizeMode={sizeMode}
            />
          )}
              </div>
            )}
          </div>

          {/* 1. Grand Total Costing for Selected Organization Type */}
          {grandTotal && (
            <div className="border border-gray-400 mb-4 bg-white">
              <SectionHeader title={`Grand Total Costing (${selectedCalc.vpc_type.toUpperCase()})`} open={grandTotalOpen} onToggle={() => setGrandTotalOpen(v => !v)} />
              {grandTotalOpen && (
                <div className="p-4">
                  <div className="rounded-xl border-2 border-indigo-300 overflow-hidden shadow-sm bg-white">
              <div className="text-center py-2.5 bg-indigo-600 text-white flex items-center justify-center gap-2">
                <Layers className="w-5 h-5" />
                <h4 className="text-base font-extrabold uppercase tracking-wide">
                  Grand Total Costing — {selectedCalc.vpc_type.toUpperCase()} ({selectedCalc.vpc_from_currency} → {selectedCalc.vpc_to_currency})
                </h4>
              </div>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-indigo-50/80 border-b border-indigo-200 text-indigo-950 font-bold">
                    <th className="px-4 py-2.5 text-left">Costing Section</th>
                    <th className="px-4 py-2.5 text-right">Amount ({selectedCalc.vpc_from_currency})</th>
                    <th className="px-4 py-2.5 text-right">Conversion Amount ({selectedCalc.vpc_to_currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100">
                  <tr className="bg-white hover:bg-indigo-50/30 transition">
                    <td className="px-4 py-2.5 font-medium text-gray-800">Total Fixed Cost</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-gray-700">
                      {formatAmount(grandTotal.fixedAmount)} {selectedCalc.vpc_from_currency}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-gray-900">
                      {formatAmount(grandTotal.fixedConv)} {selectedCalc.vpc_to_currency}
                    </td>
                  </tr>
                  {!selectedCalc.general_cost_locked && (
                    <tr className="bg-white hover:bg-indigo-50/30 transition">
                      <td className="px-4 py-2.5 font-medium text-gray-800">Total General Cost</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-700">
                        {formatAmount(grandTotal.otherAmount)} {selectedCalc.vpc_from_currency}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-gray-900">
                        {formatAmount(grandTotal.otherConv)} {selectedCalc.vpc_to_currency}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-emerald-50/80 text-emerald-900 font-semibold">
                    <td className="px-4 py-2.5">Total Paid</td>
                    <td className="px-4 py-2.5 text-right">
                      {formatAmount(grandTotal.paidAmount)} {selectedCalc.vpc_from_currency}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-emerald-700">
                      {formatAmount(grandTotal.paidConv)} {selectedCalc.vpc_to_currency}
                    </td>
                  </tr>
                  <tr className="bg-rose-50/80 text-rose-900 font-semibold">
                    <td className="px-4 py-2.5">Total Due</td>
                    <td className="px-4 py-2.5 text-right">
                      {formatAmount(grandTotal.dueAmount)} {selectedCalc.vpc_from_currency}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-rose-700">
                      {formatAmount(grandTotal.dueConv)} {selectedCalc.vpc_to_currency}
                    </td>
                  </tr>
                  <tr className="bg-indigo-900 text-white font-extrabold text-base">
                    <td className="px-4 py-3">
                      Total Costing ({selectedCalc.vpc_type.toUpperCase()}){selectedCalc.general_cost_locked ? " (Fixed only)" : ""}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatAmount(grandTotal.grandAmount)} {selectedCalc.vpc_from_currency}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatAmount(grandTotal.grandConv)} {selectedCalc.vpc_to_currency}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Organization Type Wise Grand Total Breakdown Table */}
          {calculations.length > 0 && (
            <div className="border border-gray-400 mb-4 bg-white">
              <SectionHeader title="Org Wise Summary" open={orgWiseSummaryOpen} onToggle={() => setOrgWiseSummaryOpen(v => !v)} />
              {orgWiseSummaryOpen && (
                <div className="p-4">
                  <div className="rounded-xl border-2 border-purple-300 overflow-hidden shadow-sm bg-white">
              <div className="text-center py-2.5 bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
                <h4 className="text-base font-extrabold uppercase tracking-wider">
                  Organization Type Wise Grand Total Costing Summary
                </h4>
                <p className="text-xs text-purple-200 mt-0.5">
                  Detailed costing, paid, and due summary categorized by each Organization Type
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-purple-100/90 border-b border-purple-200 text-purple-950 font-bold">
                      <th className="px-4 py-2.5 text-left">Organization Type</th>
                      <th className="px-4 py-2.5 text-left">Currency</th>
                      <th className="px-4 py-2.5 text-right">Fixed Cost</th>
                      <th className="px-4 py-2.5 text-right">General Cost</th>
                      <th className="px-4 py-2.5 text-right">Total Costing</th>
                      <th className="px-4 py-2.5 text-right">Total Paid</th>
                      <th className="px-4 py-2.5 text-right">Total Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100">
                    {allCalcsSummary.map((item) => {
                      const isCurrent = selectedCalcId === item.calcId;
                      return (
                        <tr
                          key={item.calcId}
                          onClick={() => setSelectedCalcId(item.calcId)}
                          className={`cursor-pointer transition ${
                            isCurrent
                              ? "bg-purple-50/90 font-medium"
                              : "hover:bg-gray-50/80 bg-white"
                          }`}
                          title="Click to view this organization type"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold capitalize text-gray-900 text-base">
                                {item.type}
                              </span>
                              {item.isActive && (
                                <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-400 text-amber-950 px-2 py-0.5 rounded shadow-xs">
                                  Active
                                </span>
                              )}
                              {isCurrent && (
                                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-300">
                                  Viewing
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-600 font-semibold text-xs">
                            {item.fromCurrency} → {item.toCurrency}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap font-medium text-gray-800">
                            <div>{formatAmount(item.fixedConv)} {item.toCurrency}</div>
                            {item.fromCurrency !== item.toCurrency && (
                              <div className="text-[11px] text-gray-400">
                                ({formatAmount(item.fixedAmount)} {item.fromCurrency})
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap font-medium text-gray-800">
                            {item.locked ? (
                              <span className="text-gray-400 text-xs italic">Locked</span>
                            ) : (
                              <>
                                <div>{formatAmount(item.otherConv)} {item.toCurrency}</div>
                                {item.fromCurrency !== item.toCurrency && (
                                  <div className="text-[11px] text-gray-400">
                                    ({formatAmount(item.otherAmount)} {item.fromCurrency})
                                  </div>
                                )}
                              </>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap font-bold text-indigo-950">
                            {formatAmount(item.totalConv)} {item.toCurrency}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap font-bold text-emerald-700">
                            {formatAmount(item.paidConv)} {item.toCurrency}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap font-bold text-rose-700">
                            {formatAmount(item.dueConv)} {item.toCurrency}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {calculations.length > 1 && (
                    <tfoot>
                      <tr className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white font-extrabold text-sm">
                        <td colSpan={4} className="px-4 py-3 text-right uppercase tracking-wider">
                          Net Grand Total (All Organization Types):
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatAmount(netGrandTotals.totalConv)} BDT
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-300">
                          {formatAmount(netGrandTotals.paidConv)} BDT
                        </td>
                        <td className="px-4 py-3 text-right text-rose-300">
                          {formatAmount(netGrandTotals.dueConv)} BDT
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
                </div>
              )}
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
