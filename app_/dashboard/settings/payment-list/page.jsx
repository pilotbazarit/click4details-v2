"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Footer from "@/components/dashboard/Footer";
import Pagination from "@/components/Pagination";
import VehicleService from "@/services/VehicleService";
import ContactCustomerService from "@/services/ContactCustomerService";
import { useAppContext } from "@/context/AppContext";
import Select from "react-select";
import { ExternalLink, Loader2, RefreshCw, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAYMENT_ENTITY = "\\App\\Models\\Product\\Vehicle";
const DEFAULT_CUSTOMER_CONTACT_ID = "3";

const getPaymentListFromResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.list)) return response.list;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data?.list)) return response.data.list;
  return [];
};

const getPaymentTotalFromResponse = (response, fallbackTotal = 0) => {
  const possibleTotals = [
    response?.data?.total,
    response?.total,
    response?.meta?.total,
    response?.data?.meta?.total,
    response?.pagination?.total,
    response?.data?.pagination?.total,
  ];

  const total = possibleTotals.find((value) => Number.isFinite(Number(value)));
  return total === undefined ? fallbackTotal : Number(total);
};

const parsePaymentNumber = (value) => {
  const amount = Number(String(value ?? 0).replace(/,/g, "").trim());
  return Number.isFinite(amount) ? amount : 0;
};

const getPaymentCurrencyLabel = (currency) => {
  const normalizedCurrency = String(currency || "BDT").toUpperCase();
  return normalizedCurrency === "BDT" ? "Tk" : normalizedCurrency;
};

