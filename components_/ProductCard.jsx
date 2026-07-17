"use client";
import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { FireExtinguisher, GitBranch, GitCompare, LifeBuoy, MapPin, ReceiptText, Share2, PhoneOutgoing, MessageCircle, ShoppingCart, Copy, Edit, Clock, ChevronDown, X, Star, Palette, Loader2, Plus } from "lucide-react"
import { FaWhatsapp, FaWhatsappSquare } from "react-icons/fa";
import { useAppContext } from "@/context/AppContext";
import Link from 'next/link';
import ProductShareModal from "./modals/ProductShareModal";
import ShopSelectModal from "./modals/ShopSelectModal";
import ProductChatModal from "./modals/ProductChatModal";
import { parseStoredUser } from "@/lib/parseStoredUser";
import PricePreviewModal from "./modals/PricePreviewModal";
import ClientPaymentHistoryModal from "./modals/ClientPaymentHistoryModal";
import ContactCustomerModal from "@/components/modals/ContactCustomerModal";
import { usePathname } from "next/navigation";
import { API_URL } from "@/helpers/apiUrl";
import { formatPrice } from "@/helpers/functions";
import { hasPermission } from "@/lib/utils";
import Login from "./Login";
import Register from "./Register";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import VehicleService from "@/services/VehicleService";
import ContactCustomerService from "@/services/ContactCustomerService";
import MasterDataService from "@/services/MasterDataService";
import LocationService from "@/services/LocationService";
import OutletService from "@/services/OutletService";
import OrderService from "@/services/OrderService";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { getSessionId } from "@/lib/utils";
import constData from "@/lib/constant";


dayjs.extend(relativeTime);

const getProductCardFilterValue = (values = []) => {
  for (const value of values) {
    if (value === undefined || value === null) continue;

    const normalized = String(value).trim();
    if (normalized) return normalized;
  }

  return "";
};

const getProductCardCustomerListFromResponse = (response) => {
  if (Array.isArray(response?.data?.data?.data)) return response.data.data.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data?.list)) return response.data.list;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.list)) return response.list;
  if (Array.isArray(response)) return response;
  return [];
};

const getProductCardFirstValue = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null) continue;

    const normalized = String(value).trim();
    if (normalized && normalized.toLowerCase() !== "null") return normalized;
  }

  return "";
};

const normalizeProductCardCustomer = (customer = {}) => {
  const contactInfo = customer?.customer_contact_info || customer?.customer_contact || {};
  const customerInfo = customer?.customer || {};

  const id = getProductCardFirstValue(
    customer?.cci_id,
    customer?.p_cci_id,
    customer?.id,
    customer?.contact_info_id,
    customer?.customer_contact_info_id,
    contactInfo?.cci_id,
    contactInfo?.id
  );
  const name = getProductCardFirstValue(
    customer?.cci_name,
    customer?.name,
    customer?.customer_name,
    customer?.c_name,
    customer?._c_name,
    contactInfo?.cci_name,
    contactInfo?.name,
    customerInfo?.name,
    customerInfo?.c_name
  );
  const phone = getProductCardFirstValue(
    customer?.cci_phone,
    customer?.phone,
    customer?.mobile,
    customer?.customer_phone,
    customer?.cus_phone,
    customer?.c_phone,
    customer?._c_phone,
    contactInfo?.cci_phone,
    contactInfo?.phone,
    customerInfo?.phone,
    customerInfo?.mobile,
    customer?.email,
    customerInfo?.email
  );
  const address = getProductCardFirstValue(
    customer?.cci_address,
    customer?.address,
    customer?.customer_address,
    customer?.cci_customer_address,
    customer?.c_address,
    customer?._c_address,
    contactInfo?.cci_address,
    contactInfo?.address,
    customerInfo?.address
  );
  const label = [name, phone].filter(Boolean).join(" - ") || `Customer #${id}`;

  return {
    id,
    name,
    phone,
    address,
    label,
  };
};

const getProductCardStoredAuthToken = () => {
  if (typeof window === "undefined") return "";

  const directToken = localStorage.getItem("auth_token");
  if (directToken) return directToken;

  try {
    const user = parseStoredUser(localStorage.getItem("user"));
    if (!user) return "";
    return user?.token || "";
  } catch (error) {
    console.error("Failed to parse user from localStorage:", error);
    return "";
  }
};

const sanitizeProductCardDownloadFileName = (value) =>
  String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const getProductCardDownloadFilenameFromHeaders = (contentDisposition) => {
  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1]);

  const plainMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  return plainMatch?.[1] || "";
};

const getProductCardDownloadFileExtensionFromType = (contentType) => {
  const normalizedType = String(contentType || "").toLowerCase();

  if (normalizedType.includes("pdf")) return "pdf";
  if (normalizedType.includes("json")) return "json";
  if (normalizedType.includes("zip")) return "zip";

  return "pdf";
};

const buildInitialChalanForm = (product = {}) => ({
  customerId: "",
  customerName: "",
  customerPhone: "",
  reference: "",
  date: "",
  address: "",
  fromAddress: "",
  note: "",
  customerNid: "",
  calanNo: "",
  sellerMobile: "",
  receiverMobile: "",
  goodsDescriptions: [],
  isDuplicate: false,
  registrationNo: getProductCardFilterValue([
    product?.registration_no,
    product?.v_registration_no,
    product?.vehicle_registration_no,
    product?.v_number_plate,
    product?.number_plate,
  ]),
});

const buildInitialQuotationForm = (product = {}) => ({
  customerId: "",
  customerName: "",
  customerPhone: "",
  customerNid: "",
  customerFromAddress: "",
  date: "",
  deliveryAddress: "",
  deliveryMobile: "",
  deliveryEmail: "",
  bankName: "",
  bankBranch: "",
  bankAddress: "",
  price: "",
  priceInWords: "",
  priceNegotiation: "Fixed",
  registrationCharge: "Included",
  vat: "Excluded",
  insurance: "Excluded",
  offerValidityDate: "",
  paymentMethod: "Cash",
  note: "",
});

const productCardCustomerSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "44px",
    borderRadius: "0.75rem",
    borderColor: state.isFocused ? "#fbcfe8" : "#d1d5db",
    backgroundColor: "#f9fafb",
    boxShadow: state.isFocused ? "0 0 0 2px #fbcfe8" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#fbcfe8" : "#d1d5db",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 0.75rem",
  }),
  input: (base) => ({
    ...base,
    color: "#1f2937",
    fontSize: "0.875rem",
    fontWeight: 500,
  }),
  singleValue: (base) => ({
    ...base,
    color: "#1f2937",
    fontSize: "0.875rem",
    fontWeight: 500,
  }),
  placeholder: (base) => ({
    ...base,
    color: "#9ca3af",
    fontSize: "0.875rem",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
  }),
};

const formatProductCardInputNumber = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const digits = raw.replace(/\D+/g, "");
  if (!digits) return "";

  return new Intl.NumberFormat("en-IN").format(Number(digits));
};

const productCardNumberWordsUnderTwenty = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];

const productCardNumberWordsTens = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

const numberToProductCardWordsBelowThousand = (num) => {
  if (num < 20) return productCardNumberWordsUnderTwenty[num];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return unit
      ? `${productCardNumberWordsTens[ten]} ${productCardNumberWordsUnderTwenty[unit]}`
      : productCardNumberWordsTens[ten];
  }

  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  return remainder
    ? `${productCardNumberWordsUnderTwenty[hundred]} Hundred ${numberToProductCardWordsBelowThousand(remainder)}`
    : `${productCardNumberWordsUnderTwenty[hundred]} Hundred`;
};

const numberToProductCardIndianWords = (value) => {
  const numeric = Number(String(value).replace(/\D+/g, ""));
  if (!numeric) return "";
  if (numeric < 1000) return numberToProductCardWordsBelowThousand(numeric);

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
      parts.push(`${numberToProductCardIndianWords(count)} ${unit.label}`);
      remaining %= unit.value;
    }
  });

  if (remaining > 0) {
    parts.push(numberToProductCardWordsBelowThousand(remaining));
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
};

const buildProductCardPriceOptions = (baseValue) => {
  if (baseValue === null || baseValue === undefined) return [];

  const normalized = String(baseValue).split(".")[0].replace(/\D+/g, "").trim();
  if (normalized.length === 0 || normalized.startsWith("0") || !/^\d+$/.test(normalized)) {
    return [];
  }

  return Array.from({ length: 5 }, (_, index) => {
    const value = `${normalized}${"0".repeat(index)}`;
    return {
      value,
      label: formatProductCardInputNumber(value),
      words: numberToProductCardIndianWords(value),
    };
  });
};



