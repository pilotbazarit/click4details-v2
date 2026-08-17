"use client";
import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/Pagination";
import {
  Receipt,
  Loader2,
  Pencil,
  Trash2,
  FileDown,
  FileText,
  Car,
  Package as PackageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import AsyncSelect from "react-select/async";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import toast from "react-hot-toast";
import PurchasePaymentModal from "@/components/modals/PurchasePaymentModal";
import PaymentReportFilterModal from "@/components/modals/PaymentReportFilterModal";
import VehiclePurchaseCalculationPanel from "@/components/purchase-calculation/VehiclePurchaseCalculationPanel";
import PurchasePaymentService from "@/services/PurchasePaymentService";
import Swal from "sweetalert2";
import { useAppContext } from "@/context/AppContext";
import { hasPermission } from "@/lib/utils";
import { formatPrice } from "@/helpers/functions";

const ENTITY_SEARCH_MIN_LENGTH = 2;

const formatAmount = (value) => {
  if (value === null || value === undefined || value === "") return "N/A";
  return formatPrice(Number(value).toFixed(2));
};

const BUCKET_LABELS = {
  purchase_price: { label: "Fixed", className: "bg-blue-100 text-blue-700" },
  db_costing_price: { label: "General", className: "bg-amber-100 text-amber-700" },
  purchase_costing: { label: "Fixed", className: "bg-emerald-100 text-emerald-700" },
  other_costing: { label: "General", className: "bg-purple-100 text-purple-700" },
};

const SectionHeader = ({ title, open, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 border border-gray-300 rounded-t-md text-sm font-bold tracking-wide text-gray-700 uppercase"
  >
    {title}
    {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
  </button>
);

const PurchasePaymentsContent = () => {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const [selectedEntityOption, setSelectedEntityOption] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);

  const [costingSectionOpen, setCostingSectionOpen] = useState(true);
  const [paymentSectionOpen, setPaymentSectionOpen] = useState(true);

  const [showReportFilter, setShowReportFilter] = useState(false);
  const [pendingReportKind, setPendingReportKind] = useState(null); // 'payment' | 'money-receipt'

  const entitySearchDebounceRef = useRef(null);
  const { permissionList, user } = useAppContext();
  const searchParams = useSearchParams();

  const isSupreme = user?.user_mode === "supreme";
  const canCreate = isSupreme || hasPermission(permissionList, 0, "PurchasePayment", "Create");
  const canUpdate = isSupreme || hasPermission(permissionList, 0, "PurchasePayment", "Update");
  const canDelete = isSupreme || hasPermission(permissionList, 0, "PurchasePayment", "Delete");

  const getPayments = useCallback(
    async (page = currentPage, perPage = itemsPerPage, entityOption = selectedEntityOption) => {
      if (!entityOption?.entity_type || !entityOption?.entity_id) {
        setPayments([]);
        setTotalItems(0);
        return;
      }
      try {
        setLoading(true);
        const params = {
          _page: page,
          _perPage: perPage,
          entity_type: entityOption.entity_type,
          entity_id: entityOption.entity_id,
        };

        const response = await PurchasePaymentService.Queries.getPurchasePayments(params);
        if (response?.status === "success") {
          setTotalItems(response?.data?.total || 0);
          setPayments(response?.data?.data || []);
        } else {
          toast.error(response?.data?.message || "Failed to fetch purchase payments");
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || error.message || "Failed to fetch purchase payments");
      } finally {
        setLoading(false);
      }
    },
    [currentPage, itemsPerPage, selectedEntityOption]
  );

  const fetchPricing = useCallback(async (entityOption) => {
    if (!entityOption?.entity_type || !entityOption?.entity_id) {
      setPricing(null);
      return null;
    }

    try {
      setIsPricingLoading(true);
      const response = await PurchasePaymentService.Queries.getEntityPricing({
        entity_type: entityOption.entity_type,
        entity_id: entityOption.entity_id,
      });
      if (response?.status === "success") {
        setPricing(response.data);
        return response.data;
      }
      setPricing(null);
      return null;
    } catch (error) {
      setPricing(null);
      toast.error(error?.response?.data?.message || "Failed to fetch pricing info");
      return null;
    } finally {
      setIsPricingLoading(false);
    }
  }, []);

  useEffect(() => {
    getPayments(currentPage, itemsPerPage, selectedEntityOption);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, selectedEntityOption]);

  // deep-link support: /purchase-payments/?entity_type=vehicle&entity_id=123
  // (e.g. the "Costing and Payment" button on the vehicle list) pre-selects
  // that vehicle/product so its calculation and payment data show immediately
  useEffect(() => {
    const entityType = searchParams.get("entity_type");
    const entityId = searchParams.get("entity_id");
    const section = searchParams.get("section");
    if (!entityType || !entityId) return;

    const placeholder = {
      value: `${entityType}-${entityId}`,
      entity_type: entityType,
      entity_id: Number(entityId),
      label: "Loading...",
    };
    setSelectedEntityOption(placeholder);

    fetchPricing(placeholder).then((data) => {
      if (!data) return;
      setSelectedEntityOption({
        ...placeholder,
        label: `[${entityType === "vehicle" ? "Vehicle" : "Product"}] ${data.title || "-"} (${data.code || "-"})`,
      });

      // Scroll to the requested section after data loads
      if (section) {
        setTimeout(() => {
          const sectionId = section === "costing" ? "costing-section" : section === "payment" ? "payment-section" : null;
          if (sectionId) {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 400);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEntityOptions = useCallback((inputValue) => {
    return new Promise((resolve) => {
      const q = String(inputValue ?? "").trim();
      if (q.length < ENTITY_SEARCH_MIN_LENGTH) {
        resolve([]);
        return;
      }

      if (entitySearchDebounceRef.current) {
        clearTimeout(entitySearchDebounceRef.current);
      }

      entitySearchDebounceRef.current = setTimeout(async () => {
        try {
          const res = await PurchasePaymentService.Queries.searchEntities({ search: q });
          const items = Array.isArray(res?.data) ? res.data : [];
          resolve(
            items.map((item) => ({
              value: `${item.entity_type}-${item.entity_id}`,
              entity_type: item.entity_type,
              entity_id: item.entity_id,
              label: `[${item.entity_type === "vehicle" ? "Vehicle" : "Product"}] ${item.title || "-"} (${item.code || "-"})`,
            }))
          );
        } catch {
          resolve([]);
        }
      }, 400);
    });
  }, []);

  const handleEntitySelectChange = (option) => {
    setSelectedEntityOption(option || null);
    setCurrentPage(1);
    fetchPricing(option);
  };

  const handleEdit = (item) => {
    setSelectedPayment(item);
    setOpen(true);
  };

  const handleModalClose = () => {
    setOpen(false);
    setSelectedPayment(null);
  };

  const handleAfterSave = () => {
    getPayments(currentPage, itemsPerPage, selectedEntityOption);
    if (selectedEntityOption) fetchPricing(selectedEntityOption);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This purchase payment record will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f766e",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await PurchasePaymentService.Commands.deletePurchasePayment(id);
        handleAfterSave();
        Swal.fire({ title: "Deleted!", text: "Purchase payment deleted successfully!", icon: "success" });
      } catch (error) {
        toast.error(error?.response?.data?.message || error.message || "Something went wrong");
      }
    }
  };

  const downloadBlobPdf = async (fetcher, params, filename) => {
    try {
      setIsPdfDownloading(true);
      const response = await fetcher({ ...params, _is_down: 1 });
      const blob = new Blob([response], { type: "application/pdf" });
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to download PDF");
    } finally {
      setIsPdfDownloading(false);
    }
  };

  const openReportFilter = (kind) => {
    if (!selectedEntityOption) return;
    setPendingReportKind(kind);
    setShowReportFilter(true);
  };

  const handleReportFilterConfirm = async (filters) => {
    if (!selectedEntityOption || !pendingReportKind) return;
    const baseParams = {
      entity_type: selectedEntityOption.entity_type,
      entity_id: selectedEntityOption.entity_id,
      ...filters,
    };

    if (pendingReportKind === "payment") {
      await downloadBlobPdf(
        PurchasePaymentService.Queries.downloadPurchasePaymentPdf,
        baseParams,
        `purchase-payment-${selectedEntityOption.entity_type}-${selectedEntityOption.entity_id}.pdf`
      );
    } else if (pendingReportKind === "money-receipt") {
      await downloadBlobPdf(
        PurchasePaymentService.Queries.downloadMoneyReceiptPdf,
        baseParams,
        `money-receipt-${selectedEntityOption.entity_type}-${selectedEntityOption.entity_id}.pdf`
      );
    }

    setShowReportFilter(false);
    setPendingReportKind(null);
  };

  const handleDownloadCalculationReport = () => {
    if (!selectedEntityOption || selectedEntityOption.entity_type !== "vehicle") return;
    downloadBlobPdf(
      PurchasePaymentService.Queries.downloadVehicleReportPdf,
      { vehicle_id: selectedEntityOption.entity_id },
      `vehicle-purchase-calculation-${selectedEntityOption.entity_id}.pdf`
    );
  };

  const handleDownloadReasonWiseReport = () => {
    const params = {};
    if (selectedEntityOption?.entity_type === "vehicle") params.vehicle_id = selectedEntityOption.entity_id;
    downloadBlobPdf(PurchasePaymentService.Queries.downloadReasonWisePdf, params, "purchase-reason-wise-report.pdf");
  };

  const handleDownloadAllProductsReport = () => {
    downloadBlobPdf(PurchasePaymentService.Queries.downloadAllProductsPdf, {}, "purchase-all-products-report.pdf");
  };

  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="flex flex-col w-full justify-between bg-gray-50 px-6">
      <main className="mx-auto bg-white rounded-lg shadow-lg border border-gray-200 my-6 w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-white/15 rounded-full p-2.5">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold uppercase tracking-wide">Costing and Payment</h2>
              <p className="text-sm text-teal-100">Vehicle purchase calculation & payment tracking</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* ================= Section 1: Select Vehicle or Product ================= */}
          <div className="rounded-md border-2 border-teal-300 mb-6 overflow-hidden bg-teal-50 shadow-sm shadow-teal-100">
            <div className="px-4 py-3 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border-b border-teal-200 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <span className="text-sm font-bold tracking-wide text-teal-700 uppercase">Select Vehicle or Product</span>
              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                {selectedEntityOption && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openReportFilter("payment")}
                    disabled={isPdfDownloading}
                    className="flex items-center gap-1.5 h-8 px-2.5 text-xs border-teal-600 text-teal-700 hover:bg-teal-50 bg-white"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    Payment PDF
                  </Button>
                )}
                {selectedEntityOption && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openReportFilter("money-receipt")}
                    disabled={isPdfDownloading}
                    className="flex items-center gap-1.5 h-8 px-2.5 text-xs border-teal-800 text-teal-900 hover:bg-teal-50 bg-white"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Money Receipt
                  </Button>
                )}
                {selectedEntityOption?.entity_type === "vehicle" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadCalculationReport}
                    disabled={isPdfDownloading}
                    className="flex items-center gap-1.5 h-8 px-2.5 text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-50 bg-white"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    Calculation
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadReasonWiseReport}
                  disabled={isPdfDownloading}
                  className="flex items-center gap-1.5 h-8 px-2.5 text-xs border-indigo-600 text-indigo-700 hover:bg-indigo-50 bg-white"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Reason Wise
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadAllProductsReport}
                  disabled={isPdfDownloading}
                  className="flex items-center gap-1.5 h-8 px-2.5 text-xs border-purple-600 text-purple-700 hover:bg-purple-50 bg-white"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  All Product
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="w-full sm:w-96">
                <AsyncSelect
                  inputId="purchase-payment-entity-select"
                  cacheOptions={false}
                  defaultOptions={false}
                  loadOptions={loadEntityOptions}
                  value={selectedEntityOption}
                  onChange={handleEntitySelectChange}
                  placeholder="Search by title or code..."
                  isClearable
                  openMenuOnClick={false}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  noOptionsMessage={({ inputValue }) => {
                    const q = String(inputValue ?? "").trim();
                    if (q.length < ENTITY_SEARCH_MIN_LENGTH) return "Type at least 2 characters...";
                    return "No vehicle/product found";
                  }}
                />
              </div>

              {/* Pricing info cards */}
              {selectedEntityOption && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase">Grand Total Price</div>
                    <div className="text-lg font-bold text-gray-800 mt-1">
                      {isPricingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : formatAmount(pricing?.costing_price)}
                    </div>
                    {pricing && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-50 to-slate-100 text-blue-800 border border-blue-200 text-[11px] font-semibold">
                          Paid: {formatAmount(Number(pricing?.purchase_price_paid || 0) + Number(pricing?.db_costing_price_paid || 0))}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-slate-100 to-blue-50 text-slate-700 border border-slate-300 text-[11px] font-semibold">
                          Due:{" "}
                          {formatAmount(
                            Math.max(
                              0,
                              (Number(pricing?.purchase_price || 0) + Number(pricing?.other_charge_total || 0)) -
                                (Number(pricing?.purchase_price_paid || 0) + Number(pricing?.db_costing_price_paid || 0))
                            )
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase">Fixed</div>
                    <div className="text-lg font-bold text-gray-800 mt-1">
                      {isPricingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : formatAmount(pricing?.purchase_price)}
                    </div>
                    {pricing && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-50 to-slate-100 text-blue-800 border border-blue-200 text-[11px] font-semibold">
                          Paid: {formatAmount(pricing?.purchase_price_paid)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-slate-100 to-blue-50 text-slate-700 border border-slate-300 text-[11px] font-semibold">
                          Due:{" "}
                          {formatAmount(
                            pricing?.purchase_price !== null && pricing?.purchase_price !== undefined
                              ? Math.max(0, Number(pricing.purchase_price) - Number(pricing.purchase_price_paid || 0))
                              : null
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase">General</div>
                    <div className="text-lg font-bold text-gray-800 mt-1">
                      {isPricingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : formatAmount(pricing?.other_charge_total)}
                    </div>
                    {pricing && pricing?.other_charge_total !== null && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-50 to-slate-100 text-blue-800 border border-blue-200 text-[11px] font-semibold">
                          Paid: {formatAmount(pricing?.db_costing_price_paid)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-slate-100 to-blue-50 text-slate-700 border border-slate-300 text-[11px] font-semibold">
                          Due: {formatAmount(Math.max(0, Number(pricing.other_charge_total) - Number(pricing.db_costing_price_paid || 0)))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= Section 2: Costing Section ================= */}
          {selectedEntityOption?.entity_type === "vehicle" && (
            <div id="costing-section" className="rounded-md border-2 border-blue-400 mb-4 overflow-hidden bg-blue-50 shadow-sm shadow-blue-200">
              <SectionHeader
                title="Costing Section"
                open={costingSectionOpen}
                onToggle={() => setCostingSectionOpen((v) => !v)}
              />
              {costingSectionOpen && (
                <div className="p-4">
                  <VehiclePurchaseCalculationPanel
                    vehicleId={selectedEntityOption.entity_id}
                    canCreate={canCreate}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onChanged={handleAfterSave}
                  />
                </div>
              )}
            </div>
          )}

          {/* ================= Section 3: Payment Section ================= */}
          {selectedEntityOption && (
            <div id="payment-section" className="rounded-md border-2 border-orange-400 mb-4 overflow-hidden bg-orange-50 shadow-sm shadow-orange-200">
              <SectionHeader
                title="Payment Section"
                open={paymentSectionOpen}
                onToggle={() => setPaymentSectionOpen((v) => !v)}
              />
              {paymentSectionOpen && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-teal-700 uppercase tracking-wide">Payment List</h4>
                    {canCreate && (
                      <Button
                        onClick={() => {
                          setOpen(true);
                          setSelectedPayment(null);
                        }}
                        className="flex items-center gap-2 bg-teal-600 text-white hover:bg-teal-700"
                      >
                        <Receipt className="w-4 h-4" />
                        Make Payment
                      </Button>
                    )}
                  </div>

                  <div className="overflow-x-auto rounded-md border border-gray-300">
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow className="border-b border-gray-300">
                          <TableHead className="w-[60px] border-r border-gray-300 text-center">SL</TableHead>
                          <TableHead className="border-r border-gray-300">Date</TableHead>
                          <TableHead className="border-r border-gray-300">Bucket</TableHead>
                          <TableHead className="border-r border-gray-300">Description</TableHead>
                          <TableHead className="border-r border-gray-300 text-right">Amount</TableHead>
                          <TableHead className="border-r border-gray-300">Status</TableHead>
                          <TableHead className="text-right w-[10]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {payments?.length > 0 ? (
                          payments.map((item, index) => (
                            <TableRow key={item.pp_id || index} className="border-b border-gray-200">
                              <TableCell className="border-r border-gray-200 text-center">{startIndex + index + 1}</TableCell>
                              <TableCell className="border-r border-gray-200">
                                {item.pp_paid_at ? String(item.pp_paid_at).slice(0, 16).replace("T", " ") : "-"}
                              </TableCell>
                              <TableCell className="border-r border-gray-200">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    BUCKET_LABELS[item.pp_payment_against]?.className || "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {BUCKET_LABELS[item.pp_payment_against]?.label || item.pp_payment_against}
                                </span>
                              </TableCell>
                              <TableCell className="border-r border-gray-200 text-gray-700">
                                {item.pp_remark || (item.pp_method ? item.pp_method.replace(/_/g, " ") : "-")}
                              </TableCell>
                              <TableCell className="border-r border-gray-200 text-right font-medium">
                                {formatAmount(item.pp_amount)} {item.pp_currency}
                              </TableCell>
                              <TableCell className="border-r border-gray-200">
                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                  Paid
                                </span>
                              </TableCell>
                              <TableCell className="flex justify-end gap-2 font-medium">
                                {canUpdate && (
                                  <button
                                    onClick={() => handleEdit(item)}
                                    className="text-blue-600 hover:text-blue-800"
                                    aria-label={`Edit purchase payment ${item.pp_id}`}
                                  >
                                    <Pencil size={18} />
                                  </button>
                                )}
                                {canDelete && (
                                  <button
                                    onClick={() => handleDelete(item?.pp_id)}
                                    className="text-red-600 hover:text-red-800"
                                    aria-label={`Delete purchase payment ${item.pp_id}`}
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                              {loading ? (
                                <div className="flex items-center justify-center space-x-2">
                                  <Loader2 className="animate-spin w-5 h-5 text-teal-500" />
                                  <span>Loading...</span>
                                </div>
                              ) : (
                                <div>No purchase payments found for this {selectedEntityOption.entity_type}.</div>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>

                    <Pagination
                      currentPage={currentPage}
                      totalItems={totalItems}
                      itemsPerPage={itemsPerPage}
                      onPageChange={(page) => setCurrentPage(page)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {!selectedEntityOption && (
            <p className="text-sm text-gray-500 text-center py-6">
              Select a vehicle or product above to view its costing and payment details.
            </p>
          )}
        </div>
      </main>
      <Footer />

      <PurchasePaymentModal
        open={open}
        setOpen={handleModalClose}
        onSaved={handleAfterSave}
        initialData={selectedPayment}
        prefillEntityOption={selectedEntityOption}
      />

      <PaymentReportFilterModal
        open={showReportFilter}
        setOpen={(isOpen) => {
          setShowReportFilter(isOpen);
          if (!isOpen) setPendingReportKind(null);
        }}
        entityOption={selectedEntityOption}
        title={pendingReportKind === "money-receipt" ? "Money Receipt Filters" : "Payment Report Filters"}
        onConfirm={handleReportFilterConfirm}
        isGenerating={isPdfDownloading}
      />
    </div>
  );
};

const PurchasePaymentsFallback = () => (
  <div className="flex flex-col min-h-screen w-full justify-center items-center bg-gray-50 px-6">
    <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
  </div>
);

const PurchasePaymentsPage = () => (
  <Suspense fallback={<PurchasePaymentsFallback />}>
    <PurchasePaymentsContent />
  </Suspense>
);

export default PurchasePaymentsPage;
