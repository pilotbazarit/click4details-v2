"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import { ChevronRight, Download, X } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { onlyDecimalInput } from "@/helpers/functions";
import { usePathname } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { hasPermission } from "@/lib/utils";
import SystemDocumentService from "@/services/SystemDocumentService";
import PresetSuggestionService from "@/services/PresetSuggestionService";

const formatIndianNumber = (value, keepDecimal = false) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const [integerPartRaw, decimalPartRaw = ""] = raw.replace(/,/g, "").split(".");
  const digits = String(integerPartRaw).replace(/\D+/g, "");
  if (!digits) return "";
  const formattedInteger = new Intl.NumberFormat("en-IN").format(Number(digits));
  if (!keepDecimal || decimalPartRaw.length === 0) return formattedInteger;
  const decimalDigits = decimalPartRaw.replace(/\D+/g, "").slice(0, 2);
  return decimalDigits.length > 0 ? `${formattedInteger}.${decimalDigits}` : formattedInteger;
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

const buildPriceOptions = (baseValue) => {
  if (baseValue === null || baseValue === undefined) return [];
  const normalized = String(baseValue).split(".")[0].replace(/\D+/g, "").trim();
  if (normalized.length === 0 || normalized.startsWith("0") || !/^\d+$/.test(normalized)) return [];
  return Array.from({ length: 5 }, (_, i) => {
    const value = `${normalized}${"0".repeat(i)}`;
    return { value, label: formatIndianNumber(value), words: numberToIndianWords(value) };
  });
};

const sanitizeDecimalValue = (value, maxIntegerDigits = 12, maxDecimalDigits = 2) => {
  const cleaned = String(value ?? "").replace(/,/g, "").replace(/[^\d.]/g, "");
  const [integerPart = "", ...decimalParts] = cleaned.split(".");
  const normalizedInteger = integerPart.replace(/\D+/g, "").slice(0, maxIntegerDigits);
  const normalizedDecimal = decimalParts.join("").replace(/\D+/g, "").slice(0, maxDecimalDigits);
  return cleaned.includes(".") ? `${normalizedInteger}.${normalizedDecimal}` : normalizedInteger;
};

const parseNumericValue = (value) => {
  const normalized = String(value ?? "").replace(/,/g, "").trim();
  if (!normalized) return 0;
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : 0;
};

const normalizeConversionRate = (value) => {
  const valueStr = String(value ?? "").trim();
  const numericValue = Number(valueStr);
  if (!valueStr || Number.isNaN(numericValue) || numericValue < 1) return "1";
  return valueStr;
};

const normalizeCurrency = (value) => {
  const nextValue = String(value ?? "").trim().toUpperCase();
  if (nextValue === "YEN") {
    return "YEN";
  }
  return ["BDT", "USD", "YEN"].includes(nextValue) ? nextValue : "BDT";
};

const SYSTEM_DOC_TYPE_ID = 474;
const PURCHASE_EXPENDITURE_SUGGESTION_TYPE_ID = 475;
const OTHER_CHARGES_SUGGESTION_TYPE_ID = 476;

const formatDateParam = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getCurrentMonthDateRange = () => {
  const now = new Date();
  const firstDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    fromDate: formatDateParam(firstDate),
    toDate: formatDateParam(lastDate),
  };
};

const getDownloadFileName = (fileUrl, fallbackExtension = "jpg") => {
  try {
    const parsedUrl = new URL(fileUrl);
    const rawFileName = parsedUrl.pathname.split("/").pop();

    if (rawFileName) {
      return decodeURIComponent(rawFileName);
    }
  } catch (error) {
    console.error("Failed to parse download file name:", error);
  }

  return `bd-tax-doc.${fallbackExtension}`;
};

const getPresetSuggestionRows = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.list)) return response.list;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data?.list)) return response.data.list;
  return [];
};