const ProductCard = ({ product, parsedUser = null, sourceParam = null }) => {
  const availabilityStatusOptions = [
    { value: "available", label: "Available" },
    { value: "sold", label: "Sold" },
    { value: "booked", label: "Booked" },
    { value: "hold", label: "Hold" },
    { value: "dealer_boock", label: "Dealer Booked" },
  ];

  const normalizeAvailabilityStatus = (status) => {
    const value = String(status || "available").toLowerCase();
    const isValidStatus = availabilityStatusOptions.some((option) => option.value === value);
    return isValidStatus ? value : "available";
  };

  const getAvailabilityStatusLabel = (status) =>
    availabilityStatusOptions.find((option) => option.value === status)?.label || "Available";

  // console.log("parsedUser product card 49", parsedUser);

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shopModalOpen, setShopModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatConfirmOpen, setChatConfirmOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalOpenLockUntil, setEditModalOpenLockUntil] = useState(0);
  const [outletModalOpen, setOutletModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [clientPaymentHistoryOpen, setClientPaymentHistoryOpen] = useState(false);
  const [chalanModalOpen, setChalanModalOpen] = useState(false);
  const [chalanCustomers, setChalanCustomers] = useState([]);
  const [isChalanCustomersLoading, setIsChalanCustomersLoading] = useState(false);
  const [isChalanSubmitting, setIsChalanSubmitting] = useState(false);
  const [chalanForm, setChalanForm] = useState(() => buildInitialChalanForm(product));
  const [goodsDescriptionOptions, setGoodsDescriptionOptions] = useState([]);
  const [isGoodsDescriptionLoading, setIsGoodsDescriptionLoading] = useState(false);
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);
  const [contactCustomerModalOpen, setContactCustomerModalOpen] = useState(false);
  const [quotationCustomers, setQuotationCustomers] = useState([]);
  const [isQuotationCustomersLoading, setIsQuotationCustomersLoading] = useState(false);
  const [isQuotationSubmitting, setIsQuotationSubmitting] = useState(false);
  const [quotationForm, setQuotationForm] = useState(() => buildInitialQuotationForm(product));
  const [isQuotationPriceDropdownOpen, setIsQuotationPriceDropdownOpen] = useState(false);
  const [displayVehiclePrice, setDisplayVehiclePrice] = useState(product?.vehicle_price || {});
  const [billCopyModalOpen, setBillCopyModalOpen] = useState(false);
  const [billCopyCustomers, setBillCopyCustomers] = useState([]);
  const [isBillCopyCustomersLoading, setIsBillCopyCustomersLoading] = useState(false);
  const [isBillCopySubmitting, setIsBillCopySubmitting] = useState(false);
  const [billCopyForm, setBillCopyForm] = useState({
    customerId: "",
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    bankName: "",
    bankBranch: "",
    bankAddress: "",
    registrationNo: getProductCardFilterValue([
      product?.registration_no,
      product?.v_registration_no,
      product?.vehicle_registration_no,
      product?.v_registration,
      product?.v_number_plate,
      product?.number_plate,
    ]),
    carPrice: "",
    bankPayment: "",
    customerPayment: "",
    date: "",
  });


  const quotationPriceOptions = useMemo(
    () => buildProductCardPriceOptions(quotationForm.price),
    [quotationForm.price]
  );
  const chalanCustomerOptions = useMemo(
    () =>
      chalanCustomers.map((customer) => ({
        value: customer.id,
        label: customer.label,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        customer,
      })),
    [chalanCustomers]
  );
  const selectedChalanCustomerOption = useMemo(
    () =>
      chalanCustomerOptions.find(
        (option) => option.value === String(chalanForm.customerId || "")
      ) || null,
    [chalanCustomerOptions, chalanForm.customerId]
  );
  const quotationCustomerOptions = useMemo(
    () =>
      quotationCustomers.map((customer) => ({
        value: customer.id,
        label: customer.label,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        customer,
      })),
    [quotationCustomers]
  );
  const selectedQuotationCustomerOption = useMemo(
    () =>
      quotationCustomerOptions.find(
        (option) => option.value === String(quotationForm.customerId || "")
      ) || null,
    [quotationCustomerOptions, quotationForm.customerId]
  );
  const billCopyCustomerOptions = useMemo(
    () =>
      billCopyCustomers.map((customer) => ({
        value: customer.id,
        label: customer.label,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        customer,
      })),
    [billCopyCustomers]
  );
  const selectedBillCopyCustomerOption = useMemo(
    () =>
      billCopyCustomerOptions.find(
        (option) => String(option.value) === String(billCopyForm.customerId || "")
      ) || null,
    [billCopyCustomerOptions, billCopyForm.customerId]
  );
  const [displayVehicleDbPrice, setDisplayVehicleDbPrice] = useState(product?.vehicle_db_price || {});
  const [countries, setCountries] = useState([]);
  const [locations, setLocations] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [isCountriesLoading, setIsCountriesLoading] = useState(false);
  const [isLocationsLoading, setIsLocationsLoading] = useState(false);
  const [isOutletsLoading, setIsOutletsLoading] = useState(false);
  const [isOutletUpdating, setIsOutletUpdating] = useState(false);
  const [isLocationUpdating, setIsLocationUpdating] = useState(false);
  const [isAvailabilityUpdating, setIsAvailabilityUpdating] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [isProductDeleted, setIsProductDeleted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [currentCountryId, setCurrentCountryId] = useState(
    product?.v_location?.country_id || product?.v_country_id
      ? String(product?.v_location?.country_id || product?.v_country_id)
      : ""
  );
  const [currentLocationId, setCurrentLocationId] = useState(
    product?.v_location?.loc_id ||
      product?.v_location?.location_id ||
      product?.v_location?.l_id ||
      product?.v_location_id
      ? String(
        product?.v_location?.loc_id ||
        product?.v_location?.location_id ||
        product?.v_location?.l_id ||
        product?.v_location_id
      )
      : ""
  );
  const [currentLocationName, setCurrentLocationName] = useState(product?.v_location?.location_name || "");
  const [currentOutletId, setCurrentOutletId] = useState(
    product?.v_location?.uo_id || product?.v_availability_id ? String(product?.v_location?.uo_id || product?.v_availability_id) : ""
  );
  const [currentOutletName, setCurrentOutletName] = useState(product?.v_location?.uo_name || "");
  const [selectedAvailabilityStatus, setSelectedAvailabilityStatus] = useState(
    normalizeAvailabilityStatus(product?.v_availability_status)
  );
  const { selectedShop, selectedCompanyShop, cartItems, setCartItems, addToCart, permissionList, toggleCompare, isInCompare } = useAppContext();

  const numericUserRating = Number(product?.user?.user_rating);
  const formattedUserRating = Number.isFinite(numericUserRating)
    ? numericUserRating.toFixed(1).replace(/\.0$/, "")
    : "";

  const router = useRouter();
  const [updateProductPermission, setUpdateProductPermission] = useState(false);
  const [updatePricePermission, setUpdatePricePermission] = useState(false);
  const [updateLocationPermission, setUpdateLocationPermission] = useState(false);
  const [updateOutletPermission, setUpdateOutletPermission] = useState(false);
  const [updateStatusPermission, setUpdateStatusPermission] = useState(false);
  const [updateDealerBookedPermission, setUpdateDealerBookedPermission] = useState(false);

  useEffect(() => {
    setSelectedAvailabilityStatus(normalizeAvailabilityStatus(product?.v_availability_status));
  }, [product?.v_availability_status]);

  useEffect(() => {
    setDisplayVehiclePrice(product?.vehicle_price || {});
    setDisplayVehicleDbPrice(product?.vehicle_db_price || {});
  }, [product?.v_id, product?.vehicle_price, product?.vehicle_db_price]);

  useEffect(() => {
    const nextCountryId = product?.v_location?.country_id || product?.v_country_id || "";
    const nextLocationId =
      product?.v_location?.loc_id ||
      product?.v_location?.location_id ||
      product?.v_location?.l_id ||
      product?.v_location_id ||
      "";
    const nextOutletId = product?.v_location?.uo_id || product?.v_availability_id || "";

    setCurrentCountryId(nextCountryId ? String(nextCountryId) : "");
    setCurrentLocationId(nextLocationId ? String(nextLocationId) : "");
    setCurrentLocationName(product?.v_location?.location_name || "");
    setCurrentOutletId(nextOutletId ? String(nextOutletId) : "");
    setCurrentOutletName(product?.v_location?.uo_name || "");
  }, [
    product?.v_location?.country_id,
    product?.v_country_id,
    product?.v_location?.loc_id,
    product?.v_location?.location_id,
    product?.v_location?.l_id,
    product?.v_location_id,
    product?.v_location?.location_name,
    product?.v_location?.uo_id,
    product?.v_availability_id,
    product?.v_location?.uo_name,
  ]);

  useEffect(() => {
    if (selectedShop !== "my-shop") {
      const companyShopId = selectedCompanyShop?.shop?.s_id;

      const hasUpdateProductPricePermission = hasPermission(
        permissionList,
        Number(companyShopId),
        "Vehicle",
        "Update"
      );
      setUpdateProductPermission(Boolean(hasUpdateProductPricePermission));

      // console.log("companyShopId", companyShopId)
      // console.log("permissionList", permissionList)

      const hasUpdateFixedPricePermission = hasPermission(
        permissionList,
        Number(companyShopId),
        "Vehicle",
        "UpdatePrice"
      );

      // console.log("hasUpdateFixedPricePermission 180----------", hasUpdateFixedPricePermission);


      setUpdatePricePermission(Boolean(hasUpdateFixedPricePermission));

      const hasUpdateLocationPermission = hasPermission(
        permissionList,
        Number(companyShopId),
        "Vehicle",
        "ChangeAvailability"
      );
      setUpdateLocationPermission(Boolean(hasUpdateLocationPermission));
      setUpdateOutletPermission(Boolean(hasUpdateLocationPermission));

      const hasUpdateStatusPermission = hasPermission(
        permissionList,
        Number(companyShopId),
        "Vehicle",
        "ChangeSold/Booked"
      );
      setUpdateStatusPermission(Boolean(hasUpdateStatusPermission));

      const hasUpdateDealerBookedPermission = hasPermission(
        permissionList,
        Number(companyShopId),
        "Vehicle",
        "ChangeDealer/Booked"
      );
      setUpdateDealerBookedPermission(Boolean(hasUpdateDealerBookedPermission));
      return;
    }

    setUpdateProductPermission(true);
    setUpdatePricePermission(true);
    setUpdateStatusPermission(true);
    setUpdateDealerBookedPermission(true);
    setUpdateLocationPermission(true);
    setUpdateOutletPermission(true);
  }, [permissionList, selectedCompanyShop, selectedShop]);

  const getCountries = async () => {
    try {
      setIsCountriesLoading(true);
      const country_code = constData.COUNTRY_CODE;
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(country_code);
      const countryMasterData = response?.data?.master_data || [];
      const countryData = countryMasterData.map((country) => ({
        value: String(country.md_id),
        label: country.md_title,
      }));
      setCountries(countryData);
      setSelectedCountry((prev) => (prev ? String(prev) : countryData?.[0]?.value || ""));
    } catch (error) {
      if (error?.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error?.message || "Something went wrong");
      }
    } finally {
      setIsCountriesLoading(false);
    }
  };

  const getLocationsByCountry = async (countryId) => {
    if (!countryId) {
      setLocations([]);
      setSelectedLocation("");
      return;
    }

    try {
      setIsLocationsLoading(true);
      const response = await LocationService.Queries.getLocationall({
        _country_id: countryId,
      });

      if (response?.status === "Success" || response?.status === "success") {
        const locationData = (response?.data?.data || []).map((location) => ({
          value: String(location.l_id),
          label: location.l_name,
        }));
        setLocations(locationData);
        setSelectedLocation((prev) => {
          const normalizedPrev = prev ? String(prev) : "";
          if (normalizedPrev && locationData.some((loc) => loc.value === normalizedPrev)) {
            return normalizedPrev;
          }
          return locationData?.[0]?.value || "";
        });
        return;
      }

      setLocations([]);
      setSelectedLocation("");
    } catch (error) {
      setLocations([]);
      setSelectedLocation("");
      toast.error(error?.response?.data?.message || "Failed to fetch locations");
    } finally {
      setIsLocationsLoading(false);
    }
  };

  const getOutletsByShopId = async () => {
    const resolvedShopId =
      product?.v_shop_id ||
      product?.shop?.s_id ||
      selectedCompanyShop?.shop?.s_id ||
      (typeof selectedShop === "object" ? selectedShop?.s_id : "");

    if (!resolvedShopId) {
      setOutlets([]);
      setSelectedOutlet("");
      return;
    }

    try {
      setIsOutletsLoading(true);
      const response = await OutletService.Queries.getOutletByShopId({
        _shop_id: resolvedShopId,
      });

      const outletOptions = (response?.data?.data || []).map((outlet) => ({
        value: String(outlet.uo_id),
        label: outlet.uo_name,
      }));

      setOutlets(outletOptions);
      setSelectedOutlet((prev) => {
        const normalizedPrev = prev ? String(prev) : "";
        if (normalizedPrev && outletOptions.some((outlet) => outlet.value === normalizedPrev)) {
          return normalizedPrev;
        }
        return "";
      });
    } catch (error) {
      setOutlets([]);
      setSelectedOutlet("");
      toast.error(error?.response?.data?.message || "Failed to fetch outlets");
    } finally {
      setIsOutletsLoading(false);
    }
  };

  useEffect(() => {
    if (!locationModalOpen) {
      return;
    }

    getLocationsByCountry(selectedCountry);
  }, [selectedCountry, locationModalOpen]);

  useEffect(() => {
    if (!outletModalOpen) {
      return;
    }

    getOutletsByShopId();
  }, [outletModalOpen]);

  const handleCopy = (e) => {
    e.preventDefault();

    // console.log("Hello");

    // if (parsedUser) {
    if (product?.v_code) {

      const cleanedCode = product.v_code.replace(/^[^-]*-/, "");

      navigator.clipboard.writeText(cleanedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
    // }else{
    //   setLoginOpen(true);
    // }

  };

  const pathname = usePathname();

  // ---------- Custom Helper ----------
  const productId = getProductCardFilterValue([product?.v_id, product?.id]);
  const chalanContactUserId = getProductCardFilterValue([parsedUser?.id, parsedUser?.u_id]);
  let isMyShop = pathname.includes("my-shop");
  let isCompanyShop = pathname.includes("company-shop");
  let isFilterProductPage = pathname.includes("filter-products");
  let isSearchResultsPage = pathname.includes("search-results");
  const hasClientPaymentHistoryPermission =
    !isCompanyShop ||
    hasPermission(
      permissionList,
      Number(selectedCompanyShop?.shop?.s_id),
      "Vehicle",
      "ClientPaymentView"
    );
  const hasDeleteProductPermission =
    !isCompanyShop ||
    hasPermission(
      permissionList,
      Number(selectedCompanyShop?.shop?.s_id),
      "Vehicle",
      "Delete"
    );
  const canUpdateAvailabilityStatus = (statusValue) => {
    if (!isCompanyShop) return true;

    return statusValue === "dealer_boock"
      ? updateDealerBookedPermission
      : updateStatusPermission;
  };
  const canUpdateAnyAvailabilityStatus =
    !isCompanyShop || updateStatusPermission || updateDealerBookedPermission;

  const hasChalanViewPermission =
    !isCompanyShop ||
    hasPermission(
      permissionList,
      Number(selectedCompanyShop?.shop?.s_id),
      "Vehicle",
      "ClientChallanView"
    );

  const hasQuationViewPermission =
    !isCompanyShop ||
    hasPermission(
      permissionList,
      Number(selectedCompanyShop?.shop?.s_id),
      "Vehicle",
      "ClientQuatationView"
    );

  useEffect(() => {
    if (!chalanModalOpen) return;

    if (!chalanContactUserId) {
      setChalanCustomers([]);
      setIsChalanCustomersLoading(false);
      toast.error("User id not found for customer list.");
      return;
    }

    let isCancelled = false;

    const fetchChalanCustomers = async () => {
      try {
        setIsChalanCustomersLoading(true);
        const response = await ContactCustomerService.Queries.getContactCustomers({
          _user_id: chalanContactUserId,
        });
        const rows = getProductCardCustomerListFromResponse(response);
        const customers = rows
          .map(normalizeProductCardCustomer)
          .filter((customer) => customer.id && (customer.name || customer.phone || customer.address));

        if (!isCancelled) {
          setChalanCustomers(customers);
        }
      } catch (error) {
        if (!isCancelled) {
          setChalanCustomers([]);
          toast.error(
            error?.message ||
            error?.data?.message ||
            error?.response?.data?.message ||
            "Failed to load customers."
          );
        }
      } finally {
        if (!isCancelled) {
          setIsChalanCustomersLoading(false);
        }
      }
    };

    fetchChalanCustomers();

    return () => {
      isCancelled = true;
    };
  }, [chalanContactUserId, chalanModalOpen]);

  useEffect(() => {
    if (!chalanModalOpen || goodsDescriptionOptions.length > 0) return;

    let isCancelled = false;

    const fetchGoodsDescriptions = async () => {
      try {
        setIsGoodsDescriptionLoading(true);
        const response = await MasterDataService.Queries.getMasterDataByTypeCode(
          constData.GOODS_DESCRIPTION_CODE
        );
        const masterData = response?.data?.master_data || [];
        const options = masterData
          .map((item) => ({
            value: String(item.md_id),
            label: item.md_title,
          }))
          .filter((option) => option.value && option.label);

        if (!isCancelled) {
          setGoodsDescriptionOptions(options);
        }
      } catch (error) {
        if (!isCancelled) {
          setGoodsDescriptionOptions([]);
          toast.error(
            error?.message ||
            error?.data?.message ||
            error?.response?.data?.message ||
            "Failed to load goods descriptions."
          );
        }
      } finally {
        if (!isCancelled) {
          setIsGoodsDescriptionLoading(false);
        }
      }
    };

    fetchGoodsDescriptions();

    return () => {
      isCancelled = true;
    };
  }, [chalanModalOpen, goodsDescriptionOptions.length]);

  useEffect(() => {
    if (!quotationModalOpen) return;

    if (!chalanContactUserId) {
      setQuotationCustomers([]);
      setIsQuotationCustomersLoading(false);
      toast.error("User id not found for customer list.");
      return;
    }

    let isCancelled = false;

    const fetchQuotationCustomers = async () => {
      try {
        setIsQuotationCustomersLoading(true);
        const response = await ContactCustomerService.Queries.getContactCustomers({
          _user_id: chalanContactUserId,
        });
        const rows = getProductCardCustomerListFromResponse(response);
        const customers = rows
          .map(normalizeProductCardCustomer)
          .filter((customer) => customer.id && (customer.name || customer.phone || customer.address));

        if (!isCancelled) {
          setQuotationCustomers(customers);
        }
      } catch (error) {
        if (!isCancelled) {
          setQuotationCustomers([]);
          toast.error(
            error?.message ||
            error?.data?.message ||
            error?.response?.data?.message ||
            "Failed to load customers."
          );
        }
      } finally {
        if (!isCancelled) {
          setIsQuotationCustomersLoading(false);
        }
      }
    };

    fetchQuotationCustomers();

    return () => {
      isCancelled = true;
    };
  }, [chalanContactUserId, quotationModalOpen]);

  useEffect(() => {
    if (!billCopyModalOpen) return;

    if (!chalanContactUserId) {
      setBillCopyCustomers([]);
      setIsBillCopyCustomersLoading(false);
      return;
    }

    let isCancelled = false;

    const fetchBillCopyCustomers = async () => {
      try {
        setIsBillCopyCustomersLoading(true);
        const response = await ContactCustomerService.Queries.getContactCustomers({
          _user_id: chalanContactUserId,
        });
        const rows = getProductCardCustomerListFromResponse(response);
        const customers = rows
          .map(normalizeProductCardCustomer)
          .filter((customer) => customer.id && (customer.name || customer.phone || customer.address));

        if (!isCancelled) {
          setBillCopyCustomers(customers);
        }
      } catch {
        if (!isCancelled) {
          setBillCopyCustomers([]);
        }
      } finally {
        if (!isCancelled) {
          setIsBillCopyCustomersLoading(false);
        }
      }
    };

    fetchBillCopyCustomers();

    return () => {
      isCancelled = true;
    };
  }, [chalanContactUserId, billCopyModalOpen]);

  // console.log("isFilterProductPage card 101------------", isFilterProductPage);

  const href =
    pathname.startsWith("/my-shop/") || pathname.startsWith("/company-shop/") || pathname.startsWith("/member-shop/") || pathname.startsWith("/user-shop/")
      ? `/product/my-shop/${product?.v_id}`
      : `/product/${product?.v_id}`;

  // ID বাদ দিয়ে basePath বের করা
  const basePath =
    "/" +
    pathname
      .split("/")
      .filter(Boolean) // খালি string বাদ দেবে
      .slice(0, -1) // শেষের ID বাদ দেবে
      .join("/");

  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [addToCartPromptOpen, setAddToCartPromptOpen] = useState(false);
  const [quickOrderModalOpen, setQuickOrderModalOpen] = useState(false);
  const [quickOrderProduct, setQuickOrderProduct] = useState(null);
  const [isQuickOrderSubmitting, setIsQuickOrderSubmitting] = useState(false);
  const [quickOrderForm, setQuickOrderForm] = useState({
    o_name: "",
    o_phone: "",
    oi_quantity: "1",
  });

  const proceedToChat = () => {
    if (parsedUser) {
      setChatOpen(true);
    } else {
      setLoginOpen(true);
    }
  };

  const handleChatOpen = () => {
    setChatConfirmOpen(true);
  };

  const handleAcceptChat = () => {
    setChatConfirmOpen(false);
    proceedToChat();
  };

  const handleRejectChat = () => {
    setChatConfirmOpen(false);
  };


  const closeLoginModal = () => {
    setLoginOpen(false);
  };

  const closeRegisterModal = () => {
    setRegisterOpen(false);
  };

  const openForgotPasswordModal = () => {
    setLoginOpen(false);
    // setIsForgotPasswordModalOpen(true);
  };

  const getProductPrice = (item) => {
    const rawPrice =
      pathname === "/my-shop/" || pathname === "/company-shop/"
        ? item?.vehicle_price?.user_price
        : item?.vehicle_price?.pbl_price;

    if (rawPrice === "Call for Price") {
      return 0;
    }

    return Number(rawPrice) || 0;
  };

  const getQuickOrderTypeId = (item) => {
    return (
      item?.v_vehicle_type?.c_id ||
      item?.v_product_type?.c_id ||
      item?.v_category?.c_id ||
      ""
    );
  };

  const resetQuickOrderState = () => {
    setQuickOrderModalOpen(false);
    setAddToCartPromptOpen(false);
    setQuickOrderProduct(null);
    setQuickOrderForm({
      o_name: "",
      o_phone: "",
      oi_quantity: "1",
    });
  };

  const openAddToCartPrompt = (item) => {
    setQuickOrderProduct(item);
    setQuickOrderForm({
      o_name: "",
      o_phone: "",
      oi_quantity: "1",
    });
    setAddToCartPromptOpen(true);
  };

  const handleManualOrderClick = () => {
    setAddToCartPromptOpen(false);
    setQuickOrderProduct(null);
    setRegisterOpen(false);
    setLoginOpen(true);
  };

  const handleSignupOrderClick = () => {
    setAddToCartPromptOpen(false);
    setQuickOrderProduct(null);
    setLoginOpen(false);
    setRegisterOpen(true);
  };

  const handleQuickOrderClick = () => {
    setAddToCartPromptOpen(false);
    setQuickOrderModalOpen(true);
  };

  const handleWhatsappOrderClick = () => {
    const productName = quickOrderProduct?.v_title || product?.v_title || "Product";
    const message = `I Want to Order This Product. Please Contact Me:\n Product Link: ${window.location.origin}/product/${quickOrderProduct?.v_id || product?.v_id}\n Product Name: ${productName}`;
    const whatsappUrl = `https://wa.me/8801407054400?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setAddToCartPromptOpen(false);
    setQuickOrderProduct(null);
  };

  const handleQuickOrderInputChange = (event) => {
    const { name, value } = event.target;
    setQuickOrderForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuickOrderSubmit = async (event) => {
    event.preventDefault();

    const customerName = quickOrderForm.o_name.trim();
    const customerPhone = quickOrderForm.o_phone.trim();
    const quantity = Math.max(1, Number(quickOrderForm.oi_quantity) || 1);
    const productId = quickOrderProduct?.v_id;
    const typeId = getQuickOrderTypeId(quickOrderProduct);
    const unitPrice = getProductPrice(quickOrderProduct);
    const totalPrice = unitPrice * quantity;

    if (!customerName) {
      toast.error("Please enter your name.");
      return;
    }

    if (!customerPhone) {
      toast.error("Please enter your phone number.");
      return;
    }

    if (!productId) {
      toast.error("Product information is missing.");
      return;
    }

    if (!typeId) {
      toast.error("Product type information is missing.");
      return;
    }

    setIsQuickOrderSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("o_name", customerName);
      formData.append("o_phone", customerPhone);
      formData.append("o_type", "quick_order");
      formData.append("oi_product_id", String(productId));
      formData.append("oi_type_id", String(typeId));
      formData.append("oi_quantity", String(quantity));
      formData.append("oi_unit_price", String(unitPrice));
      formData.append("oi_discount_price", String(unitPrice));
      formData.append("oi_total_price", String(totalPrice));
      formData.append("o_status", "pending");
      formData.append("i_status", "pending");

      const response = await OrderService.Commands.quickOrder(formData);

      if (
        response?.status === "success" ||
        response?.status === "Success" ||
        response?.data?.o_id ||
        response?.data?.id ||
        response?.order?.o_id
      ) {
        toast.success(response?.message || "Quick order placed successfully.");
        resetQuickOrderState();
        return;
      }

      toast.error(response?.message || "Failed to place quick order.");
    } catch (error) {
      if (error?.errors) {
        Object.values(error.errors).forEach((entry) => toast.error(entry[0]));
      } else {
        toast.error(error?.response?.data?.message || error?.message || "Failed to place quick order.");
      }
    } finally {
      setIsQuickOrderSubmitting(false);
    }
  };

  const handleChalanModalChange = (nextOpen) => {
    setChalanModalOpen(nextOpen);

    if (!nextOpen) {
      setChalanForm(buildInitialChalanForm(product));
    }
  };

  const openChalanModal = () => {
    setEditModalOpen(false);
    setChalanForm(buildInitialChalanForm(product));
    setChalanModalOpen(true);
  };


  const handleChalanFormChange = (field, value) => {
    console.log("setChalanForm", chalanForm);
    setChalanForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChalanCustomerChange = (option) => {
    const customer = option?.customer || option || {};
    setChalanForm((prev) => ({
      ...prev,
      customerId: customer?.id || option?.value || "",
      customerName: customer?.name || option?.name || "",
      customerPhone: customer?.phone || option?.phone || "",
      address: customer?.address || option?.address || "",
    }));
  };

  const handleChalanGoodsDescriptionToggle = (value, isChecked) => {
    setChalanForm((prev) => {
      const currentGoodsDescriptions = Array.isArray(prev.goodsDescriptions)
        ? prev.goodsDescriptions
        : [];
      const normalizedValue = String(value || "");
      const goodsDescriptions = isChecked
        ? Array.from(new Set([...currentGoodsDescriptions, normalizedValue]))
        : currentGoodsDescriptions.filter(
          (descriptionValue) => descriptionValue !== normalizedValue
        );

      return {
        ...prev,
        goodsDescriptions,
      };
    });
  };

  const handleContactCustomerModalChange = (isOpen) => {
    setContactCustomerModalOpen(isOpen);
  };

  const fetchChalanCustomersList = async () => {
    if (!chalanContactUserId) return;
    try {
      setIsChalanCustomersLoading(true);
      const response = await ContactCustomerService.Queries.getContactCustomers({
        _user_id: chalanContactUserId,
      });
      const rows = getProductCardCustomerListFromResponse(response);
      const customers = rows
        .map(normalizeProductCardCustomer)
        .filter((customer) => customer.id && (customer.name || customer.phone || customer.address));
      setChalanCustomers(customers);
    } catch (error) {
      toast.error("Failed to load customers.");
    } finally {
      setIsChalanCustomersLoading(false);
    }
  };

  const fetchQuotationCustomersList = async () => {
    if (!chalanContactUserId) return;
    try {
      setIsQuotationCustomersLoading(true);
      const response = await ContactCustomerService.Queries.getContactCustomers({
        _user_id: chalanContactUserId,
      });
      const rows = getProductCardCustomerListFromResponse(response);
      const customers = rows
        .map(normalizeProductCardCustomer)
        .filter((customer) => customer.id && (customer.name || customer.phone || customer.address));
      setQuotationCustomers(customers);
    } catch (error) {
      toast.error("Failed to load customers.");
    } finally {
      setIsQuotationCustomersLoading(false);
    }
  };

  const handleContactCustomerSaved = async () => {
    setContactCustomerModalOpen(false);
    await Promise.all([fetchChalanCustomersList(), fetchQuotationCustomersList()]);
  };

  const handleChalanSubmit = async (event) => {
    event.preventDefault();

    if (!productId) {
      toast.error("Product id not found.");
      return;
    }

    const selectedCustomerId = String(chalanForm.customerId || "").trim();
    const customerName = String(chalanForm.customerName || "").trim();
    const customerPhone = String(chalanForm.customerPhone || "").trim();
    const customerToAddress = String(chalanForm.address || "").trim();
    const selectedGoodsDescriptions = (Array.isArray(chalanForm.goodsDescriptions)
      ? chalanForm.goodsDescriptions
      : []
    )
      .map((value) => {
        const normalizedValue = String(value || "").trim();
        const selectedOption = goodsDescriptionOptions.find(
          (option) => option.value === normalizedValue
        );
        return String(selectedOption?.label || normalizedValue).trim();
      })
      .filter(Boolean);

    if (!selectedCustomerId) {
      if (!customerName) {
        toast.error("Please enter customer name.");
        return;
      }

      if (!customerPhone) {
        toast.error("Please enter customer phone.");
        return;
      }

    }

    const authToken = getProductCardStoredAuthToken();
    if (!authToken) {
      toast.error("Authentication token not found.");
      return;
    }

    setIsChalanSubmitting(true);

    try {
      const queryParams = new URLSearchParams({
        _vehicle_id: String(productId),
        _reference: String(chalanForm.reference || "").trim(),
        _date: String(chalanForm.date || "").trim(),
        _is_down: "1",
        _c_to_addr: customerToAddress,
        _c_from_addr: String(chalanForm.fromAddress || "").trim(),
        _c_name: customerName,
        _c_phone: customerPhone,
        _note: String(chalanForm.note || "").trim(),
        _registration_no: String(chalanForm.registrationNo || "").trim(),
        _c_nid: String(chalanForm.customerNid || "").trim(),
        _calan_no: String(chalanForm.calanNo || "").trim(),
        _s_mob: String(chalanForm.sellerMobile || "").trim(),
        _r_mob: String(chalanForm.receiverMobile || "").trim(),
        _is_duplicate: chalanForm.isDuplicate ? "1" : "0",
      });

      if (selectedCustomerId) {
        queryParams.append("_cci_id", selectedCustomerId);
      }

      selectedGoodsDescriptions.forEach((value, index) => {
        queryParams.append(`_goods_desc[${index}]`, value);
      });

      const response = await fetch(
        `${API_URL}api/vehicle/delivery-challan-pdf?${queryParams.toString()}`,
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
        let errorMessage = "Failed to download delivery challan.";
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

      const headerFilename = getProductCardDownloadFilenameFromHeaders(
        response.headers.get("content-disposition") || ""
      );
      const fallbackBaseName =
        sanitizeProductCardDownloadFileName(product?.v_code) ||
        sanitizeProductCardDownloadFileName(product?.v_title) ||
        `delivery-challan-${productId}`;
      const fallbackExtension = getProductCardDownloadFileExtensionFromType(blob.type);
      const downloadFilename =
        headerFilename || `${fallbackBaseName}-delivery-challan.${fallbackExtension}`;

      const objectUrl = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = objectUrl;
      downloadLink.download = downloadFilename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.URL.revokeObjectURL(objectUrl);

      toast.success("Delivery challan downloaded.");
      handleChalanModalChange(false);
    } catch (error) {
      toast.error(error?.message || "Failed to download delivery challan.");
    } finally {
      setIsChalanSubmitting(false);
    }
  };

  const chalanInputClass =
    "h-11 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200 disabled:cursor-not-allowed disabled:opacity-60";

  const quotationInputClass =
    "h-11 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60";

  const handleQuotationModalChange = (nextOpen) => {
    setQuotationModalOpen(nextOpen);

    if (!nextOpen) {
      setQuotationForm(buildInitialQuotationForm(product));
    }
  };

  const openQuotationModal = () => {
    setEditModalOpen(false);
    setQuotationForm(buildInitialQuotationForm(product));
    setQuotationModalOpen(true);
  };

  const handleQuotationFormChange = (field, value) => {
    setQuotationForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleQuotationCustomerChange = (option) => {
    const customer = option?.customer || option || {};
    setQuotationForm((prev) => ({
      ...prev,
      customerId: customer?.id || option?.value || "",
      customerName: customer?.name || option?.name || "",
      customerPhone: customer?.phone || option?.phone || "",
      customerFromAddress: customer?.address || option?.address || "",
    }));
  };

  const handleQuotationSubmit = async (event) => {
    event.preventDefault();

    if (!productId) {
      toast.error("Product id not found.");
      return;
    }

    const selectedCustomerId = String(quotationForm.customerId || "").trim();
    const customerName = String(quotationForm.customerName || "").trim();
    const customerPhone = String(quotationForm.customerPhone || "").trim();
    const customerFromAddress = String(quotationForm.customerFromAddress || "").trim();

    if (!selectedCustomerId) {
      if (!customerName) {
        toast.error("Please enter customer name.");
        return;
      }

      if (!customerPhone) {
        toast.error("Please enter customer phone.");
        return;
      }

      if (!customerFromAddress) {
        toast.error("Please enter from address.");
        return;
      }
    }

    const authToken = getProductCardStoredAuthToken();
    if (!authToken) {
      toast.error("Authentication token not found.");
      return;
    }

    setIsQuotationSubmitting(true);

    try {
      const queryParams = new URLSearchParams({
        _bank_name: String(quotationForm.bankName || "").trim(),
        _bank_branch: String(quotationForm.bankBranch || "").trim(),
        _bank_address: String(quotationForm.bankAddress || "").trim(),
        _c_nid: String(quotationForm.customerNid || "").trim(),
        _date: String(quotationForm.date || "").trim(),
        _c_from_addr: customerFromAddress,
        _d_addr: String(quotationForm.deliveryAddress || "").trim(),
        _d_mob: String(quotationForm.deliveryMobile || "").trim(),
        _d_email: String(quotationForm.deliveryEmail || "").trim(),
        _c_name: customerName,
        _c_phone: customerPhone,
        _price: String(quotationForm.price || "").trim(),
        _price_in_words: String(quotationForm.priceInWords || "").trim(),
        _price_negotiation: String(quotationForm.priceNegotiation || "Fixed"),
        _registration_charge: String(quotationForm.registrationCharge || "Included"),
        _vat: String(quotationForm.vat || "Exclude"),
        _insurance: String(quotationForm.insurance || "Exclude"),
        _offer_validity_date: String(quotationForm.offerValidityDate || "").trim(),
        _payment_method: String(quotationForm.paymentMethod || "Cash"),
        _note: String(quotationForm.note || "").trim(),
      });

      if (selectedCustomerId) {
        queryParams.append("_cci_id", selectedCustomerId);
      }

      const response = await fetch(
        `${API_URL}api/vehicle/quotation-pdf/${productId}?${queryParams.toString()}`,
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
        let errorMessage = "Failed to download quotation.";
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

      const headerFilename = getProductCardDownloadFilenameFromHeaders(
        response.headers.get("content-disposition") || ""
      );
      const fallbackBaseName =
        sanitizeProductCardDownloadFileName(product?.v_code) ||
        sanitizeProductCardDownloadFileName(product?.v_title) ||
        `quotation-${productId}`;
      const fallbackExtension = getProductCardDownloadFileExtensionFromType(blob.type);
      const downloadFilename =
        headerFilename || `${fallbackBaseName}-quotation.${fallbackExtension}`;

      const objectUrl = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = objectUrl;
      downloadLink.download = downloadFilename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.URL.revokeObjectURL(objectUrl);

      toast.success("Quotation downloaded.");
      handleQuotationModalChange(false);
    } catch (error) {
      toast.error(error?.message || "Failed to download quotation.");
    } finally {
      setIsQuotationSubmitting(false);
    }
  };

  const billCopyInputClass =
    "h-11 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-60";

  const billCopyDefaultRegistrationNo = getProductCardFilterValue([
    product?.registration_no,
    product?.v_registration_no,
    product?.vehicle_registration_no,
    product?.v_registration,
    product?.v_number_plate,
    product?.number_plate,
  ]);

  const handleBillCopyModalChange = (nextOpen) => {
    setBillCopyModalOpen(nextOpen);
    if (!nextOpen) {
      setBillCopyForm({
        customerId: "", customerName: "", customerPhone: "", customerAddress: "",
        bankName: "", bankBranch: "", bankAddress: "", registrationNo: billCopyDefaultRegistrationNo,
        carPrice: "", bankPayment: "", customerPayment: "", date: "",
      });
    }
  };

  const openBillCopyModal = () => {
    setBillCopyForm({
      customerId: "", customerName: "", customerPhone: "", customerAddress: "",
      bankName: "", bankBranch: "", bankAddress: "", registrationNo: billCopyDefaultRegistrationNo,
      carPrice: "", bankPayment: "", customerPayment: "", date: "",
    });
    setEditModalOpen(false);
    setTimeout(() => setBillCopyModalOpen(true), 150);
  };

  const handleBillCopyFormChange = (field, value) => {
    setBillCopyForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBillCopyCustomerChange = (option) => {
    if (!option) {
      setBillCopyForm((prev) => ({
        ...prev,
        customerId: "",
        customerName: "",
        customerPhone: "",
        customerAddress: "",
      }));
      return;
    }

    const selectedCustomer = option?.customer || billCopyCustomers.find(
      (customer) => String(customer.id) === String(option.value)
    ) || option;

    setBillCopyForm((prev) => ({
      ...prev,
      customerId: selectedCustomer?.id || String(option.value || ""),
      customerName: selectedCustomer?.name || option.name || "",
      customerPhone: selectedCustomer?.phone || option.phone || "",
      customerAddress: selectedCustomer?.address || option.address || "",
    }));
  };

  const handleBillCopySubmit = async (event) => {
    event.preventDefault();

    if (!productId) {
      toast.error("Product id not found.");
      return;
    }

    const customerName = String(billCopyForm.customerName || "").trim();
    const customerPhone = String(billCopyForm.customerPhone || "").trim();
    const customerAddress = String(billCopyForm.customerAddress || "").trim();
    const selectedCustomerId = String(billCopyForm.customerId || "").trim();

    if (!selectedCustomerId) {
      if (!customerName) { toast.error("Please enter customer name."); return; }
      if (!customerPhone) { toast.error("Please enter customer phone."); return; }
      if (!customerAddress) { toast.error("Please enter customer address."); return; }
    }

    const authToken = getProductCardStoredAuthToken();
    if (!authToken) {
      toast.error("Authentication token not found.");
      return;
    }

    setIsBillCopySubmitting(true);

    try {
      const queryParams = new URLSearchParams({
        _bank_name: String(billCopyForm.bankName || "").trim(),
        _bank_branch: String(billCopyForm.bankBranch || "").trim(),
        _bank_address: String(billCopyForm.bankAddress || "").trim(),
        _registration_no: String(billCopyForm.registrationNo || "").trim(),
        _c_name: customerName,
        _c_phone: customerPhone,
        _c_address: customerAddress,
        _car_price: String(billCopyForm.carPrice || "").trim().replace(/,/g, ""),
        _bank_payment: String(billCopyForm.bankPayment || "").trim().replace(/,/g, ""),
        _customer_payment: String(billCopyForm.customerPayment || "").trim().replace(/,/g, ""),
        _date: String(billCopyForm.date || "").trim(),
        _is_down: "1",
      });

      if (selectedCustomerId) {
        queryParams.append("_cci_id", selectedCustomerId);
      }

      const response = await fetch(
        `${API_URL}api/vehicle/bill-copy-pdf/${productId}?${queryParams.toString()}`,
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
        let errorMessage = "Failed to download bill copy.";
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const errorPayload = await response.json();
          errorMessage = errorPayload?.message || errorPayload?.error || errorMessage;
        } else {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      if (!blob || blob.size === 0) throw new Error("Downloaded file is empty.");

      const headerFilename = getProductCardDownloadFilenameFromHeaders(
        response.headers.get("content-disposition") || ""
      );
      const fallbackBaseName =
        sanitizeProductCardDownloadFileName(product?.v_code) ||
        sanitizeProductCardDownloadFileName(product?.v_title) ||
        `bill-copy-${productId}`;
      const fallbackExtension = getProductCardDownloadFileExtensionFromType(blob.type);
      const downloadFilename = headerFilename || `${fallbackBaseName}-bill-copy.${fallbackExtension}`;

      const objectUrl = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = objectUrl;
      downloadLink.download = downloadFilename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.URL.revokeObjectURL(objectUrl);

      toast.success("Bill copy downloaded.");
      handleBillCopyModalChange(false);
    } catch (error) {
      toast.error(error?.message || "Failed to download bill copy.");
    } finally {
      setIsBillCopySubmitting(false);
    }
  };

  const handleEditProduct = (label, item) => {
    if (!item?.v_id) {
      return;
    }

    if (label === "Price") {
      setPriceModalOpen(true);
      return;
    }

    if (label === "Edit" || label === "Product") {
      router.push(`/dashboard/products/vehicle/edit/${item.v_id}`);
      return;
    }

    if (label === "Clone") {
      router.push(`/dashboard/products/vehicle/clone/${item.v_id}`);
      return;
    }

    if (label === "Client payment history") {
      setClientPaymentHistoryOpen(true);
      return;
    }

    if (label === "Outlet") {
      const productOutletId = product?.v_location?.uo_id || product?.v_availability_id || "";

      setSelectedOutlet(currentOutletId || (productOutletId ? String(productOutletId) : ""));
      setOutletModalOpen(true);
      if (outlets.length === 0 && !isOutletsLoading) {
        getOutletsByShopId();
      }
      return;
    }

    if (label === "Location") {
      const productCountryId = product?.v_location?.country_id || product?.v_country_id || "";
      const productLocationId =
        product?.v_location?.loc_id ||
        product?.v_location?.location_id ||
        product?.v_location?.l_id ||
        product?.v_location_id ||
        "";

      setSelectedCountry(currentCountryId || (productCountryId ? String(productCountryId) : ""));
      setSelectedLocation(currentLocationId || (productLocationId ? String(productLocationId) : ""));
      setLocationModalOpen(true);
      if (countries.length === 0 && !isCountriesLoading) {
        getCountries();
      }
    }
  };

  const handleLocationUpdate = async () => {
    if (!product?.v_id || isLocationUpdating) {
      return;
    }

    if (!selectedLocation) {
      toast.error("Please select a location.");
      return;
    }

    setIsLocationUpdating(true);

    try {
      const response = await VehicleService.Commands.individualVehicleUpdate(product.v_id, {
        v_location_id: selectedLocation,
        _method: "PUT",
      });

      if (response?.status === "success" || response?.v_id) {
        const selectedLocationOption = locations.find((loc) => loc.value === String(selectedLocation));

        setCurrentCountryId(selectedCountry ? String(selectedCountry) : "");
        setCurrentLocationId(selectedLocation ? String(selectedLocation) : "");
        setCurrentLocationName(selectedLocationOption?.label || "");
        toast.success("Location updated.");
        setLocationModalOpen(false);
        return;
      }

      toast.error(response?.message || "Failed to update location.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update location.");
    } finally {
      setIsLocationUpdating(false);
    }
  };

  const handleOutletUpdate = async () => {
    if (!product?.v_id || isOutletUpdating) {
      return;
    }

    if (!selectedOutlet) {
      toast.error("Please select an outlet.");
      return;
    }

    setIsOutletUpdating(true);

    try {
      const response = await VehicleService.Commands.individualVehicleUpdate(product.v_id, {
        v_availability_id: selectedOutlet,
        _method: "PUT",
      });

      if (response?.status === "success" || response?.v_id) {
        const selectedOutletOption = outlets.find((outlet) => outlet.value === String(selectedOutlet));
        setCurrentOutletId(String(selectedOutlet));
        setCurrentOutletName(selectedOutletOption?.label || "");
        toast.success("Outlet updated.");
        setOutletModalOpen(false);
        return;
      }

      toast.error(response?.message || "Failed to update outlet.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update outlet.");
    } finally {
      setIsOutletUpdating(false);
    }
  };

  const handleAvailabilityStatusUpdate = async (status) => {
    const nextStatus = normalizeAvailabilityStatus(status);

    if (!canUpdateAvailabilityStatus(nextStatus)) {
      alert("You don't have permission");
      return;
    }

    if (isAvailabilityUpdating || isDeletingProduct || !product?.v_id) {
      return;
    }

    if (nextStatus === selectedAvailabilityStatus) {
      return;
    }

    const previousStatus = selectedAvailabilityStatus;
    setSelectedAvailabilityStatus(nextStatus);
    setIsAvailabilityUpdating(true);

    try {
      const response = await VehicleService.Commands.individualVehicleUpdate(product.v_id, {
        v_availability_status: nextStatus,
        _method: "PUT",
      });

      if (response?.status === "success" || response?.v_id) {
        toast.success("Availability updated.");
        return;
      }

      setSelectedAvailabilityStatus(previousStatus);
      toast.error(response?.message || "Failed to update availability.");
    } catch (error) {
      setSelectedAvailabilityStatus(previousStatus);
      toast.error(error?.response?.data?.message || "Failed to update availability.");
    } finally {
      setIsAvailabilityUpdating(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (isDeletingProduct || isAvailabilityUpdating || !product?.v_id) {
      return;
    }

    setIsDeletingProduct(true);

    try {
      const response = await VehicleService.Commands.individualVehicleUpdate(product.v_id, {
        v_status: "inactive",
        _method: "PUT",
      });

      if (response?.status === "success" || response?.v_id) {
        setIsProductDeleted(true);
        setEditModalOpen(false);
        toast.success("Product deleted successfully.");
        return;
      }

      toast.error(response?.message || "Failed to delete product.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete product.");
    } finally {
      setIsDeletingProduct(false);
    }
  };

  const handleDeleteProductClick = async () => {
    if (!hasDeleteProductPermission) {
      alert("You don't have permission");
      return;
    }

    if (isDeletingProduct || isAvailabilityUpdating) {
      return;
    }

    // Swal খোলার আগে modal বন্ধ করুন এবং লক সেট করুন
    setEditModalOpen(false);
    setEditModalOpenLockUntil(Date.now() + 1000);

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this product!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      await handleDeleteProduct();
      return;
    }

    // Cancel বাটনে আর কিছু করার দরকার নেই
  };

  const handleEditModalOpen = () => {
    if (Date.now() < editModalOpenLockUntil) {
      return;
    }
    setEditModalOpen(true);
  };

  const handleEditModalOpenChange = (nextOpen) => {
    if (nextOpen && Date.now() < editModalOpenLockUntil) {
      return;
    }
    setEditModalOpen(nextOpen);
  };

  const getStatusButtonClasses = (statusValue) => {
    const isActive = selectedAvailabilityStatus === statusValue;

    if (!isActive) {
      return "border-gray-300 bg-gray-50 text-gray-500";
    }

    if (statusValue === "available") {
      return "border-green-500 bg-green-100 text-green-700";
    }

    return "border-red-500 bg-red-100 text-red-700";
  };


  const handleAddToCart = (item) => {
    if (!parsedUser) {
      openAddToCartPrompt(item);
      return;
    }

    const price = getProductPrice(item);

    // let price = product?.prices && product?.prices[0]?.pp_regular_price;
    let priceId = item?.vehicle_price && item?.vehicle_price?.v_price_id;

    let cartItem = {
      c_user_id: parsedUser?.id || null,
      c_session_id: parsedUser?.id ? null : getSessionId(),
      ci_product_id: item.v_id,
      // ci_type_id: null,
      ci_type_id: item?.v_category?.c_id,
      ci_qty: 1,
      ci_price: price || 0,
      ci_url: item?.vehicle_front_image?.url || '',
      ci_name: item.v_title,
      ci_subtotal: price * 1,
      ci_product_price_id: priceId,
    }

    addToCart(item.v_id, cartItem);
  }

  const handlePriceUpdated = (updatedProductSource) => {
    if (!updatedProductSource) {
      return;
    }

    const resolvedProduct =
      updatedProductSource?.data?.data ||
      updatedProductSource?.data ||
      updatedProductSource;

    if (resolvedProduct?.vehicle_price) {
      setDisplayVehiclePrice(resolvedProduct.vehicle_price);
    }

    if (resolvedProduct?.vehicle_db_price) {
      setDisplayVehicleDbPrice(resolvedProduct.vehicle_db_price);
    }
  };


  // console.log("sourceParam 146", sourceParam)

  const displayedLocationName = currentLocationName || product?.v_location?.location_name || "";
  const displayedOutletId = currentOutletId || (product?.v_location?.uo_id ? String(product.v_location.uo_id) : "");
  const displayedOutletName = currentOutletName || product?.v_location?.uo_name || "";

  if (isProductDeleted) {
    return null;
  }


  const shouldShowOutletName = pathname !== '/pb-home' && pathname !== '/pb-home/';

  // console.log("updateProductPermission product card 433", updateProductPermission);

  return (
    <div className="h-full relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 blur"></div>
      <div className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        shadow-md
        hover:shadow-2xl
        hover:-translate-y-2
        hover:border-gray-300
        transition-all
        duration-300
        ease-in-out
        p-3
        bg-white
        flex
        flex-col
        font-sans
        h-full

      ">

        {/* font-arial
        font-ui-sans-serif */}
        {product?.v_urgent_sale == "1" && (
          <div className="absolute top-0 left-0 w-24 h-24 z-20">
            <div className="absolute transform -rotate-45 bg-gradient-to-r from-orange-600 to-red-600 text-center text-white font-bold py-1 left-[-34px] top-[24px] w-[150px] shadow-lg text-xs tracking-wide">
              URGENT
            </div>
          </div>
        )}

        {/* Message Notification Badge */}
        {/* <div 
          onClick={() => setChatOpen(true)}
          className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-2.5 py-1.5 rounded-full text-xs font-bold shadow-lg z-30 flex items-center gap-1 animate-pulse cursor-pointer hover:from-red-600 hover:to-red-700 transition-all duration-200 md:hidden"
        >
          <span className="flex h-2 w-2 relative">
            <span className="inline-flex absolute h-full w-full rounded-full bg-white opacity-75 animate-ping"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span>2 msg</span>
        </div> */}


        <Link href={href} target="_blank">
          <div className="relative overflow-hidden rounded-xl group/image">
            {product?.vehicle_front_image?.url && (
              <img
                src={product?.vehicle_front_image.url || 'https://res.cloudinary.com/pilotbazar/image/upload/vehicles/6BM29EuNbGBWwi51Z514ChHfLTLcocKGyD2QJLnv.jpg'}
                alt="Vehicle"
                className="rounded-xl mb-3 w-full h-60 sm:h-72 md:h-72 lg:h-72 xl:h-60 3xl:h-72 object-cover aspect-[3/2] transition-transform duration-500 group-hover/image:scale-105"
              />
            )}

            {/* {(parsedUser?.user_mode === 'pbl' || parsedUser?.user_mode === 'supreme') && ( */}
            {/* <div
             className="absolute bottom-6 left-3 bg-gray-600/80 backdrop-blur-sm rounded-full px-3 py-1.5 leading-4 text-xs text-white font-medium z-10 cursor-pointer hover:bg-gray-700/90 transition-all duration-200 shadow-lg flex items-center gap-1"
            >
              <Clock className="h-3 w-3" title="Vehicle Code" /> 
            </div>
             */}




            <div
              onClick={handleCopy}
              className="absolute bottom-6 right-3 bg-gray-600/80 backdrop-blur-sm rounded-full px-3 py-1.5 leading-4 text-xs text-white font-medium z-10 cursor-pointer hover:bg-gray-700/90 transition-all duration-200 shadow-lg flex items-center gap-1"
            >
              {copied ? "✓ Copied!" : product?.v_code}
            </div>
            {/* // )} */}

          </div>
        </Link>

        <Link href={`/product/${product?.v_id}`} target="_blank">
          <p className="text-lg leading-6 font-bold text-blue-800 hover:text-blue-900 transition-colors duration-200 line-clamp-2">
            {product?.v_title?.length > 50
              ? product.v_title.slice(0, 50) + "..."
              : product.v_title}
          </p>
        </Link>


        <div className="grid grid-cols-3 gap-2 mt-2 bg-gray-50 rounded-lg p-2">
          {/* Condition */}
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs sm:text-sm md:text-sm lg:text-xs xl:text-xs 2xl:text-sm 3xl:text-sm 4xl:text-sm font-medium mb-1">Condition</span>
            <span className="font-bold text-gray-900 text-sm sm:text-base">
              {product?.v_condition_name || 'N/A'}
            </span>
          </div>

          {/* Registration */}
          {
            product.v_grade_name ? (
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs sm:text-sm md:text-sm lg:text-xs xl:text-xs 2xl:text-sm 3xl:text-sm 4xl:text-sm font-medium mb-1">Point</span>
                <span className="text-gray-900 font-bold text-sm sm:text-base">
                  {product?.v_grade_name || 'N/A'} (
                  {[product?.v_int_grade_name, product?.v_ext_grade_name].filter(Boolean).join(' ') || 'N/A'}
                  )

                </span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs sm:text-sm md:text-sm lg:text-xs xl:text-xs 2xl:text-sm 3xl:text-sm 4xl:text-sm font-medium mb-1">Registration</span>
                <span className="text-gray-900 font-bold text-sm sm:text-base">
                  {product?.v_registration || 'N/A'}
                </span>
              </div>
            )
          }


          {/* <div className="flex flex-col">
            <span className="text-gray-400 text-sm sm:text-base md:text-base lg:text-sm xl:text-sm 2xl:text-base 3xl:text-base 4xl:text-base">Point</span>
            <span className="text-black font-bold ">
              {product?.v_registration || 'N/A'}
            </span>
          </div> */}

          {/* Mileage */}
          <div className="flex flex-col text-center">
            <span className="text-gray-500 text-xs sm:text-sm md:text-sm lg:text-xs xl:text-xs 2xl:text-sm 3xl:text-sm 4xl:text-sm font-medium mb-1">Mileage</span>
            <span className="text-gray-900 font-bold text-sm sm:text-base">
              {product?.v_mileage || 'N/A'}
            </span>
          </div>
        </div>


        <div className="text-gray-600 text-sm w-full flex mt-2 py-2 border-t border-gray-100">
          <div className="w-[34%]">
            <span className={`${selectedAvailabilityStatus === "dealer_boock"
              ? "text-orange-600"
              : selectedAvailabilityStatus === "sold" || selectedAvailabilityStatus === "booked"
                ? "text-red-600"
                : "text-gray-600"
              } text-xs sm:text-sm md:text-sm lg:text-xs xl:text-xs 2xl:text-sm 3xl:text-sm 4xl:text-sm font-medium`}>
              {selectedAvailabilityStatus
                ? `${getAvailabilityStatusLabel(selectedAvailabilityStatus)} `
                : <span className="text-gray-600">Available</span>}
            </span>
          </div>

          {/* {
            console.log("pathname", pathname)
          } */}

          <div className="w-[33%]">
            <span
              className={`text-gray-600 text-xs sm:text-sm md:text-sm lg:text-xs xl:text-xs 2xl:text-sm 3xl:text-sm 4xl:text-sm font-medium ${displayedOutletName ? "cursor-help" : ""}`}
              title={shouldShowOutletName ? displayedOutletName : ""}
            >
              {displayedLocationName
                ? displayedLocationName.charAt(0).toUpperCase() + displayedLocationName.slice(1) + " "
                : ""}
              {
                pathname !== '/pb-home/'
                  ? `${displayedOutletId ? `(${displayedOutletId}) ` : ""}`
                  : ``
              }
            </span>
          </div>

          {/* ${displayedOutletName} */}


          <div className="w-[33%]">
            <div className="relative flex justify-end pr-4">



              <div className="-mt-1">
                {
                  <div
                    className="relative mr-2 flex h-6 w-6 items-center justify-center drop-shadow-sm cursor-pointer"
                    title={product?.v_color_name ? `${product.v_color_name}` : "Color information not available"}
                  >
                    <Palette className="h-7 w-7  text-pink-600" />

                    {/* <span className="absolute  text-[12px] mt-0.5 font-bold leading-none text-gray-900">
                        Red
                      </span> */}
                  </div>
                }
              </div>

              {
                (!isMyShop && !isCompanyShop) &&
                <div className="-mt-1">
                  {
                    formattedUserRating
                      ? <div
                        className="relative mr-2 flex h-6 w-6 items-center justify-center drop-shadow-sm cursor-pointer"
                        title={`Importer rating ${formattedUserRating}`}
                      >
                        <Star className="h-8 w-8 fill-amber-300 text-amber-400" />
                        <span className="absolute  text-[12px] mt-0.5 font-bold leading-none text-gray-900">
                          {formattedUserRating}
                        </span>
                      </div>
                      : null
                  }
                </div>
              }




              <div
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={(e) => {
                  e.preventDefault();   // ✅ stop Link navigation
                  e.stopPropagation();  // ✅ stop bubbling
                  setShowTooltip(!showTooltip);
                }}

              >
                <Clock className="h-5 w-5" />
                {/* {dayjs(product?.v_created_at).fromNow()} */}
              </div>

              {/* Tooltip */}
              {showTooltip && (
                <div
                  className="
                    absolute bottom-6 left-3
                    bg-black text-white
                    text-xs
                    px-3 py-2
                  
                    rounded-md
                    shadow-lg
                    whitespace-nowrap
                    z-20
                    animate-fadeIn
                  "
                >
                  {dayjs(product?.v_created_at).fromNow()}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* {
          console.log("product", product)
        } */}


        <div className="py-2 border-t border-gray-100 flex-grow flex flex-col justify-end">

          <div className="flex justify-between mb-2">

            <div>
              <div className="font-extrabold text-gray-900 text-xl mb-1">
                {/* {displayVehiclePrice?.user_price !== 'Call for Price' && ''} */}
                {displayVehiclePrice?.user_price !== 'Call for Price' && displayVehicleDbPrice?.vp_currency + '. '}
                {(pathname === '/my-shop/' || pathname === '/company-shop/')
                  ? formatPrice(displayVehiclePrice?.user_price)
                  : formatPrice(displayVehiclePrice?.pbl_price)
                }
              </div>

              {
                pathname !== '/pb-home/' ? (
                  <span className="text-gray-500 text-xs font-medium mb-1">
                    {displayVehicleDbPrice?.vp_pbl_price_status
                      ? String(displayVehicleDbPrice.vp_pbl_price_status).charAt(0).toUpperCase() +
                      String(displayVehicleDbPrice.vp_pbl_price_status).slice(1)
                      : ''}
                  </span>
                ) : (
                  <span className="text-gray-500 text-xs font-medium mb-1">
                    {displayVehicleDbPrice?.vp_user_price_status
                      ? String(displayVehicleDbPrice.vp_user_price_status).charAt(0).toUpperCase() +
                      String(displayVehicleDbPrice.vp_user_price_status).slice(1)
                      : ''}
                  </span>
                )
              }
            </div>

            {
              (!isMyShop && !isCompanyShop) &&
              Number(parsedUser?.id) !== Number(product?.v_user_id) && (
                <button
                  // onClick={() => setChatOpen(true)}
                  onClick={() => handleChatOpen()}
                  title="ইম্পোর্টারের সাথে সরাসরি চ্যাট করুন"
                  className="
                  px-3
                  lg:px-4
                  md:px-2
                  xl:px-3
                  3xl:px-4
                  py-2
                  border-2
                border-red-300
                rounded-lg
                text-red-800
                font-semibold
                bg-yellow-50
                hover:bg-red-50
                hover:border-red-400
                active:scale-95
                transition-all
                duration-200
                w-32
                h-10
                relative"
                >
                  <div
                    className="flex items-center justify-center gap-2"
                  >
                    <span className="text-sm">Offer Price</span>
                  </div>
                </button>
              )
            }
          </div>

          {/* Buttons */}
          <div className="flex justify-between gap-2">
            {(isFilterProductPage || isSearchResultsPage || pathname === '/pb-home/' || pathname == '/' || sourceParam === 'pb-home' || sourceParam === 'home') && (
              <button
                onClick={() => {
                  if (!parsedUser) {
                    setLoginOpen(true);
                    return;
                  }
                  setShopModalOpen(true);
                }}
                title="Clone"
                className="
                flex-1
              lg:px-3
              md:px-4
              xl:px-2.5
              3xl:px-3
              bg-gradient-to-r 
              border
              border-blue-300
              text-white 
              font-semibold 
              px-4 py-1
              rounded-lg 
              transition-all duration-300
              hover:shadow-lg
              active:scale-95"
              >
                <div
                  className="flex items-center justify-center gap-2"
                >
                  <Copy className="h-4 w-4 text-blue-600" />
                  {/* <span className="text-sm">Clone</span> */}
                </div>
              </button>
            )}





            <button
              onClick={() => setOpen(true)}
              title="Share"
              className="
              flex-1
              lg:px-3
              md:px-4
              xl:px-2.5
              3xl:px-3
              bg-gradient-to-r 
              border
              border-green-300
              font-semibold 
              px-4 py-1 
              rounded-lg 
              transition-all duration-300
              hover:shadow-lg
              active:scale-95"
            >
              <div
                className="flex items-center justify-center gap-2"
              >
                <Share2 className="h-4 w-4 text-green-600" />
                {/* <span className="text-sm">Share</span> */}
              </div>
            </button>

            {
              (!isMyShop && !isCompanyShop) && (
                <button
                  onClick={() => {
                    const phoneNumber = parsedUser?.phone || '+8809638660077';
                    window.location.href = `tel:${phoneNumber}`;
                  }}
                  title="Contact Via Phone"
                  className="
                    flex-1
                    lg:px-3
                    md:px-4
                    xl:px-2.5
                    3xl:px-3
                    bg-gradient-to-r 
                    border
                    border-purple-300
                    font-semibold 
                    px-4 py-1
                    rounded-lg 
                    transition-all duration-300
                    hover:shadow-lg
                    active:scale-95"
                >
                  <div className="flex items-center justify-center gap-2">
                    <PhoneOutgoing className="h-4 w-4 text-purple-600" />
                    {/* <span className="text-sm">Call</span> */}
                  </div>
                </button>
              )
            }



            {
              (isFilterProductPage || isSearchResultsPage || pathname === '/pb-home/' || pathname === '/' || sourceParam === 'pb-home' || sourceParam === 'home') && (
                <button
                  onClick={() => {
                    const rawPhoneNumber = '+8801407054400';
                    const phoneNumber = rawPhoneNumber.replace('+', '');
                    const productDetailsUrl = `${window.location.origin}${href}`;
                    const message = `Hello,\nI am interested about this product. Please give me more information.\n${productDetailsUrl}`;
                    const whatsappText = encodeURIComponent(message);
                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${whatsappText}`;
                    const link = document.createElement('a');
                    link.href = whatsappUrl;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.click();
                  }}
                  title="Contact Via WhatsApp"
                  className="
              flex-1
              lg:px-3
              md:px-4
              xl:px-2.5
              3xl:px-3
              bg-gradient-to-r 
               border-2
              border-green-600
              font-bold 
              px-4 py-1
              rounded-lg 
              transition-all duration-300
              hover:shadow-lg
              active:scale-95"
                >
                  <div className="flex items-center justify-center gap-2">
                    <FaWhatsapp className="h-6 w-6 text-green-600 stroke-2" />
                  </div>
                </button>
              )
            }

            {
              (!isMyShop && !isCompanyShop) && (
                <button
                  onClick={() => handleAddToCart(product)}
                  title="Add To Cart"
                  className="
                  flex-1
                  lg:px-3
                  md:px-4
                  xl:px-2.5
                  3xl:px-3
                  bg-gradient-to-r 
                  border
                  border-orange-300
                  font-semibold 
                  px-4 py-1
                  rounded-lg 
                  transition-all duration-300
                  hover:shadow-lg
                  active:scale-95"
                >
                  <div className="flex items-center justify-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-orange-600" />
                  </div>
                </button>
              )
            }

            <button
              onClick={() => toggleCompare(product?.v_id)}
              title="Add to compare"
              className={`
                flex-1
                lg:px-3
                md:px-4
                xl:px-2.5
                3xl:px-3
                border
                font-semibold 
                px-4 py-1
                rounded-lg 
                transition-all duration-300
                hover:shadow-lg
                active:scale-95
                ${isInCompare(product?.v_id) ? 'border-cyan-600 bg-cyan-600 text-white' : 'border-cyan-300'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <GitCompare className={`h-4 w-4 ${isInCompare(product?.v_id) ? 'text-white' : 'text-cyan-600'}`} />
              </div>
            </button>

            {
              (pathname === '/my-shop/' || pathname === '/company-shop/') && (
                <button
                  onClick={handleEditModalOpen}
                  className="
                    flex-1
                    lg:px-4
                    md:px-5
                    xl:px-3
                    3xl:px-4
                    bg-gradient-to-r 
                    border
                    border-pink-300
                    font-semibold 
                    px-6 py-2 
                    rounded-lg 
                    transition-all duration-300
                    hover:shadow-lg
                    active:scale-95
                  "
                >
                  <div className="flex items-center justify-center gap-2">
                    <Edit className="h-4 w-4 text-pink-600" />
                  </div>
                </button>
              )
            }



          </div>


        </div>
      </div>

      <Dialog open={editModalOpen} onOpenChange={handleEditModalOpenChange}>
        <DialogContent className="!top-auto !bottom-0 !translate-y-0 w-full max-w-[380px] rounded-t-3xl border border-gray-200 p-0 sm:!top-[50%] sm:!bottom-auto sm:!translate-y-[-50%] sm:rounded-3xl [&>button]:hidden">
          <div className="px-4 pb-4 pt-2">
            <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-gray-300"></div>

            <DialogHeader className="text-left">
              <div className="flex items-start justify-between gap-3">
                <DialogTitle className="text-[36px] font-bold leading-none text-gray-800">Edit</DialogTitle>
                <button
                  type="button"
                  onClick={() => handleEditModalOpenChange(false)}
                  className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Close edit dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </DialogHeader>

            {/* <div className="mt-3 border-t border-gray-200"></div> */}

            <div className="mt-3 grid grid-cols-2 gap-3">
              {["Product", "Price", "Outlet", "Location"].map((label) => {
                const isEditDisabled =
                  (label === "Product" && !updateProductPermission) ||
                  (label === "Price" && !updatePricePermission) ||
                  (label === "Outlet" && !updateOutletPermission) ||
                  (label === "Location" && !updateLocationPermission);

                return (
                  <button
                    key={label}
                    type="button"
                    disabled={isCompanyShop && !isMyShop && isEditDisabled}
                    onClick={() => {
                      setEditModalOpen(false);
                      handleEditProduct(label, product);
                    }}
                    className="h-11 rounded-xl border px-3 text-base font-medium transition-colors enabled:border-gray-300 enabled:bg-gray-100 enabled:text-gray-800 enabled:hover:bg-gray-200 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-70"
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div title={!hasClientPaymentHistoryPermission ? "You don't have permission" : ""}>
                <button
                  type="button"
                  disabled={!hasClientPaymentHistoryPermission}
                  onClick={() => {
                    setEditModalOpen(false);
                    handleEditProduct("Client payment history", product);
                  }}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 text-base font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Money Receipt
                </button>
              </div>

              <div title={!hasQuationViewPermission ? "You don't have permission" : ""}>
                <button
                  type="button"
                  disabled={!hasQuationViewPermission}
                  onClick={() => openBillCopyModal()}
                  className="h-11 w-full rounded-xl border border-green-300 bg-green-50 px-3 text-base font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Bank Docs
                </button>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <div title={!hasChalanViewPermission ? "You don't have permission" : ""}>
                <button
                  type="button"
                  disabled={!hasChalanViewPermission}
                  onClick={() => { openChalanModal(); }}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 text-base font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Chalan
                </button>
              </div>

              <div title={!hasQuationViewPermission ? "You don't have permission" : ""}>
                <button
                  type="button"
                  disabled={!hasQuationViewPermission}
                  onClick={() => { openQuotationModal(); }}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 text-base font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Quotation
                </button>
              </div>


            </div>

            <div className="mt-4 border-t border-gray-200"></div>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-800">Status</span>

              <div className="relative w-full max-w-[190px]">
                <select
                  value={selectedAvailabilityStatus}
                  onChange={(e) => handleAvailabilityStatusUpdate(e.target.value)}
                  // disabled={isAvailabilityUpdating || isDeletingProduct || !updateStatusPermission}
                  disabled={isAvailabilityUpdating || isDeletingProduct || !canUpdateAnyAvailabilityStatus}
                  className="h-11 w-full appearance-none rounded-xl border border-gray-300 bg-[#eeecfb] px-3 pr-10 text-base font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#c8c2f7] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {availabilityStatusOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={!canUpdateAvailabilityStatus(option.value)}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
              </div>
            </div>





            <div className="mx-auto mt-3 grid w-full max-w-[340px] grid-cols-2 gap-2">
              {availabilityStatusOptions.map((option) => {
                const isStatusUpdateDisabled =
                  isAvailabilityUpdating ||
                  isDeletingProduct ||
                  !canUpdateAvailabilityStatus(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleAvailabilityStatusUpdate(option.value)}
                    disabled={isStatusUpdateDisabled}
                    className={`min-h-10 w-full min-w-0 rounded-2xl border-2 px-3 text-sm font-semibold leading-none transition sm:text-base ${getStatusButtonClasses(option.value)} ${isStatusUpdateDisabled ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <span className="whitespace-nowrap">{option.label}</span>
                  </button>
                );
              })}
            </div>

            {isAvailabilityUpdating && (
              <p className="mt-2 text-xs text-gray-500">Updating status...</p>
            )}

            <button
              type="button"
              onClick={handleDeleteProductClick}
              disabled={isDeletingProduct || isAvailabilityUpdating || !hasDeleteProductPermission}
              className="mt-5 h-11 w-full rounded-xl bg-red-500 text-lg font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeletingProduct ? "Deleting..." : "Delete"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ClientPaymentHistoryModal
        open={clientPaymentHistoryOpen}
        setOpen={setClientPaymentHistoryOpen}
        product={product}
        parsedUser={parsedUser}
      />

      {/* {
        console.log("chalanCustomerOptions --------------------", chalanCustomerOptions)
      } */}

      <Dialog open={chalanModalOpen} onOpenChange={handleChalanModalChange}>
        <DialogContent className="max-h-[90vh] w-[92vw] max-w-xl overflow-hidden rounded-2xl border border-gray-200 p-0">
          <form onSubmit={handleChalanSubmit} className="flex max-h-[90vh] flex-col">
            <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
              <DialogHeader className="text-left">
                <DialogTitle className="text-2xl font-bold text-gray-800">
                  Delivery Challan
                </DialogTitle>
              </DialogHeader>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Select Customer
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Select
                      value={selectedChalanCustomerOption}
                      onChange={handleChalanCustomerChange}
                      options={chalanCustomerOptions}
                      isClearable
                      isSearchable
                      isDisabled={isChalanCustomersLoading || isChalanSubmitting}
                      isLoading={isChalanCustomersLoading}
                      placeholder={
                        isChalanCustomersLoading ? "Loading customers..." : "Select Customer"
                      }
                      noOptionsMessage={() => "No customers found"}
                      className="min-w-0 flex-1 text-sm"
                      classNamePrefix="react-select"
                      styles={productCardCustomerSelectStyles}
                    />
                    <button
                      type="button"
                      onClick={() => setContactCustomerModalOpen(true)}
                      className="inline-flex h-11 shrink-0 items-center justify-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      <Plus className="h-4 w-4" />
                      Add Customer
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Name
                  </label>
                  <input
                    type="text"
                    value={chalanForm.customerName}
                    onChange={(event) =>
                      handleChalanFormChange("customerName", event.target.value)
                    }
                    disabled={isChalanSubmitting}
                    className={chalanInputClass}
                    placeholder="Name"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={chalanForm.customerPhone}
                    onChange={(event) =>
                      handleChalanFormChange("customerPhone", event.target.value)
                    }
                    disabled={isChalanSubmitting}
                    className={chalanInputClass}
                    placeholder="Phone"
                  />
                </div>


                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    NID
                  </label>
                  <input
                    type="text"
                    value={chalanForm.customerNid}
                    onChange={(event) =>
                      handleChalanFormChange("customerNid", event.target.value)
                    }
                    disabled={isChalanSubmitting}
                    className={chalanInputClass}
                    placeholder="NID"
                  />
                </div>


                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Date
                  </label>
                  <input
                    type="date"
                    value={chalanForm.date}
                    onChange={(event) =>
                      handleChalanFormChange("date", event.target.value)
                    }
                    disabled={isChalanSubmitting}
                    className={chalanInputClass}
                  />
                </div>



                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Customer Address / To Address
                  </label>
                  <textarea
                    value={chalanForm.address}
                    onChange={(event) =>
                      handleChalanFormChange("address", event.target.value)
                    }
                    disabled={isChalanSubmitting}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="Customer Address"
                    rows={3}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    From Address
                  </label>
                  <textarea
                    value={chalanForm.fromAddress}
                    onChange={(event) =>
                      handleChalanFormChange("fromAddress", event.target.value)
                    }
                    disabled={isChalanSubmitting}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="From Address"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Sender Mobile Number
                  </label>
                  <input
                    type="text"
                    inputMode="tel"
                    value={chalanForm.sellerMobile}
                    onChange={(event) =>
                      handleChalanFormChange("sellerMobile", event.target.value)
                    }
                    disabled={isChalanSubmitting}
                    className={chalanInputClass}
                    placeholder="Sender Mobile Number"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Receiver Mobile Number
                  </label>
                  <input
                    type="text"
                    inputMode="tel"
                    value={chalanForm.receiverMobile}
                    onChange={(event) =>
                      handleChalanFormChange("receiverMobile", event.target.value)
                    }
                    disabled={isChalanSubmitting}
                    className={chalanInputClass}
                    placeholder="Receiver Mobile Number"
                  />
                </div>


                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Chalan Number
                  </label>
                  <input
                    type="text"
                    value={chalanForm.calanNo}
                    onChange={(event) =>
                      handleChalanFormChange("calanNo", event.target.value)
                    }
                    disabled={isChalanSubmitting}
                    className={chalanInputClass}
                    placeholder="Chalan Number"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Reference
                  </label>
                  <input
                    type="text"
                    value={chalanForm.reference}
                    onChange={(event) =>
                      handleChalanFormChange("reference", event.target.value)
                    }
                    disabled={isChalanSubmitting}
                    className={chalanInputClass}
                    placeholder="Reference"
                  />
                </div>





                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Registration Number (if any)
                  </label>
                  <input
                    type="text"
                    value={chalanForm.registrationNo}
                    onChange={(event) =>
                      handleChalanFormChange("registrationNo", event.target.value)
                    }
                    disabled={isChalanSubmitting}
                    className={chalanInputClass}
                    placeholder="Registration Number"
                  />
                </div>


                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Note
                  </label>
                  <textarea
                    value={chalanForm.note}
                    onChange={(event) =>
                      handleChalanFormChange("note", event.target.value)
                    }
                    disabled={isChalanSubmitting}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="Note"
                    rows={4}
                  />
                </div>







                <div className="sm:col-span-2">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Goods Description
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:grid-cols-2">
                    {isGoodsDescriptionLoading ? (
                      <div className="col-span-full flex items-center gap-2 text-sm font-medium text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading goods descriptions...
                      </div>
                    ) : goodsDescriptionOptions.length ? (
                      goodsDescriptionOptions.map((option) => {
                        const isChecked = (chalanForm.goodsDescriptions || []).includes(
                          option.value
                        );

                        return (
                          <label
                            key={option.value}
                            className="flex min-h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(event) =>
                                handleChalanGoodsDescriptionToggle(
                                  option.value,
                                  event.target.checked
                                )
                              }
                              disabled={isChalanSubmitting}
                              className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-200 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                            <span>{option.label}</span>
                          </label>
                        );
                      })
                    ) : (
                      <p className="col-span-full text-sm font-medium text-gray-500">
                        No goods description found
                      </p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={Boolean(chalanForm.isDuplicate)}
                      onChange={(event) =>
                        handleChalanFormChange("isDuplicate", event.target.checked)
                      }
                      disabled={isChalanSubmitting}
                      className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-200 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <span>Duplicate Challan</span>
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter className="grid shrink-0 grid-cols-2 gap-3 border-t border-gray-200 bg-white p-4 sm:px-6">
              <button
                type="button"
                onClick={() => handleChalanModalChange(false)}
                disabled={isChalanSubmitting}
                className="h-11 rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isChalanSubmitting ||
                  isChalanCustomersLoading ||
                  isGoodsDescriptionLoading ||
                  !productId
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-pink-600 px-4 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isChalanSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {isChalanSubmitting ? "Generating..." : "Submit"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={quotationModalOpen} onOpenChange={handleQuotationModalChange}>
        <DialogContent className="w-[92vw] max-w-2xl rounded-2xl border border-gray-200 p-0 max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleQuotationSubmit}>
            <div className="p-5 sm:p-6">
              <DialogHeader className="text-left">
                <DialogTitle className="text-2xl font-bold text-gray-800">
                  Create Quotation
                </DialogTitle>
              </DialogHeader>


              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    (To) Bank / Institution Name
                  </label>
                  <input
                    type="text"
                    value={quotationForm.bankName}
                    onChange={(event) =>
                      handleQuotationFormChange("bankName", event.target.value)
                    }
                    disabled={isQuotationSubmitting}
                    className={quotationInputClass}
                    placeholder="Bank Name"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    (To) Bank Branch / Institution Area
                  </label>
                  <input
                    type="text"
                    value={quotationForm.bankBranch}
                    onChange={(event) =>
                      handleQuotationFormChange("bankBranch", event.target.value)
                    }
                    disabled={isQuotationSubmitting}
                    className={quotationInputClass}
                    placeholder="Bank Branch"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    (To) Bank / Institution Address
                  </label>
                  <input
                    type="text"
                    value={quotationForm.bankAddress}
                    onChange={(event) =>
                      handleQuotationFormChange("bankAddress", event.target.value)
                    }
                    disabled={isQuotationSubmitting}
                    className={quotationInputClass}
                    placeholder="Bank Address"
                  />
                </div>



                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Select Customer
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Select
                      value={selectedQuotationCustomerOption}
                      onChange={handleQuotationCustomerChange}
                      options={quotationCustomerOptions}
                      isClearable
                      isSearchable
                      isDisabled={isQuotationCustomersLoading || isQuotationSubmitting}
                      isLoading={isQuotationCustomersLoading}
                      placeholder={
                        isQuotationCustomersLoading ? "Loading customers..." : "Select Customer"
                      }
                      noOptionsMessage={() => "No customers found"}
                      className="min-w-0 flex-1 text-sm"
                      classNamePrefix="react-select"
                      styles={productCardCustomerSelectStyles}
                    />
                    <button
                      type="button"
                      onClick={() => setContactCustomerModalOpen(true)}
                      className="inline-flex h-11 shrink-0 items-center justify-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      <Plus className="h-4 w-4" />
                      Add Customer
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Name
                  </label>
                  <input
                    type="text"
                    value={quotationForm.customerName}
                    onChange={(event) =>
                      handleQuotationFormChange("customerName", event.target.value)
                    }
                    disabled={isQuotationSubmitting}
                    className={quotationInputClass}
                    placeholder="Name"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={quotationForm.customerPhone}
                    onChange={(event) =>
                      handleQuotationFormChange("customerPhone", event.target.value)
                    }
                    disabled={isQuotationSubmitting}
                    className={quotationInputClass}
                    placeholder="Phone"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    NID
                  </label>
                  <input
                    type="text"
                    value={quotationForm.customerNid}
                    onChange={(event) =>
                      handleQuotationFormChange("customerNid", event.target.value)
                    }
                    disabled={isQuotationSubmitting}
                    className={quotationInputClass}
                    placeholder="NID"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Date
                  </label>
                  <input
                    type="date"
                    value={quotationForm.date}
                    onChange={(event) =>
                      handleQuotationFormChange("date", event.target.value)
                    }
                    disabled={isQuotationSubmitting}
                    className={quotationInputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Customer Address
                  </label>
                  <textarea
                    value={quotationForm.customerFromAddress}
                    onChange={(event) =>
                      handleQuotationFormChange("customerFromAddress", event.target.value)
                    }
                    disabled={isQuotationSubmitting}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="Customer Address"
                    rows={3}
                  />
                </div>



                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Price
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatProductCardInputNumber(quotationForm.price)}
                      onChange={(event) => {
                        const nextValue = event.target.value.replace(/\D+/g, "").slice(0, 12);
                        handleQuotationFormChange("price", nextValue);
                        setIsQuotationPriceDropdownOpen(nextValue.length > 0);

                        // Automatically update price in words
                        const words = numberToProductCardIndianWords(nextValue);
                        handleQuotationFormChange("priceInWords", words);
                      }}
                      onFocus={() => setIsQuotationPriceDropdownOpen(quotationPriceOptions.length > 0)}
                      onBlur={() => {
                        setTimeout(() => setIsQuotationPriceDropdownOpen(false), 120);
                      }}
                      disabled={isQuotationSubmitting}
                      className={quotationInputClass}
                      placeholder="Price"
                    />
                    {isQuotationPriceDropdownOpen && quotationPriceOptions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                        {quotationPriceOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                            onClick={() => {
                              handleQuotationFormChange("price", option.value);
                              handleQuotationFormChange("priceInWords", option.words);
                              setIsQuotationPriceDropdownOpen(false);
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
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Price In Words
                  </label>
                  <input
                    type="text"
                    value={quotationForm.priceInWords}
                    onChange={(event) =>
                      handleQuotationFormChange("priceInWords", event.target.value)
                    }
                    disabled={isQuotationSubmitting}
                    className={quotationInputClass}
                    placeholder="Price In Words"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Price Negotiation
                  </label>
                  <select
                    value={quotationForm.priceNegotiation}
                    onChange={(event) =>
                      handleQuotationFormChange("priceNegotiation", event.target.value)
                    }
                    disabled={isQuotationSubmitting}
                    className={quotationInputClass}
                  >
                    <option value="Fixed">Fixed</option>
                    <option value="Negotiable">Negotiable</option>
                    <option value="Not Applicable">Not Applicable</option>
                    <option value="As per Discussion">As per Discussion</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Registration Charge
                  </label>
                  <select
                    value={quotationForm.registrationCharge}
                    onChange={(event) =>
                      handleQuotationFormChange("registrationCharge", event.target.value)
                    }
                    disabled={isQuotationSubmitting}
                    className={quotationInputClass}
                  >
                    <option value="Included">Included</option>
                    <option value="Excluded">Excluded</option>
                    <option value="Not Applicable">Not Applicable</option>
                    <option value="As per Discussion">As per Discussion</option>
                    <option value="Free">Free</option>
                    <option value="Buyer Will Pay">Buyer Will Pay</option>
                    <option value="Customer Will Pay">Customer Will Pay</option>
                    <option value="Seller Will Pay">Seller Will Pay</option>
                    <option value="Institution Will Pay">Institution Will Pay</option>
                    <option value="Institution Will Pay">Institution Will Pay</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    VAT
                  </label>
                  <select
                    value={quotationForm.vat}
                    onChange={(event) =>
                      handleQuotationFormChange("vat", event.target.value)
                    }
                    disabled={isQuotationSubmitting}
                    className={quotationInputClass}
                  >
                    <option value="Included">Included</option>
                    <option value="Excluded">Excluded</option>
                    <option value="Not Applicable">Not Applicable</option>
                    <option value="As per Discussion">As per Discussion</option>
                    <option value="Free">Free</option>
                    <option value="Buyer Will Pay">Buyer Will Pay</option>
                    <option value="Customer Will Pay">Customer Will Pay</option>
                    <option value="Seller Will Pay">Seller Will Pay</option>
                    <option value="Institution Will Pay">Institution Will Pay</option>
                    <option value="Institution Will Pay">Institution Will Pay</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Insurance
                  </label>
                  <select
                    value={quotationForm.insurance}
                    onChange={(event) =>
                      handleQuotationFormChange("insurance", event.target.value)
                    }
                    disabled={isQuotationSubmitting}
                    className={quotationInputClass}
                  >
                    <option value="Included">Included</option>
                    <option value="Excluded">Excluded</option>
                    <option value="Not Applicable">Not Applicable</option>
                    <option value="As per Discussion">As per Discussion</option>
                    <option value="Free">Free</option>
                    <option value="Buyer Will Pay">Buyer Will Pay</option>
                    <option value="Customer Will Pay">Customer Will Pay</option>
                    <option value="Seller Will Pay">Seller Will Pay</option>
                    <option value="Institution Will Pay">Institution Will Pay</option>
                    <option value="Institution Will Pay">Institution Will Pay</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Payment Method
                  </label>
                  <select
                    value={quotationForm.paymentMethod}
                    onChange={(event) =>
                      handleQuotationFormChange("paymentMethod", event.target.value)
                    }
                    disabled={isQuotationSubmitting}
                    className={quotationInputClass}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Any">Any</option>
                    <option value="Pay Order">Pay Order</option>
                    <option value="Check">Check</option>
                    <option value="RTGS">RTGS</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Offer Validity Date
                  </label>
                  <input
                    type="date"
                    value={quotationForm.offerValidityDate}
                    onChange={(event) =>
                      handleQuotationFormChange("offerValidityDate", event.target.value)
                    }
                    disabled={isQuotationSubmitting}
                    className={quotationInputClass}
                  />
                </div>


                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Delivery Place Address
                  </label>
                  <textarea
                    value={quotationForm.deliveryAddress}
                    onChange={(event) =>
                      handleQuotationFormChange("deliveryAddress", event.target.value)
                    }
                    disabled={isQuotationSubmitting}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="Delivery Address"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Delivery Place Mobile
                  </label>
                  <input
                    type="text"
                    inputMode="tel"
                    value={quotationForm.deliveryMobile}
                    onChange={(event) =>
                      handleQuotationFormChange("deliveryMobile", event.target.value)
                    }
                    disabled={isQuotationSubmitting}
                    className={quotationInputClass}
                    placeholder="Delivery Mobile"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Delivery Place Email
                  </label>
                  <input
                    type="email"
                    value={quotationForm.deliveryEmail}
                    onChange={(event) =>
                      handleQuotationFormChange("deliveryEmail", event.target.value)
                    }
                    disabled={isQuotationSubmitting}
                    className={quotationInputClass}
                    placeholder="Delivery Email"
                  />
                </div>


                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Note
                  </label>
                  <textarea
                    value={quotationForm.note}
                    onChange={(event) =>
                      handleQuotationFormChange("note", event.target.value)
                    }
                    disabled={isQuotationSubmitting}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="Note"
                    rows={3}
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-2 font-semibold text-red-500 text-sm sm:flex-row sm:items-center sm:justify-start">
                  <span>NB. Bank Account Information will be Taken From Profile Page</span>
                  <button
                    type="button"
                    target="_blank"
                    onClick={() => router.push("/profile/#bank-accounts")}
                    className="inline-flex h-9 w-fit items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                </div>
              </div>
            </div>

            <DialogFooter className="grid grid-cols-2 gap-3 border-t border-gray-200 bg-white p-4 sm:px-6">
              <button
                type="button"
                onClick={() => handleQuotationModalChange(false)}
                disabled={isQuotationSubmitting}
                className="h-11 rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isQuotationSubmitting || isQuotationCustomersLoading || !productId}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isQuotationSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {isQuotationSubmitting ? "Generating..." : "Submit"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* =========== BANK DOCS DIALOG =========== */}
      <Dialog open={billCopyModalOpen} onOpenChange={handleBillCopyModalChange}>
        <DialogContent className="w-[92vw] max-w-2xl rounded-2xl border border-gray-200 p-0 max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleBillCopySubmit}>
            <div className="p-5 sm:p-6">
              <DialogHeader className="text-left">
                <DialogTitle className="text-2xl font-bold text-gray-800">
                  Bank Docs (For Bank Loan Purpose Only)
                </DialogTitle>
              </DialogHeader>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* ---- Bank / Institution Info ---- */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    (To) Bank / Institution Name
                  </label>
                  <input
                    type="text"
                    value={billCopyForm.bankName}
                    onChange={(e) => handleBillCopyFormChange("bankName", e.target.value)}
                    disabled={isBillCopySubmitting}
                    className={billCopyInputClass}
                    placeholder="Bank Name"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    (To) Bank Branch
                  </label>
                  <input
                    type="text"
                    value={billCopyForm.bankBranch}
                    onChange={(e) => handleBillCopyFormChange("bankBranch", e.target.value)}
                    disabled={isBillCopySubmitting}
                    className={billCopyInputClass}
                    placeholder="Bank Branch"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    (To) Bank / Institution Address
                  </label>
                  <input
                    type="text"
                    value={billCopyForm.bankAddress}
                    onChange={(e) => handleBillCopyFormChange("bankAddress", e.target.value)}
                    disabled={isBillCopySubmitting}
                    className={billCopyInputClass}
                    placeholder="Bank Address"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Registration No
                  </label>
                  <input
                    type="text"
                    value={billCopyForm.registrationNo}
                    onChange={(e) => handleBillCopyFormChange("registrationNo", e.target.value)}
                    disabled={isBillCopySubmitting}
                    className={billCopyInputClass}
                    placeholder="Registration No"
                  />
                </div>

                {/* ---- Customer Info ---- */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Select Customer
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Select
                      options={billCopyCustomerOptions}
                      value={selectedBillCopyCustomerOption}
                      onChange={handleBillCopyCustomerChange}
                      isClearable
                      isDisabled={isBillCopyCustomersLoading || isBillCopySubmitting}
                      isLoading={isBillCopyCustomersLoading}
                      placeholder={isBillCopyCustomersLoading ? "Loading customers..." : "Select Customer"}
                      styles={productCardCustomerSelectStyles}
                      noOptionsMessage={() => "No customers found"}
                      className="min-w-0 flex-1 text-sm"
                      classNamePrefix="react-select"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={billCopyForm.customerName}
                    onChange={(e) => handleBillCopyFormChange("customerName", e.target.value)}
                    disabled={isBillCopySubmitting}
                    className={billCopyInputClass}
                    placeholder="Customer Name"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={billCopyForm.customerPhone}
                    onChange={(e) => handleBillCopyFormChange("customerPhone", e.target.value)}
                    disabled={isBillCopySubmitting}
                    className={billCopyInputClass}
                    placeholder="Customer Phone"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Customer Address
                  </label>
                  <input
                    type="text"
                    value={billCopyForm.customerAddress}
                    onChange={(e) => handleBillCopyFormChange("customerAddress", e.target.value)}
                    disabled={isBillCopySubmitting}
                    className={billCopyInputClass}
                    placeholder="Customer Address"
                  />
                </div>

                {/* ---- Date ---- */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Date
                  </label>
                  <input
                    type="date"
                    value={billCopyForm.date}
                    onChange={(e) => handleBillCopyFormChange("date", e.target.value)}
                    disabled={isBillCopySubmitting}
                    className={billCopyInputClass}
                  />
                </div>

                {/* ---- Prices ---- */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Car Price
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={billCopyForm.carPrice}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      handleBillCopyFormChange("carPrice", raw);
                    }}
                    disabled={isBillCopySubmitting}
                    className={billCopyInputClass}
                    placeholder="Car Price (numbers only)"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Bank Payment Amount
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={billCopyForm.bankPayment}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      handleBillCopyFormChange("bankPayment", raw);
                    }}
                    disabled={isBillCopySubmitting}
                    className={billCopyInputClass}
                    placeholder="Bank Payment Amount"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Customer Payment Amount
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={billCopyForm.customerPayment}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      handleBillCopyFormChange("customerPayment", raw);
                    }}
                    disabled={isBillCopySubmitting}
                    className={billCopyInputClass}
                    placeholder="Customer Payment Amount"
                  />
                </div>


              </div>
            </div>

            <DialogFooter className="grid grid-cols-2 gap-3 border-t border-gray-200 bg-white p-4 sm:px-6">
              <button
                type="button"
                onClick={() => handleBillCopyModalChange(false)}
                disabled={isBillCopySubmitting}
                className="h-11 rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBillCopySubmitting || isBillCopyCustomersLoading || !productId}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-green-600 px-4 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBillCopySubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isBillCopySubmitting ? "Generating..." : "Download Bank Docs"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={locationModalOpen} onOpenChange={setLocationModalOpen}>
        <DialogContent className="w-[92vw] max-w-md rounded-2xl border border-gray-200 p-0">
          <div className="p-5">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl font-bold text-gray-800">Update Location</DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Select Country</label>
                <div className="relative">
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      setSelectedLocation("");
                    }}
                    disabled={isCountriesLoading || countries.length === 0}
                    className="h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 pr-10 text-base font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {isCountriesLoading ? (
                      <option value="">Loading countries...</option>
                    ) : countries.length > 0 ? (
                      countries.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))
                    ) : (
                      <option value="">No country found</option>
                    )}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Select Location</label>
                <div className="relative">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    disabled={!selectedCountry || isLocationsLoading || locations.length === 0}
                    className="h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 pr-10 text-base font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {isLocationsLoading ? (
                      <option value="">Loading locations...</option>
                    ) : locations.length > 0 ? (
                      locations.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))
                    ) : (
                      <option value="">{selectedCountry ? "No location found" : "Select country first"}</option>
                    )}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLocationUpdate}
              disabled={isLocationUpdating || !selectedLocation || isLocationsLoading}
              className="mt-6 h-11 w-full rounded-xl bg-blue-600 text-base font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLocationUpdating ? "Updating..." : "Update Location"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={outletModalOpen} onOpenChange={setOutletModalOpen}>
        <DialogContent className="w-[92vw] max-w-md rounded-2xl border border-gray-200 p-0">
          <div className="p-5">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl font-bold text-gray-800">Update Outlet</DialogTitle>
            </DialogHeader>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Select Outlet</label>
              <div className="relative">
                <select
                  value={selectedOutlet}
                  onChange={(e) => setSelectedOutlet(e.target.value)}
                  disabled={isOutletsLoading || outlets.length === 0}
                  className="h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 pr-10 text-base font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="" disabled>
                    {isOutletsLoading
                      ? "Loading outlets..."
                      : outlets.length > 0
                        ? "Select outlet"
                        : "No outlet found"}
                  </option>
                  {outlets.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
              </div>
            </div>

            <button
              type="button"
              onClick={handleOutletUpdate}
              disabled={isOutletUpdating || !selectedOutlet || isOutletsLoading}
              className="mt-6 h-11 w-full rounded-xl bg-blue-600 text-base font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isOutletUpdating ? "Updating..." : "Update Outlet"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ProductShareModal open={open} setOpen={setOpen} product={product} />
      <ShopSelectModal open={shopModalOpen} setOpen={setShopModalOpen} product={product} />
      <PricePreviewModal
        open={priceModalOpen}
        setOpen={setPriceModalOpen}
        selectedProduct={{
          ...product,
          vehicle_price: {
            ...(product?.vehicle_price || {}),
            ...(displayVehiclePrice || {}),
          },
          vehicle_db_price: {
            ...(product?.vehicle_db_price || {}),
            ...(displayVehicleDbPrice || {}),
          },
        }}
        updateProductPricePermission={true}
        onPriceUpdated={handlePriceUpdated}
      />
      <ProductChatModal
        open={chatOpen}
        setOpen={setChatOpen}
        productInfo={product}
      />
      <Dialog
        open={addToCartPromptOpen}
        onOpenChange={(nextOpen) => {
          setAddToCartPromptOpen(nextOpen);
          if (!nextOpen && !quickOrderModalOpen) {
            setQuickOrderProduct(null);
          }
        }}
      >
        <DialogContent className="w-[92vw] max-w-[480px] overflow-hidden rounded-2xl border border-white/25 bg-gradient-to-br from-[#2f0b50] via-[#21105a] to-[#090313] p-0 shadow-2xl [&>button]:text-white [&>button]:opacity-80 [&>button:hover]:opacity-100">
          <div className="p-5 sm:p-6">
            <DialogHeader className="items-center text-center">
              <DialogTitle className="text-2xl font-bold leading-tight text-white">
                Choose Order Type
              </DialogTitle>
            </DialogHeader>

            <DialogFooter className="mt-6 !flex !flex-col gap-3 !space-x-0 sm:!flex-col sm:!justify-start sm:!space-x-0">

              <button
                type="button"
                onClick={handleQuickOrderClick}
                className="group flex min-h-[58px] w-full items-center gap-3 rounded-lg border border-white/45 bg-white/10 px-4 py-3 text-left text-white shadow-[0_0_16px_rgba(96,165,250,0.18)] backdrop-blur transition hover:-translate-y-0.5 hover:border-white/75 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-orange-200">
                  <ReceiptText className="h-5 w-5" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-base font-semibold leading-tight">Easy Order</span>
                  <span className="text-xs font-medium leading-snug text-white/65">Just Order By Mobile Number & Name</span>
                </span>
              </button>

              <button
                type="button"
                onClick={handleWhatsappOrderClick}
                className="group flex min-h-[58px] w-full items-center gap-3 rounded-lg border border-white/45 bg-white/10 px-4 py-3 text-left text-white shadow-[0_0_16px_rgba(96,165,250,0.18)] backdrop-blur transition hover:-translate-y-0.5 hover:border-white/75 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-orange-200">
                  <ReceiptText className="h-5 w-5" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-base font-semibold leading-tight">Quick Order</span>
                  <span className="text-xs font-medium leading-snug text-white/65">Order with WhatsApp</span>
                </span>
              </button>


              <div className="mt-4"></div>

              <button
                type="button"
                onClick={handleManualOrderClick}
                className="group flex min-h-[58px] w-full items-center gap-3 rounded-lg border border-white/45 bg-white/10 px-4 py-3 text-left text-white shadow-[0_0_16px_rgba(96,165,250,0.18)] backdrop-blur transition hover:-translate-y-0.5 hover:border-white/75 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-orange-200">
                  <ReceiptText className="h-5 w-5" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-base font-semibold leading-tight">Login</span>
                  <span className="text-xs font-medium leading-snug text-white/65">Already Have an Account</span>
                </span>
              </button>


              <button
                type="button"
                onClick={handleSignupOrderClick}
                className="group flex min-h-[58px] w-full items-center gap-3 rounded-lg border border-white/45 bg-white/10 px-4 py-3 text-left text-white shadow-[0_0_16px_rgba(96,165,250,0.18)] backdrop-blur transition hover:-translate-y-0.5 hover:border-white/75 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-orange-200">
                  <ReceiptText className="h-5 w-5" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-base font-semibold leading-tight">Sign Up</span>
                  <span className="text-xs font-medium leading-snug text-white/65">Create a New Account</span>
                </span>
              </button>


              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 flex items-center justify-center gap-2">
                <p>Our Only Bkash Account: +8801407054400</p>
              </div>




            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={quickOrderModalOpen}
        onOpenChange={(nextOpen) => {
          setQuickOrderModalOpen(nextOpen);
          if (!nextOpen && !addToCartPromptOpen) {
            setQuickOrderProduct(null);
          }
        }}
      >
        <DialogContent className="w-[92vw] max-w-md rounded-2xl border border-gray-200 p-0">
          <div className="p-5">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl font-bold text-gray-800">Easy Order</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleQuickOrderSubmit} className="mt-4 space-y-4">
              {/* {quickOrderProduct?.v_title && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-gray-700">
                  {quickOrderProduct.v_title}
                </div>
              )} */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor={`quick-order-phone-${product?.v_id}`}>
                  Phone
                </label>
                <input
                  id={`quick-order-phone-${product?.v_id}`}
                  name="o_phone"
                  type="tel"
                  value={quickOrderForm.o_phone}
                  onChange={handleQuickOrderInputChange}
                  placeholder="Enter Your Phone Number"
                  className="h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>


              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor={`quick-order-name-${product?.v_id}`}>
                  Name
                </label>
                <input
                  id={`quick-order-name-${product?.v_id}`}
                  name="o_name"
                  type="text"
                  value={quickOrderForm.o_name}
                  onChange={handleQuickOrderInputChange}
                  placeholder="Enter Your Name"
                  className="h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>



              <div className="hidden">
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor={`quick-order-qty-${product?.v_id}`}>
                  Quantity
                </label>
                <input
                  id={`quick-order-qty-${product?.v_id}`}
                  name="oi_quantity"
                  type="number"
                  min="1"
                  value={quickOrderForm.oi_quantity}
                  onChange={handleQuickOrderInputChange}
                  className="h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="hidden rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                <div className="flex items-center justify-between gap-3">
                  <span>Unit Price</span>
                  <span className="font-semibold text-gray-800">{formatPrice(getProductPrice(quickOrderProduct))}</span>
                </div>
              </div>

              <DialogFooter className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={resetQuickOrderState}
                  className="h-11 rounded-xl border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isQuickOrderSubmitting}
                  className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isQuickOrderSubmitting ? "Submitting..." : "Place Order"}
                </button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={chatConfirmOpen} onOpenChange={setChatConfirmOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center mb-2">সরাসরি ইমপোর্টার সাথে চ্যাট করুন ও গাড়ি কিনুন — PilotBazar এর মাধ্যমে</DialogTitle><hr />
          </DialogHeader>
          <div className="text-sm text-gray-600 space-y-4 leading-relaxed max-h-[60vh] overflow-y-auto pr-4">

            <p>
              <strong> Terms & Conditions</strong>
            </p>

            <p>
              <strong>১।</strong> Wow! PilotBazar নিয়ে এসেছে একটি স্মার্ট ও ইউনিক সিস্টেম,
              যেখানে আপনি সরাসরি ইমপোর্টারের কাছ থেকে গাড়ি কেনার সিদ্ধান্ত নিতে পারবেন—
              ঝামেলা ছাড়া, সময় নষ্ট না করে।
            </p>

            <p>
              <strong>২।</strong> এটি একটি <strong>Closed Chat System</strong>, যেখানে নির্দিষ্ট
              প্রশ্ন–উত্তরের মাধ্যমেই ডিল সম্পন্ন হয়।
            </p>

            <hr />

            <div>
              <strong>৩। কিভাবে কাজ করে?</strong>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Offer Price বাটনে ক্লিক করুন</li>
                <li>সাইন-আপ / লগইন করুন</li>
                <li>প্রশ্নের ক্যাটাগরি নির্বাচন করুন</li>
                <li>প্রস্তুত করা Question & Answer অপশন থেকে সিলেক্ট করুন</li>
                <li>ক্লিক করার সাথে সাথে আপনার অফার ইমপোর্টারের কাছে চলে যাবে</li>
              </ol>

              <p className="mt-2">
                ইমপোর্টার সময়মতো উত্তর দিতে পারনে না বা দেন না কারণঃ
              </p>

              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>প্রতিদিন প্রতি গাড়িতে হাজারের বেশি অফার আসে</li>
                <li>সাধারণত ৭২ ঘণ্টার মধ্যে উত্তর পাওয়া যায়</li>
                <li>অথবা PilotBazar এর প্রতিনিধি আপনার সাথে যোগাযোগ করবে</li>
              </ul>
            </div>

            <div>
              <strong>৪। গুরুত্বপূর্ণ বিষয় :</strong>
              <p className="mt-1">
                আপনার অফার প্রাইস যদি গাড়ীর বাজারমূল্য অনুযায়ী অনেক কম হয়,
                ইমপোর্টার উত্তর নাও দিতে পারে।
                (সাধারণত ইমপোর্টার পর্যায়ে ২০,০০০–৩০,০০০ টাকা পর্যন্ত নেগোশিয়েশন রেঞ্জ থাকে।)
                উত্তর না পেলে নতুন অফার প্রাইস দিন।
              </p>
            </div>

            <hr />

            <div>
              <strong>৫। দরদাম করার নিয়ম</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>প্রাইস অপশনে গিয়ে প্রাইসের প্রথম ৫ ডিজিট লিখুন</li>
                <li>সার্চ করে প্রাইস সিলেক্ট করুন</li>
                <li>Fixed Price পাওয়ার পর আর দরদাম করবেন না</li>
                <li>বায়নার সময়সীমা: সাধারণত ২৪ ঘণ্টা</li>
                <li>সময়ের সাথে প্রাইস কমতেও পারে, বাড়তেও পারে</li>
              </ul>
            </div>

            <hr />

            <div>
              <strong>৬। কেন এটি “Closed System”?</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>ইমপোর্টাররা খুচরা কাস্টমারের সাথে দীর্ঘ কথা বা দরদাম করেন না</li>
                <li>এখানে নিজে থেকে কিছু লেখার অপশন নেই</li>
                <li>শুধুমাত্র টু-দা-পয়েন্ট Question & Answer</li>
                <li>
                  সিদ্ধান্ত একদম পরিষ্কার:
                  <br />
                  👉 এই দামে নিবেন, না নিবেন না
                </li>
              </ul>
            </div>

            <hr />

            <div>
              <strong>৭। গুরুত্বপূর্ণ শর্তাবলি (অবশ্যই পড়ুন)</strong>
            </div>

            <div>
              <strong>৮। Fixed Price – দরদাম নেই</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>ইমপোর্টাররা খুচরা দরদাম করেন না</li>
                <li>
                  দাম জানানোর পর শুধু দুটি অপশন:
                  <ul className="list-none pl-3 mt-1">
                    <li>✅ I Agree</li>
                    <li>❌ I Don’t Agree</li>
                  </ul>
                </li>
              </ul>
            </div>

            <hr />

            <div>
              <strong>৯। গাড়ি “As-Is Condition” এ বিক্রি হতে পারে</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>গাড়ি শোরুম কন্ডিশনে থাকতে পারে বা নাও থাকতে পারে</li>
                <li>সাধারণত নিচের এক বা একাধিক সার্ভিস নাও পেতে পারেন:</li>
              </ul>

              <ul className="list-disc pl-10 mt-1 space-y-1">
                <li>ওয়াশ / পলিশ / টাচ-আপ</li>
                <li>চাকা বা পার্টস পরিবর্তন</li>
                <li>প্রোগ্রামিং / SD Card</li>
                <li>এক্সট্রা টুলস / সার্ভিসিং</li>
                <li>ইত্যাদি</li>
              </ul>

              <p className="mt-2">
                কম দামে গাড়ি কিনলে এই রিস্ক গ্রহণ করতে হবে।
                তবে বিষয়গুলো মেজর সমস্যা নয়।
                প্রয়োজনে সার্ভিসের জন্য আলাদা পেমেন্টে সমাধান রয়েছে (শর্তসাপেক্ষে)।
              </p>

              <p>
                👉 মেজর সমস্যা (ইঞ্জিন, গিয়ারবক্স, এক্সিডেন্ট তথ্য গোপন থাকলে)
                হলে গাড়ি পরিবর্তন করা হবে।
              </p>
            </div>

            <hr />

            <div>
              <strong>১০। No Warranty | No Return | No Exchange</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>গ্যারান্টি নেই</li>
                <li>ওয়ারেন্টি নেই</li>
                <li>গাড়ি ফেরত বা এক্সচেঞ্জ নেই</li>
                <li>
                  এই সুবিধা চাইলে → শোরুম থেকে গাড়ি কিনুন
                  (তবে বেশির ভাগ শোরুমও গ্যারান্টি বা ওয়ারেন্টি দেয় না)
                </li>
              </ul>
            </div>

            <hr />

            <div>
              <strong>১১। বায়না দিলে ফেরত নেই</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>বায়না কনফার্ম হলে ফেরতযোগ্য নয়</li>
                <li>গাড়ি পরিবর্তন করা যাবে না</li>
                <li>
                  তবে গাড়ি দিতে না পারলে বা গাড়ীতে মেজর সমস্যা থাকলে গাড়ি পরিবর্তন হবে
                </li>
              </ul>
            </div>

            <hr />

            <div>
              <strong>১২। এই সিস্টেম কাদের জন্য উপযুক্ত?</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>যারা কম দামে গাড়ি নিতে চান</li>
                <li>যারা ছবি ও তথ্য দেখে গাড়ি বাছাই জানেন</li>
                <li>যারা টু-দা-পয়েন্ট সিদ্ধান্ত নিতে পারেন</li>
                <li>গাড়ি ব্যবসায়ী, রিসেলার, ছোট ডিলার</li>
                <li>“এখন কম দামে নিলাম, পরে ঠিক করবো” টাইপ ক্রেতা</li>
              </ul>
            </div>

            <hr />

            <div>
              <strong>১৩। এই সিস্টেম কাদের জন্য নয়?</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>যারা দরদাম করতে চান বা সময় নষ্ট করেন</li>
                <li>যারা শোরুম কন্ডিশন ও আফটার সেল সার্ভিস চান</li>
                <li>যারা খুব খুঁতখুঁতে বা পারফেকশন খোঁজেন</li>
                <li>ফার্স্ট-টাইম বা ইমোশনাল গাড়ি ক্রেতা</li>
              </ul>
            </div>

            <hr />

            <div>
              <strong>১৪। কেন ইমপোর্টাররা PilotBazar পছন্দ করে?</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>অযথা দরদাম, লম্বা কথা, হোয়াটসঅ্যাপ স্প্যাম বন্ধ</li>
                <li>টু-দা-পয়েন্ট Fixed Price Deal</li>
                <li>সময় বাঁচে, ডিল ক্লোজ হয় দ্রুত</li>
              </ul>
            </div>

            <hr />

            <div>
              <strong>১৫। ট্রান্সপারেন্সি ও কমিটমেন্ট</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>PilotBazar কোনো পক্ষপাতমূলক দরদাম করে না</li>
                <li>
                  ডিল সফল হলে PilotBazar শুধুমাত্র ইমপোর্টার থেকে একটি সার্ভিস চার্জ গ্রহণ করে
                </li>
                <li>
                  <strong>I Agree</strong> বাটনে ক্লিক মানে—
                  আপনি সব শর্ত জেনে উক্ত দামে গাড়ি কিনতে সম্মত
                </li>
              </ul>
            </div>

            <hr />

            <p className="font-semibold text-gray-800">
              ১৬। “ঝামেলা ছাড়া, কম দামে — সরাসরি ইমপোর্টার থেকে গাড়ি কিনুন PilotBazar এর মাধ্যমে।”
            </p>

          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <button
              type="button"
              onClick={handleRejectChat}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Rejected
            </button>
            <button
              type="button"
              onClick={handleAcceptChat}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Accept
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ContactCustomerModal
        open={contactCustomerModalOpen}
        setOpen={handleContactCustomerModalChange}
        userId={chalanContactUserId}
        onSuccess={handleContactCustomerSaved}
        parsedUser={parsedUser}
      />

      <Login isOpen={loginOpen} onClose={closeLoginModal} openForgotPasswordModal={openForgotPasswordModal} />
      <Register
        isOpen={registerOpen}
        onClose={closeRegisterModal}
        onOpenLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
        onHideLogin={() => {
          setLoginOpen(false);
        }}
      />

      {/* <Login open={loginOpen} setOpen={setLoginOpen} /> */}
    </div>
  );
};

export default ProductCard;
