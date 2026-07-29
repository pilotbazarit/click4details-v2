"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import dayjs from "dayjs";
import {
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Download,
  DollarSign,
  ExternalLink,
  FileText,
  IdCard,
  Loader2,
  Paperclip,
  Pencil,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Ticket,
  Trash2,
  Users,
  Wallet,
  X,
  Banknote,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { API_URL } from "@/helpers/apiUrl";
import ContactCustomerModal from "@/components/modals/ContactCustomerModal";
import ContactCustomerService from "@/services/ContactCustomerService";
import VehicleService from "@/services/VehicleService";
import { parseStoredUser } from "@/lib/parseStoredUser";

const getPaymentHistoryFilterValue = (values = []) => {
  for (const value of values) {
    if (value === undefined || value === null) continue;

    const normalized = String(value).trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
};

const getPaymentHistoryListFromResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.list)) return response.list;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data?.list)) return response.data.list;
  return [];
};

const getClientPaymentStatusClasses = (status) => {
  if (status === "paid" || status === "success") {
    return "bg-green-100 text-green-700";
  }

  if (status === "pending" || status === "due") {
    return "bg-yellow-100 text-yellow-700";
  }

  if (status === "failed" || status === "cancelled" || status === "canceled") {
    return "bg-red-100 text-red-700";
  }

  return "bg-gray-100 text-gray-700";
};

const getClientPaymentCurrencyLabel = (currency) => {
  const normalizedCurrency = String(currency || "BDT").toUpperCase();
  if (normalizedCurrency === "BDT") return "Tk";
  return normalizedCurrency;
};

const parseClientPaymentNumber = (value) => {
  const normalizedValue = Number(String(value ?? 0).replace(/,/g, "").trim());
  return Number.isFinite(normalizedValue) ? normalizedValue : 0;
};

const formatClientPaymentInputNumber = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const digits = raw.replace(/\D+/g, "");
  if (!digits) return "";

  return new Intl.NumberFormat("en-IN").format(Number(digits));
};