const formatPaymentAmount = (amount, currency = "BDT") => {
  const numericAmount = parsePaymentNumber(amount);
  return `${getPaymentCurrencyLabel(currency)} ${numericAmount.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatPaymentDateTime = (dateValue) => {
  if (!dateValue) return "N/A";

  const normalizedDate = typeof dateValue === "string" ? dateValue.replace(" ", "T") : dateValue;
  const date = new Date(normalizedDate);

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPaymentText = (value) => {
  const normalizedValue = String(value || "").trim();
  if (!normalizedValue) return "N/A";

  return normalizedValue
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const getPaymentStatusClasses = (status) => {
  const normalizedStatus = String(status || "").trim().toLowerCase();

  if (["paid", "success", "completed"].includes(normalizedStatus)) {
    return "bg-green-100 text-green-700";
  }

  if (["pending", "due"].includes(normalizedStatus)) {
    return "bg-yellow-100 text-yellow-700";
  }

  if (["failed", "cancelled", "canceled"].includes(normalizedStatus)) {
    return "bg-red-100 text-red-700";
  }

  if (["refunded", "refund"].includes(normalizedStatus)) {
    return "bg-purple-100 text-purple-700";
  }

  return "bg-gray-100 text-gray-700";
};

const isPaymentImageDocument = (document = {}) => {
  const format = String(document?.format || "").toLowerCase();
  const url = String(document?.url || document?.secure_url || document?.secureUrl || "").toLowerCase();

  if (["jpg", "jpeg", "png", "webp", "gif", "bmp", "svg", "avif"].includes(format)) {
    return true;
  }

  return /\.(jpg|jpeg|png|webp|gif|bmp|svg|avif)(\?|$)/i.test(url);
};

const getPaymentDocumentArray = (value) => {
  if (Array.isArray(value)) return value;

  if (typeof value === "string" && value.trim()) {
    try {
      const parsedValue = JSON.parse(value);
      if (Array.isArray(parsedValue)) return parsedValue;
    } catch (error) {
      return [{ url: value }];
    }
  }

  return [];
};

const getPaymentDocuments = (entry = {}) => {
  const rawDocuments = [
    ...getPaymentDocumentArray(entry?.p_docs),
    ...getPaymentDocumentArray(entry?.docs),
  ];

  const documents = rawDocuments
    .map((document, index) => {
      const url = document?.secure_url || document?.secureUrl || document?.url || null;
      if (!url) return null;

      return {
        id: document?.public_id || document?.id || `${url}-${index}`,
        url,
        format: String(document?.format || "").toUpperCase(),
        isImage: isPaymentImageDocument({ ...document, url }),
      };
    })
    .filter(Boolean);

  if (documents.length > 0) return documents;

  const fallbackUrl = entry?.image || entry?.image_url || entry?.attachment || entry?.payment_image || null;
  if (!fallbackUrl) return [];

  return [
    {
      id: fallbackUrl,
      url: fallbackUrl,
      format: "",
      isImage: isPaymentImageDocument({ url: fallbackUrl }),
    },
  ];
};

const normalizePaymentItem = (entry = {}, index = 0) => {
  const amount =
    entry?.p_amount ??
    entry?.amount ??
    entry?.paid_amount ??
    entry?.total_amount ??
    entry?.payment_amount ??
    entry?.pm_amount ??
    0;
  const soldPrice =
    entry?.p_sold_price ??
    entry?.sold_price ??
    entry?.vehicle_sold_price ??
    entry?.price_sold ??
    0;
  const duePrice =
    entry?.p_due_price ??
    entry?.due_price ??
    entry?.vehicle_due_price ??
    entry?.price_due ??
    0;

  return {
    id: entry?.p_id || entry?.id || entry?.pm_id || entry?.vp_id || entry?.payment_id || `payment-${index}`,
    method: entry?.p_method || entry?.payment_method || entry?.method || entry?.type || entry?.pm_method || "N/A",
    status: String(entry?.p_status || entry?.payment_status || entry?.status || entry?.pm_status || "unknown").toLowerCase(),
    amount: parsePaymentNumber(amount),
    soldPrice: parsePaymentNumber(soldPrice),
    duePrice: parsePaymentNumber(duePrice),
    currency: String(entry?.p_currency || entry?.currency || "BDT").toUpperCase(),
    customerId:
      entry?.p_cci_id ||
      entry?.cci_id ||
      entry?.contact_info_id ||
      entry?.customer_contact_info_id ||
      entry?.customer_contact?.cci_id ||
      entry?.customer_contact_info?.cci_id ||
      null,
    customerName:
      entry?.customer_contact_info?.cci_name ||
      entry?.customer_contact?.cci_name ||
      entry?.customer_name ||
      entry?.customer?.name ||
      entry?.cus_name ||
      null,
    customerPhone:
      entry?.customer_contact_info?.cci_phone ||
      entry?.customer_contact?.cci_phone ||
      entry?.customer_phone ||
      entry?.customer?.phone ||
      entry?.customer?.mobile ||
      entry?.cus_phone ||
      null,
    transactionId:
      entry?.p_transaction_id ||
      entry?.txn ||
      entry?.txn_id ||
      entry?.transaction_id ||
      entry?.transactionId ||
      null,
    reference: entry?.p_reference || entry?.reference || entry?.ref || entry?.ref_no || entry?.reference_no || null,
    createdAt: entry?.p_created_at || entry?.created_at || entry?.createdAt || entry?.date || null,
    paidAt: entry?.p_paid_at || entry?.paid_at || entry?.paidAt || entry?.payment_date || null,
    note: entry?.p_note || entry?.note || entry?.remarks || entry?.description || entry?.comment || "",
    entityTitle: entry?.entity?.v_title || entry?.vehicle?.v_title || entry?.product?.name || entry?.product?.title || null,
    entityCode: entry?.entity?.v_code || entry?.vehicle?.v_code || entry?.product?.code || null,
    userName: entry?.user?.name || entry?.entity?.v_shop_user_name || null,
    documents: getPaymentDocuments(entry),
  };
};

const PaymentList = () => {
  const { user } = useAppContext();

  const { currentUserId, userMode } = useMemo(() => {
    if (!user) return { currentUserId: "", userMode: "" };
    const raw = typeof user === "string" ? (() => { try { return JSON.parse(user); } catch { return null; } })() : user;
    return {
      currentUserId: String(raw?.id ?? raw?.u_id ?? ""),
      userMode: String(raw?.user_mode ?? "").toLowerCase(),
    };
  }, [user]);

  const isSupreme = userMode === "supreme";

  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const [customerContactId, setCustomerContactId] = useState("");
  const [appliedCustomerContactId, setAppliedCustomerContactId] = useState("");
  const [cusPhone, setCusPhone] = useState("");
  const [appliedCusPhone, setAppliedCusPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [appliedCustomerName, setAppliedCustomerName] = useState("");
  const [status, setStatus] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  const getCustomers = useCallback(async (userId, supreme = false) => {
    try {
      setCustomersLoading(true);
      const params = supreme ? {} : { _user_id: userId };
      const response = await ContactCustomerService.Queries.getContactCustomers(params);
      if (response?.status === "success") {
        const data = response?.data?.data ?? response?.data ?? [];
        const list = Array.isArray(data) ? data : [];
        setCustomers(list);
      } else {
        setCustomers([]);
      }
    } catch {
      setCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSupreme) {
      getCustomers("", true);
    } else if (currentUserId) {
      getCustomers(currentUserId, false);
    }
  }, [currentUserId, isSupreme, getCustomers]);

  const normalizedPayments = useMemo(
    () => payments.map((payment, index) => normalizePaymentItem(payment, index)),
    [payments]
  );

  const paymentSummary = useMemo(() => {
    return normalizedPayments.reduce(
      (summary, payment) => {
        const status = String(payment.status || "").toLowerCase();

        return {
          totalAmount: summary.totalAmount + payment.amount,
          paidAmount: ["paid", "success", "completed"].includes(status)
            ? summary.paidAmount + payment.amount
            : summary.paidAmount,
          dueAmount: summary.dueAmount + payment.duePrice,
          currency: summary.currency || payment.currency || "BDT",
        };
      },
      { totalAmount: 0, paidAmount: 0, dueAmount: 0, currency: "BDT" }
    );
  }, [normalizedPayments]);

  const getPayments = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const params = {
        _page: currentPage,
        _perPage: itemsPerPage,
        _entity: PAYMENT_ENTITY,
      };

      if (appliedCustomerContactId.trim()) {
        params._cci_id = appliedCustomerContactId.trim();
      }

      if (appliedCusPhone.trim()) {
        params._cus_phone = appliedCusPhone.trim();
      }

      if (appliedCustomerName.trim()) {
        params._cus_name = appliedCustomerName.trim();
      }

      if (appliedStatus.trim()) {
        params._status = appliedStatus.trim();
      }

      if (appliedQuery.trim()) {
        params._search = appliedQuery.trim();
      }

      const response = await VehicleService.Queries.getPaymentHistory(params);
      const rows = getPaymentListFromResponse(response);

      setPayments(rows);
      setTotalItems(getPaymentTotalFromResponse(response, rows.length));

      if (response?.status && response.status !== "success" && rows.length === 0) {
        toast.error(response?.message || "Failed to fetch payment list.");
      }
    } catch (error) {
      const message =
        error?.message ||
        error?.data?.message ||
        error?.response?.data?.message ||
        "Failed to fetch payment list.";

      setPayments([]);
      setTotalItems(0);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [appliedCustomerContactId, appliedCusPhone, appliedCustomerName, appliedStatus, appliedQuery, currentPage, itemsPerPage]);

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    setAppliedCustomerContactId(customerContactId ? customerContactId.trim() : "");
    setAppliedCusPhone(cusPhone.trim());
    setAppliedCustomerName(customerName.trim());
    setAppliedStatus(status.trim());
    setAppliedQuery(query.trim());
  };

  const handleClearSearch = () => {
    setQuery("");
    setAppliedQuery("");
    setCustomerContactId("");
    setAppliedCustomerContactId("");
    setCusPhone("");
    setAppliedCusPhone("");
    setCustomerName("");
    setAppliedCustomerName("");
    setStatus("");
    setAppliedStatus("");
    setCurrentPage(1);
  };

  useEffect(() => {
    getPayments();
  }, [getPayments]);

  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-gray-50 px-6">
      <main className="mx-auto my-6 w-full rounded-lg border border-gray-200 bg-white p-6 shadow-lg">

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Payment List</h2>
          <p className="mt-1 text-sm text-gray-500">Vehicle payment records</p>
        </div>

        <div className="mb-6">
          <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-3 w-full">
            <div className="w-full sm:w-auto">
              <label htmlFor="paymentRowsPerPage" className="mb-1 block text-sm font-medium text-gray-700">
                Show
              </label>
              <select
                id="paymentRowsPerPage"
                value={itemsPerPage}
                onChange={(event) => {
                  setCurrentPage(1);
                  setItemsPerPage(Number(event.target.value));
                }}
                className="h-10 w-full sm:w-[100px] rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            <div className="w-full sm:w-48 lg:w-56 text-left flex-grow">
              <label htmlFor="paymentCustomerContactId" className="mb-1 block text-sm font-medium text-gray-700">
                Customer
              </label>
              <Select
                id="paymentCustomerContactId"
                options={[
                  { value: "", label: "-- Select Customer --" },
                  ...customers.map((customer) => {
                    const cciId =
                      customer?.cci_id ?? customer?.id ?? customer?.customer_contact_info_id ?? "";
                    const name =
                      customer?.cci_name ?? customer?.name ?? customer?.customer_name ?? "";
                    return {
                      value: String(cciId),
                      label: `${name} | ${cciId}`,
                    };
                  }),
                ]}
                value={
                  customerContactId
                    ? {
                      value: customerContactId,
                      label:
                        customers.reduce((acc, customer) => {
                          const cciId = String(
                            customer?.cci_id ?? customer?.id ?? customer?.customer_contact_info_id ?? ""
                          );
                          const name =
                            customer?.cci_name ?? customer?.name ?? customer?.customer_name ?? "";
                          if (cciId === customerContactId) {
                            return `${name} | ${cciId}`;
                          }
                          return acc;
                        }, "") || customerContactId,
                    }
                    : null
                }
                onChange={(selectedOption) => setCustomerContactId(selectedOption?.value || "")}
                isDisabled={customersLoading}
                isLoading={customersLoading}
                isClearable={true}
                instanceId="customer-select"
                className="react-select-container text-sm"
                classNamePrefix="react-select"
                placeholder="-- Select Customer --"
              />
            </div>

            <div className="w-full sm:w-auto flex-grow">
              <label htmlFor="paymentCustomerName" className="mb-1 block text-sm font-medium text-gray-700">
                Customer Name
              </label>
              <input
                id="paymentCustomerName"
                type="text"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Enter name"
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="w-full sm:w-auto flex-grow">
              <label htmlFor="paymentCusPhone" className="mb-1 block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                id="paymentCusPhone"
                type="text"
                value={cusPhone}
                onChange={(event) => setCusPhone(event.target.value)}
                placeholder="Enter phone"
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="w-full sm:w-auto flex-grow">
              <label htmlFor="paymentStatus" className="mb-1 block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="paymentStatus"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="paid">Paid / Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed / Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* <div>
              <label htmlFor="paymentSearch" className="mb-1 block text-sm font-medium text-gray-700">
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="paymentSearch"
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Reference, customer, transaction"
                  className="h-10 w-full rounded-md border border-gray-300 px-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div> */}

            <div className="flex items-center gap-2 w-full sm:w-auto lg:mt-6 flex-grow sm:flex-grow-0">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-10 flex-1 sm:flex-none items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </button>
              <button
                type="button"
                onClick={handleClearSearch}
                disabled={loading}
                className="inline-flex h-10 flex-1 sm:flex-none items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                Reset
              </button>
            </div>
          </form>
        </div>



        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-500">Total Records</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{totalItems}</p>
          </div>
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-500">Page Amount</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {formatPaymentAmount(paymentSummary.totalAmount, paymentSummary.currency)}
            </p>
          </div>
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-500">Page Paid</p>
            <p className="mt-1 text-2xl font-semibold text-green-700">
              {formatPaymentAmount(paymentSummary.paidAmount, paymentSummary.currency)}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border border-gray-300">
          <Table className="min-w-[1320px]">
            <TableHeader>
              <TableRow className="border-b border-gray-300">
                <TableHead className="w-[70px] border-r border-gray-300 text-center">SL</TableHead>
                <TableHead className="border-r border-gray-300">Payment ID</TableHead>
                <TableHead className="border-r border-gray-300">Customer</TableHead>
                <TableHead className="border-r border-gray-300">Product</TableHead>
                <TableHead className="border-r border-gray-300">Method</TableHead>
                <TableHead className="border-r border-gray-300">Status</TableHead>
                <TableHead className="border-r border-gray-300">Amount</TableHead>
                <TableHead className="border-r border-gray-300">Sold / Due</TableHead>
                <TableHead className="border-r border-gray-300">Transaction</TableHead>
                <TableHead className="border-r border-gray-300">Reference</TableHead>
                <TableHead className="border-r border-gray-300">Dates</TableHead>
                {/* <TableHead className="border-r border-gray-300">Attachment</TableHead> */}
              </TableRow>
            </TableHeader>

            <TableBody>
              {!loading && normalizedPayments.length > 0 ? (
                normalizedPayments.map((payment, index) => {
                  const primaryDocument = payment.documents[0] || null;

                  return (
                    <TableRow key={payment.id || index} className="border-b border-gray-200 align-top">
                      <TableCell className="border-r border-gray-200 text-center font-medium">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="border-r border-gray-200 font-medium text-gray-900">
                        {payment.id}
                      </TableCell>
                      <TableCell className="border-r border-gray-200">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{payment.customerName || "N/A"}</p>
                          <p className="text-sm text-gray-600">{payment.customerPhone || "N/A"}</p>
                          {payment.customerId ? <p className="text-xs text-gray-500">CCI: {payment.customerId}</p> : null}
                        </div>
                      </TableCell>
                      <TableCell className="border-r border-gray-200">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{payment.entityTitle || "N/A"}</p>
                          <p className="text-sm text-gray-600">{payment.entityCode || "N/A"}</p>
                          {payment.userName ? <p className="text-xs text-gray-500">{payment.userName}</p> : null}
                        </div>
                      </TableCell>
                      <TableCell className="border-r border-gray-200 font-medium">
                        {formatPaymentText(payment.method)}
                      </TableCell>
                      <TableCell className="border-r border-gray-200">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusClasses(payment.status)}`}>
                          {formatPaymentText(payment.status)}
                        </span>
                      </TableCell>
                      <TableCell className="border-r border-gray-200">
                        <p className="font-semibold text-gray-900">{formatPaymentAmount(payment.amount, payment.currency)}</p>
                        <p className="text-xs text-gray-500">{payment.currency}</p>
                      </TableCell>
                      <TableCell className="border-r border-gray-200">
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-medium text-gray-500">Sold:</span>{" "}
                            <span className="font-semibold text-gray-900">{formatPaymentAmount(payment.soldPrice, payment.currency)}</span>
                          </p>
                          <p>
                            <span className="font-medium text-gray-500">Due:</span>{" "}
                            <span className="font-semibold text-gray-900">{formatPaymentAmount(payment.duePrice, payment.currency)}</span>
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="border-r border-gray-200 font-medium">
                        {payment.transactionId || "N/A"}
                      </TableCell>
                      <TableCell className="border-r border-gray-200 font-medium">
                        {payment.reference || "N/A"}
                      </TableCell>
                      <TableCell className="border-r border-gray-200">
                        <div className="space-y-1 text-sm text-gray-700">
                          <p>
                            <span className="font-medium text-gray-500">Created:</span> {formatPaymentDateTime(payment.createdAt)}
                          </p>
                          <p>
                            <span className="font-medium text-gray-500">Paid:</span> {formatPaymentDateTime(payment.paidAt)}
                          </p>
                        </div>
                      </TableCell>
                      {/* <TableCell className="border-r border-gray-200">
                        {primaryDocument ? (
                          <div className="flex items-center gap-3">
                            <a
                              href={primaryDocument.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-100 text-xs font-semibold text-gray-500"
                              aria-label="Open payment attachment"
                            >
                              {primaryDocument.isImage ? (
                                <img
                                  src={primaryDocument.url}
                                  alt="Payment attachment"
                                  className="h-full w-full object-cover transition group-hover:scale-105"
                                />
                              ) : (
                                primaryDocument.format || "FILE"
                              )}
                            </a>
                            <a
                              href={primaryDocument.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                              View
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No attachment</span>
                        )}
                      </TableCell> */}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={12} className="h-[320px] text-center text-gray-500">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        <span className="font-semibold text-gray-500">Loading payment list...</span>
                      </div>
                    ) : errorMessage ? (
                      <span className="font-medium text-red-600">{errorMessage}</span>
                    ) : (
                      <span>No payment data found.</span>
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
      </main>
      <Footer />
    </div>
  );
};

export default PaymentList;
