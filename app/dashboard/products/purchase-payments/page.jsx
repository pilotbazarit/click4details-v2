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
    className="flex items-center justify-between w-full px-4 py-3 text-sm font-bold tracking-wide text-gray-700 uppercase bg-gray-100 border border-gray-300 rounded-t-md"
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

  const [selectEntitySectionOpen, setSelectEntitySectionOpen] = useState(false);
  const [paymentSectionOpen, setPaymentSectionOpen] = useState(false);
  const [reportSectionOpen, setReportSectionOpen] = useState(false);

  const [showReportFilter, setShowReportFilter] = useState(false);
  const [pendingReportKind, setPendingReportKind] = useState(null); // 'payment' | 'money-receipt'
  const [calcRefreshSignal, setCalcRefreshSignal] = useState(0);

  const entitySearchDebounceRef = useRef(null);
  const { permissionList, user, selectedShop } = useAppContext();
  const searchParams = useSearchParams();

  const isSupreme = user?.user_mode === "supreme";
  const entityShopId = pricing?.shop_id || selectedShop?.id || 0;
  const isShopOwnerOrPartner =
    user?.user_mode === "partner" ||
    (pricing?.shop_id && Number(pricing.shop_id) === Number(selectedShop?.id)) ||
    (pricing?.user_id && Number(pricing.user_id) === Number(user?.id));

  const canCreate =
    isSupreme ||
    isShopOwnerOrPartner ||
    hasPermission(permissionList, 0, "PurchasePayment", "Create") ||
    hasPermission(permissionList, entityShopId, "PurchasePayment", "Create");

  const canUpdate =
    isSupreme ||
    isShopOwnerOrPartner ||
    hasPermission(permissionList, 0, "PurchasePayment", "Update") ||
    hasPermission(permissionList, entityShopId, "PurchasePayment", "Update");

  const canDelete =
    isSupreme ||
    isShopOwnerOrPartner ||
    hasPermission(permissionList, 0, "PurchasePayment", "Delete") ||
    hasPermission(permissionList, entityShopId, "PurchasePayment", "Delete");

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
    // a payment can be made independently of the Costing Section (via the
    // Payment Section's modal) - nudge the panel to re-fetch its own
    // paid/due figures too, since it has no other way to know they changed
    setCalcRefreshSignal((v) => v + 1);
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

  // These endpoints are requested with responseType "blob", so a failure comes
  // back as a Blob rather than parsed JSON and error.response.data.message is
  // always undefined - every server error used to surface as the generic
  // "Failed to download PDF". Read the blob back as text so the real message
  // (validation, permission, or a 500) reaches the toast.
  const readPdfErrorMessage = async (error) => {
    const fallback = "Failed to download PDF";
    const data = error?.response?.data;

    if (data instanceof Blob) {
      try {
        const text = await data.text();
        try {
          return JSON.parse(text)?.message || fallback;
        } catch {
          return text?.trim()?.slice(0, 300) || fallback;
        }
      } catch {
        return fallback;
      }
    }

    return data?.message || error?.message || fallback;
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
      toast.error(await readPdfErrorMessage(error));
    } finally {
      setIsPdfDownloading(false);
    }
  };

  const openReportFilter = (kind) => {
    if (!selectedEntityOption) return;
    setPendingReportKind(kind);
    setShowReportFilter(true);
  };

  const getChassisPrefix = () => {
    const chassis = pricing?.vehicle_info?.chassis_no;
    if (!chassis) return null;
    const clean = String(chassis).trim().replace(/[^a-zA-Z0-9_-]/g, "-");
    return clean || null;
  };

  const handleReportFilterConfirm = async (filters) => {
    if (!selectedEntityOption || !pendingReportKind) return;
    const baseParams = {
      entity_type: selectedEntityOption.entity_type,
      entity_id: selectedEntityOption.entity_id,
      ...filters,
    };
    const chassis = getChassisPrefix();

    if (pendingReportKind === "payment") {
      const fileName = chassis
        ? `${chassis}-costing-payment.pdf`
        : `costing-payment-${selectedEntityOption.entity_type}-${selectedEntityOption.entity_id}.pdf`;
      await downloadBlobPdf(
        PurchasePaymentService.Queries.downloadPurchasePaymentPdf,
        baseParams,
        fileName
      );
    } else if (pendingReportKind === "money-receipt") {
      const fileName = chassis
        ? `${chassis}-money-receipt.pdf`
        : `money-receipt-${selectedEntityOption.entity_type}-${selectedEntityOption.entity_id}.pdf`;
      await downloadBlobPdf(
        PurchasePaymentService.Queries.downloadMoneyReceiptPdf,
        baseParams,
        fileName
      );
    }

    setShowReportFilter(false);
    setPendingReportKind(null);
  };

  const handleDownloadCalculationReport = () => {
    if (!selectedEntityOption || selectedEntityOption.entity_type !== "vehicle") return;
    const chassis = getChassisPrefix();
    const fileName = chassis
      ? `${chassis}-vehicle-purchase-calculation.pdf`
      : `vehicle-purchase-calculation-${selectedEntityOption.entity_id}.pdf`;
    downloadBlobPdf(
      PurchasePaymentService.Queries.downloadVehicleReportPdf,
      { vehicle_id: selectedEntityOption.entity_id },
      fileName
    );
  };

  const handleDownloadReasonWiseReport = () => {
    const params = {};
    if (selectedEntityOption?.entity_type === "vehicle") params.vehicle_id = selectedEntityOption.entity_id;
    const chassis = getChassisPrefix();
    const fileName = chassis
      ? `${chassis}-purchase-reason-wise-report.pdf`
      : "purchase-reason-wise-report.pdf";
    downloadBlobPdf(PurchasePaymentService.Queries.downloadReasonWisePdf, params, fileName);
  };

  const handleDownloadAllProductsReport = () => {
    const params = selectedShop?.s_id ? { _shop_id: selectedShop.s_id } : {};
    const chassis = getChassisPrefix();
    const fileName = chassis
      ? `${chassis}-purchase-all-products-report.pdf`
      : "purchase-all-products-report.pdf";
    downloadBlobPdf(PurchasePaymentService.Queries.downloadAllProductsPdf, params, fileName);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="flex flex-col justify-between w-full px-6 bg-gray-50">
      <main className="w-full mx-auto my-6 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-4 px-6 py-6 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 md:flex-row">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-white/15 rounded-full p-2.5">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-wide uppercase">Costing and Payment</h2>
              <p className="text-sm text-teal-100">Vehicle purchase calculation & payment tracking</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadAllProductsReport}
            disabled={isPdfDownloading}
            className="flex items-center gap-1.5 h-8 px-3 text-xs bg-white/15 border-white/30 text-white hover:bg-white/25 hover:text-white"
          >
            <FileDown className="w-3.5 h-3.5" />
            All Product
          </Button>
        </div>

        <div className="p-6">
          {/* ================= Section 1: Select Vehicle or Product ================= */}
          <div className="mb-6 overflow-hidden border-2 border-teal-300 rounded-md shadow-sm bg-teal-50 shadow-teal-100">
            <SectionHeader
              title="Select Vehicle or Product"
              open={selectEntitySectionOpen}
              onToggle={() => setSelectEntitySectionOpen((v) => !v)}
            />
            {selectEntitySectionOpen && (
              <div className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
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
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedEntityOption && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReportFilter("payment")}
                        disabled={isPdfDownloading}
                        className="flex items-center gap-1.5 h-8 px-2.5 text-xs border-teal-600 text-teal-700 hover:bg-teal-50 bg-white"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        Costing Payment PDF
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
                  </div>
                </div>

                {/* Vehicle info strip */}
                {selectedEntityOption?.entity_type === "vehicle" && pricing?.vehicle_info && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-1.5 mt-3 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                    {[
                      ["Brand", pricing.vehicle_info.brand],
                      ["Model", pricing.vehicle_info.model],
                      ["Package", pricing.vehicle_info.package],
                      ["Condition", pricing.vehicle_info.condition],
                      ["Model Yr", pricing.vehicle_info.model_year],
                      ["Reg Yr", pricing.vehicle_info.reg_year],
                      ["Grade", pricing.vehicle_info.grade],
                      ["Exterior Grd", pricing.vehicle_info.exterior_grade],
                      ["Interior Grd", pricing.vehicle_info.interior_grade],
                      ["Mileage", pricing.vehicle_info.mileage],
                      ["Auction Type", pricing.vehicle_info.auction_type],
                      ["Color", pricing.vehicle_info.color],
                      ["Fuel", pricing.vehicle_info.fuel],
                      ["Option", pricing.vehicle_info.option],
                      ["CC", pricing.vehicle_info.cc],
                      ["Body", pricing.vehicle_info.body],
                      ["Seat", pricing.vehicle_info.seat],
                      ["Chassis No", pricing.vehicle_info.chassis_no],
                      ["Engine No", pricing.vehicle_info.engine_no],
                      ["Tax Token", pricing.vehicle_info.tax_token],
                      ["Fitness", pricing.vehicle_info.fitness],
                      ["Arrival Date", pricing.vehicle_info.arrival_date],
                    ].map(([label, value]) => (
                      <span key={label}>
                        <span className="font-semibold text-gray-500">{label}:</span> {value || "-"}
                      </span>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>

          {/* ================= Section 2: Costing Section ================= */}
          {selectedEntityOption?.entity_type === "vehicle" && (
            <div id="costing-section" className="mb-4">
              <VehiclePurchaseCalculationPanel
                vehicleId={selectedEntityOption.entity_id}
                canCreate={canCreate}
                canUpdate={canUpdate}
                canDelete={canDelete}
                onChanged={handleAfterSave}
                refreshSignal={calcRefreshSignal}
              />
            </div>
          )}

          {/* ================= Section 3: Payment Section ================= */}
          {selectedEntityOption && (
            <div id="payment-section" className="mb-4 overflow-hidden border-2 border-green-300 rounded-md shadow-sm bg-green-50 shadow-orange-200">
              <SectionHeader
                title="Payment Section"
                open={paymentSectionOpen}
                onToggle={() => setPaymentSectionOpen((v) => !v)}
              />
              {paymentSectionOpen && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold tracking-wide text-teal-700 uppercase">Purchase Payment</h4>
                    {canCreate && (
                      <Button
                        onClick={() => {
                          setOpen(true);
                          setSelectedPayment(null);
                        }}
                        className="flex items-center gap-2 text-white bg-teal-600 hover:bg-teal-700"
                      >
                        <Receipt className="w-4 h-4" />
                        Make Payment
                      </Button>
                    )}
                  </div>

                  <div className="overflow-x-auto border border-gray-300 rounded-md">
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow className="border-b border-gray-300">
                          <TableHead className="w-[60px] border-r border-gray-300 text-center">SL</TableHead>
                          <TableHead className="border-r border-gray-300">Date</TableHead>
                          <TableHead className="border-r border-gray-300">Bucket</TableHead>
                          <TableHead className="border-r border-gray-300">Reason</TableHead>
                          <TableHead className="border-r border-gray-300">Supplier</TableHead>
                          <TableHead className="border-r border-gray-300">Description</TableHead>
                          <TableHead className="text-right border-r border-gray-300">Amount</TableHead>
                          <TableHead className="border-r border-gray-300">Status</TableHead>
                          <TableHead className="text-right w-[10]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {payments?.length > 0 ? (
                          payments.map((item, index) => (
                            <TableRow key={item.pp_id || index} className="border-b border-gray-200">
                              <TableCell className="text-center border-r border-gray-200">{startIndex + index + 1}</TableCell>
                              <TableCell className="border-r border-gray-200">
                                {item.pp_paid_at ? String(item.pp_paid_at).slice(0, 16).replace("T", " ") : "-"}
                              </TableCell>
                              <TableCell className="border-r border-gray-200">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${BUCKET_LABELS[item.pp_payment_against]?.className || "bg-gray-100 text-gray-700"
                                    }`}
                                >
                                  {BUCKET_LABELS[item.pp_payment_against]?.label || item.pp_payment_against}
                                </span>
                              </TableCell>
                              <TableCell className="text-gray-700 border-r border-gray-200">
                                {item.pp_reason || "-"}
                              </TableCell>
                              <TableCell className="text-gray-700 border-r border-gray-200">
                                {item.supplier?.s_name || "-"}
                              </TableCell>
                              <TableCell className="text-gray-700 border-r border-gray-200">
                                {item.pp_remark || (item.pp_method ? item.pp_method.replace(/_/g, " ") : "-")}
                              </TableCell>
                              <TableCell className="font-medium text-right border-r border-gray-200">
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
                            <TableCell colSpan={9} className="py-4 text-center text-gray-500">
                              {loading ? (
                                <div className="flex items-center justify-center space-x-2">
                                  <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
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

          {/* ================= Section 4: Report Section ================= */}
          <div id="report-section" className="mb-4 overflow-hidden border-2 border-green-300 rounded-md  bg-green-50 shadow-sm bg-gray-50 shadow-gray-200">
            <SectionHeader
              title="Report Section"
              open={reportSectionOpen}
              onToggle={() => setReportSectionOpen((v) => !v)}
            />
            {reportSectionOpen && (
              <div className="flex flex-wrap items-center gap-4 p-4 bg-white">
                {selectedEntityOption && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openReportFilter("payment")}
                    disabled={isPdfDownloading}
                    className="flex items-center gap-1.5 h-9 px-4 text-sm font-semibold border-teal-600 text-teal-700 hover:bg-teal-50 bg-white"
                  >
                    <FileDown className="w-4 h-4" />
                    Payment PDF
                  </Button>
                )}
                {selectedEntityOption && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openReportFilter("money-receipt")}
                    disabled={isPdfDownloading}
                    className="flex items-center gap-1.5 h-9 px-4 text-sm font-semibold border-teal-800 text-teal-900 hover:bg-teal-50 bg-white"
                  >
                    <FileText className="w-4 h-4" />
                    Money Receipt
                  </Button>
                )}
                {selectedEntityOption?.entity_type === "vehicle" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadCalculationReport}
                    disabled={isPdfDownloading}
                    className="flex items-center gap-1.5 h-9 px-4 text-sm font-semibold border-emerald-600 text-emerald-700 hover:bg-emerald-50 bg-white"
                  >
                    <FileDown className="w-4 h-4" />
                    Calculation
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadReasonWiseReport}
                  disabled={isPdfDownloading}
                  className="flex items-center gap-1.5 h-9 px-4 text-sm font-semibold border-indigo-600 text-indigo-700 hover:bg-indigo-50 bg-white"
                >
                  <FileDown className="w-4 h-4" />
                  Reason Wise
                </Button>
              </div>
            )}
          </div>

          {!selectedEntityOption && (
            <p className="py-6 text-sm text-center text-gray-500">
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
        title={pendingReportKind === "money-receipt" ? "Money Receipt Filters" : "Costing Payment PDF Filters"}
        onConfirm={handleReportFilterConfirm}
        isGenerating={isPdfDownloading}
      />
    </div>
  );
};

const PurchasePaymentsFallback = () => (
  <div className="flex flex-col items-center justify-center w-full min-h-screen px-6 bg-gray-50">
    <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
  </div>
);

const PurchasePaymentsPage = () => (
  <Suspense fallback={<PurchasePaymentsFallback />}>
    <PurchasePaymentsContent />
  </Suspense>
);

export default PurchasePaymentsPage;