const formatClientPaymentAmount = (amount, currency = "BDT") => {
  const numericAmount = parseClientPaymentNumber(amount);
  const currencyLabel = getClientPaymentCurrencyLabel(currency);
  if (!Number.isFinite(numericAmount)) return `${currencyLabel} 0.00`;

  return `${currencyLabel} ${numericAmount.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatClientPaymentDateTime = (dateValue) => {
  if (!dateValue) return "N/A";

  const parsedDate = dayjs(dateValue);
  if (!parsedDate.isValid()) return "N/A";

  return parsedDate.format("DD MMM YYYY, hh:mm A");
};

const formatClientPaymentText = (value) => {
  const normalizedValue = String(value || "").trim();
  if (!normalizedValue) return "N/A";

  return normalizedValue
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const clientPaymentNumberWordsUnderTwenty = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const clientPaymentNumberWordsTens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

const numberToClientPaymentWordsBelowThousand = (num) => {
  if (num < 20) return clientPaymentNumberWordsUnderTwenty[num];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return unit
      ? `${clientPaymentNumberWordsTens[ten]} ${clientPaymentNumberWordsUnderTwenty[unit]}`
      : clientPaymentNumberWordsTens[ten];
  }

  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  return remainder
    ? `${clientPaymentNumberWordsUnderTwenty[hundred]} Hundred ${numberToClientPaymentWordsBelowThousand(remainder)}`
    : `${clientPaymentNumberWordsUnderTwenty[hundred]} Hundred`;
};

const numberToClientPaymentIndianWords = (value) => {
  const numeric = Number(String(value).replace(/\D+/g, ""));
  if (!numeric) return "";
  if (numeric < 1000) return numberToClientPaymentWordsBelowThousand(numeric);

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
      parts.push(`${numberToClientPaymentIndianWords(count)} ${unit.label}`);
      remaining %= unit.value;
    }
  });

  if (remaining > 0) {
    parts.push(numberToClientPaymentWordsBelowThousand(remaining));
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
};

const buildClientPaymentPriceOptions = (baseValue) => {
  if (baseValue === null || baseValue === undefined) return [];

  const normalized = String(baseValue).split(".")[0].replace(/\D+/g, "").trim();
  if (normalized.length === 0 || normalized.startsWith("0") || !/^\d+$/.test(normalized)) {
    return [];
  }

  return Array.from({ length: 5 }, (_, index) => {
    const value = `${normalized}${"0".repeat(index)}`;
    return {
      value,
      label: formatClientPaymentInputNumber(value),
      words: numberToClientPaymentIndianWords(value),
    };
  });
};

const IMAGE_DOCUMENT_FORMATS = new Set(["jpg", "jpeg", "png", "webp", "gif", "bmp", "svg", "avif"]);

const isClientPaymentImageDocument = (document = {}) => {
  const documentFormat = String(document?.format || "").toLowerCase();
  if (documentFormat && IMAGE_DOCUMENT_FORMATS.has(documentFormat)) {
    return true;
  }

  const documentUrl = String(document?.url || document?.secureUrl || "");
  return /\.(jpg|jpeg|png|webp|gif|bmp|svg|avif)(\?|$)/i.test(documentUrl);
};

const getClientPaymentDocuments = (entry = {}) => {
  const normalizedDocuments = [];
  const rawDocuments = Array.isArray(entry?.p_docs)
    ? entry.p_docs
    : Array.isArray(entry?.docs)
      ? entry.docs
      : [];

  rawDocuments.forEach((document, index) => {
    const documentUrl = document?.secure_url || document?.secureUrl || document?.url || null;
    if (!documentUrl) return;

    normalizedDocuments.push({
      id: document?.public_id || document?.id || `${documentUrl}-${index}`,
      url: documentUrl,
      format: String(document?.format || "").toUpperCase(),
      isImage: isClientPaymentImageDocument({
        format: document?.format,
        url: documentUrl,
      }),
    });
  });

  if (normalizedDocuments.length > 0) {
    return normalizedDocuments;
  }

  const fallbackDocumentUrl =
    entry?.image ||
    entry?.image_url ||
    entry?.attachment ||
    entry?.payment_image ||
    null;

  if (!fallbackDocumentUrl) {
    return [];
  }

  return [
    {
      id: fallbackDocumentUrl,
      url: fallbackDocumentUrl,
      format: "",
      isImage: isClientPaymentImageDocument({ url: fallbackDocumentUrl }),
    },
  ];
};

const getClientPaymentAttachmentSummary = (documents = []) => {
  if (!Array.isArray(documents) || documents.length === 0) {
    return "No attachment";
  }

  const formats = [...new Set(documents.map((document) => document?.format).filter(Boolean))];
  const fileLabel = `${documents.length} file${documents.length > 1 ? "s" : ""}`;

  if (formats.length === 0) {
    return fileLabel;
  }

  return `${fileLabel} | ${formats.join(", ")}`;
};

const buildInitialCreatePaymentForm = (
  customerName,
  customerPhone,
  initialValues = {}
) => ({
  customerId: "",
  reference: "",
  paidAt: dayjs().format("YYYY-MM-DD"),
  method: "cash",
  currency: "BDT",
  amount: "",
  soldPrice: String(initialValues.soldPrice ?? ""),
  duePrice: String(initialValues.duePrice ?? ""),
  status: "pending",
  transactionId: "",
  note: "",
  documents: [],
  customerName,
  customerPhone,
});

const getPaymentCustomerListFromResponse = (response) => {
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.list)) return response.list;
  if (Array.isArray(response)) return response;
  return [];
};

const getStoredAuthToken = () => {
  if (typeof window === "undefined") return "";

  const directToken = localStorage.getItem("auth_token");
  if (directToken) {
    return directToken;
  }

  try {
    const user = parseStoredUser(localStorage.getItem("user"));
    if (!user) return "";
    return user?.token || "";
  } catch (error) {
    console.error("Failed to parse user from localStorage:", error);
    return "";
  }
};

const sanitizeDownloadFileName = (value) =>
  String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const getDownloadFilenameFromHeaders = (contentDisposition) => {
  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1]);
  }

  const plainMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  return plainMatch?.[1] || "";
};

const getDownloadFileExtensionFromType = (contentType) => {
  const normalizedType = String(contentType || "").toLowerCase();

  if (normalizedType.includes("pdf")) return "pdf";
  if (normalizedType.includes("spreadsheetml") || normalizedType.includes("excel")) return "xlsx";
  if (normalizedType.includes("csv")) return "csv";
  if (normalizedType.includes("zip")) return "zip";
  if (normalizedType.includes("json")) return "json";

  return "bin";
};

const normalizePaymentCustomer = (customer = {}) => {
  const id =
    customer?.cci_id ??
    customer?.id ??
    customer?.contact_info_id ??
    customer?.customer_contact_info_id ??
    "";
  const name = String(
    customer?.cci_name ?? customer?.name ?? customer?.customer_name ?? ""
  ).trim();
  const phone = String(
    customer?.cci_phone ??
    customer?.mobile ??
    customer?.phone ??
    customer?.customer_phone ??
    customer?.email ??
    ""
  ).trim();

  return {
    id: String(id),
    name,
    phone,
    label: [name, phone].filter(Boolean).join(" - "),
  };
};

const clientPaymentCustomerSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "44px",
    borderRadius: "0.75rem",
    borderColor: state.isFocused ? "#a7f3d0" : "#d1d5db",
    backgroundColor: "#fff",
    boxShadow: state.isFocused ? "0 0 0 2px #a7f3d0" : "none",
    paddingLeft: "2.25rem",
    "&:hover": {
      borderColor: state.isFocused ? "#a7f3d0" : "#d1d5db",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 0.75rem",
  }),
  input: (base) => ({
    ...base,
    color: "#111827",
    fontSize: "0.875rem",
    fontWeight: 500,
  }),
  singleValue: (base) => ({
    ...base,
    color: "#111827",
    fontSize: "0.875rem",
    fontWeight: 500,
  }),
  placeholder: (base) => ({
    ...base,
    color: "#9ca3af",
    fontSize: "0.875rem",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 50,
  }),
};

const methodOptions = [
  { value: "cash", label: "Cash" },
  { value: "cash_deposit", label: "Cash Deposit" },
  { value: "advance", label: "Advance" },
  { value: "bank_check", label: "Bank Check" },
  { value: "pay_order", label: "Pay Order" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "rtgs", label: "RTGS" },
  { value: "car_exchange", label: "Car Exchange" },
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "loan", label: "Loan" },
  { value: "mfs", label: "MFS" },
  { value: "bkash", label: "Bkash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" },
  { value: "ssl_commerz", label: "SSL Commerz" },
  { value: "amar_pay", label: "amarPay" },
  { value: "bangla_qr", label: "Bangla QR" },
  { value: "others", label: "Others" },
];

const currencyOptions = [
  { value: "BDT", label: "BDT" },
  { value: "USD", label: "USD" },
  { value: "YEN", label: "YEN" },
];

const statusOptions = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" }
];

const resolvePaymentMethodValue = (value) => {
  const normalizedValue = String(value || "cash").trim().toLowerCase();
  return methodOptions.some((option) => option.value === normalizedValue)
    ? normalizedValue
    : "cash";
};

const resolvePaymentCurrencyValue = (value) => {
  const normalizedValue = String(value || "BDT").trim().toUpperCase();
  return currencyOptions.some((option) => option.value === normalizedValue)
    ? normalizedValue
    : "BDT";
};

const resolvePaymentStatusValue = (value) => {
  const normalizedValue = String(value || "pending").trim().toLowerCase();
  return statusOptions.some((option) => option.value === normalizedValue)
    ? normalizedValue
    : "pending";
};

const isPaidPaymentStatus = (status) => {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  return ["paid", "success", "completed"].includes(normalizedStatus);
};

const isRefundedPaymentStatus = (status) => {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  return ["refunded", "refund"].includes(normalizedStatus);
};

const getClientPaymentSignedAmount = (amount, status) => {
  const numericAmount = parseClientPaymentNumber(amount);
  if (isPaidPaymentStatus(status)) return numericAmount;
  if (isRefundedPaymentStatus(status)) return -numericAmount;
  return 0;
};

const buildPaymentHistoryQueryParams = ({
  productId,
  customerId = "",
  perPage = 100,
}) => {
  const params = {
    _page: 1,
    _perPage: perPage,
    _entity: "\\App\\Models\\Product\\Vehicle",
    _entity_id: productId,
  };

  if (customerId) {
    params._cci_id = customerId;
  }

  return params;
};

const ClientPaymentHistoryModal = ({ open, setOpen, product, parsedUser = null }) => {
  const [clientPaymentHistoryItems, setClientPaymentHistoryItems] = useState([]);
  const [isClientPaymentHistoryLoading, setIsClientPaymentHistoryLoading] = useState(false);
  const [clientPaymentHistoryError, setClientPaymentHistoryError] = useState("");

  const [createPaymentOpen, setCreatePaymentOpen] = useState(false);
  const [contactCustomerModalOpen, setContactCustomerModalOpen] = useState(false);
  const [editingPaymentItem, setEditingPaymentItem] = useState(null);
  const [advancedDetailsOpen, setAdvancedDetailsOpen] = useState(true);
  const [isCreatePaymentSubmitting, setIsCreatePaymentSubmitting] = useState(false);
  const [isPaymentHistoryDownloading, setIsPaymentHistoryDownloading] = useState(false);
  const [paymentHistoryDownloadOpen, setPaymentHistoryDownloadOpen] = useState(false);
  const [paymentHistoryDownloadForm, setPaymentHistoryDownloadForm] = useState({
    description: "",
    customerId: "",
    paAmount: "",
    paReason: "",
  });
  const [deletingPaymentId, setDeletingPaymentId] = useState(null);
  const [createPaymentCustomers, setCreatePaymentCustomers] = useState([]);
  const [isCreatePaymentCustomersLoading, setIsCreatePaymentCustomersLoading] = useState(false);
  const [isCreatePaymentCustomerHistoryLoading, setIsCreatePaymentCustomerHistoryLoading] = useState(false);
  const [createPaymentCustomerPaidAmount, setCreatePaymentCustomerPaidAmount] = useState(0);
  const [isCreatePaymentSoldPriceLocked, setIsCreatePaymentSoldPriceLocked] = useState(false);
  const [selectedPaymentCustomerId, setSelectedPaymentCustomerId] = useState("");
  const [createPaymentForm, setCreatePaymentForm] = useState(() =>
    buildInitialCreatePaymentForm("", "")
  );
  const [isSoldPriceDropdownOpen, setIsSoldPriceDropdownOpen] = useState(false);
  const [isAmountDropdownOpen, setIsAmountDropdownOpen] = useState(false);
  const [isPaymentHistoryDownloadPaAmountDropdownOpen, setIsPaymentHistoryDownloadPaAmountDropdownOpen] = useState(false);
  const productId = getPaymentHistoryFilterValue([product?.id, product?.v_id]);
  const customerPhone = getPaymentHistoryFilterValue([
    product?.cus_phone,
    product?.customer_phone,
    product?.client_phone,
    product?.buyer_phone,
    product?.lead_phone,
    product?.customer_mobile,
    product?.phone,
    parsedUser?.phone,
  ]);
  const customerName = getPaymentHistoryFilterValue([
    product?.cus_name,
    product?.customer_name,
    product?.client_name,
    product?.buyer_name,
    product?.lead_name,
    product?.customer,
    parsedUser?.name,
  ]);
  const createPaymentUserId = getPaymentHistoryFilterValue([product?.v_user_id]);
  const createPaymentContactUserId = getPaymentHistoryFilterValue([
    parsedUser?.id,
    parsedUser?.u_id,
  ]);
  const paymentUserLabel = getPaymentHistoryFilterValue([
    parsedUser?.name,
    parsedUser?.phone,
    parsedUser?.email,
  ]);
  const isEditPaymentMode = Boolean(editingPaymentItem?.id);
  const soldPriceOptions = useMemo(
    () => buildClientPaymentPriceOptions(createPaymentForm.soldPrice),
    [createPaymentForm.soldPrice]
  );
  const amountOptions = useMemo(
    () => buildClientPaymentPriceOptions(createPaymentForm.amount),
    [createPaymentForm.amount]
  );
  const paymentHistoryDownloadPaAmountOptions = useMemo(
    () => buildClientPaymentPriceOptions(paymentHistoryDownloadForm.paAmount),
    [paymentHistoryDownloadForm.paAmount]
  );
  const createPaymentCustomerOptions = useMemo(
    () =>
      createPaymentCustomers.map((customer) => ({
        value: customer.id,
        label: customer.label,
      })),
    [createPaymentCustomers]
  );
  const selectedCreatePaymentCustomerOption = useMemo(
    () =>
      createPaymentCustomerOptions.find(
        (option) => option.value === String(createPaymentForm.customerId || "")
      ) || null,
    [createPaymentCustomerOptions, createPaymentForm.customerId]
  );
  const selectedPaymentCustomerOption = useMemo(
    () =>
      createPaymentCustomerOptions.find(
        (option) => option.value === String(selectedPaymentCustomerId || "")
      ) || null,
    [createPaymentCustomerOptions, selectedPaymentCustomerId]
  );

  const fetchClientPaymentHistory = useCallback(async () => {
    if (!productId) {
      setClientPaymentHistoryItems([]);
      setClientPaymentHistoryError("Product id not found.");
      return;
    }

    setIsClientPaymentHistoryLoading(true);
    setClientPaymentHistoryError("");

    try {
      const params = buildPaymentHistoryQueryParams({
        productId,
        customerId: selectedPaymentCustomerId,
        perPage: 100,
      });
      const response = await VehicleService.Queries.getPaymentHistory(params);
      const responseList = getPaymentHistoryListFromResponse(response);
      setClientPaymentHistoryItems(responseList);
    } catch (error) {
      setClientPaymentHistoryItems([]);
      setClientPaymentHistoryError(
        error?.message ||
        error?.data?.message ||
        error?.response?.data?.message ||
        "Failed to load client payment history."
      );
    } finally {
      setIsClientPaymentHistoryLoading(false);
    }
  }, [productId, selectedPaymentCustomerId]);

  const fetchCreatePaymentCustomerPricing = useCallback(
    async (customerId) => {
      if (!productId || !customerId) {
        return {
          soldPrice: "",
          paidAmount: 0,
          hasExistingSoldPrice: false,
        };
      }

      setIsCreatePaymentCustomerHistoryLoading(true);

      try {
        const response = await VehicleService.Queries.getPaymentHistory(
          buildPaymentHistoryQueryParams({
            productId,
            customerId,
            perPage: 500,
          })
        );
        const responseList = getPaymentHistoryListFromResponse(response);
        const firstPaymentItem = responseList[0];
        const soldPriceValue =
          firstPaymentItem?.p_sold_price ??
          firstPaymentItem?.sold_price ??
          firstPaymentItem?.vehicle_sold_price ??
          firstPaymentItem?.price_sold ??
          "";
        const normalizedSoldPrice =
          soldPriceValue === "" ? "" : String(parseClientPaymentNumber(soldPriceValue));
        const paidAmount = responseList.reduce((totalPaidAmount, paymentItem) => {
          const paymentStatus =
            paymentItem?.p_status ??
            paymentItem?.payment_status ??
            paymentItem?.status ??
            paymentItem?.pm_status ??
            "";

          const paymentAmount =
            paymentItem?.p_amount ??
            paymentItem?.amount ??
            paymentItem?.paid_amount ??
            paymentItem?.total_amount ??
            paymentItem?.payment_amount ??
            paymentItem?.pm_amount ??
            0;

          return totalPaidAmount + getClientPaymentSignedAmount(paymentAmount, paymentStatus);
        }, 0);

        return {
          soldPrice: normalizedSoldPrice,
          paidAmount,
          hasExistingSoldPrice: normalizedSoldPrice !== "",
        };
      } catch (error) {
        toast.error(
          error?.message ||
          error?.data?.message ||
          error?.response?.data?.message ||
          "Failed to load customer payment pricing."
        );
        return {
          soldPrice: "",
          paidAmount: 0,
          hasExistingSoldPrice: false,
        };
      } finally {
        setIsCreatePaymentCustomerHistoryLoading(false);
      }
    },
    [productId]
  );

  useEffect(() => {
    if (!open) return;
    fetchClientPaymentHistory();
  }, [open, fetchClientPaymentHistory]);

  const fetchCreatePaymentCustomers = useCallback(async () => {
    if (!createPaymentContactUserId) {
      setCreatePaymentCustomers([]);
      return;
    }

    try {
      setIsCreatePaymentCustomersLoading(true);
      const response = await ContactCustomerService.Queries.getContactCustomers({
        _user_id: createPaymentContactUserId,
        _page: 1,
        _perPage: 5000,
      });
      const rows = getPaymentCustomerListFromResponse(response);

      setCreatePaymentCustomers(
        rows
          .map(normalizePaymentCustomer)
          .filter((customer) => customer.id && customer.name)
      );
    } catch (error) {
      setCreatePaymentCustomers([]);
      toast.error(
        error?.message ||
        error?.data?.message ||
        error?.response?.data?.message ||
        "Failed to load contact customers."
      );
    } finally {
      setIsCreatePaymentCustomersLoading(false);
    }
  }, [createPaymentContactUserId]);

  useEffect(() => {
    if (!open) return;
    fetchCreatePaymentCustomers();
  }, [open, fetchCreatePaymentCustomers]);

  const clientPaymentHistory = useMemo(
    () =>
      clientPaymentHistoryItems.map((entry, index) => {
        const amountValue =
          entry?.p_amount ??
          entry?.amount ??
          entry?.paid_amount ??
          entry?.total_amount ??
          entry?.payment_amount ??
          entry?.pm_amount ??
          0;
        const soldPriceValue =
          entry?.p_sold_price ??
          entry?.sold_price ??
          entry?.vehicle_sold_price ??
          entry?.price_sold ??
          0;
        const duePriceValue =
          entry?.p_due_price ??
          entry?.due_price ??
          entry?.vehicle_due_price ??
          entry?.price_due ??
          0;
        const documents = getClientPaymentDocuments(entry);

        return {
          id: entry?.p_id || entry?.id || entry?.pm_id || entry?.vp_id || entry?.payment_id || `payment-${index}`,
          method: entry?.p_method || entry?.payment_method || entry?.method || entry?.type || entry?.pm_method || "N/A",
          status: String(entry?.p_status || entry?.payment_status || entry?.status || entry?.pm_status || "unknown").toLowerCase(),
          amount: parseClientPaymentNumber(amountValue),
          soldPrice: parseClientPaymentNumber(soldPriceValue),
          duePrice: parseClientPaymentNumber(duePriceValue),
          currency: String(entry?.p_currency || entry?.currency || "BDT").toUpperCase(),
          contactCustomerId:
            entry?.p_cci_id ||
            entry?.cci_id ||
            entry?.contact_info_id ||
            entry?.customer_contact_info_id ||
            entry?.customer_contact?.cci_id ||
            null,
          customerName:
            entry?.customer_contact_info?.cci_name ||
            entry?.customer_name ||
            entry?.customer?.name ||
            entry?.cus_name ||
            null,
          customerPhone:
            entry?.customer_contact_info?.cci_phone ||
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
          documents,
          entityTitle: entry?.entity?.v_title || null,
          entityCode: entry?.entity?.v_code || null,
          userName: entry?.user?.name || entry?.entity?.v_shop_user_name || null,
        };
      }),
    [clientPaymentHistoryItems]
  );

  const clientPaymentSummary = useMemo(() => {
    const firstEntryWithSoldPrice =
      clientPaymentHistory.find((entry) => entry.soldPrice > 0) ||
      clientPaymentHistory[0] ||
      null;
    const soldPrice = firstEntryWithSoldPrice?.soldPrice || 0;
    const paidPrice = clientPaymentHistory.reduce(
      (totalAmount, entry) =>
        totalAmount + getClientPaymentSignedAmount(entry.amount, entry.status),
      0
    );

    return {
      soldPrice,
      duePrice: Math.max(soldPrice - paidPrice, 0),
      paidPrice,
      currency: firstEntryWithSoldPrice?.currency || clientPaymentHistory[0]?.currency || "BDT",
    };
  }, [clientPaymentHistory]);

  const buildPaymentFormFromHistoryItem = useCallback(
    (historyItem) => {
      const normalizedHistoryCustomerName = String(historyItem?.customerName || "")
        .trim()
        .toLowerCase();
      const normalizedHistoryCustomerPhone = String(
        historyItem?.customerPhone || ""
      ).trim();

      const matchedCustomer =
        createPaymentCustomers.find((customer) => {
          const isIdMatch =
            historyItem?.contactCustomerId &&
            String(customer.id) === String(historyItem.contactCustomerId);
          const isNameMatch =
            normalizedHistoryCustomerName &&
            customer.name.toLowerCase() === normalizedHistoryCustomerName;
          const isPhoneMatch =
            normalizedHistoryCustomerPhone &&
            customer.phone === normalizedHistoryCustomerPhone;

          return isIdMatch || isNameMatch || isPhoneMatch;
        }) || null;

      return {
        customerId:
          String(
            matchedCustomer?.id ||
            historyItem?.contactCustomerId ||
            ""
          ) || "",
        reference: String(historyItem?.reference || "").trim(),
        paidAt: dayjs(historyItem?.paidAt).isValid()
          ? dayjs(historyItem.paidAt).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"),
        method: resolvePaymentMethodValue(historyItem?.method),
        currency: resolvePaymentCurrencyValue(historyItem?.currency),
        amount:
          historyItem?.amount !== undefined && historyItem?.amount !== null
            ? String(historyItem.amount)
            : "",
        soldPrice:
          historyItem?.soldPrice !== undefined && historyItem?.soldPrice !== null
            ? String(historyItem.soldPrice)
            : "",
        duePrice:
          historyItem?.duePrice !== undefined && historyItem?.duePrice !== null
            ? String(historyItem.duePrice)
            : "",
        status: resolvePaymentStatusValue(historyItem?.status),
        transactionId: String(historyItem?.transactionId || "").trim(),
        note: String(historyItem?.note || "").trim(),
        documents: [],
        customerName:
          matchedCustomer?.name ||
          historyItem?.customerName ||
          customerName ||
          "",
        customerPhone:
          matchedCustomer?.phone ||
          historyItem?.customerPhone ||
          customerPhone ||
          "",
      };
    },
    [createPaymentCustomers, customerName, customerPhone]
  );

  const openCreatePaymentModal = () => {
    const initialForm = buildInitialCreatePaymentForm(customerName, customerPhone);
    setCreatePaymentForm(initialForm);
    setIsSoldPriceDropdownOpen(false);
    setIsAmountDropdownOpen(false);
    setCreatePaymentCustomerPaidAmount(0);
    setIsCreatePaymentSoldPriceLocked(false);
    setAdvancedDetailsOpen(true);
    setEditingPaymentItem(null);
    setCreatePaymentOpen(true);
  };

  useEffect(() => {
    if (!createPaymentOpen || createPaymentCustomers.length === 0 || isEditPaymentMode) {
      return;
    }

    const normalizedCustomerName = String(customerName || "")
      .trim()
      .toLowerCase();
    const normalizedCustomerPhone = String(customerPhone || "").trim();

    const matchedCustomer = createPaymentCustomers.find((customer) => {
      const isNameMatch =
        normalizedCustomerName &&
        customer.name.toLowerCase() === normalizedCustomerName;
      const isPhoneMatch =
        normalizedCustomerPhone && customer.phone === normalizedCustomerPhone;

      return isNameMatch || isPhoneMatch;
    });

    if (!matchedCustomer) {
      return;
    }

    setCreatePaymentForm((prev) => {
      if (String(prev.customerId) === matchedCustomer.id) {
        return prev;
      }

      return {
        ...prev,
        customerId: matchedCustomer.id,
        customerName: matchedCustomer.name || prev.customerName,
        customerPhone: matchedCustomer.phone || prev.customerPhone,
      };
    });
  }, [
    createPaymentCustomers,
    createPaymentOpen,
    customerName,
    customerPhone,
    isEditPaymentMode,
  ]);

  useEffect(() => {
    if (!createPaymentOpen || !isEditPaymentMode || createPaymentCustomers.length === 0) {
      return;
    }

    setCreatePaymentForm(buildPaymentFormFromHistoryItem(editingPaymentItem));
    setCreatePaymentCustomerPaidAmount(0);
    setIsCreatePaymentSoldPriceLocked(true);
  }, [
    buildPaymentFormFromHistoryItem,
    createPaymentCustomers.length,
    createPaymentOpen,
    editingPaymentItem,
    isEditPaymentMode,
  ]);

  useEffect(() => {
    if (!createPaymentOpen || isEditPaymentMode) {
      return;
    }

    const selectedCustomerId = String(createPaymentForm.customerId || "").trim();

    if (!selectedCustomerId) {
      setCreatePaymentCustomerPaidAmount(0);
      setIsCreatePaymentSoldPriceLocked(false);
      setCreatePaymentForm((prev) => {
        if (prev.soldPrice === "" && prev.duePrice === "") {
          return prev;
        }

        return {
          ...prev,
          soldPrice: "",
          duePrice: "",
        };
      });
      return;
    }

    let isCancelled = false;

    const loadCustomerPricing = async () => {
      const pricing = await fetchCreatePaymentCustomerPricing(selectedCustomerId);
      if (isCancelled) {
        return;
      }

      setCreatePaymentCustomerPaidAmount(pricing.paidAmount);
      setIsCreatePaymentSoldPriceLocked(pricing.hasExistingSoldPrice);
      setCreatePaymentForm((prev) => {
        if (prev.customerId !== selectedCustomerId) {
          return prev;
        }

        return {
          ...prev,
          soldPrice: pricing.hasExistingSoldPrice ? pricing.soldPrice : "",
        };
      });
    };

    loadCustomerPricing();

    return () => {
      isCancelled = true;
    };
  }, [
    createPaymentForm.customerId,
    createPaymentOpen,
    fetchCreatePaymentCustomerPricing,
    isEditPaymentMode,
  ]);

  useEffect(() => {
    if (!createPaymentOpen || isEditPaymentMode) {
      return;
    }

    const soldPriceRaw = String(createPaymentForm.soldPrice || "").trim();
    const currentAmount = getClientPaymentSignedAmount(
      createPaymentForm.amount,
      createPaymentForm.status
    );
    const nextDuePrice = soldPriceRaw
      ? String(
        Math.max(
          parseClientPaymentNumber(soldPriceRaw) -
          createPaymentCustomerPaidAmount -
          currentAmount,
          0
        )
      )
      : "";

    setCreatePaymentForm((prev) => {
      if (prev.duePrice === nextDuePrice) {
        return prev;
      }

      return {
        ...prev,
        duePrice: nextDuePrice,
      };
    });
  }, [
    createPaymentCustomerPaidAmount,
    createPaymentForm.amount,
    createPaymentForm.soldPrice,
    createPaymentForm.status,
    createPaymentOpen,
    isEditPaymentMode,
  ]);

  const handlePaymentCustomerSelectionChange = (customerId) => {
    setSelectedPaymentCustomerId(customerId);
  };

  const handlePaymentHistoryDownloadModalChange = (isOpen) => {
    setPaymentHistoryDownloadOpen(isOpen);

    if (!isOpen) {
      setIsPaymentHistoryDownloadPaAmountDropdownOpen(false);
      setPaymentHistoryDownloadForm({
        description: "",
        customerId: "",
        paAmount: "",
        paReason: "",
      });
    }
  };

  const openPaymentHistoryDownloadModal = () => {
    setPaymentHistoryDownloadForm({
      description: "",
      customerId: selectedPaymentCustomerId,
      paAmount: "",
      paReason: "",
    });
    setIsPaymentHistoryDownloadPaAmountDropdownOpen(false);
    setPaymentHistoryDownloadOpen(true);
  };

  const handlePaymentHistoryDownloadFormChange = (field, value) => {
    setPaymentHistoryDownloadForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreatePaymentFieldChange = (field, value) => {
    setCreatePaymentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreatePaymentCustomerChange = (customerId) => {
    const selectedCustomer = createPaymentCustomers.find(
      (customer) => customer.id === customerId
    );

    setIsSoldPriceDropdownOpen(false);
    setIsAmountDropdownOpen(false);
    setCreatePaymentForm((prev) => ({
      ...prev,
      customerId,
      customerName: selectedCustomer?.name || customerName || "",
      customerPhone: selectedCustomer?.phone || customerPhone || "",
      soldPrice: "",
      duePrice: "",
    }));
  };

  const handleCreatePaymentModalChange = (isOpen) => {
    setCreatePaymentOpen(isOpen);

    if (!isOpen) {
      setEditingPaymentItem(null);
      setCreatePaymentCustomerPaidAmount(0);
      setIsCreatePaymentSoldPriceLocked(false);
      setIsSoldPriceDropdownOpen(false);
      setIsAmountDropdownOpen(false);
      setCreatePaymentForm(buildInitialCreatePaymentForm(customerName, customerPhone));
      setAdvancedDetailsOpen(true);
    }
  };

  const handleEditPayment = (historyItem) => {
    setEditingPaymentItem(historyItem);
    setCreatePaymentForm(buildPaymentFormFromHistoryItem(historyItem));
    setAdvancedDetailsOpen(true);
    setCreatePaymentOpen(true);
  };

  const handleContactCustomerModalChange = (isOpen) => {
    setContactCustomerModalOpen(isOpen);
  };

  const handleContactCustomerSaved = async () => {
    setContactCustomerModalOpen(false);
    await fetchCreatePaymentCustomers();
  };

  const handleDeletePayment = async (historyItem) => {
    if (!historyItem?.id) {
      toast.error("Payment id not found.");
      return;
    }

    const isConfirmed = window.confirm("You want to delete this payment.");
    if (!isConfirmed) {
      return;
    }

    setDeletingPaymentId(historyItem.id);

    try {
      const response = await VehicleService.Commands.deletePayment(historyItem.id);

      if (
        response?.status === "success" ||
        response?.status === "Payment deleted successfully" ||
        response?.message
      ) {
        toast.success(response?.message || "Payment deleted successfully.");

        if (editingPaymentItem?.id === historyItem.id) {
          handleCreatePaymentModalChange(false);
        }

        await fetchClientPaymentHistory();
        return;
      }

      toast.error(response?.message || "Failed to delete payment.");
    } catch (error) {
      toast.error(
        error?.message ||
        error?.data?.message ||
        error?.response?.data?.message ||
        "Failed to delete payment."
      );
    } finally {
      setDeletingPaymentId(null);
    }
  };

  const handleDownloadPaymentHistory = async ({
    description = "",
    customerId = "",
    paAmount = "",
    paReason = "",
  } = {}) => {
    if (!productId) {
      toast.error("Product id not found.");
      return false;
    }

    const authToken = getStoredAuthToken();
    if (!authToken) {
      toast.error("Authentication token not found.");
      return false;
    }

    setIsPaymentHistoryDownloading(true);

    try {
      const queryParams = new URLSearchParams({
        p_entity: "\\App\\Models\\Product\\Vehicle",
        p_entity_id: String(productId),
        _is_down: "1",
        p_desc: String(description || "").trim(),
        p_a_amount: String(paAmount || "").trim()
          ? String(parseClientPaymentNumber(paAmount))
          : "",
        p_a_reason: String(paReason || "").trim(),
      });

      const normalizedCustomerId = String(customerId || "").trim();
      if (normalizedCustomerId) {
        queryParams.set("p_cci_id", normalizedCustomerId);
      }

      const response = await fetch(
        `${API_URL}api/payment/download-payment?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "*/*",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to download payment history.";
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const errorPayload = await response.json();
          errorMessage =
            errorPayload?.message ||
            errorPayload?.error ||
            errorMessage;
        } else {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        }

        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        throw new Error("Downloaded file is empty.");
      }

      const headerFilename = getDownloadFilenameFromHeaders(
        response.headers.get("content-disposition") || ""
      );
      const fallbackBaseName =
        sanitizeDownloadFileName(product?.v_code) ||
        sanitizeDownloadFileName(product?.v_title) ||
        `payment-history-${productId}`;
      const fallbackExtension = getDownloadFileExtensionFromType(blob.type);
      const downloadFilename =
        headerFilename || `${fallbackBaseName}.${fallbackExtension}`;

      const objectUrl = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = objectUrl;
      downloadLink.download = downloadFilename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.URL.revokeObjectURL(objectUrl);

      toast.success("Payment history downloaded.");
      return true;
    } catch (error) {
      toast.error(
        error?.message ||
        "Failed to download payment history."
      );
      return false;
    } finally {
      setIsPaymentHistoryDownloading(false);
    }
  };

  const handlePaymentHistoryDownloadSubmit = async (event) => {
    event.preventDefault();

    const didDownload = await handleDownloadPaymentHistory({
      description: paymentHistoryDownloadForm.description,
      customerId: paymentHistoryDownloadForm.customerId,
      paAmount: paymentHistoryDownloadForm.paAmount,
      paReason: paymentHistoryDownloadForm.paReason,
    });

    if (didDownload) {
      handlePaymentHistoryDownloadModalChange(false);
    }
  };

  const handleDocumentsChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    setCreatePaymentForm((prev) => ({
      ...prev,
      documents: [...prev.documents, ...selectedFiles],
    }));

    event.target.value = "";
  };

  const removeDocument = (indexToRemove) => {
    setCreatePaymentForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleCreatePaymentSubmit = async (event) => {
    event.preventDefault();

    if (!productId) {
      toast.error("Product id not found.");
      return;
    }

    if (!String(createPaymentForm.customerId || "").trim()) {
      toast.error("Please select a customer.");
      return;
    }

    // if (!createPaymentForm.reference.trim()) {
    //   toast.error("Reference/Name is required.");
    //   return;
    // }

    // if (!createPaymentForm.paidAt) {
    //   toast.error("Paid at date is required.");
    //   return;
    // }

    const normalizedAmount = Number(String(createPaymentForm.amount).replace(/,/g, ""));
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    const normalizedSoldPrice = parseClientPaymentNumber(createPaymentForm.soldPrice);
    if (String(createPaymentForm.soldPrice).trim() === "" || normalizedSoldPrice <= 0) {
      toast.error("Please enter a valid sold price.");
      return;
    }

    const normalizedDuePrice = parseClientPaymentNumber(createPaymentForm.duePrice);
    if (String(createPaymentForm.duePrice).trim() && normalizedDuePrice < 0) {
      toast.error("Please enter a valid due price.");
      return;
    }

    if (!createPaymentUserId) {
      toast.error("User id not found for payment create.");
      return;
    }

    const formData = new FormData();
    formData.append("p_entity", "\\App\\Models\\Product\\Vehicle");
    formData.append("p_entity_id", String(productId));
    formData.append("p_user_id", String(createPaymentUserId));
    formData.append("p_amount", String(normalizedAmount));
    formData.append("p_currency", createPaymentForm.currency);
    formData.append("p_method", createPaymentForm.method);
    formData.append("p_status", createPaymentForm.status);
    formData.append("p_reference", createPaymentForm.reference.trim());
    formData.append("p_paid_at", createPaymentForm.paidAt);
    formData.append("p_sold_price", String(normalizedSoldPrice));
    formData.append("p_due_price", String(normalizedDuePrice));

    if (isEditPaymentMode) {
      formData.append("_method", "PUT");
    }

    if (createPaymentForm.customerId) {
      formData.append("p_cci_id", String(createPaymentForm.customerId));
    }

    if (createPaymentForm.transactionId.trim()) {
      formData.append("p_transaction_id", createPaymentForm.transactionId.trim());
    }

    if (createPaymentForm.note.trim()) {
      formData.append("p_note", createPaymentForm.note.trim());
    }

    createPaymentForm.documents.forEach((file, index) => {
      formData.append(`p_docs[${index}]`, file);
    });

    setIsCreatePaymentSubmitting(true);

    try {
      const response = isEditPaymentMode
        ? await VehicleService.Commands.updatePayment(editingPaymentItem.id, formData)
        : await VehicleService.Commands.createPayment(formData);

      if (
        response?.status === "success" ||
        response?.status === "Payment created successfully" ||
        response?.status === "Payment updated successfully" ||
        response?.data?.p_id ||
        response?.p_id
      ) {
        toast.success(
          response?.message ||
          (isEditPaymentMode
            ? "Payment updated successfully."
            : "Payment created successfully.")
        );
        handleCreatePaymentModalChange(false);
        await fetchClientPaymentHistory();
        return;
      }

      toast.error(
        response?.message ||
        (isEditPaymentMode
          ? "Failed to update payment."
          : "Failed to create payment.")
      );
    } catch (error) {
      toast.error(
        error?.message ||
        error?.data?.message ||
        error?.response?.data?.message ||
        (isEditPaymentMode
          ? "Failed to update payment."
          : "Failed to create payment.")
      );
    } finally {
      setIsCreatePaymentSubmitting(false);
    }
  };

  const formInputClass =
    "h-12 w-full rounded-2xl border border-gray-300 bg-gray-100 px-10 text-base font-medium text-gray-800 placeholder:text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] w-[98vw] max-w-[1500px] overflow-hidden rounded-3xl border border-gray-200 p-0 [&>button]:hidden">
          <div className="p-4 sm:p-5">
            <DialogHeader className="text-left">
              <div className="flex items-start justify-between gap-3">
                <DialogTitle className="text-2xl font-bold text-gray-800">Client Payment History/Money Receipt</DialogTitle>
                <div className="flex items-center gap-2">

                  <div>
                    <button
                      type="button"
                      onClick={openPaymentHistoryDownloadModal}
                      disabled={isPaymentHistoryDownloading || !productId}
                      className="inline-flex h-9 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPaymentHistoryDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Download Payment History
                    </button>
                  </div>

                  <div className="relative min-w-[250px]">
                    <Users className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Select
                      value={selectedPaymentCustomerOption}
                      onChange={(option) =>
                        handlePaymentCustomerSelectionChange(option?.value || "")
                      }
                      options={createPaymentCustomerOptions}
                      isClearable
                      isSearchable
                      isDisabled={isCreatePaymentCustomersLoading}
                      isLoading={isCreatePaymentCustomersLoading}
                      placeholder={
                        isCreatePaymentCustomersLoading
                          ? "Loading customers..."
                          : "All Customer"
                      }
                      noOptionsMessage={() => "No customers found"}
                      className="text-sm"
                      classNamePrefix="react-select"
                      styles={clientPaymentCustomerSelectStyles}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setContactCustomerModalOpen(true)}
                    className="inline-flex h-9 items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    <Plus className="h-4 w-4" />
                    Add Customer
                  </button>

                  <button
                    type="button"
                    onClick={fetchClientPaymentHistory}
                    disabled={isClientPaymentHistoryLoading}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Refresh payment history"
                  >
                    <RefreshCw className={`h-4 w-4 ${isClientPaymentHistoryLoading ? "animate-spin" : ""}`} />
                  </button>

                  <button
                    type="button"
                    onClick={openCreatePaymentModal}
                    className="inline-flex h-9 items-center gap-1 rounded-full bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create Payment
                  </button>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Close client payment history"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    Total Sold Price
                  </p>
                  <p className="mt-2 text-2xl font-bold text-emerald-950">
                    {isClientPaymentHistoryLoading
                      ? "--"
                      : formatClientPaymentAmount(
                        clientPaymentSummary.soldPrice,
                        clientPaymentSummary.currency
                      )}
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                    Total Paid Price
                  </p>
                  <p className="mt-2 text-2xl font-bold text-amber-950">
                    {isClientPaymentHistoryLoading
                      ? "--"
                      : formatClientPaymentAmount(
                        clientPaymentSummary.paidPrice,
                        clientPaymentSummary.currency
                      )}
                  </p>
                </div>

                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                    Total Due Amount
                  </p>
                  <p className="mt-2 text-2xl font-bold text-rose-950">
                    {isClientPaymentHistoryLoading
                      ? "--"
                      : formatClientPaymentAmount(
                        clientPaymentSummary.duePrice,
                        clientPaymentSummary.currency
                      )}
                  </p>
                </div>
              </div>

              {isClientPaymentHistoryLoading ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm font-medium text-gray-500">
                  Loading client payment history...
                </div>
              ) : clientPaymentHistoryError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm font-medium text-red-600">
                  {clientPaymentHistoryError}
                </div>
              ) : clientPaymentHistory.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm font-medium text-gray-500">
                  No client payment history found.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-[#d7dee8] bg-white shadow-sm">
                  <div className="w-full overflow-x-auto">
                    <div className="max-h-[64vh] min-w-[1180px] overflow-y-auto overscroll-contain">
                      <table className="w-full border-collapse text-left text-sm text-slate-700">
                        <thead className="sticky top-0 z-10 bg-[#f8fafc]">
                          <tr className="border-b border-[#d7dee8]">
                            <th className="border-r border-[#d7dee8] px-4 py-3 text-base font-semibold leading-snug text-slate-500">
                              Payment Method
                            </th>
                            <th className="border-r border-[#d7dee8] px-4 py-3 text-base font-semibold leading-snug text-slate-500">
                              Customer Information
                            </th>
                            <th className="border-r border-[#d7dee8] px-4 py-3 text-base font-semibold leading-snug text-slate-500">
                              Payment Status
                            </th>
                            <th className="border-r border-[#d7dee8] px-4 py-3 text-base font-semibold leading-snug text-slate-500">
                              Amount
                            </th>
                            <th className="border-r border-[#d7dee8] px-4 py-3 text-base font-semibold leading-snug text-slate-500">
                              Transaction No
                            </th>
                            <th className="border-r border-[#d7dee8] px-4 py-3 text-base font-semibold leading-snug text-slate-500">
                              Reference No
                            </th>
                            <th className="border-r border-[#d7dee8] px-4 py-3 text-base font-semibold leading-snug text-slate-500">
                              Created
                            </th>
                            <th className="border-r border-[#d7dee8] px-4 py-3 text-base font-semibold leading-snug text-slate-500">
                              Paid At
                            </th>
                            <th className="border-r border-[#d7dee8] px-4 py-3 text-base font-semibold leading-snug text-slate-500">
                              Image
                            </th>
                            <th className="px-4 py-3 text-base font-semibold leading-snug text-slate-500">
                              Action
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {clientPaymentHistory.map((historyItem, index) => {
                            const primaryDocument = historyItem.documents[0] || null;

                            return (
                              <tr
                                key={historyItem.id || `${productId || "product"}-payment-${index}`}
                                className="border-b border-[#e4eaf2] align-middle transition hover:bg-[#fafcff]"
                              >
                                <td className="border-r border-[#e4eaf2] px-5 py-5 text-lg font-semibold text-slate-700">
                                  {formatClientPaymentText(historyItem.method)}
                                </td>

                                <td className="border-r border-[#e4eaf2] px-5 py-5 text-md font-semibold text-slate-700">
                                 
                                  { historyItem?.customerName } - { historyItem?.customerPhone }
                                </td>

                                <td className="border-r border-[#e4eaf2] px-5 py-5">
                                  <span
                                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getClientPaymentStatusClasses(historyItem.status)}`}
                                  >
                                    {formatClientPaymentText(historyItem.status)}
                                  </span>
                                </td>

                                <td className="border-r border-[#e4eaf2] px-5 py-5">
                                  <p className="text-lg font-semibold text-slate-800">
                                    {formatClientPaymentAmount(historyItem.amount, historyItem.currency)}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-500">{historyItem.currency}</p>
                                </td>

                                <td className="border-r border-[#e4eaf2] px-5 py-5 text-lg font-medium text-slate-700">
                                  {historyItem.transactionId || "N/A"}
                                </td>

                                <td className="border-r border-[#e4eaf2] px-5 py-5 text-lg font-medium text-slate-700">
                                  {historyItem.reference || "N/A"}
                                </td>

                                <td className="border-r border-[#e4eaf2] px-5 py-5 text-base text-slate-700">
                                  {formatClientPaymentDateTime(historyItem.createdAt)}
                                </td>

                                <td className="border-r border-[#e4eaf2] px-5 py-5 text-base text-slate-700">
                                  {formatClientPaymentDateTime(historyItem.paidAt)}
                                </td>

                                <td className="border-r border-[#e4eaf2] px-5 py-5">
                                  {primaryDocument ? (
                                    <div className="flex min-w-[190px] items-center gap-3">
                                      <a
                                        href={primaryDocument.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group block h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#d7dee8] bg-slate-100"
                                        title="Open payment image"
                                      >
                                        {primaryDocument.isImage ? (
                                          <img
                                            src={primaryDocument.url}
                                            alt={`Payment attachment ${index + 1}`}
                                            className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                                          />
                                        ) : (
                                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-500">
                                            {primaryDocument.format || "FILE"}
                                          </div>
                                        )}
                                      </a>

                                      <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-slate-700">
                                          {getClientPaymentAttachmentSummary(historyItem.documents)}
                                        </p>
                                        {historyItem.documents.length > 1 && (
                                          <p className="mt-1 text-xs text-slate-500">
                                            +{historyItem.documents.length - 1} more file
                                            {historyItem.documents.length > 2 ? "s" : ""}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-base text-slate-400">No image</span>
                                  )}
                                </td>

                                <td className="px-5 py-5">
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => handleEditPayment(historyItem)}
                                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7dee8] text-[#2563eb] transition hover:border-[#2563eb] hover:bg-blue-50"
                                      aria-label={`Edit payment ${index + 1}`}
                                      title="Edit payment"
                                    >
                                      <Pencil className="h-5 w-5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeletePayment(historyItem)}
                                      disabled={deletingPaymentId === historyItem.id}
                                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#fecaca] text-[#dc2626] transition hover:border-[#dc2626] hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                      aria-label={`Delete payment ${index + 1}`}
                                      title="Delete payment"
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>

                                    {primaryDocument ? (
                                      <a
                                        href={primaryDocument.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7dee8] text-[#f97316] transition hover:border-[#f97316] hover:bg-orange-50"
                                        aria-label={`Open payment attachment ${index + 1}`}
                                        title="Open attachment"
                                      >
                                        <ExternalLink className="h-5 w-5" />
                                      </a>
                                    ) : null}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex items-center justify-end border-t border-[#d7dee8] bg-[#f8fafc] px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-[#d7dee8] bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={paymentHistoryDownloadOpen}
        onOpenChange={handlePaymentHistoryDownloadModalChange}
      >
        <DialogContent className="w-[94vw] max-w-2xl rounded-2xl border border-gray-200 p-0">
          <form onSubmit={handlePaymentHistoryDownloadSubmit}>
            <div className="p-5 sm:p-6">
              <DialogHeader className="text-left">
                <DialogTitle className="text-2xl font-bold text-gray-900 uppercase">
                  Download Payment History
                </DialogTitle>
              </DialogHeader>

              <div className="mt-5 space-y-4">
                <div>
                  <label
                    className="mb-1.5 block text-xs font-semibold normal-case text-gray-600"
                    htmlFor="payment-history-download-customer"
                  >
                    Customer Section
                  </label>
                  <div className="relative">
                    <Users className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <select
                      id="payment-history-download-customer"
                      value={paymentHistoryDownloadForm.customerId}
                      onChange={(event) =>
                        handlePaymentHistoryDownloadFormChange(
                          "customerId",
                          event.target.value
                        )
                      }
                      disabled={isPaymentHistoryDownloading || isCreatePaymentCustomersLoading}
                      className={formInputClass}
                    >
                      <option value="">
                        {isCreatePaymentCustomersLoading
                          ? "Loading customers..."
                          : "All Customer"}
                      </option>
                      {createPaymentCustomers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    className="mb-1.5 block text-xs font-semibold normal-case tracking-wide text-gray-600"
                    htmlFor="payment-history-download-description"
                  >
                    Description
                  </label>
                  <div className="relative">
                    <FileText className="pointer-events-none absolute left-3.5 top-4 h-5 w-5 text-gray-500" />
                    <textarea
                      id="payment-history-download-description"
                      value={paymentHistoryDownloadForm.description}
                      onChange={(event) =>
                        handlePaymentHistoryDownloadFormChange(
                          "description",
                          event.target.value
                        )
                      }
                      disabled={isPaymentHistoryDownloading}
                      className="w-full rounded-2xl border border-gray-300 bg-gray-100 px-10 py-3 text-base font-medium text-gray-800 placeholder:text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                      placeholder="Write description"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      className="mb-1.5 block text-xs font-semibold normal-case tracking-wide text-gray-600"
                      htmlFor="payment-history-download-pa-reason"
                    >
                     Additional Reason
                    </label>
                    <div className="relative">
                      <FileText className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                      <input
                        id="payment-history-download-pa-reason"
                        type="text"
                        value={paymentHistoryDownloadForm.paReason}
                        onChange={(event) =>
                          handlePaymentHistoryDownloadFormChange(
                            "paReason",
                            event.target.value
                          )
                        }
                        disabled={isPaymentHistoryDownloading}
                        className={formInputClass}
                        placeholder="Reason"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block text-xs font-semibold normal-case tracking-wide text-gray-600"
                      htmlFor="payment-history-download-pa-amount"
                    >
                      Additional Amount
                    </label>
                    <div className="relative">
                      <Banknote className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                      <input
                        id="payment-history-download-pa-amount"
                        type="text"
                        inputMode="numeric"
                        value={formatClientPaymentInputNumber(paymentHistoryDownloadForm.paAmount)}
                        onChange={(event) => {
                          const nextValue = event.target.value.replace(/\D+/g, "").slice(0, 12);
                          handlePaymentHistoryDownloadFormChange("paAmount", nextValue);
                          setIsPaymentHistoryDownloadPaAmountDropdownOpen(nextValue.length > 0);
                        }}
                        onFocus={() =>
                          setIsPaymentHistoryDownloadPaAmountDropdownOpen(
                            paymentHistoryDownloadPaAmountOptions.length > 0
                          )
                        }
                        onBlur={() => {
                          setTimeout(() => setIsPaymentHistoryDownloadPaAmountDropdownOpen(false), 120);
                        }}
                        disabled={isPaymentHistoryDownloading}
                        className={formInputClass}
                        placeholder="Amount"
                      />
                      {isPaymentHistoryDownloadPaAmountDropdownOpen &&
                        paymentHistoryDownloadPaAmountOptions.length > 0 && (
                          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                            {paymentHistoryDownloadPaAmountOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                                onClick={() => {
                                  handlePaymentHistoryDownloadFormChange("paAmount", option.value);
                                  setIsPaymentHistoryDownloadPaAmountDropdownOpen(false);
                                }}
                              >
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                                  <p className="mt-1 text-xs text-gray-700">{option.words}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-gray-200 bg-white p-4 sm:px-6">
              <button
                type="button"
                onClick={() => handlePaymentHistoryDownloadModalChange(false)}
                disabled={isPaymentHistoryDownloading}
                className="h-11 rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPaymentHistoryDownloading || !productId}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPaymentHistoryDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={createPaymentOpen} onOpenChange={handleCreatePaymentModalChange}>
        <DialogContent className="!top-auto !bottom-0 !translate-y-0 w-full max-w-[740px] rounded-t-3xl border border-gray-200 p-0 sm:!top-[50%] sm:!bottom-auto sm:!translate-y-[-50%] sm:rounded-3xl [&>button]:hidden">
          <form onSubmit={handleCreatePaymentSubmit} className="flex max-h-[90vh] flex-col">
            <div className="px-4 pb-4 pt-2 sm:px-6">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300"></div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <DialogTitle className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
                    {isEditPaymentMode ? "Edit Payment" : "Create Payment"}
                  </DialogTitle>
                  <p className="mt-1 text-sm font-medium text-gray-500">Vehicle payment information</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCreatePaymentModalChange(false)}
                  className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Close create payment"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto border-t border-gray-200 px-4 py-4 sm:px-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Select Customer
                  </label>
                  <div className="relative">
                    <Users className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <Select
                      value={selectedCreatePaymentCustomerOption}
                      onChange={(option) =>
                        handleCreatePaymentCustomerChange(option?.value || "")
                      }
                      options={createPaymentCustomerOptions}
                      isClearable
                      isSearchable
                      isDisabled={
                        isCreatePaymentSubmitting || isCreatePaymentCustomersLoading
                      }
                      isLoading={isCreatePaymentCustomersLoading}
                      placeholder={
                        isCreatePaymentCustomersLoading
                          ? "Loading customers..."
                          : "Select Customer"
                      }
                      noOptionsMessage={() => "No customers found"}
                      className="text-sm"
                      classNamePrefix="react-select"
                      styles={clientPaymentCustomerSelectStyles}
                    />
                  </div>
                </div>

                {/* <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Reference Name
                  </label>
                  <div className="relative">
                    <Ticket className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={createPaymentForm.reference}
                      onChange={(event) => handleCreatePaymentFieldChange("reference", event.target.value)}
                      className={formInputClass}
                      placeholder="Reference/Name"
                    />
                  </div>
                </div> */}

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Paid At</label>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <input
                      type="date"
                      value={createPaymentForm.paidAt}
                      onChange={(event) => handleCreatePaymentFieldChange("paidAt", event.target.value)}
                      className={formInputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Method</label>
                  <div className="relative">
                    <Wallet className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <select
                      value={createPaymentForm.method}
                      onChange={(event) => handleCreatePaymentFieldChange("method", event.target.value)}
                      className={formInputClass}
                    >
                      {methodOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Currency</label>
                  <div className="relative">
                    <RefreshCw className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <select
                      value={createPaymentForm.currency}
                      onChange={(event) => handleCreatePaymentFieldChange("currency", event.target.value)}
                      className={formInputClass}
                    >
                      {currencyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>



              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Sold Price
                  </label>
                  <div className="relative">
                    <Banknote className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatClientPaymentInputNumber(createPaymentForm.soldPrice)}
                      onChange={(event) => {
                        const nextValue = event.target.value.replace(/\D+/g, "").slice(0, 12);
                        handleCreatePaymentFieldChange("soldPrice", nextValue);
                        setIsSoldPriceDropdownOpen(nextValue.length > 0 && !isCreatePaymentSoldPriceLocked);
                      }}
                      onFocus={() =>
                        setIsSoldPriceDropdownOpen(
                          !isCreatePaymentSoldPriceLocked && soldPriceOptions.length > 0
                        )
                      }
                      onBlur={() => {
                        setTimeout(() => setIsSoldPriceDropdownOpen(false), 120);
                      }}
                      required
                      className={formInputClass}
                      placeholder="Sold Price"
                      disabled={isCreatePaymentCustomerHistoryLoading || isCreatePaymentSoldPriceLocked}
                    />
                    {isSoldPriceDropdownOpen && soldPriceOptions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                        {soldPriceOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                            onClick={() => {
                              handleCreatePaymentFieldChange("soldPrice", option.value);
                              setIsSoldPriceDropdownOpen(false);
                            }}
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                              <p className="mt-1 text-xs text-gray-700">{option.words}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Due Price
                  </label>
                  <div className="relative">
                    <Banknote className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={createPaymentForm.duePrice}
                      className={formInputClass}
                      placeholder="Due Price"
                      disabled
                    />
                  </div>
                </div>
              </div>



              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Amount</label>
                  <div className="relative">
                    <Banknote className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatClientPaymentInputNumber(createPaymentForm.amount)}
                      onChange={(event) => {
                        const nextValue = event.target.value.replace(/\D+/g, "").slice(0, 12);
                        handleCreatePaymentFieldChange("amount", nextValue);
                        setIsAmountDropdownOpen(nextValue.length > 0);
                      }}
                      onFocus={() => setIsAmountDropdownOpen(amountOptions.length > 0)}
                      onBlur={() => {
                        setTimeout(() => setIsAmountDropdownOpen(false), 120);
                      }}
                      required
                      className={formInputClass}
                      placeholder="Amount"
                    />
                    {isAmountDropdownOpen && amountOptions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                        {amountOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                            onClick={() => {
                              handleCreatePaymentFieldChange("amount", option.value);
                              setIsAmountDropdownOpen(false);
                            }}
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                              <p className="mt-1 text-xs text-gray-700">{option.words}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Payment Status</label>
                  <div className="relative">
                    <BadgeCheck className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <select
                      value={createPaymentForm.status}
                      onChange={(event) => handleCreatePaymentFieldChange("status", event.target.value)}
                      className={formInputClass}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>


              <div className="rounded-2xl border border-gray-300 bg-gray-100 p-3.5">
                <button
                  type="button"
                  onClick={() => setAdvancedDetailsOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-100 p-2.5">
                      <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-bold text-gray-800 sm:text-xl">Advanced Details</p>
                      <p className="text-sm font-medium text-gray-500">Transaction ID, note & documents</p>
                    </div>
                  </div>

                  {advancedDetailsOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>

                {advancedDetailsOpen && (
                  <div className="mt-3 space-y-2.5">


                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Reference Name
                      </label>
                      <div className="relative">
                        <Ticket className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          value={createPaymentForm.reference}
                          onChange={(event) => handleCreatePaymentFieldChange("reference", event.target.value)}
                          className={formInputClass}
                          placeholder="Reference/Name"
                        />
                      </div>
                    </div>

                    {/* <div className="relative">
                      <IdCard className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                      <input
                          type="text"
                          value={createPaymentForm.reference}
                          onChange={(event) => handleCreatePaymentFieldChange("reference", event.target.value)}
                          className={formInputClass}
                          placeholder="Reference/Name"
                        />
                    </div> */}



                    <div className="relative">
                      <IdCard className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        value={createPaymentForm.transactionId}
                        onChange={(event) => handleCreatePaymentFieldChange("transactionId", event.target.value)}
                        className={formInputClass}
                        placeholder="Transaction ID"
                      />
                    </div>

                    <div className="relative">
                      <FileText className="pointer-events-none absolute left-3.5 top-4 h-5 w-5 text-gray-500" />
                      <textarea
                        value={createPaymentForm.note}
                        onChange={(event) => handleCreatePaymentFieldChange("note", event.target.value)}
                        className="w-full rounded-2xl border border-gray-300 bg-white px-10 py-3 text-base font-medium text-gray-800 placeholder:text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Note"
                        rows={3}
                      />
                    </div>

                    <div>
                      <p className="mb-2 text-sm font-semibold text-gray-700">Documents</p>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 sm:text-sm">
                        <Paperclip className="h-4 w-4" />
                        Add Documents
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleDocumentsChange}
                        />
                      </label>

                      {createPaymentForm.documents.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {createPaymentForm.documents.map((file, index) => (
                            <div
                              key={`${file.name}-${index}`}
                              className="flex items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm"
                            >
                              <span className="truncate pr-3 text-gray-700">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeDocument(index)}
                                className="rounded-full p-1 text-red-500 transition hover:bg-red-50"
                                aria-label={`Remove document ${index + 1}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-gray-200 bg-white p-4 sm:px-6">
              <button
                type="button"
                onClick={() => handleCreatePaymentModalChange(false)}
                disabled={isCreatePaymentSubmitting}
                className="h-11 rounded-full border border-gray-300 bg-white text-base font-semibold text-blue-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatePaymentSubmitting}
                className="h-11 rounded-full bg-blue-600 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg"
              >
                {isCreatePaymentSubmitting
                  ? isEditPaymentMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditPaymentMode
                    ? "Update"
                    : "Create"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ContactCustomerModal
        open={contactCustomerModalOpen}
        setOpen={handleContactCustomerModalChange}
        selectedItem={null}
        userId={createPaymentContactUserId}
        selectedUserLabel={paymentUserLabel}
        onSuccess={handleContactCustomerSaved}
      />
    </>
  );
};

export default ClientPaymentHistoryModal;