const VehiclePricingSection = ({
  register,
  watch,
  setValue,
  control,
  purchasePriceField = "vp_user_purchase_price",
  partnerPriceLabel = "Partner B2B Price",
  hotlineText = "Call PBL Hotline to be Partner",
  showCurrencyField = true,
  selectedProduct = null,
}) => {
  const [isFixedPriceDropdownOpen, setIsFixedPriceDropdownOpen] = useState(false);
  const [selectedFixedPriceOption, setSelectedFixedPriceOption] = useState("");
  const [isAskingPriceDropdownOpen, setIsAskingPriceDropdownOpen] = useState(false);
  const [selectedAskingPriceOption, setSelectedAskingPriceOption] = useState("");
  const [isVariablePriceDropdownOpen, setIsVariablePriceDropdownOpen] = useState(false);
  const [selectedVariablePriceOption, setSelectedVariablePriceOption] = useState("");
  const [isUserPurchaseDropdownOpen, setIsUserPurchaseDropdownOpen] = useState(false);
  const [selectedUserPurchaseOption, setSelectedUserPurchaseOption] = useState("");
  const [isUserCostingDropdownOpen, setIsUserCostingDropdownOpen] = useState(false);
  const [selectedUserCostingOption, setSelectedUserCostingOption] = useState("");
  const [isUserToPblDropdownOpen, setIsUserToPblDropdownOpen] = useState(false);
  const [selectedUserToPblOption, setSelectedUserToPblOption] = useState("");
  const [isCalculatorPurchaseDropdownOpen, setIsCalculatorPurchaseDropdownOpen] = useState(false);
  const [isCalculatorConversionRateDropdownOpen, setIsCalculatorConversionRateDropdownOpen] = useState(false);
  const [isCalculatorTaxDropdownOpen, setIsCalculatorTaxDropdownOpen] = useState(false);
  const [isCalculatorOtherChargesDropdownOpen, setIsCalculatorOtherChargesDropdownOpen] = useState(false);
  const [activePurchaseCostNameDropdown, setActivePurchaseCostNameDropdown] = useState(null);
  const [activePurchaseCostNameQuery, setActivePurchaseCostNameQuery] = useState("");
  const [purchaseCostNameSuggestions, setPurchaseCostNameSuggestions] = useState([]);
  const [isPurchaseCostNameSuggestionsLoading, setIsPurchaseCostNameSuggestionsLoading] = useState(false);
  const [activeOtherCostNameDropdown, setActiveOtherCostNameDropdown] = useState(null);
  const [activeOtherCostNameQuery, setActiveOtherCostNameQuery] = useState("");
  const [otherCostNameSuggestions, setOtherCostNameSuggestions] = useState([]);
  const [isOtherCostNameSuggestionsLoading, setIsOtherCostNameSuggestionsLoading] = useState(false);
  const [activePurchaseCostAmountDropdown, setActivePurchaseCostAmountDropdown] = useState(null);
  const [activeOtherCostAmountDropdown, setActiveOtherCostAmountDropdown] = useState(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isPurchaseCostingOpen, setIsPurchaseCostingOpen] = useState(false);
  const [isOtherCostingOpen, setIsOtherCostingOpen] = useState(false);
  const [isTaxDownloading, setIsTaxDownloading] = useState(false);
  const [calculatorInputs, setCalculatorInputs] = useState({
    purchasePriceUsdYuan: "",
    conversionRate: "1",
    taxBdt: "",
    otherChargesBdt: "",
  });
  const purchaseCostSuggestionTimeoutRef = useRef(null);
  const purchaseCostSuggestionRequestRef = useRef(0);
  const otherCostSuggestionTimeoutRef = useRef(null);
  const otherCostSuggestionRequestRef = useRef(0);
  const { selectedCompanyShop, permissionList } = useAppContext();


  // console.log("watch 145====================", selectedProduct)
  // console.log("selectedCompanyShop====================", selectedCompanyShop)


  // console.log("watch 145====================", selectedProduct)

  const vpConvRate = watch("vp_conv_rate");
  const vpBdTax = watch("vp_bd_tax");
  const userPurchasePrice = watch(purchasePriceField);
  const selectedCurrency = watch("vp_currency");

  const pathname = usePathname();
  const isCompanyShop = pathname.includes("company-shop");


  const hasUserUpdateFixedPricePermission =
    isCompanyShop &&
    hasPermission(
      permissionList,
      Number(selectedCompanyShop?.shop?.s_id),
      "Vehicle",
      "UpdateFixedPrice"
    );
  const hasUserUpdateAskingPricePermission =
    isCompanyShop &&
    hasPermission(
      permissionList,
      Number(selectedCompanyShop?.shop?.s_id),
      "Vehicle",
      "UpdateAskingPrice"
    );
  const hasUserUpdateVariablePricePermission =
    isCompanyShop &&
    hasPermission(
      permissionList,
      Number(selectedCompanyShop?.shop?.s_id),
      "Vehicle",
      "UpdateVariablePrice"
    );
  const hasUserUpdatePartnerB2BPricePermission =
    isCompanyShop &&
    hasPermission(
      permissionList,
      Number(selectedCompanyShop?.shop?.s_id),
      "Vehicle",
      "UpdatePartnerPrice"
    );
  const hasUserUpdateCostingPricePermission =
    isCompanyShop &&
    hasPermission(
      permissionList,
      Number(selectedCompanyShop?.shop?.s_id),
      "Vehicle",
      "UpdateCostingPrice"
    );
  const hasUserUpdatePurchasePricePermission =
    isCompanyShop &&
    hasPermission(
      permissionList,
      Number(selectedCompanyShop?.shop?.s_id),
      "Vehicle",
      "UpdatePurchasePrice"
    );
  const isUserFixedPriceDisabled = isCompanyShop && !hasUserUpdateFixedPricePermission;
  const isUserAskingPriceDisabled = isCompanyShop && !hasUserUpdateAskingPricePermission;
  const isUserVariablePriceDisabled = isCompanyShop && !hasUserUpdateVariablePricePermission;
  const isUserToPblPriceDisabled = isCompanyShop && !hasUserUpdatePartnerB2BPricePermission;
  const isUserCostingPriceDisabled = isCompanyShop && !hasUserUpdateCostingPricePermission;
  const isUserPurchasePriceDisabled = isCompanyShop && !hasUserUpdatePurchasePricePermission;

  // console.log("=============hasUserUpdateFixedPricePermission==================", hasUserUpdateFixedPricePermission);

  useEffect(() => {
    const normalizedCurrency = normalizeCurrency(selectedCurrency);
    if ((selectedCurrency ?? "") !== normalizedCurrency) {
      setValue("vp_currency", normalizedCurrency, { shouldDirty: false, shouldValidate: false });
    }
  }, [selectedCurrency, setValue]);

  useEffect(() => {
    if (vpConvRate !== undefined && vpConvRate !== null && String(vpConvRate).trim() !== "") {
      setCalculatorInputs((previous) => ({ ...previous, conversionRate: normalizeConversionRate(vpConvRate) }));
    }
  }, [vpConvRate]);

  useEffect(() => {
    if (vpBdTax !== undefined && vpBdTax !== null && String(vpBdTax).trim() !== "") {
      setCalculatorInputs((previous) => ({ ...previous, taxBdt: String(vpBdTax) }));
    }
  }, [vpBdTax]);

  const {
    fields: otherCostFields,
    append: appendOtherCost,
    remove: removeOtherCost,
    replace: replaceOtherCost,
  } = useFieldArray({
    control,
    name: "vp_other_cost",
  });

  const {
    fields: purchaseCostFields,
    append: appendPurchaseCost,
    remove: removePurchaseCost,
    replace: replacePurchaseCost,
  } = useFieldArray({
    control,
    name: "vp_purchase_cost",
  });

  useEffect(() => {
    if (otherCostFields.length === 0) appendOtherCost({ name: "", amount: "" });
  }, [otherCostFields.length, appendOtherCost]);

  useEffect(() => {
    if (purchaseCostFields.length === 0) appendPurchaseCost({ name: "", amount: "" });
  }, [purchaseCostFields.length, appendPurchaseCost]);

  const purchaseCostingValues = useWatch({ control, name: "vp_purchase_cost", defaultValue: [{ name: "", amount: "" }] });
  const otherCostingValues = useWatch({ control, name: "vp_other_cost", defaultValue: [{ name: "", amount: "" }] });
  const showPriceValue = watch("vp_show_price") || "fixed";
  const userFixedPrice = watch("vp_user_fixed_price");
  const userAskingPrice = watch("vp_user_asking_price");
  const userVariablePrice = watch("vp_user_variable_price");
  const userCostingPrice = watch("vp_user_costing_price");
  const userToPblPrice = watch("vp_user_to_pbl_price");

  const fixedPriceOptions = useMemo(() => buildPriceOptions(userFixedPrice), [userFixedPrice]);
  const askingPriceOptions = useMemo(() => buildPriceOptions(userAskingPrice), [userAskingPrice]);
  const variablePriceOptions = useMemo(() => buildPriceOptions(userVariablePrice), [userVariablePrice]);
  const userPurchasePriceOptions = useMemo(() => buildPriceOptions(userPurchasePrice), [userPurchasePrice]);
  const userCostingPriceOptions = useMemo(() => buildPriceOptions(userCostingPrice), [userCostingPrice]);
  const userToPblPriceOptions = useMemo(() => buildPriceOptions(userToPblPrice), [userToPblPrice]);
  const calculatorPurchasePriceOptions = useMemo(
    () => buildPriceOptions(calculatorInputs.purchasePriceUsdYuan),
    [calculatorInputs.purchasePriceUsdYuan]
  );
  const calculatorConversionRateOptions = useMemo(
    () => buildPriceOptions(calculatorInputs.conversionRate),
    [calculatorInputs.conversionRate]
  );
  const calculatorTaxOptions = useMemo(
    () => buildPriceOptions(calculatorInputs.taxBdt),
    [calculatorInputs.taxBdt]
  );
  const calculatorOtherChargesOptions = useMemo(
    () => buildPriceOptions(calculatorInputs.otherChargesBdt),
    [calculatorInputs.otherChargesBdt]
  );

  const calculatorSummary = useMemo(() => {
    const purchasePriceUsdYuan = parseNumericValue(calculatorInputs.purchasePriceUsdYuan);
    const conversionRate = parseNumericValue(calculatorInputs.conversionRate);
    const taxBdt = parseNumericValue(calculatorInputs.taxBdt);
    const otherChargesBdt = parseNumericValue(calculatorInputs.otherChargesBdt);
    const purchasePriceBdt = purchasePriceUsdYuan * conversionRate;
    const costingPrice = purchasePriceBdt + taxBdt + otherChargesBdt;
    return { purchasePriceBdt, costingPrice };
  }, [calculatorInputs]);
  const totalOtherCosting = useMemo(() => {
    if (!Array.isArray(otherCostingValues)) return 0;
    return otherCostingValues.reduce((sum, item) => sum + parseNumericValue(item?.amount), 0);
  }, [otherCostingValues]);

  const totalPurchaseCosting = useMemo(() => {
    if (!Array.isArray(purchaseCostingValues)) return 0;
    return purchaseCostingValues.reduce((sum, item) => sum + parseNumericValue(item?.amount), 0);
  }, [purchaseCostingValues]);
  const hasLivePurchaseCalculatorInput = useMemo(
    () => String(calculatorInputs.purchasePriceUsdYuan ?? "").trim() !== "",
    [calculatorInputs.purchasePriceUsdYuan]
  );
  const hasLiveCostingCalculatorInput = useMemo(
    () =>
      hasLivePurchaseCalculatorInput ||
      String(calculatorInputs.taxBdt ?? "").trim() !== "" ||
      String(calculatorInputs.otherChargesBdt ?? "").trim() !== "",
    [calculatorInputs.otherChargesBdt, calculatorInputs.taxBdt, hasLivePurchaseCalculatorInput]
  );
  const livePurchasePriceAfterConversion = useMemo(() => {
    if (!hasLivePurchaseCalculatorInput) {
      return "";
    }

    return calculatorSummary.purchasePriceBdt
      ? calculatorSummary.purchasePriceBdt.toFixed(2).replace(/\.00$/, "")
      : "0";
  }, [calculatorSummary.purchasePriceBdt, hasLivePurchaseCalculatorInput]);
  const liveTotalUserCostingPrice = useMemo(() => {
    if (!hasLiveCostingCalculatorInput) {
      return "";
    }

    return calculatorSummary.costingPrice
      ? calculatorSummary.costingPrice.toFixed(2).replace(/\.00$/, "")
      : "0";
  }, [calculatorSummary.costingPrice, hasLiveCostingCalculatorInput]);

  useEffect(() => {
    if (!hasLivePurchaseCalculatorInput) {
      return;
    }

    const normalizedUserPurchasePrice = sanitizeDecimalValue(userPurchasePrice ?? "");
    if (normalizedUserPurchasePrice === livePurchasePriceAfterConversion) {
      return;
    }

    setValue(purchasePriceField, livePurchasePriceAfterConversion, { shouldDirty: true, shouldValidate: true });
  }, [
    hasLivePurchaseCalculatorInput,
    livePurchasePriceAfterConversion,
    purchasePriceField,
    setValue,
    userPurchasePrice,
  ]);

  useEffect(() => {
    if (!hasLiveCostingCalculatorInput) {
      return;
    }

    const normalizedUserCostingPrice = sanitizeDecimalValue(userCostingPrice ?? "");
    if (normalizedUserCostingPrice === liveTotalUserCostingPrice) {
      return;
    }

    setValue("vp_user_costing_price", liveTotalUserCostingPrice, { shouldDirty: true, shouldValidate: true });
  }, [
    hasLiveCostingCalculatorInput,
    liveTotalUserCostingPrice,
    setValue,
    userCostingPrice,
  ]);

  useEffect(() => {
    const normalizedPurchaseCost = totalPurchaseCosting
      ? totalPurchaseCosting.toFixed(2).replace(/\.00$/, "")
      : "";

    setCalculatorInputs((previous) => {
      const previousValue = String(previous.purchasePriceUsdYuan ?? "").replace(/,/g, "").trim();
      if (previousValue === normalizedPurchaseCost) return previous;
      return { ...previous, purchasePriceUsdYuan: normalizedPurchaseCost };
    });
  }, [totalPurchaseCosting]);

  useEffect(() => {
    const normalizedOtherCharges = totalOtherCosting
      ? totalOtherCosting.toFixed(2).replace(/\.00$/, "")
      : "";

    setCalculatorInputs((previous) => {
      const previousValue = String(previous.otherChargesBdt ?? "").replace(/,/g, "").trim();
      if (previousValue === normalizedOtherCharges) return previous;
      return { ...previous, otherChargesBdt: normalizedOtherCharges };
    });
  }, [totalOtherCosting]);

  useEffect(() => () => {
    if (purchaseCostSuggestionTimeoutRef.current) {
      clearTimeout(purchaseCostSuggestionTimeoutRef.current);
    }
    if (otherCostSuggestionTimeoutRef.current) {
      clearTimeout(otherCostSuggestionTimeoutRef.current);
    }
  }, []);

  const fetchPurchaseCostNameSuggestions = async (query) => {
    const trimmedQuery = String(query ?? "").trim();

    if (!trimmedQuery) {
      setPurchaseCostNameSuggestions([]);
      setIsPurchaseCostNameSuggestionsLoading(false);
      return;
    }

    const requestId = purchaseCostSuggestionRequestRef.current + 1;
    purchaseCostSuggestionRequestRef.current = requestId;
    setIsPurchaseCostNameSuggestionsLoading(true);

    try {
      const response = await PresetSuggestionService.Queries.getPresetSuggestionList({
        _suggestion: trimmedQuery,
        _type_id: PURCHASE_EXPENDITURE_SUGGESTION_TYPE_ID,
      });
      const rows = getPresetSuggestionRows(response);
      const nextSuggestions = Array.from(
        new Map(
          rows
            .map((item, index) => {
              const suggestion = String(item?.ps_suggestion || "").trim();
              if (!suggestion) return null;

              return [
                suggestion.toLowerCase(),
                {
                  id: item?.ps_id || item?.id || `${suggestion}-${index}`,
                  label: suggestion,
                },
              ];
            })
            .filter(Boolean)
        ).values()
      );

      if (purchaseCostSuggestionRequestRef.current === requestId) {
        setPurchaseCostNameSuggestions(nextSuggestions);
      }
    } catch (error) {
      if (purchaseCostSuggestionRequestRef.current === requestId) {
        setPurchaseCostNameSuggestions([]);
      }
    } finally {
      if (purchaseCostSuggestionRequestRef.current === requestId) {
        setIsPurchaseCostNameSuggestionsLoading(false);
      }
    }
  };

  const handlePurchaseCostNameChange = (index, inputOnChange) => (event) => {
    inputOnChange(event);
    const nextValue = event.target.value;

    setActivePurchaseCostNameDropdown(index);
    setActivePurchaseCostNameQuery(nextValue);

    if (purchaseCostSuggestionTimeoutRef.current) {
      clearTimeout(purchaseCostSuggestionTimeoutRef.current);
    }

    if (!String(nextValue ?? "").trim()) {
      setPurchaseCostNameSuggestions([]);
      setIsPurchaseCostNameSuggestionsLoading(false);
      return;
    }

    purchaseCostSuggestionTimeoutRef.current = setTimeout(() => {
      fetchPurchaseCostNameSuggestions(nextValue);
    }, 250);
  };

  const handlePurchaseCostNameFocus = (index, currentValue) => () => {
    setActivePurchaseCostNameDropdown(index);

    const trimmedValue = String(currentValue ?? "").trim();
    setActivePurchaseCostNameQuery(trimmedValue);
    if (!trimmedValue) {
      setPurchaseCostNameSuggestions([]);
      return;
    }

    if (purchaseCostSuggestionTimeoutRef.current) {
      clearTimeout(purchaseCostSuggestionTimeoutRef.current);
    }

    purchaseCostSuggestionTimeoutRef.current = setTimeout(() => {
      fetchPurchaseCostNameSuggestions(trimmedValue);
    }, 150);
  };

  const fetchOtherCostNameSuggestions = async (query) => {
    const trimmedQuery = String(query ?? "").trim();

    if (!trimmedQuery) {
      setOtherCostNameSuggestions([]);
      setIsOtherCostNameSuggestionsLoading(false);
      return;
    }

    const requestId = otherCostSuggestionRequestRef.current + 1;
    otherCostSuggestionRequestRef.current = requestId;
    setIsOtherCostNameSuggestionsLoading(true);

    try {
      const response = await PresetSuggestionService.Queries.getPresetSuggestionList({
        _suggestion: trimmedQuery,
        _type_id: OTHER_CHARGES_SUGGESTION_TYPE_ID,
      });
      const rows = getPresetSuggestionRows(response);
      const nextSuggestions = Array.from(
        new Map(
          rows
            .map((item, index) => {
              const suggestion = String(item?.ps_suggestion || "").trim();
              if (!suggestion) return null;

              return [
                suggestion.toLowerCase(),
                {
                  id: item?.ps_id || item?.id || `${suggestion}-${index}`,
                  label: suggestion,
                },
              ];
            })
            .filter(Boolean)
        ).values()
      );

      if (otherCostSuggestionRequestRef.current === requestId) {
        setOtherCostNameSuggestions(nextSuggestions);
      }
    } catch (error) {
      if (otherCostSuggestionRequestRef.current === requestId) {
        setOtherCostNameSuggestions([]);
      }
    } finally {
      if (otherCostSuggestionRequestRef.current === requestId) {
        setIsOtherCostNameSuggestionsLoading(false);
      }
    }
  };

  const handleOtherCostNameChange = (index, inputOnChange) => (event) => {
    inputOnChange(event);
    const nextValue = event.target.value;

    setActiveOtherCostNameDropdown(index);
    setActiveOtherCostNameQuery(nextValue);

    if (otherCostSuggestionTimeoutRef.current) {
      clearTimeout(otherCostSuggestionTimeoutRef.current);
    }

    if (!String(nextValue ?? "").trim()) {
      setOtherCostNameSuggestions([]);
      setIsOtherCostNameSuggestionsLoading(false);
      return;
    }

    otherCostSuggestionTimeoutRef.current = setTimeout(() => {
      fetchOtherCostNameSuggestions(nextValue);
    }, 250);
  };

  const handleOtherCostNameFocus = (index, currentValue) => () => {
    setActiveOtherCostNameDropdown(index);

    const trimmedValue = String(currentValue ?? "").trim();
    setActiveOtherCostNameQuery(trimmedValue);
    if (!trimmedValue) {
      setOtherCostNameSuggestions([]);
      return;
    }

    if (otherCostSuggestionTimeoutRef.current) {
      clearTimeout(otherCostSuggestionTimeoutRef.current);
    }

    otherCostSuggestionTimeoutRef.current = setTimeout(() => {
      fetchOtherCostNameSuggestions(trimmedValue);
    }, 150);
  };

  const setNormalizedPriceValue = (fieldName, selectedSetter, dropdownSetter) => (event) => {
    const cleaned = String(event.target.value).replace(/,/g, "").replace(/[^\d.]/g, "");
    const [integerPart = "", decimalPart = ""] = cleaned.split(".");
    const normalizedInteger = integerPart.replace(/\D+/g, "").slice(0, 12);
    const normalizedDecimal = decimalPart.replace(/\D+/g, "").slice(0, 2);
    const normalizedValue = cleaned.includes(".") ? `${normalizedInteger}.${normalizedDecimal}` : normalizedInteger;
    setValue(fieldName, normalizedValue, { shouldDirty: true, shouldValidate: true });
    selectedSetter("");
    dropdownSetter(normalizedInteger.length > 0);
  };

  const handleCalculatorInputChange = (field) => (event) => {
    const normalizedValue = sanitizeDecimalValue(event.target.value);
    setCalculatorInputs((previousState) => ({ ...previousState, [field]: normalizedValue }));
    if (field === "purchasePriceUsdYuan") {
      const normalizedInteger = normalizedValue.split(".")[0].replace(/\D+/g, "");
      setIsCalculatorPurchaseDropdownOpen(normalizedInteger.length > 0);
      replacePurchaseCost([{ name: "Purchase Price", amount: normalizedValue }]);
    }
    if (field === "conversionRate") {
      const normalizedInteger = normalizedValue.split(".")[0].replace(/\D+/g, "");
      setIsCalculatorConversionRateDropdownOpen(normalizedInteger.length > 0);
      setValue("vp_conv_rate", normalizeConversionRate(normalizedValue), { shouldDirty: true, shouldValidate: true });
    }
    if (field === "taxBdt") {
      const normalizedInteger = normalizedValue.split(".")[0].replace(/\D+/g, "");
      setIsCalculatorTaxDropdownOpen(normalizedInteger.length > 0);
      setValue("vp_bd_tax", normalizedValue, { shouldDirty: true, shouldValidate: true });
    }
    if (field === "otherChargesBdt") {
      const normalizedInteger = normalizedValue.split(".")[0].replace(/\D+/g, "");
      setIsCalculatorOtherChargesDropdownOpen(normalizedInteger.length > 0);
      replaceOtherCost([{ name: "Other Charge", amount: normalizedValue }]);
    }
  };

  const handlePurchaseCostAmountChange = (index) => (event) => {
    const normalizedValue = sanitizeDecimalValue(event.target.value);
    setValue(`vp_purchase_cost.${index}.amount`, normalizedValue, { shouldDirty: true, shouldValidate: true });
    const normalizedInteger = normalizedValue.split(".")[0].replace(/\D+/g, "");
    setActivePurchaseCostAmountDropdown(normalizedInteger.length > 0 ? index : null);
  };

  const handleOtherCostAmountChange = (index) => (event) => {
    const normalizedValue = sanitizeDecimalValue(event.target.value);
    setValue(`vp_other_cost.${index}.amount`, normalizedValue, { shouldDirty: true, shouldValidate: true });
    const normalizedInteger = normalizedValue.split(".")[0].replace(/\D+/g, "");
    setActiveOtherCostAmountDropdown(normalizedInteger.length > 0 ? index : null);
  };

  const handleTaxDownload = async () => {
    if (isTaxDownloading) return;

    const toastId = "tax-doc-download";
    setIsTaxDownloading(true);

    try {
      const { fromDate, toDate } = getCurrentMonthDateRange();

      toast.loading("Preparing tax document...", { id: toastId });

      const response = await SystemDocumentService.Queries.getSystemDocuments({
        _page: 1,
        _perPage: 1,
        _type_id: SYSTEM_DOC_TYPE_ID,
        _from_date: fromDate,
        _to_date: toDate,
      });

      const documentItem = response?.data?.data?.[0];
      const documentFile = documentItem?.sd_docs?.[0];
      const downloadUrl = documentFile?.url || documentFile?.secure_url;

      if (!downloadUrl) {
        throw new Error("No tax document found for this month.");
      }

      const fileResponse = await fetch(downloadUrl);

      if (!fileResponse.ok) {
        throw new Error("Failed to download tax document.");
      }

      const fileBlob = await fileResponse.blob();
      if (!fileBlob || fileBlob.size === 0) {
        throw new Error("Downloaded tax document is empty.");
      }

      const fallbackExtension = documentFile?.format || fileBlob.type.split("/").pop() || "jpg";
      const downloadFileName = getDownloadFileName(downloadUrl, fallbackExtension);
      const objectUrl = window.URL.createObjectURL(fileBlob);
      const downloadLink = document.createElement("a");

      downloadLink.href = objectUrl;
      downloadLink.download = downloadFileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.URL.revokeObjectURL(objectUrl);

      toast.success("Tax document downloaded.", { id: toastId });
    } catch (error) {
      toast.error(error?.message || "Failed to download tax document.", { id: toastId });
    } finally {
      setIsTaxDownloading(false);
    }
  };

  const handleCostingCalculation = () => {
    const normalizedPurchasePrice = calculatorSummary.purchasePriceBdt ? calculatorSummary.purchasePriceBdt.toFixed(2).replace(/\.00$/, "") : "";
    const normalizedCostingPrice = calculatorSummary.costingPrice ? calculatorSummary.costingPrice.toFixed(2).replace(/\.00$/, "") : "";
    setValue(purchasePriceField, normalizedPurchasePrice, { shouldDirty: true, shouldValidate: true });
    setSelectedUserPurchaseOption("");
    setIsUserPurchaseDropdownOpen(false);
    setValue("vp_user_costing_price", normalizedCostingPrice, { shouldDirty: true, shouldValidate: true });
    setSelectedUserCostingOption("");
    setIsUserCostingDropdownOpen(false);
    setValue("vp_conv_rate", normalizeConversionRate(calculatorInputs.conversionRate), { shouldDirty: true, shouldValidate: true });
    setValue("vp_bd_tax", calculatorInputs.taxBdt || "", { shouldDirty: true, shouldValidate: true });
    toast.success("Purchase and costing price updated from calculator.");
  };

  const handleOtherCostingApply = () => {
    const normalizedOtherCharges = totalOtherCosting ? totalOtherCosting.toFixed(2).replace(/\.00$/, "") : "";
    const nextCalculatorInputs = { ...calculatorInputs, otherChargesBdt: normalizedOtherCharges };
    setCalculatorInputs(nextCalculatorInputs);
    setIsCalculatorOpen(true);
    toast.success("Other Charges updated from Other Costing total.");
  };

  const handlePurchaseCostingApply = () => {
    const normalizedPurchaseCost = totalPurchaseCosting ? totalPurchaseCosting.toFixed(2).replace(/\.00$/, "") : "";
    const nextCalculatorInputs = { ...calculatorInputs, purchasePriceUsdYuan: normalizedPurchaseCost };
    setCalculatorInputs(nextCalculatorInputs);
    setIsCalculatorOpen(true);
    toast.success("Purchase Price updated from Purchase Cost total.");
  };

  const closeAllCostingPanels = () => {
    setIsCalculatorOpen(false);
    setIsPurchaseCostingOpen(false);
    setIsOtherCostingOpen(false);
  };

  const handleCostingCalculatorToggle = () => {
    if (!isUserCostingPriceDisabled) {
      if (isCalculatorOpen) {
        closeAllCostingPanels();
        return;
      }
      setIsCalculatorOpen(true);
    }else{
      alert("আপনার এই ফিচারটি ব্যবহারের অনুমতি নেই, দয়া করে আপনার অ্যাডমিনের সাথে যোগাযোগ করুন।")
    }

  };

  return (
    <>
      <input type="hidden" {...register("vp_show_price")} />
      <input type="hidden" {...register("vp_conv_rate")} />
      <input type="hidden" {...register("vp_bd_tax")} />

      {/* <div className="mb-3 mt-4">
        <span className="text-sm font-semibold text-gray-600 mb-1">{hotlineText}</span>
      </div> */}

      <div className="mt-2 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="border border-md rounded-lg p-2 border-gray-200 w-full xl:w-[34%] xl:max-w-[620px]">
          <div className="mb-3 mt-4">
            <h4 className="text-lg font-bold text-gray-800 mb-1">User Pricing</h4>
            <div className="flex w-20 h-1" />
          </div>


          <div className="rounded-xl border border-gray-200 bg-white p-3 md:p-4">
            <div className="grid grid-cols-1 gap-2">
              {showCurrencyField && (
                <div className="mb-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="vp_currency">
                    Currency
                  </label>
                  <select
                    id="vp_currency"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none"
                    {...register("vp_currency")}
                  >
                    <option value="BDT">BDT</option>
                    <option value="USD">USD</option>
                    <option value="YEN">YEN</option>
                  </select>
                  <div className="mt-2 text-xs text-gray-500">
                    Selected currency: {selectedCurrency || "BDT"}
                  </div>
                </div>
              )}

              <div className="mb-2">
                <label className="text-base font-medium" htmlFor={purchasePriceField}>
                  User Total Purchase Price BDT (After Conversion)
                </label>
                <div className="relative">
                  <Input
                    className="text-purple-600"
                    id={purchasePriceField}
                    name={purchasePriceField}
                    placeholder="Enter User Purchase Price"
                    {...register(purchasePriceField)}
                    disabled={isUserPurchasePriceDisabled}
                    type="text"
                    inputMode="decimal"
                    value={formatIndianNumber(userPurchasePrice, true)}
                    onChange={setNormalizedPriceValue(
                      purchasePriceField,
                      setSelectedUserPurchaseOption,
                      setIsUserPurchaseDropdownOpen
                    )}
                    onFocus={() => setIsUserPurchaseDropdownOpen(!isUserPurchasePriceDisabled && userPurchasePriceOptions.length > 0)}
                    onBlur={() => {
                      setTimeout(() => setIsUserPurchaseDropdownOpen(false), 120);
                    }}
                    onKeyDown={onlyDecimalInput}
                  />
                  {isUserPurchaseDropdownOpen && userPurchasePriceOptions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                      {userPurchasePriceOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                          onClick={() => {
                            setValue(purchasePriceField, option.value, { shouldDirty: true, shouldValidate: true });
                            setSelectedUserPurchaseOption(option.value);
                            setIsUserPurchaseDropdownOpen(false);
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

            <div className="grid grid-cols-1 gap-2">
              <div className="mb-2">
                <label className="text-base font-medium" htmlFor="vp_user_costing_price">
                  User Costing Price
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      className="border-red-900 border-4 text-red-900"
                      id="vp_user_costing_price"
                      name="vp_user_costing_price"
                      placeholder="Enter User Costing Price"
                      {...register("vp_user_costing_price")}
                      disabled={isUserCostingPriceDisabled}
                      type="text"
                      inputMode="decimal"
                      value={formatIndianNumber(userCostingPrice, true)}
                      onChange={setNormalizedPriceValue(
                        "vp_user_costing_price",
                        setSelectedUserCostingOption,
                        setIsUserCostingDropdownOpen
                      )}
                      onFocus={() => setIsUserCostingDropdownOpen(!isUserCostingPriceDisabled && userCostingPriceOptions.length > 0)}
                      onBlur={() => {
                        setTimeout(() => setIsUserCostingDropdownOpen(false), 120);
                      }}
                      onKeyDown={onlyDecimalInput}
                    />
                    {isUserCostingDropdownOpen && userCostingPriceOptions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                        {userCostingPriceOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                            onClick={() => {
                              setValue("vp_user_costing_price", option.value, { shouldDirty: true, shouldValidate: true });
                              setSelectedUserCostingOption(option.value);
                              setIsUserCostingDropdownOpen(false);
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

                  <button
                    type="button"
                    onClick={handleCostingCalculatorToggle}
                    aria-label="Toggle calculator"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md border-red-900 border-4 bg-white text-red-900 transition-colors hover:bg-gray-50 hover:text-red-900"
                  >
                    <ChevronRight className={`h-5 w-5 transition-transform ${isCalculatorOpen ? "rotate-90" : ""}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="mb-2">
                <label className="text-base font-bold " htmlFor="vp_user_to_pbl_price">
                  {/* {partnerPriceLabel} */} Partner B2B Price
                </label>
                <div className="relative">
                  <Input
                    className="border-black border-4 text-black"
                    id="vp_user_to_pbl_price"
                    name="vp_user_to_pbl_price"
                    placeholder="Enter Partner B2B Price"
                    {...register("vp_user_to_pbl_price")}
                    disabled={isUserToPblPriceDisabled}
                    type="text"
                    inputMode="decimal"
                    value={formatIndianNumber(userToPblPrice, true)}
                    onChange={setNormalizedPriceValue(
                      "vp_user_to_pbl_price",
                      setSelectedUserToPblOption,
                      setIsUserToPblDropdownOpen
                    )}
                    onFocus={() => setIsUserToPblDropdownOpen(!isUserToPblPriceDisabled && userToPblPriceOptions.length > 0)}
                    onBlur={() => {
                      setTimeout(() => setIsUserToPblDropdownOpen(false), 120);
                    }}
                    onKeyDown={onlyDecimalInput}
                  />

                  {isUserToPblDropdownOpen && userToPblPriceOptions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                      {userToPblPriceOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                          onClick={() => {
                            setValue("vp_user_to_pbl_price", option.value, { shouldDirty: true, shouldValidate: true });
                            setSelectedUserToPblOption(option.value);
                            setIsUserToPblDropdownOpen(false);
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
                  <span className="text-base font-medium text-red-500">Partner B2B Price সঠিক ভাবে Select করুন, বিক্রির হার বৃদ্ধি করুন! </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3 md:p-4">
            <div className="grid grid-cols-1 gap-2">
              <div className="mb-2">
                <div className="flex justify-between">
                  <div>
                    <label className="text-base font-medium" htmlFor="vp_user_fixed_price">
                      User Fixed Price
                    </label>
                  </div>
                  <div className="text-sm font-medium text-gray-800">
                    Show Info Front
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="relative flex-1">
                    <Input
                      id="vp_user_fixed_price"
                      name="vp_user_fixed_price"
                      placeholder="Enter User Fixed Price"
                      {...register("vp_user_fixed_price")}
                      disabled={isUserFixedPriceDisabled}
                      type="text"
                      inputMode="decimal"
                      value={formatIndianNumber(userFixedPrice, true)}
                      onChange={setNormalizedPriceValue(
                        "vp_user_fixed_price",
                        setSelectedFixedPriceOption,
                        setIsFixedPriceDropdownOpen
                      )}
                      onFocus={() => setIsFixedPriceDropdownOpen(!isUserFixedPriceDisabled && fixedPriceOptions.length > 0)}
                      onBlur={() => {
                        setTimeout(() => setIsFixedPriceDropdownOpen(false), 120);
                      }}
                      onKeyDown={onlyDecimalInput}
                    />
                    {isFixedPriceDropdownOpen && fixedPriceOptions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                        {fixedPriceOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                            onClick={() => {
                              setValue("vp_user_fixed_price", option.value, { shouldDirty: true, shouldValidate: true });
                              setSelectedFixedPriceOption(option.value);
                              setValue("vp_show_price", "fixed", { shouldDirty: true, shouldValidate: true });
                              setIsFixedPriceDropdownOpen(false);
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
                  <input
                    type="radio"
                    id="fixed_price_radio"
                    name="price_selection"
                    value="fixed"
                    checked={showPriceValue === "fixed"}
                    onChange={() => setValue("vp_show_price", "fixed", { shouldDirty: true, shouldValidate: true })}
                    className="ml-2"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="mb-2">
                <label className="text-base font-medium" htmlFor="vp_user_asking_price">
                  User Asking Price
                </label>
                <div className="flex items-center">
                  <div className="relative flex-1">
                    <Input
                      id="vp_user_asking_price"
                      name="vp_user_asking_price"
                      placeholder="Enter User Asking Price"
                      {...register("vp_user_asking_price")}
                      disabled={isUserAskingPriceDisabled}
                      type="text"
                      inputMode="decimal"
                      value={formatIndianNumber(userAskingPrice, true)}
                      onChange={setNormalizedPriceValue(
                        "vp_user_asking_price",
                        setSelectedAskingPriceOption,
                        setIsAskingPriceDropdownOpen
                      )}
                      onFocus={() => setIsAskingPriceDropdownOpen(!isUserAskingPriceDisabled && askingPriceOptions.length > 0)}
                      onBlur={() => {
                        setTimeout(() => setIsAskingPriceDropdownOpen(false), 120);
                      }}
                      onKeyDown={onlyDecimalInput}
                    />
                    {isAskingPriceDropdownOpen && askingPriceOptions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                        {askingPriceOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                            onClick={() => {
                              setValue("vp_user_asking_price", option.value, { shouldDirty: true, shouldValidate: true });
                              setSelectedAskingPriceOption(option.value);
                              setValue("vp_show_price", "asking", { shouldDirty: true, shouldValidate: true });
                              setIsAskingPriceDropdownOpen(false);
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
                  <input
                    type="radio"
                    id="asking_price_radio"
                    name="price_selection"
                    value="asking"
                    checked={showPriceValue === "asking"}
                    onChange={() => setValue("vp_show_price", "asking", { shouldDirty: true, shouldValidate: true })}
                    className="ml-2"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="mb-2">
                <label className="text-base font-medium" htmlFor="vp_user_variable_price">
                  User Variable Price
                </label>
                <div className="flex items-center">
                  <div className="relative flex-1">
                    <Input
                      id="vp_user_variable_price"
                      name="vp_user_variable_price"
                      placeholder="Enter User Variable Price"
                      {...register("vp_user_variable_price")}
                      disabled={isUserVariablePriceDisabled}
                      type="text"
                      inputMode="decimal"
                      value={formatIndianNumber(userVariablePrice, true)}
                      onChange={setNormalizedPriceValue(
                        "vp_user_variable_price",
                        setSelectedVariablePriceOption,
                        setIsVariablePriceDropdownOpen
                      )}
                      onFocus={() => setIsVariablePriceDropdownOpen(!isUserVariablePriceDisabled && variablePriceOptions.length > 0)}
                      onBlur={() => {
                        setTimeout(() => setIsVariablePriceDropdownOpen(false), 120);
                      }}
                      onKeyDown={onlyDecimalInput}
                    />
                    {isVariablePriceDropdownOpen && variablePriceOptions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                        {variablePriceOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                            onClick={() => {
                              setValue("vp_user_variable_price", option.value, { shouldDirty: true, shouldValidate: true });
                              setSelectedVariablePriceOption(option.value);
                              setValue("vp_show_price", "variable", { shouldDirty: true, shouldValidate: true });
                              setIsVariablePriceDropdownOpen(false);
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
                  <input
                    type="radio"
                    id="variable_price_radio"
                    name="price_selection"
                    value="variable"
                    checked={showPriceValue === "variable"}
                    onChange={() => setValue("vp_show_price", "variable", { shouldDirty: true, shouldValidate: true })}
                    className="ml-2"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="v_urgent_sale"
                name="v_urgent_sale"
                className="mr-2 h-5 w-5"
                {...register("v_urgent_sale")}
              />
              <label htmlFor="v_urgent_sale" className="text-lg font-semibold text-gray-600">
                Urgent Sell &nbsp;
              </label>
            </div>
          </div>
        </div>

        {(isCalculatorOpen || isPurchaseCostingOpen || isOtherCostingOpen) && (
          <div className="w-full xl:w-[66%]">
            <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] xl:items-stretch">
              {isCalculatorOpen && (
                <div className="w-full xl:min-w-0 xl:self-stretch">
                  <div className="w-full rounded-2xl border-red-900 border-4 bg-gray-100 p-4 shadow-sm md:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-2xl font-bold text-gray-800">Total User Costing Price Calculator</h4>
                      <button
                        type="button"
                        onClick={closeAllCostingPanels}
                        aria-label="Close costing price calculator"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-900 text-red-900 transition-colors hover:bg-red-50"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mt-5 space-y-4">
                      <div>
                        <label className="text-sm font-medium text-blue-700">Purchase Price Total USD/Yen</label>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="relative flex-1">
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="Enter price"
                              value={formatIndianNumber(calculatorInputs.purchasePriceUsdYuan, true)}
                              onChange={handleCalculatorInputChange("purchasePriceUsdYuan")}
                              onFocus={() => setIsCalculatorPurchaseDropdownOpen(calculatorPurchasePriceOptions.length > 0)}
                              onBlur={() => {
                                setTimeout(() => setIsCalculatorPurchaseDropdownOpen(false), 120);
                              }}
                              onKeyDown={onlyDecimalInput}
                              className="h-11 rounded-lg border-blue-600 border-4 bg-white px-3 text-base text-blue-600"
                            />
                            {isCalculatorPurchaseDropdownOpen && calculatorPurchasePriceOptions.length > 0 && (
                              <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                                {calculatorPurchasePriceOptions.map((option) => (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                                    onClick={() => {
                                      setCalculatorInputs((previousState) => ({
                                        ...previousState,
                                        purchasePriceUsdYuan: option.value,
                                      }));
                                      replacePurchaseCost([{ name: "Purchase Price", amount: option.value }]);
                                      setIsCalculatorPurchaseDropdownOpen(false);
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
                          <button
                            type="button"
                            onClick={() => setIsPurchaseCostingOpen((prev) => !prev)}
                            aria-label="Toggle purchase costing calculator"
                            className="inline-flex h-11 w-11 items-center justify-center rounded-md border-blue-600 border-4 bg-white text-blue-600 transition-colors hover:bg-gray-50 hover:text-blue-600"
                          >
                            <ChevronRight className={`h-4 w-4 transition-transform ${isPurchaseCostingOpen ? "rotate-90" : ""}`} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-[24px_minmax(0,1fr)] items-end gap-3">
                        <div className="pb-2 text-center text-2xl font-semibold leading-none text-gray-500">x</div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Conversion Rate: (USD/Yen to Tk)</label>
                          <div className="relative">
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="1"
                              value={formatIndianNumber(calculatorInputs.conversionRate, true)}
                              onChange={handleCalculatorInputChange("conversionRate")}
                              onFocus={() => setIsCalculatorConversionRateDropdownOpen(calculatorConversionRateOptions.length > 0)}
                              onBlur={() => {
                                setTimeout(() => setIsCalculatorConversionRateDropdownOpen(false), 120);
                              }}
                              onKeyDown={onlyDecimalInput}
                              className="mt-1 h-11 rounded-lg border-gray-300 bg-white px-3 text-base"
                            />
                            {isCalculatorConversionRateDropdownOpen && calculatorConversionRateOptions.length > 0 && (
                              <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                                {calculatorConversionRateOptions.map((option) => (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                                    onClick={() => {
                                      setCalculatorInputs((previousState) => ({
                                        ...previousState,
                                        conversionRate: option.value,
                                      }));
                                      setValue("vp_conv_rate", normalizeConversionRate(option.value), { shouldDirty: true, shouldValidate: true });
                                      setIsCalculatorConversionRateDropdownOpen(false);
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

                      <div className="grid grid-cols-[24px_minmax(0,1fr)] items-end gap-3">
                        <div className="pb-2 text-center text-2xl font-semibold leading-none text-gray-500">=</div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">User Total Purchase Price BDT (After Conversion)</label>
                          <Input
                            type="text"
                            value={formatIndianNumber(livePurchasePriceAfterConversion, true)}
                            placeholder="--"
                            readOnly
                            className="mt-1 h-11 rounded-lg border-gray-300 bg-white px-3 text-base text-purple-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-[24px_minmax(0,1fr)] items-end gap-3">
                        <div className="text-center text-2xl font-semibold leading-none text-gray-500">+</div>
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <label className="text-sm font-medium text-gray-600">Tax (BDT)</label>
                            <label className="text-sm font-medium text-gray-600">BD Tax Doc</label>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="relative flex-1">
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={formatIndianNumber(calculatorInputs.taxBdt, true).replace(/\.00$/, "")}
                                onChange={handleCalculatorInputChange("taxBdt")}
                                onFocus={() => setIsCalculatorTaxDropdownOpen(calculatorTaxOptions.length > 0)}
                                onBlur={() => {
                                  setTimeout(() => setIsCalculatorTaxDropdownOpen(false), 120);
                                }}
                                onKeyDown={onlyDecimalInput}
                                placeholder="--"
                                className="h-11 rounded-lg border-gray-300 bg-white px-3 text-base"
                              />
                              {isCalculatorTaxDropdownOpen && calculatorTaxOptions.length > 0 && (
                                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                                  {calculatorTaxOptions.map((option) => (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onMouseDown={(e) => e.preventDefault()}
                                      className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                                      onClick={() => {
                                        setCalculatorInputs((previousState) => ({
                                          ...previousState,
                                          taxBdt: option.value,
                                        }));
                                        setValue("vp_bd_tax", option.value, { shouldDirty: true, shouldValidate: true });
                                        setIsCalculatorTaxDropdownOpen(false);
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
                            <button
                              type="button"
                              onClick={handleTaxDownload}
                              disabled={isTaxDownloading}
                              aria-label="Download tax value"
                              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-[24px_minmax(0,1fr)] items-end gap-3">
                        <div className="pb-2 text-center text-2xl font-semibold leading-none text-gray-500">+</div>
                        <div>
                          <label className="text-sm font-medium text-green-700">Total Other Charges (BDT)</label>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="relative flex-1">
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={formatIndianNumber(calculatorInputs.otherChargesBdt, true)}
                                onChange={handleCalculatorInputChange("otherChargesBdt")}
                                onFocus={() => setIsCalculatorOtherChargesDropdownOpen(calculatorOtherChargesOptions.length > 0)}
                                onBlur={() => {
                                  setTimeout(() => setIsCalculatorOtherChargesDropdownOpen(false), 120);
                                }}
                                onKeyDown={onlyDecimalInput}
                                placeholder="--"
                                className="h-11 rounded-lg border-green-600 border-4 bg-white px-3 text-base text-green-600"
                              />
                              {isCalculatorOtherChargesDropdownOpen && calculatorOtherChargesOptions.length > 0 && (
                                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                                  {calculatorOtherChargesOptions.map((option) => (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onMouseDown={(e) => e.preventDefault()}
                                      className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                                      onClick={() => {
                                        setCalculatorInputs((previousState) => ({
                                          ...previousState,
                                          otherChargesBdt: option.value,
                                        }));
                                        replaceOtherCost([{ name: "Other Charge", amount: option.value }]);
                                        setIsCalculatorOtherChargesDropdownOpen(false);
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
                            <button
                              type="button"
                              onClick={() => setIsOtherCostingOpen((prev) => !prev)}
                              aria-label="Toggle other costing calculator"
                              className="inline-flex h-11 w-11 items-center justify-center rounded-md border-green-600 border-4 bg-white text-green-600 transition-colors hover:bg-gray-50 hover:text-green-600"
                            >
                              <ChevronRight className={`h-4 w-4 transition-transform ${isOtherCostingOpen ? "rotate-90" : ""}`} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-[24px_minmax(0,1fr)] items-end gap-3">
                        <div className="pb-2 text-center text-2xl font-semibold leading-none text-gray-600">=</div>
                        <div>
                          <label className="text-sm font-medium text-red-800"> User Total Costing Price (BDT)</label>
                          <Input
                            type="text"
                            value={formatIndianNumber(liveTotalUserCostingPrice, true)}
                            placeholder="0"
                            readOnly
                            className="mt-1 h-11 rounded-lg border-gray-300 bg-white px-3 text-base font-semibold text-red-900 border border-red-800"
                          />
                        </div>
                      </div>
                    </div>
                    {/* <Button
                  type="button"
                  onClick={handleCostingCalculation}
                  className="mt-6 h-12 w-full rounded-lg bg-red-900 text-base font-semibold text-white hover:bg-red-900"
                >
                  Calculate & to Save Press Submit Below
                </Button> */}
                  </div>
                </div>
              )}

              {(isPurchaseCostingOpen || isOtherCostingOpen) && (
                <div className="w-full space-y-4 xl:flex xl:self-stretch xl:min-h-[610px] xl:flex-col xl:justify-start">
                  {isPurchaseCostingOpen && (
                    <div className="w-full border-lg rounded-md border-blue-300 border-4 p-2">
                      <div className="mb-3 mt-4 flex items-start justify-between gap-3">
                        <h4 className="text-lg font-bold text-blue-600 mb-1">Break Down of Purchase Expenditure USD/Yen Calculator </h4>
                        <button
                          type="button"
                          onClick={() => setIsPurchaseCostingOpen(false)}
                          aria-label="Close total purchase price calculator"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-blue-300 text-blue-600 transition-colors hover:bg-blue-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {purchaseCostFields.map((field, index) => (
                          <div key={field.id} className="rounded-lg border border-gray-200 bg-white p-3">
                            {(() => {
                              const amountOptions = buildPriceOptions(purchaseCostingValues?.[index]?.amount);

                              return (
                                <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.15fr)_36px] items-end gap-x-1">
                                  <div>
                                    <label className="text-sm font-medium text-blue-700" htmlFor={`vp_purchase_cost_${index}_name`}>
                                      Type of Expenditure
                                    </label>
                                    {(() => {
                                      const purchaseCostNameField = register(`vp_purchase_cost.${index}.name`);

                                      return (
                                        <div className="relative">
                                          <Input
                                            id={`vp_purchase_cost_${index}_name`}
                                            placeholder="Enter Reason"
                                            {...purchaseCostNameField}
                                            onChange={handlePurchaseCostNameChange(index, purchaseCostNameField.onChange)}
                                            onFocus={handlePurchaseCostNameFocus(index, purchaseCostingValues?.[index]?.name)}
                                            onBlur={() => {
                                              setTimeout(() => setActivePurchaseCostNameDropdown((currentIndex) => (
                                                currentIndex === index ? null : currentIndex
                                              )), 120);
                                            }}
                                            className="mt-1 border border-blue-500"
                                          />
                                          {activePurchaseCostNameDropdown === index && String(activePurchaseCostNameQuery || "").trim() !== "" && (
                                            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                                              {isPurchaseCostNameSuggestionsLoading ? (
                                                <div className="px-3 py-2 text-sm text-gray-500">
                                                  Loading suggestions...
                                                </div>
                                              ) : purchaseCostNameSuggestions.length > 0 ? (
                                                <>
                                                  {purchaseCostNameSuggestions.map((suggestion) => (
                                                    <button
                                                      key={suggestion.id}
                                                      type="button"
                                                      onMouseDown={(e) => e.preventDefault()}
                                                      className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                                                      onClick={() => {
                                                        setValue(`vp_purchase_cost.${index}.name`, suggestion.label, { shouldDirty: true, shouldValidate: true });
                                                        setActivePurchaseCostNameDropdown(null);
                                                        setActivePurchaseCostNameQuery(suggestion.label);
                                                        setPurchaseCostNameSuggestions([]);
                                                      }}
                                                    >
                                                      <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900">{suggestion.label}</p>
                                                      </div>
                                                    </button>
                                                  ))}
                                                </>
                                              ) : (
                                                <div className="px-3 py-2 text-sm text-gray-500">
                                                  No suggestions found.
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>

                                  <div>
                                    {/* <label className="text-sm font-medium text-gray-700" htmlFor={`vp_purchase_cost_${index}_amount`}>
                            Amount
                          </label> */}
                                    <div className="relative">
                                      <Input
                                        id={`vp_purchase_cost_${index}_amount`}
                                        placeholder="Enter amount"
                                        type="text"
                                        inputMode="decimal"
                                        {...register(`vp_purchase_cost.${index}.amount`)}
                                        value={formatIndianNumber(purchaseCostingValues?.[index]?.amount, true)}
                                        onChange={handlePurchaseCostAmountChange(index)}
                                        onFocus={() => setActivePurchaseCostAmountDropdown(amountOptions.length > 0 ? index : null)}
                                        onBlur={() => {
                                          setTimeout(() => setActivePurchaseCostAmountDropdown((currentIndex) => (
                                            currentIndex === index ? null : currentIndex
                                          )), 120);
                                        }}
                                        onKeyDown={onlyDecimalInput}
                                        className="mt-1 border border-blue-500"
                                      />
                                      {activePurchaseCostAmountDropdown === index && amountOptions.length > 0 && (
                                        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                                          {amountOptions.map((option) => (
                                            <button
                                              key={option.value}
                                              type="button"
                                              onMouseDown={(e) => e.preventDefault()}
                                              className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                                              onClick={() => {
                                                setValue(`vp_purchase_cost.${index}.amount`, option.value, { shouldDirty: true, shouldValidate: true });
                                                setActivePurchaseCostAmountDropdown(null);
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

                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => removePurchaseCost(index)}
                                    disabled={purchaseCostFields.length === 1}
                                    className="justify-self-start mt-7 h-9 w-9 border-blue-300 px-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    -
                                  </Button>
                                </div>
                              );
                            })()}
                          </div>
                        ))}

                        <div className="flex justify-end p-2">
                          <Button
                            type="button"
                            onClick={() => appendPurchaseCost({ name: "", amount: "" })}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                          >
                            +
                          </Button>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <p className="text-base font-semibold text-blue-700">
                            Purchase Price Total USD/Yen ={" "}
                            <span className="text-blue-600">
                              {totalPurchaseCosting > 0 ? formatIndianNumber(totalPurchaseCosting.toFixed(2).replace(/\.00$/, ""), true) : "0"}
                            </span>
                          </p>
                          {/* <Button
                      type="button"
                      onClick={handlePurchaseCostingApply}
                      className="mt-3 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Calculate & to Save Press Submit Below
                    </Button> */}
                        </div>
                      </div>
                    </div>
                  )}
                  {isOtherCostingOpen && (
                    <div className="w-full border-lg rounded-md border-green-300 border-4 p-2 xl:mt-auto">
                      <div className="mb-3 mt-4 flex items-start justify-between gap-3">
                        <h4 className="text-lg font-bold text-gray-800 mb-1">Break Down of Other Charges (BDT) Calculator</h4>
                        <button
                          type="button"
                          onClick={() => setIsOtherCostingOpen(false)}
                          aria-label="Close total other charges calculator"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-green-300 text-green-600 transition-colors hover:bg-green-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {otherCostFields.map((field, index) => (
                          <div key={field.id} className="rounded-lg border border-gray-200 bg-white p-3">
                            {(() => {
                              const amountOptions = buildPriceOptions(otherCostingValues?.[index]?.amount);

                              return (
                                <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.15fr)_36px] items-end gap-x-1">
                                  <div>
                                    <label className="text-sm font-medium text-green-700" htmlFor={`vp_other_cost_${index}_name`}>
                                      Type of Expenditure
                                    </label>
                                    {(() => {
                                      const otherCostNameField = register(`vp_other_cost.${index}.name`);

                                      return (
                                        <div className="relative">
                                          <Input
                                            id={`vp_other_cost_${index}_name`}
                                            placeholder="Enter Reason"
                                            {...otherCostNameField}
                                            onChange={handleOtherCostNameChange(index, otherCostNameField.onChange)}
                                            onFocus={handleOtherCostNameFocus(index, otherCostingValues?.[index]?.name)}
                                            onBlur={() => {
                                              setTimeout(() => setActiveOtherCostNameDropdown((currentIndex) => (
                                                currentIndex === index ? null : currentIndex
                                              )), 120);
                                            }}
                                            className="mt-1 border border-green-500"
                                          />
                                          {activeOtherCostNameDropdown === index && String(activeOtherCostNameQuery || "").trim() !== "" && (
                                            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                                              {isOtherCostNameSuggestionsLoading ? (
                                                <div className="px-3 py-2 text-sm text-gray-500">
                                                  Loading suggestions...
                                                </div>
                                              ) : otherCostNameSuggestions.length > 0 ? (
                                                <>
                                                  {otherCostNameSuggestions.map((suggestion) => (
                                                    <button
                                                      key={suggestion.id}
                                                      type="button"
                                                      onMouseDown={(e) => e.preventDefault()}
                                                      className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                                                      onClick={() => {
                                                        setValue(`vp_other_cost.${index}.name`, suggestion.label, { shouldDirty: true, shouldValidate: true });
                                                        setActiveOtherCostNameDropdown(null);
                                                        setActiveOtherCostNameQuery(suggestion.label);
                                                        setOtherCostNameSuggestions([]);
                                                      }}
                                                    >
                                                      <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900">{suggestion.label}</p>
                                                      </div>
                                                    </button>
                                                  ))}
                                                </>
                                              ) : (
                                                <div className="px-3 py-2 text-sm text-gray-500">
                                                  No suggestions found.
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>

                                  <div>
                                    {/* <label className="text-sm font-medium text-gray-700" htmlFor={`vp_other_cost_${index}_amount`}>
                            Amount
                          </label> */}
                                    <div className="relative">
                                      <Input
                                        id={`vp_other_cost_${index}_amount`}
                                        placeholder="Enter amount"
                                        type="text"
                                        inputMode="decimal"
                                        {...register(`vp_other_cost.${index}.amount`)}
                                        value={formatIndianNumber(otherCostingValues?.[index]?.amount, true)}
                                        onChange={handleOtherCostAmountChange(index)}
                                        onFocus={() => setActiveOtherCostAmountDropdown(amountOptions.length > 0 ? index : null)}
                                        onBlur={() => {
                                          setTimeout(() => setActiveOtherCostAmountDropdown((currentIndex) => (
                                            currentIndex === index ? null : currentIndex
                                          )), 120);
                                        }}
                                        onKeyDown={onlyDecimalInput}
                                        className="mt-1 border border-green-500"
                                      />
                                      {activeOtherCostAmountDropdown === index && amountOptions.length > 0 && (
                                        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                                          {amountOptions.map((option) => (
                                            <button
                                              key={option.value}
                                              type="button"
                                              onMouseDown={(e) => e.preventDefault()}
                                              className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                                              onClick={() => {
                                                setValue(`vp_other_cost.${index}.amount`, option.value, { shouldDirty: true, shouldValidate: true });
                                                setActiveOtherCostAmountDropdown(null);
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

                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => removeOtherCost(index)}
                                    disabled={otherCostFields.length === 1}
                                    className="justify-self-start mt-7 h-9 w-9 border-green-300 px-0 text-green-600 hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    -
                                  </Button>
                                </div>
                              );
                            })()}
                          </div>
                        ))}

                        <div className="flex justify-end p-2">
                          <Button
                            type="button"
                            onClick={() => appendOtherCost({ name: "", amount: "" })}
                            className="bg-green-600 text-white hover:bg-green-700"
                          >
                            +
                          </Button>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <p className="text-base font-semibold text-green-700">
                            Total Other Charges (BDT) ={" "}
                            <span className="text-green-600">
                              {totalOtherCosting > 0 ? formatIndianNumber(totalOtherCosting.toFixed(2).replace(/\.00$/, ""), true) : "0"}
                            </span>
                          </p>
                          {/* <Button
                      type="button"
                      onClick={handleOtherCostingApply}
                      className="mt-3 bg-green-600 text-white hover:bg-green-700"
                    >
                      Calculate & to Save Press Submit Below
                    </Button> */}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VehiclePricingSection;




