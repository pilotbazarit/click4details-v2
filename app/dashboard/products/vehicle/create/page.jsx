"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Loading from '@/components/Loading';
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import Link from "next/link";
import { useForm, FormProvider, set, get, Controller } from "react-hook-form";
import dynamic from 'next/dynamic';

const Select = dynamic(() => import('react-select'), { ssr: false });
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import VehicleService from "@/services/VehicleService";
import ShopService from "@/services/ShopService";
import constData from "@/lib/constant";
import { formatPermissions, onlyDecimalInput, onlyNumberInput } from "@/helpers/functions";
import MasterDataService from "@/services/MasterDataService";
import PackageService from "@/services/PackageService";
import VehicleModelService from "@/services/VehicleModelService";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import ProductFeatureSpecificationModal from "@/components/modals/ProductFeatureSpecificationModal";
import Swal from "sweetalert2";
import OutletService from "@/services/OutletService";
import LocationService from "@/services/LocationService";
import { useAppContext } from "@/context/AppContext";
import UserService from "@/services/UserService";
import { hasPermission } from "@/lib/utils";
import VehiclePricingSection from "@/components/pricing/VehiclePricingSection";
import CategoryService from "@/services/CategoryService";
import { ChevronDown, ChevronRight } from "lucide-react";

// Yup Validation Schema
const schema = yup.object().shape({
  v_product_type_id: yup.string().required("Product Type is Required"),
  category: yup.string().required("Category is Required"),
  v_title: yup.string().required("Title is Required"),
  v_brand_id: yup.string().required("Brand is Required"),
  v_model_id: yup.string().required("Model is Required"),
  v_shop_id: yup.string().required("Shop is Required"),
  // v_code: yup.string().required("Code is Required"),
});

const formatIndianNumber = (value, keepDecimal = false) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  const [integerPartRaw, decimalPartRaw = ''] = raw.replace(/,/g, '').split('.');
  const digits = String(integerPartRaw).replace(/\D+/g, '');
  if (!digits) return '';

  const formattedInteger = new Intl.NumberFormat('en-IN').format(Number(digits));
  if (!keepDecimal || decimalPartRaw.length === 0) return formattedInteger;

  const decimalDigits = decimalPartRaw.replace(/\D+/g, '').slice(0, 2);
  return decimalDigits.length > 0 ? `${formattedInteger}.${decimalDigits}` : formattedInteger;
};

const numberWordsUnderTwenty = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const numberWordsTens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

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
  const numeric = Number(String(value).replace(/\D+/g, ''));
  if (!numeric) return '';
  if (numeric < 1000) return numberToWordsBelowThousand(numeric);

  const parts = [];
  const units = [
    { value: 10000000, label: 'Crore' },
    { value: 100000, label: 'Lakh' },
    { value: 1000, label: 'Thousand' },
  ];

  let remaining = numeric;

  units.forEach((unit) => {
    if (remaining >= unit.value) {
      const count = Math.floor(remaining / unit.value);
      parts.push(`${numberToIndianWords(count)} ${unit.label}`);
      remaining %= unit.value;
    }
  });

  if (remaining > 0) {
    parts.push(numberToWordsBelowThousand(remaining));
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
};

const buildPriceOptions = (baseValue) => {
  if (baseValue === null || baseValue === undefined) return [];

  const normalized = String(baseValue).split('.')[0].replace(/\D+/g, '').trim();
  if (normalized.length === 0 || normalized.startsWith('0') || !/^\d+$/.test(normalized)) {
    return [];
  }

  return Array.from({ length: 5 }, (_, i) => {
    const value = `${normalized}${'0'.repeat(i)}`;
    return {
      value,
      label: formatIndianNumber(value),
      words: numberToIndianWords(value),
    };
  });
};

const normalizeConversionRate = (value) => {
  const valueStr = String(value ?? "").trim();
  const numericValue = Number(valueStr);
  if (!valueStr || Number.isNaN(numericValue) || numericValue < 1) {
    return "1";
  }
  return valueStr;
};

const isBlobValue = (value) => typeof Blob !== "undefined" && value instanceof Blob;

const appendFormValue = (
  formData,
  key,
  value,
  { fallback = "", skipNullish = false, skipEmptyString = false } = {}
) => {
  let normalizedValue = value;

  if (normalizedValue === undefined || normalizedValue === null) {
    if (skipNullish) return;
    normalizedValue = fallback;
  }

  if (skipEmptyString && normalizedValue === "") {
    return;
  }

  if (typeof normalizedValue === "object" && !isBlobValue(normalizedValue)) {
    return;
  }

  formData.append(key, normalizedValue);
};


const Vehicle = () => {
  const [loading, setLoading] = useState(false);
  const [frontImageFile, setFrontImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]); // store File objects
  const [additionalPreviews, setAdditionalPreviews] = useState([]); // for UI previews
  const [additionalDocumentFiles, setAdditionalDocumentFiles] = useState([]);
  const [additionalDocumentPreviews, setAdditionalDocumentPreviews] = useState([]);
  const [secretDocumentFiles, setSecretDocumentFiles] = useState([]);
  const [secretDocumentPreviews, setSecretDocumentPreviews] = useState([]);
  const [removeSecretDocument, setRemoveSecretDocument] = useState([]);

  const [shopData, setShopData] = useState([]);
  const [brandData, setBrandData] = useState([]);
  const [colorData, setColorData] = useState([]);
  const [conditionData, setConditionData] = useState([]);
  const [packageData, setPackageData] = useState([]);
  const [skeletonData, setSkeletonData] = useState([]);
  const [transmissionData, setTransmissionData] = useState([]);
  const [gradeData, setGradeData] = useState([]);
  const [exteriorGradeData, setExteriorGradeData] = useState([]);
  const [interiorGradeData, setInteriorGradeData] = useState([]);
  const [modelData, setModelData] = useState([]);
  const [fuelData, setFuelData] = useState([]);
  const [userModeData, setUserModeData] = useState([]);
  const [shopCodeData, setShopCodeData] = useState([]);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [seatData, setSeatData] = useState([]);
  const [featureData, setFeatureData] = useState([]);
  const [featureModalShow, setFeatureModalShow] = useState(false);
  const [fontImageError, setFontImageError] = useState(false);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [user, setUser] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isPackageLoading, setIsPackageLoading] = useState(false);
  const [selectedFsId, setSelectedFsId] = useState([]);
  const [outletData, setOutletData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [availabilityStatusData, setAvailabilityStatusData] = useState([
    {
      value: "available",
      label: "Available",
    },
    {
      value: "sold",
      label: "Sold",
    },
    {
      value: "booked",
      label: "Booked",
    },
    {
      value: "hold",
      label: "Hold",
    },
    {
      value: "slightly_negotiable",
      label: "Slightly Negotiable",
    }
  ]);


  const [auctionType, setAuctionType] = useState([
    {
      value: "orginal_auc",
      label: "Orginal Auc",
    },
    {
      value: "dealer_auc",
      label: "Dealer Auc",
    },
    {
      value: "car_mods_bd",
      label: "Car Mods BD",
    },
    {
      value: "ussr_auc",
      label: "USSR Auc",
    },
    {
      value: "not_orginal_auc",
      label: "Not Orginal Auc",
    },
  ]);

  const [partnerData, setPartnerData] = useState([]);
  const [masterCategoryItems, setMasterCategoryItems] = useState([]);
  const [categoryItems, setCategoryItems] = useState([]);
  const [categoryHistory, setCategoryHistory] = useState([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [isCategoryListVisible, setIsCategoryListVisible] = useState(false);
  const categoryDropdownRef = useRef(null);
  const [isPblAdditionalDropdownOpen, setIsPblAdditionalDropdownOpen] = useState(false);
  const [selectedPblAdditionalOption, setSelectedPblAdditionalOption] = useState('');
  const [isPblAskingDropdownOpen, setIsPblAskingDropdownOpen] = useState(false);
  const [selectedPblAskingOption, setSelectedPblAskingOption] = useState('');

  const { selectedShop, permissionList, selectedCompanyShop } = useAppContext();


  const router = useRouter();

  const getStoredUser = () => {
    try {
      const userData = localStorage.getItem("user");
      const userInfo = userData && JSON.parse(userData);
      return typeof userInfo === "string" ? JSON.parse(userInfo) : userInfo;
    } catch {
      return null;
    }
  };

  const canAllShopView = (targetUser = user) => {
    if (!targetUser) return false;
    const targetPermissions = permissionList?.length
      ? permissionList
      : formatPermissions(targetUser?.permissions ?? []);

    return (
      (targetUser?.user_mode !== "pbl" && targetUser?.user_mode !== "admin") ||
      hasPermission(targetPermissions, 0, "Vehicle", "AllShopView")
    );
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    trigger,
    control
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      vp_currency: "BDT",
      vp_show_price: "fixed",
      vp_other_cost: [{ name: "", amount: "" }],
      vp_purchase_cost: [{ name: "", amount: "" }],
      vp_conv_rate: "1",
      vp_bd_tax: "",
      v_arrival_date: "",
      v_video_gdocpbl: "",
      v_video_gdocuser: "",
      v_auction_type: "",
      v_availability_status: "available",
      v_product_type_id: "1",
      category: "",
    }
  });

  const selectedShopId = watch("v_shop_id");
  const selectedBrandId = watch("v_brand_id");
  const selectedModelId = watch("v_model_id");
  const vUrgentSale = watch("v_urgent_sale");
  const userFixedPrice = watch("vp_user_fixed_price");
  const userPblAdditionalPrice = watch("vp_pbl_additional_amount");
  const userPblAskingPrice = watch("vp_pbl_asking_price");
  const pblAdditionalPriceOptions = useMemo(() => buildPriceOptions(userPblAdditionalPrice), [userPblAdditionalPrice]);
  const pblAskingPriceOptions = useMemo(() => buildPriceOptions(userPblAskingPrice), [userPblAskingPrice]);
  const selectedCountryId = watch("v_country_id");
  const selectedProductTypeId = watch("v_product_type_id");
  // v_shop_idW

  useEffect(() => {
    if (vUrgentSale) {
      if (!userFixedPrice || parseFloat(userFixedPrice) <= 0) {
        setValue("v_urgent_sale", false);
        toast.error("Please enter a fixed price before marking as urgent sell.");
      } else {
        setValue('vp_show_price', 'fixed');
      }
    }
  }, [vUrgentSale, userFixedPrice, setValue]);

  useEffect(() => {
    if (selectedShopId) {
      fetchShopDetails(selectedShopId);
    }
  }, [selectedShopId]);

  useEffect(() => {
    const fetchModels = async () => {
      if (selectedBrandId) {
        setIsModelLoading(true);
        setModelData([]);
        setPackageData([]);
        setValue("v_model_id", "");
        setValue("v_edition_id", "");
        try {
          const response = await VehicleModelService.Queries.getModelsByBrand({
            _brand_id: selectedBrandId,
            _page: 1,
            _perPage: 1000,
          });
          const modelData = response.data?.data.map((model) => ({
            value: model.vm_id,
            label: model.vm_name,
          }));
          setModelData(modelData);
        } catch (error) {
          toast.error("Failed to fetch models");
        } finally {
          setIsModelLoading(false);
        }
      } else {
        setModelData([]);
        setPackageData([]);
      }
    };
    fetchModels();
  }, [selectedBrandId, setValue]);

  useEffect(() => {
    const fetchPackages = async () => {
      if (selectedModelId) {
        setIsPackageLoading(true);
        setPackageData([]);
        setValue("v_edition_id", "");
        try {
          const response = await PackageService.Queries.getPackageById({
            _model_id: selectedModelId,
            _page: 1,
            _perPage: 1000,
          });
          const packageData = response.data?.data.map((edition) => ({
            value: edition.p_id,
            label: edition.p_name,
          }));
          setPackageData(packageData);
        } catch (error) {
          toast.error("Failed to fetch packages");
        } finally {
          setIsPackageLoading(false);
        }
      } else {
        setPackageData([]);
      }
    };
    fetchPackages();
  }, [selectedModelId, setValue]);

  const [isShopCodeLoading, setIsShopCodeLoading] = useState(false);
  const fetchShopDetails = async (shopId) => {
    try {
      setIsShopCodeLoading(true);
      setShopCodeData([]);
      const response = await VehicleService.Queries.getVehicleCodeByShopeId(shopId);

      // Sort: exist=false first, then exist=true
      const sortedData = Array.isArray(response?.data)
        ? [...response.data].sort((a, b) => {
          if (a.exist === b.exist) return 0;
          return a.exist ? 1 : -1;
        })
        : [];

      setShopCodeData(sortedData);
      setIsShopCodeLoading(false);
    } catch (error) {
      setIsShopCodeLoading(false);
      console.log("Error fetching shop details:", error);
    }
  };


  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const fetchLocationDetails = async (countryId) => {
    try {
      // Reset location data before fetching
      setIsLocationLoading(true);
      setLocationData([]);

      const response = await LocationService.Queries.getLocationByCountryId({
        _country_id: countryId,
        _page: 1,
        _perPage: 1000,
      });
      const locationData = response.data?.data.map((location) => ({
        value: location.l_id,
        label: location.l_name,
      }));
      setLocationData(locationData);
      setIsLocationLoading(false);
    } catch (error) {
      setIsLocationLoading(false);
      console.log("Error fetching shop details:", error);
    }
  };


  const [isOutletLoading, setIsOutletLoading] = useState(false);
  const fetchOutletDetails = async (shopId) => {
    try {
      setOutletData([]);
      setIsOutletLoading(true);
      const response = await OutletService.Queries.getOutletByShopId({
        _page: 1,
        _perPage: 1000,
        _shop_id: shopId,
      });

      if (response.status === 'success') {

        const outletOptions = response?.data?.data.map((outlet) => ({
          value: outlet.uo_id,
          label: outlet.uo_name,
        }));

        setOutletData(outletOptions);
        setIsOutletLoading(false);
      }
    } catch (error) {
      setIsOutletLoading(false);
      console.log("Error fetching outlet details:", error);
    }
  };

  const [isHandleNext, setIsHandleNext] = useState(false);
  const [isUpdate, setIsUpdate] = useState('new');
  // const 

  const handleNext = async () => {
    setIsUpdate('processing');
    const result = await trigger([
      "v_product_type_id",
      "category",
      "v_title",
      "v_brand_id",
      "v_model_id",
      "v_shop_id",
      // "v_code",
      "v_priority",
      // "v_user_mode",
      "vp_user_fixed_price",
      "vp_show_price",
      "vp_user_purchase_price",
      "vp_user_asking_price",
      "vp_user_variable_price",
      "vp_user_costing_price",
      "vp_user_to_pbl_price",
    ]);

    if (!frontImageFile) {
      setFontImageError(true);
      // toast.error("Please select a front image");
      return;
    }
    setIsHandleNext(true);
    setFontImageError(false);




    if (result) {
      try {
        // setLoading(true);
        const formData = new FormData();

        // Add only the basic fields for initial submission
        appendFormValue(formData, "v_vehicle_type_id", watch("v_product_type_id") || "");
        appendFormValue(formData, "v_type_id", watch("v_product_type_id") || "");
        appendFormValue(formData, "v_category_id", watch("category") || "");
        appendFormValue(formData, "v_title", watch("v_title"));
        appendFormValue(formData, "v_brand_id", watch("v_brand_id"));
        appendFormValue(formData, "v_model_id", watch("v_model_id"));
        appendFormValue(formData, "v_shop_id", watch("v_shop_id"));
        // formData.append("v_code", watch("v_code"));
        appendFormValue(formData, "v_priority", watch("v_priority") || '');
        // formData.append("v_user_mode", watch("v_user_mode") || '');
        appendFormValue(formData, "vp_user_fixed_price", watch("vp_user_fixed_price"));
        appendFormValue(formData, "vp_user_purchase_price", watch("vp_user_purchase_price"));
        appendFormValue(formData, "vp_user_asking_price", watch("vp_user_asking_price"));
        appendFormValue(formData, "vp_user_variable_price", watch("vp_user_variable_price"));
        appendFormValue(formData, "vp_user_costing_price", watch("vp_user_costing_price"));
        appendFormValue(formData, "vp_user_to_pbl_price", watch("vp_user_to_pbl_price"));
        appendFormValue(formData, "vp_show_price", watch("vp_show_price"));
        appendFormValue(formData, "vp_conv_rate", normalizeConversionRate(watch("vp_conv_rate")));
        appendFormValue(formData, "vp_bd_tax", watch("vp_bd_tax") || "");

        // Add front image
        if (frontImageFile) {
          formData.append("vi_front_image", frontImageFile);
        }

        additionalImages.forEach((file) => {
          formData.append("vi_image[]", file);
        });
        additionalDocumentFiles.forEach((file, index) => {
          formData.append(`v_docs[${index}]`, file);
        });
        secretDocumentFiles.forEach((file, index) => {
          formData.append(`v_secret_docs[${index}]`, file);
        });

        setShowAdditionalFields(true);

        // Call initial submission API
        const response = await VehicleService.Commands.storeVehicle(formData);

        if (response.status === 'success') {
          // Store the vehicle ID for the update step
          setIsUpdate('update');
          setValue("v_id", response?.data.v_id);
        }
      } catch (error) {
        setShowAdditionalFields(false);
        console.log("Error submitting initial data:", error);
        setIsUpdate('failed');
        setIsUpdate(false);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `${error.message}`,
        })
      }
    } else {
      toast.error("Please fill all the required fields correctly.");
    }
  };



  const onSubmit = async (data) => {
    // process.exit();
    if (isHandleNext) {

      const formData = new FormData();
      const excludedKeys = new Set([
        "v_id",
        "vp_other_cost",
        "vp_purchase_cost",
        "v_video_user",
        "v_video_pbl",
        "v_video_gdocpbl",
        "v_video_gdocuser",
        "v_auction_type",
        "vp_show_price",
        "v_urgent_sale",
        "v_is_saleBy_pbl",
        "v_location_id",
        "v_availability_id",
        "v_outlet_id",
        "v_capacity",
        "v_mileage",
        "v_registration",
        "v_mod_year",
        "v_seat_id",
        "v_chassis",
        "v_engine",
        "v_country_id",
        "v_fuel_id",
        "v_priority",
        "vp_user_purchase_price",
        "vp_user_to_pbl_price",
        "vp_user_fixed_price",
        "vp_user_asking_price",
        "vp_user_variable_price",
        "vp_pbl_additional_amount",
        "vp_pbl_price_status",
        "vp_pbl_hs_price_status",
        "v_int_grade_id",
        "v_ext_grade_id",
        "v_condition_id",
        "v_transmission_id",
        "v_grade_id",
        "v_skeleton_id",
        "v_color_id",
        "v_edition_id",
        "v_product_type_id",
        "category",
      ]);

      // Include all fields for the update
      for (let key in data) {
        if (!excludedKeys.has(key)) {
          appendFormValue(formData, key, data[key], {
            skipNullish: true,
            skipEmptyString: true,
          });
        }
      }

      const otherCosts = Array.isArray(data?.vp_other_cost) ? data.vp_other_cost : [];
      otherCosts.forEach((item, index) => {
        appendFormValue(formData, `vp_other_cost[${index}][name]`, item?.name ? String(item.name).trim() : "");
        appendFormValue(formData, `vp_other_cost[${index}][amount]`, item?.amount ? String(item.amount).replace(/,/g, "").trim() : "");
      });

      const purchaseCosts = Array.isArray(data?.vp_purchase_cost) ? data.vp_purchase_cost : [];
      purchaseCosts.forEach((item, index) => {
        appendFormValue(formData, `vp_purchase_cost[${index}][name]`, item?.name ? String(item.name).trim() : "");
        appendFormValue(formData, `vp_purchase_cost[${index}][amount]`, item?.amount ? String(item.amount).replace(/,/g, "").trim() : "");
      });

      appendFormValue(formData, "v_video[user]", data.v_video_user ? String(data.v_video_user).trim() : "");
      appendFormValue(formData, "v_video[pbl]", data.v_video_pbl ? String(data.v_video_pbl).trim() : "");
      appendFormValue(formData, "v_video[gdocpbl]", data.v_video_gdocpbl ? String(data.v_video_gdocpbl).trim() : "");
      appendFormValue(formData, "v_video[gdocuser]", data.v_video_gdocuser ? String(data.v_video_gdocuser).trim() : "");
      appendFormValue(formData, "v_auction_type", data.v_auction_type?.value ? data.v_auction_type.value : (data.v_auction_type || ""));
      appendFormValue(formData, "v_vehicle_type_id", data.v_product_type_id ? data.v_product_type_id : "");
      appendFormValue(formData, "v_type_id", data.v_product_type_id ? data.v_product_type_id : "");
      appendFormValue(formData, "v_category_id", data.category ? data.category : "");

      // Transform checkbox values
      appendFormValue(formData, "vp_show_price", data.vp_show_price || "fixed");
      appendFormValue(formData, "v_urgent_sale", data.v_urgent_sale ? 1 : 0);
      appendFormValue(formData, "v_is_saleBy_pbl", data.v_is_saleBy_pbl ? 1 : 0);
      // formData.append("v_to_be_partner", data.v_to_be_partner ? 1 : 0);
      appendFormValue(formData, "v_location_id", data.v_location_id ? data.v_location_id : '');
      appendFormValue(formData, "v_availability_id", data.v_availability_id ? data.v_availability_id : '');
      appendFormValue(formData, "v_outlet_id", data.v_outlet_id ? data.v_outlet_id : '');
      appendFormValue(formData, "v_capacity", data.v_capacity ? data.v_capacity : '');
      appendFormValue(formData, "v_mileage", data.v_mileage ? data.v_mileage : '');
      appendFormValue(formData, "v_registration", data.v_registration ? data.v_registration : '');
      appendFormValue(formData, "v_mod_year", data.v_mod_year ? data.v_mod_year : '');
      appendFormValue(formData, "v_seat_id", data.v_seat_id ? data.v_seat_id : '');
      appendFormValue(formData, "v_chassis", data.v_chassis ? data.v_chassis : '');
      appendFormValue(formData, "v_engine", data.v_engine ? data.v_engine : '');
      appendFormValue(formData, "v_country_id", data.v_country_id ? data.v_country_id : '');
      appendFormValue(formData, "v_fuel_id", data.v_fuel_id ? data.v_fuel_id : '');
      // formData.append("v_code", data.v_code ? data.v_code : '');
      appendFormValue(formData, "v_priority", data.v_priority ? data.v_priority : '');


      appendFormValue(formData, "vp_user_purchase_price", data.vp_user_purchase_price ? data.vp_user_purchase_price : '');
      appendFormValue(formData, "vp_user_to_pbl_price", data.vp_user_to_pbl_price ? data.vp_user_to_pbl_price : '');
      appendFormValue(formData, "vp_user_fixed_price", data.vp_user_fixed_price ? data.vp_user_fixed_price : '');
      appendFormValue(formData, "vp_user_asking_price", data.vp_user_asking_price ? data.vp_user_asking_price : '');
      appendFormValue(formData, "vp_user_variable_price", data.vp_user_variable_price ? data.vp_user_variable_price : '');
      appendFormValue(formData, "vp_pbl_additional_amount", data.vp_pbl_additional_amount ? data.vp_pbl_additional_amount : '');
      // formData.append('v_user_mode', data.v_user_mode ? data.v_user_mode : '');
      appendFormValue(formData, "vp_pbl_price_status", data.vp_pbl_price_status || '');
      appendFormValue(formData, "v_int_grade_id", data.v_int_grade_id ? data.v_int_grade_id : '');
      appendFormValue(formData, "v_ext_grade_id", data.v_ext_grade_id ? data.v_ext_grade_id : '');
      appendFormValue(formData, "v_condition_id", data.v_condition_id ? data.v_condition_id : '');
      appendFormValue(formData, "v_transmission_id", data.v_transmission_id ? data.v_transmission_id : '');
      appendFormValue(formData, "v_grade_id", data.v_grade_id ? data.v_grade_id : '');
      appendFormValue(formData, "v_skeleton_id", data.v_skeleton_id ? data.v_skeleton_id : '');
      appendFormValue(formData, "v_color_id", data.v_color_id ? data.v_color_id : '');
      appendFormValue(formData, "v_edition_id", data.v_edition_id ? data.v_edition_id : '');



      // v_location_id




      if (!data.v_id) {
        if (isUpdate === 'failed') {
          setLoading(true);
          // Add front image
          if (frontImageFile) {
            appendFormValue(formData, "vi_front_image", frontImageFile);
          }

          additionalImages.forEach((file) => {
            formData.append("vi_image[]", file);
          });
          additionalDocumentFiles.forEach((file, index) => {
            formData.append(`v_docs[${index}]`, file);
          });
          secretDocumentFiles.forEach((file, index) => {
            formData.append(`v_secret_docs[${index}]`, file);
          });
          removeSecretDocument.forEach((docId, index) => {
            formData.append(`v_secret_docs_remove[${index}]`, docId);
          });

          // setShowAdditionalFields(true);

          // Call initial submission API
          try {
            const response = await VehicleService.Commands.storeVehicle(formData);

            if (response.status == 'success') {
              setAdditionalImages([]);
              setAdditionalDocumentFiles([]);
              setAdditionalDocumentPreviews([]);
              setSecretDocumentFiles([]);
              setSecretDocumentPreviews([]);
              setRemoveSecretDocument([]);
              setPreview(null);
              reset();
              setLoading(false);
              toast.success("Vehicle Updated Successfully!");
              router.push("/dashboard/product-list/"); // Redirect after success
            }
          } catch (error) {
            setLoading(false);
            toast.error("Update failed");
          }
        } else {
          return;
        }
      } else {
        setLoading(true);

        selectedFsId.forEach((fsId) => {
          formData.append("v_fs[]", fsId);
        });
        // secretDocumentFiles.forEach((file, index) => {
        //   formData.append(`v_secret_docs[${index}]`, file);
        // });
        removeSecretDocument.forEach((docId, index) => {
          formData.append(`v_secret_docs_remove[${index}]`, docId);
        });
        // additionalDocumentFiles.forEach((file, index) => {
        //   formData.append(`v_docs[${index}]`, file);
        // });


        appendFormValue(formData, '_method', 'PUT');

        try {
          // Call update API instead of store
          const response = await VehicleService.Commands.updateVehicle(data.v_id, formData);

          if (response.status == 'success') {
            setAdditionalImages([]);
            setAdditionalDocumentFiles([]);
            setAdditionalDocumentPreviews([]);
            setSecretDocumentFiles([]);
            setSecretDocumentPreviews([]);
            setRemoveSecretDocument([]);
            setPreview(null);
            reset();
            setLoading(false);
            toast.success("Vehicle Updated Successfully!");
            router.push("/dashboard/product-list/"); // Redirect after success
          }
        } catch (error) {
          setLoading(false);
          toast.error("Update failed");
        }
      }
    }


  };

  //  Single image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFrontImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFrontImageDelete = () => {
    setFrontImageFile(null);
    setPreview(null);
  };


  // Multiple Images
  const handleAdditionalImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalAllowed = 12;
    const remainingSlots = totalAllowed - additionalImages.length;

    if (remainingSlots <= 0) return;

    const filesToAdd = files.slice(0, remainingSlots);
    const previews = filesToAdd.map((file) => URL.createObjectURL(file));

    setAdditionalImages((prev) => [...prev, ...filesToAdd]);
    setAdditionalPreviews((prev) => [...prev, ...previews]);
  };

  const handleDeleteAdditionalImage = (index) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAdditionalDocumentFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;

    setAdditionalDocumentFiles((prevFiles) => {
      const combinedFiles = [...prevFiles, ...newFiles];
      setAdditionalDocumentPreviews((prevPreviews) => {
        prevPreviews.forEach((item) => URL.revokeObjectURL(item.url));
        return combinedFiles
          .map((file, fileIndex) => ({ file, fileIndex }))
          .filter(({ file }) => file.type.startsWith("image/"))
          .map(({ file, fileIndex }) => ({ url: URL.createObjectURL(file), fileIndex }));
      });
      return combinedFiles;
    });
    e.target.value = "";
  };

  const handleDeleteAdditionalDocument = (fileIndexToDelete) => {
    setAdditionalDocumentFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter((_, index) => index !== fileIndexToDelete);
      setAdditionalDocumentPreviews((prevPreviews) => {
        prevPreviews.forEach((item) => URL.revokeObjectURL(item.url));
        return updatedFiles
          .map((file, fileIndex) => ({ file, fileIndex }))
          .filter(({ file }) => file.type.startsWith("image/"))
          .map(({ file, fileIndex }) => ({ url: URL.createObjectURL(file), fileIndex }));
      });
      return updatedFiles;
    });
  };

  const handleSecretDocumentFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;

    setSecretDocumentFiles((prevFiles) => {
      const combinedFiles = [...prevFiles, ...newFiles];
      setSecretDocumentPreviews((prevPreviews) => {
        prevPreviews.forEach((item) => URL.revokeObjectURL(item.url));
        return combinedFiles
          .map((file, fileIndex) => ({ file, fileIndex }))
          .filter(({ file }) => file.type.startsWith("image/"))
          .map(({ file, fileIndex }) => ({ url: URL.createObjectURL(file), fileIndex }));
      });
      return combinedFiles;
    });
    e.target.value = "";
  };

  const handleDeleteSecretDocument = (fileIndexToDelete) => {
    setSecretDocumentFiles((prevFiles) => {
      const fileToDelete = prevFiles[fileIndexToDelete];
      const removedDocId =
        fileToDelete?.public_id ||
        fileToDelete?.publicId ||
        fileToDelete?.doc?.public_id ||
        null;

      if (removedDocId) {
        setRemoveSecretDocument((prev) => {
          if (prev.includes(removedDocId)) return prev;
          return [...prev, removedDocId];
        });
      }

      const updatedFiles = prevFiles.filter((_, index) => index !== fileIndexToDelete);
      setSecretDocumentPreviews((prevPreviews) => {
        prevPreviews.forEach((item) => URL.revokeObjectURL(item.url));
        return updatedFiles
          .map((file, fileIndex) => ({ file, fileIndex }))
          .filter(({ file }) => file.type.startsWith("image/"))
          .map(({ file, fileIndex }) => ({ url: URL.createObjectURL(file), fileIndex }));
      });
      return updatedFiles;
    });
  };

  useEffect(() => {
    return () => {
      additionalDocumentPreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [additionalDocumentPreviews]);

  useEffect(() => {
    return () => {
      secretDocumentPreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [secretDocumentPreviews]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  // shop data get from api
  const getShopData = async () => {
    try {
      const activeUser = user || getStoredUser();

      // Build request params conditionally
      const params = {
        order: "desc",
        orderBy: "md_id",
        _page: 1,
        _perPage: 1000,
        ...(!canAllShopView(activeUser) && activeUser?.id && { _user_id: activeUser.id }),
        // _user_id: user?.id,
        // ...(user.user_mode !== "pbl" && user.user_mode !== "supreme" && { _user_id: user?.id })
      };

      const response = await ShopService.Queries.getShops(params);

      const shopOptions = response.data.data.map((shop) => ({
        value: shop?.s_id,
        label: shop?.s_title,
        s_user_id: shop?.s_user_id,
        s_id: shop?.s_id,
        shop_name: "my-shop"
      }));

      setShopData((prevShopData) => {
        const newShops = shopOptions.filter(
          (newShop) => !prevShopData.find((s) => s.value === newShop.value)
        );
        return [...prevShopData, ...newShops];
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch data");
    }
  };

  // getPartnerData
  const getPartnerData = async () => {
    try {
      // Build request params conditionally
      const params = {
        order: "desc",
        orderBy: "md_id",
        _page: 1,
        _perPage: 1000,
        _mode: 'partner',
        _status: 'active',
      };

      const response = await UserService.Queries.getUsers(params);

      const partnerOptions = response.data.data.map((partner) => ({
        value: partner.id,
        label: partner.name,
      }));

      setPartnerData(partnerOptions);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch data");
    }
  };

  const fetchMasterCategories = async () => {
    setIsCategoryLoading(true);
    try {
      const response = await CategoryService.Queries.getCategories({
        _page: 1,
        _perPage: 1000,
        _parent_id: 0,
      });

      if (response?.status === "success") {
        const categories = response?.data?.data || [];
        const mappedCategories = categories.map((item) => ({
          c_id: item.c_id,
          c_name: item.c_name,
        }));
        setMasterCategoryItems(mappedCategories);
      } else {
        setMasterCategoryItems([]);
      }
    } catch (error) {
      toast.error("Failed to fetch categories");
      setMasterCategoryItems([]);
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const fetchCategories = async (parentId) => {
    if (!parentId) {
      setCategoryItems([]);
      return;
    }

    setIsCategoryLoading(true);
    try {
      const response = await CategoryService.Queries.getCategories({
        _page: 1,
        _perPage: 5000,
        _parent_id: parentId,
      });

      if (response?.status === "success") {
        const categories = response?.data?.data || [];
        const mappedCategories = categories.map((item) => ({
          c_id: item.c_id,
          c_name: item.c_name,
        }));
        setCategoryItems(mappedCategories);
      } else {
        setCategoryItems([]);
      }
    } catch (error) {
      toast.error("Failed to fetch categories");
      setCategoryItems([]);
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setValue("category", String(category.c_id), { shouldValidate: true });
    setCategoryHistory((prev) => [...prev, category]);
    fetchCategories(category.c_id);
  };

  const handleCategoryBack = () => {
    if (categoryHistory.length === 0) return;

    const newHistory = [...categoryHistory];
    newHistory.pop();
    const parentCategory = newHistory[newHistory.length - 1];

    setValue("category", parentCategory ? String(parentCategory.c_id) : "", { shouldValidate: true });
    setCategoryHistory(newHistory);

    const parentId = parentCategory ? parentCategory.c_id : selectedProductTypeId;
    if (parentId) {
      fetchCategories(parentId);
    } else {
      setCategoryItems([]);
    }
  };

  const getCountryData = async () => {
    try {
      const country_code = constData.COUNTRY_CODE;
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(country_code); // Replace with your API endpoint

      const countryMasterData = response.data?.master_data;
      const countryData = countryMasterData.map((country) => ({
        value: country.md_id,
        label: country.md_title,
        _page: 1,
        _perPage: 1000,
      }));
      setCountryData(countryData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }


  const getBrandData = async () => {
    try {
      const brand_code = constData.BRAND_MD_CODE;
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(brand_code);

      const brandMasterData = response.data?.master_data;
      const brandData = brandMasterData.map((brand) => ({
        value: brand.md_id,
        label: brand.md_title
      }));
      setBrandData(brandData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }

  const getColorData = async () => {
    try {
      const color_code = constData.COLOR_MD_CODE;
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(color_code);

      const colorMasterData = response.data?.master_data;
      const colorData = colorMasterData.map((color) => ({
        value: color.md_id,
        label: color.md_title,
        _page: 1,
        _perPage: 1000,
      }));
      setColorData(colorData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }

  const getConditionData = async () => {
    try {
      const condition_code = constData.CONSTANTS_MD_CODE;
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(condition_code);

      const conditionMasterData = response.data?.master_data;
      const conditionData = conditionMasterData.map((condition) => ({
        value: condition.md_id,
        label: condition.md_title,
      }));
      setConditionData(conditionData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }

  const getEditionData = async () => {
    try {
      const response = await PackageService.Queries.getPackages({
        _page: 1,
        _perPage: 400
      });

      const packageMasterData = response.data?.data;

      const packageData = packageMasterData.map((edition) => ({
        value: edition.p_id,
        label: edition.p_name,
        _page: 1,
        _perPage: 1000,
      }));

      setPackageData(packageData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }

  const getSkeletonData = async () => {
    try {
      const skeleton_code = constData.SKELETON_MD_CODE;
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(skeleton_code);

      const skeletonMasterData = response.data?.master_data;
      const skeletonData = skeletonMasterData.map((skeleton) => ({
        value: skeleton.md_id,
        label: skeleton.md_title,
        _page: 1,
        _perPage: 1000,
      }));
      setSkeletonData(skeletonData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }

  const getTransmissionData = async () => {
    try {
      const transmission_code = constData.TRANSACTION_MD_CODE;
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(transmission_code);

      const transmissionMasterData = response.data?.master_data;
      const transmissionData = transmissionMasterData.map((transmission) => ({
        value: transmission.md_id,
        label: transmission.md_title,
        _page: 1,
        _perPage: 1000,
      }));
      setTransmissionData(transmissionData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }


  const getGradeData = async () => {
    try {
      const grade_code = constData.GRADE_MD_CODE;
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(grade_code);

      const gradeMasterData = response.data?.master_data;
      const gradeData = gradeMasterData.map((grade) => ({
        value: grade.md_id,
        label: grade.md_title,
        _page: 1,
        _perPage: 1000,
      }));
      setGradeData(gradeData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }

  // getExteriorData
  const getExteriorData = async () => {
    try {
      const exterior_grade_code = constData.EXTERIOR_GRADE_MD_CODE;
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(exterior_grade_code);

      const gradeMasterData = response.data?.master_data;
      const exteriorGradeData = gradeMasterData.map((grade) => ({
        value: grade.md_id,
        label: grade.md_title,
        _page: 1,
        _perPage: 1000,
      }));
      setExteriorGradeData(exteriorGradeData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }


  const getInteriorData = async () => {
    try {
      const interior_grade_code = constData.INTERIOR_GRADE_MD_CODE;
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(interior_grade_code);

      const gradeMasterData = response.data?.master_data;
      const interiorGradeData = gradeMasterData.map((grade) => ({
        value: grade.md_id,
        label: grade.md_title,
        _page: 1,
        _perPage: 1000,
      }));
      setInteriorGradeData(interiorGradeData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }

  const getModelData = async () => {
    try {
      // const model_code = constData.MODEL_MD_CODE;
      // const response = await MasterDataService.Queries.getMasterDataByTypeCode(model_code);
      const response = await VehicleModelService.Queries.getModels({
        _page: 1,
        _perPage: 400
      });

      const gradeMasterData = response.data?.data;
      const modelData = gradeMasterData.map((model) => ({
        value: model.vm_id,
        label: model.vm_name,
      }));
      setModelData(modelData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }

  const getFuelData = async () => {
    try {
      const fuel_code = constData.FUEL_MD_CODE;
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(fuel_code);

      const fuelMasterData = response.data?.master_data;
      const fuelData = fuelMasterData.map((model) => ({
        value: model.md_id,
        label: model.md_title,
        _page: 1,
        _perPage: 1000,
      }));
      setFuelData(fuelData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }

  const getAvailabilityData = async () => {
    try {
      const availability_code = constData.USER_AVAILABILITY_MD_CODE;
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(availability_code);

      const availabilityMasterData = response.data?.master_data;
      const availabilityData = availabilityMasterData.map((model) => ({
        value: model.md_id,
        label: model.md_title,
        _page: 1,
        _perPage: 1000,
      }));
      setAvailabilityData(availabilityData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }

  const getUserModeData = async () => {
    try {
      const user_mode_code = constData.USER_MODE_MD_CODE;
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(user_mode_code);

      const userModeMasterData = response.data?.master_data;
      const userModeData = userModeMasterData.map((model) => ({
        value: model.md_id,
        label: model.md_title,
        _page: 1,
        _perPage: 1000,
      }));
      setUserModeData(userModeData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }


  const getSeatData = async () => {
    try {
      const seat_code = constData.SEAT_CODE;
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(seat_code);

      const seatData = response.data?.master_data;
      const seatModeData = seatData.map((model) => ({
        value: model.md_id,
        label: model.md_title,
        _page: 1,
        _perPage: 1000,
      }));
      setSeatData(seatModeData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }

  const handleList = async () => {
    router.push("/dashboard/product-list/");
  }


  const [formData, setFormData] = useState({
    vsm_feature_id: 0,
    vsm_model_id: "",
    vsm_ve_id: "",
    vsm_fs_id: [],
  });

  const getFeatureData = async (id) => {
    if (id) {
      const response = await PackageService.Queries.getFeatureByPackage(id, 0);

      setFeatureData(response?.data || []);

      const arr = [];

      response?.data && response?.data.map((item) => {
        item?.specification && item?.specification.map((feature) => {
          if (feature.is_selected === true) {
            arr.push(feature.fs_id);
          }
        })
      });

      setFormData({
        ...formData,
        vsm_ve_id: id,
        vsm_fs_id: arr
      })
      // setFeatureLoading(false);
    } else {
      setFeatureData([]);
      // setFeatureLoading(false);
    }
  }



  // ProductFeatureSpecificationModal
  const handlePackageClick = async (id) => {
    setSelectedFsId([]);
    await getFeatureData(id);
    setFeatureModalShow(true);
  }

  useEffect(() => {
    if (selectedProductTypeId !== "1") {
      setValue("v_product_type_id", "1", { shouldValidate: true });
      setCategoryHistory([]);
      setValue("category", "", { shouldValidate: true });
      setIsCategoryListVisible(false);
      return;
    }

    fetchCategories("1");
  }, [selectedProductTypeId, setValue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryListVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const fetchCompanyShops = useCallback(async () => {
    try {
      const response = await ShopService.Queries.getCompanyShops(user?.id);

      if (response.status == 'success') {
        let shopArrayData = [];

        response?.data.forEach((item) => {
          if (item.shop) {

            let companyShopId = item.shop.s_id;
            let priceAction = "Create"

            const hasCreatePermission = hasPermission(permissionList, companyShopId, "Vehicle", priceAction);

            if (hasCreatePermission) {
              shopArrayData.push({
                value: item.shop.s_id,
                label: item.shop.s_title,
                s_user_id: item.shop.s_user_id,
                s_id: item?.shop?.s_id,
                shop_name: 'company-shop'
              });
            }

          }
        });





        setShopData((prevShopData) => {
          const newShops = shopArrayData.filter(
            (newShop) => !prevShopData.find((s) => s.value === newShop.value)
          );

          const finalData = [...prevShopData, ...newShops];

          return finalData;
        });
        // setCompanyShops(response?.data);
      }
    } catch (error) {
      console.log("Error fetching shops:", error);
    }
  }, [user?.id]);





  useEffect(() => {

    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }

    getShopData();
    getPartnerData();
    fetchMasterCategories();
    getBrandData();
    getColorData();
    getConditionData();
    getCountryData();
    // getEditionData();
    getSkeletonData();
    getTransmissionData();
    getGradeData();
    getExteriorData();
    getInteriorData();
    // getModelData();
    getFuelData();
    getUserModeData();
    getAvailabilityData();
    getSeatData();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchCompanyShops();
    }
  }, [user?.id, fetchCompanyShops]);



  const lastValidCode = useRef("");
  const handleSelectChange = (e) => {
    const selected = e.target.value;

    const selectedItem = shopCodeData.find((item) => item.code === selected);

    if (selectedItem && selectedItem.exist) {
      // Invalid selection
      toast.error(`Code ${selectedItem.code} is not available.`);
      // Revert back to previous valid
      setValue("v_code", lastValidCode.current);
    } else {
      // Valid selection
      lastValidCode.current = selected;
      setValue("v_code", selected);
    }
  };

  const handlePartnerChange = async (item) => {
    if (item.value) {
      const params = {
        order: "desc",
        orderBy: "md_id",
        _page: 1,
        _perPage: 1000,
        _user_id: item.value
      };

      const response = await ShopService.Queries.getShops(params);

      const shopOptions = response.data.data.map((shop) => ({
        value: shop.s_id,
        label: shop.s_title,
      }));

      setShopData(shopOptions);
    }
  }




  useEffect(() => {
    if (selectedShop) {
      setValue("v_shop_id", selectedShop.s_id);
    }
  }, [selectedShop]);

  return (
    <>
      <div className="flex-1 min-h-screen flex flex-col justify-between">
        {loading ? (
          <Loading />
        ) : (
          // <div className="w-full md:p-10 p-4">
          <div className="w-full mt-6 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-white shadow-sm rounded-lg mb-6 border border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  ➕ Add Product
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Create a new product listing.
                </p>
              </div>

              <div>
                <span className="text-2xl font-bold text-gray-900">Your User Mode:</span>
                <span className="text-2xl font-bold text-red-700 ml-2">
                  {user?.user_mode === 'supreme' ? "Super Admin" : user?.user_mode === 'pbl' ? "PBL" : user?.user_mode === 'admin' ? "Admin" : user?.user_mode === 'partner' ? "Partner" : "User"}
                </span><br />
                <span className="text-sm font-black">To be Partner Call Hotline</span>
              </div>

              <div className="text-right">
                <Button
                  onClick={handleList}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Product List
                </Button>
                <p className="text-sm text-gray-500 mt-1">Overview of all added vehicles</p>
              </div>
            </div>

            <div className="w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="p-4">
                  {/* user section */}
                  {!showAdditionalFields && (
                    <>
                      <div className="mb-4 border border-gray-300 rounded-lg p-4">
                        <div className="mb-3">
                          <h4 className="text-sm font-semibold text-gray-800 mb-1">Product Info</h4>
                          <div className="flex w-20 h-1">
                            <div className="w-2/3 bg-green-500"></div>
                            <div className="w-1/2 bg-gray-500/20"></div>
                          </div>
                        </div>

                        {/* Product Info section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="text-base font-medium" htmlFor="v_product_type_id">
                              Product Type <span className="text-red-500">*</span>
                            </label>
                            <Controller
                              name="v_product_type_id"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  id="v_product_type_id"
                                  options={masterCategoryItems.map((item) => ({
                                    value: String(item.c_id),
                                    label: item.c_name,
                                  }))}
                                  value={masterCategoryItems
                                    .map((item) => ({ value: String(item.c_id), label: item.c_name }))
                                    .find((option) => option.value === "1") || null}
                                  placeholder="Select Product Type"
                                  className="basic-single"
                                  classNamePrefix="select"
                                  isDisabled
                                  isSearchable={false}
                                />
                              )}
                            />
                            {errors.v_product_type_id && (
                              <p className="text-red-500 text-sm">{errors.v_product_type_id.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="text-base font-medium" htmlFor="category">
                              Category <span className="text-red-500">*</span>
                            </label>
                            <div className="relative" ref={categoryDropdownRef}>
                              <div
                                onClick={() => selectedProductTypeId && setIsCategoryListVisible(!isCategoryListVisible)}
                                className={`flex justify-between items-center border rounded-lg p-2 bg-white shadow-sm ${selectedProductTypeId ? "cursor-pointer" : "cursor-not-allowed bg-gray-100"}`}
                              >
                                <span className="text-sm text-gray-500 truncate">
                                  {categoryHistory.length === 0 && (selectedProductTypeId ? "Select a category..." : "Select Product Type first")}
                                  {categoryHistory.map((cat, index) => (
                                    <span key={cat.c_id}>
                                      {cat.c_name} {index < categoryHistory.length - 1 ? " / " : ""}
                                    </span>
                                  ))}
                                </span>
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isCategoryListVisible ? "rotate-180" : ""}`} />
                              </div>

                              {isCategoryListVisible && selectedProductTypeId && (
                                <div className="absolute top-full left-0 w-full bg-white border mt-1 rounded-lg shadow-lg z-20 p-2">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                      {categoryHistory.length > 0 && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCategoryBack();
                                          }}
                                          className="hover:underline text-red-500 pr-2"
                                        >
                                          Back
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  {isCategoryLoading ? (
                                    <div className="p-2 text-gray-500">Loading...</div>
                                  ) : (
                                    <div className="max-h-40 overflow-y-auto">
                                      {categoryItems.length > 0 ? (
                                        categoryItems.map((item) => (
                                          <div
                                            key={item.c_id}
                                            onClick={() => {
                                              handleCategoryClick(item);
                                            }}
                                            className="p-2 hover:bg-gray-100 cursor-pointer rounded flex justify-between items-center"
                                          >
                                            <span>{item.c_name}</span>
                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                          </div>
                                        ))
                                      ) : (
                                        <div className="p-2 text-gray-500">No sub-categories.</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <Controller
                              name="category"
                              control={control}
                              render={({ field }) => <input {...field} value={field.value || ""} type="hidden" />}
                            />
                            {errors.category && (
                              <p className="text-red-500 text-sm">{errors.category.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="text-base font-medium" htmlFor="v_title">
                              Title <span className="text-red-500">*</span>
                            </label>
                            <Input
                              {...register("v_title")}
                              id="v_title"
                              name="v_title"
                              placeholder="Title *"
                            />
                            {errors.v_title && (
                              <p className="text-red-500 text-sm">{errors.v_title.message}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div className="">
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Brand <span className="text-red-500">*</span>
                            </label>
                            <Controller
                              name="v_brand_id"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={brandData}
                                  onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                  value={brandData.find(option => option.value === field.value)}
                                  placeholder="Select Brand"
                                  className="basic-single"
                                  classNamePrefix="select"
                                />
                              )}
                            />
                            {errors.v_brand_id && (
                              <p className="text-red-500 text-sm">{errors.v_brand_id.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Model <span className="text-red-500">*</span>
                            </label>
                            <Controller
                              name="v_model_id"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={modelData}
                                  onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                  value={modelData.find(option => option.value === field.value)}
                                  placeholder={isModelLoading ? "Loading..." : "Select Model"}
                                  isDisabled={isModelLoading}
                                  className="basic-single"
                                  classNamePrefix="select"
                                />
                              )}
                            />
                            {errors.v_model_id && (
                              <p className="text-red-500 text-sm">{errors.v_model_id.message}</p>
                            )}
                          </div>
                        </div>

                        {/* Shop section */}
                        <div className="mb-3 mt-4">
                          <h4 className="text-sm font-bold text-gray-800 mb-1">Shop</h4>
                          <div className="flex w-20 h-1">
                            <div className="w-2/3 bg-green-500"></div>
                            <div className="w-1/2 bg-gray-500/20"></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-4">
                          {
                            ((user?.user_mode === 'supreme') || (user?.user_mode === 'admin') || (user?.user_mode === 'pbl')) && (
                              <div>
                                <label
                                  className="text-base font-medium"
                                  htmlFor="v_partner_id"
                                >
                                  Partner List
                                </label>

                                <Controller
                                  name="v_partner_id"
                                  control={control} // ✅ must include this
                                  rules={{ required: "Partner is required" }} // validation
                                  render={({ field }) => (
                                    <Select
                                      {...field}
                                      options={partnerData}
                                      onChange={(selectedOption) => {
                                        field.onChange(selectedOption ? selectedOption.value : "");
                                        handlePartnerChange(selectedOption);
                                      }}
                                      value={partnerData.find((option) => option.value === field.value) || null}
                                      placeholder="Select Partner"
                                      className="basic-single"
                                      classNamePrefix="select"
                                    />
                                  )}
                                />
                              </div>
                            )
                          }

                          <div>
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Shop List <span className="text-red-500">*</span>
                            </label>
                            <Controller
                              name="v_shop_id"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={shopData}
                                  onChange={(selectedOption) => {
                                    field.onChange(selectedOption ? selectedOption.value : '');
                                    // fetchShopDetails(selectedOption ? selectedOption.value : '');
                                    fetchOutletDetails(selectedOption ? selectedOption.value : '');
                                    setValue('v_availability_id', null); // Shop change korle outlet select null
                                  }}
                                  value={shopData.find(option => option.value === field.value)}
                                  placeholder="Select Shop"
                                  className="basic-single"
                                  classNamePrefix="select"
                                />
                              )}
                            />
                            {errors.v_shop_id && (
                              <p className="text-red-500 text-sm">{errors.v_shop_id.message}</p>
                            )}
                          </div>


                        </div>


                        {/* Description section */}
                        <div className="mb-3 mt-4">
                          <h4 className="text-lg font-semibold text-gray-800 mb-1">Description (User Shop Only)</h4>
                          <div className="flex w-28 h-1">
                            <div className="w-4/5 bg-green-500"></div>
                            <div className="w-1/3 bg-gray-500/20"></div>
                          </div>
                        </div>

                        <div>
                          <textarea
                            id="v_user_description"
                            name="v_user_description"
                            placeholder="Description"
                            rows="6"
                            className="outline-none py-2 px-3 rounded border w-full"
                            {...register("v_user_description")}
                          ></textarea>
                          {errors.v_user_description && (
                            <p className="text-red-500 text-sm">{errors.v_user_description.message}</p>
                          )}
                        </div>

                        <hr />

                        <VehiclePricingSection
                          register={register}
                          watch={watch}
                          setValue={setValue}
                          control={control}
                          purchasePriceField="vp_user_purchase_price"
                          partnerPriceLabel="Partner B2B Price"
                          hotlineText="Call Our Hotline to be Partner"
                        />

                        {/* Front Image section */}
                        <div className="mb-3 mt-4">
                          <h4 className="text-sm font-bold text-gray-800 mb-1">Front Image</h4>
                          <div className="flex w-20 h-1">
                            <div className="w-2/3 bg-green-500"></div>
                            <div className="w-1/3 bg-gray-500/20"></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-5 gap-4 mt-4 mb-4">
                          <div>
                            <div className={`flex justify-center items-center border ${fontImageError && `border-2 border-dashed border-red-600 rounded-lg`}`}>
                              <label
                                htmlFor="front-image-upload"
                                className="flex-1 h-40 flex flex-col justify-center items-center gap-2 cursor-pointer border border-dashed border-gray-400 rounded-lg text-center hover:border-blue-500 transition"
                              >
                                <span className="text-sm text-gray-600">Click to Upload Font Image</span>
                                <input
                                  type="file"
                                  id="front-image-upload"
                                  name="frontImage"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleImageChange}
                                />
                              </label>
                            </div>
                            {
                              fontImageError && <span className="text-red-500 font-sm mt-2 ">Front Image is required</span>
                            }
                          </div>

                          <div className="col-span-4">
                            {preview && (
                              <div className="w-40 h-40 border rounded-lg overflow-hidden relative">
                                <img
                                  src={preview}
                                  alt="Front Preview"
                                  className="object-cover w-full h-full"
                                />
                                <button
                                  type="button"
                                  onClick={handleFrontImageDelete}
                                  className="absolute top-1 right-1 bg-white text-red-600 border border-red-300 rounded-full px-2 py-0.5 text-xs hover:bg-red-100"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-red-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>

                        </div>

                        {/* PBL Pricing section */}
                        <div className="mb-3 mt-4">
                          <h4 className="text-sm font-semibold text-gray-800 mb-1">Additional Images</h4>
                          <div className="flex w-20 h-0.5">
                            <div className="w-1/2 bg-green-500"></div>
                            <div className="w-1/2 bg-gray-500/20"></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-5 gap-4 mt-4 mb-4">
                          {/* Upload Box */}
                          <div className="flex justify-center items-center">
                            <label
                              htmlFor="additional-images-upload"
                              className="flex-1 h-40 flex flex-col justify-center items-center gap-2 cursor-pointer border border-dashed border-gray-400 rounded-lg text-center hover:border-blue-500 transition"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-6 h-6 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 7h2l2-3h10l2 3h2a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z"
                                />
                                <circle cx="12" cy="13" r="4" />
                              </svg>
                              <input
                                type="file"
                                id="additional-images-upload"
                                name="additionalImages"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleAdditionalImageChange}
                              />
                            </label>
                          </div>

                          {/* Image Previews */}
                          <div className="col-span-4">
                            <div className="grid grid-cols-6 gap-4 image-preview">
                              {additionalPreviews.map((img, index) => (
                                <div key={index} className="w-40 h-40 border rounded-lg overflow-hidden relative">
                                  <img
                                    src={img}
                                    alt={`Preview ${index}`}
                                    className="object-cover w-full h-full"
                                  />
                                  {/* SVG Delete Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAdditionalImage(index)}
                                    className="absolute top-1 right-1 bg-white p-1 rounded-full shadow hover:bg-red-100 transition"
                                    aria-label="Delete image"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 text-red-500"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mb-3 mt-4">
                          <h4 className="text-sm font-semibold text-gray-800 mb-1">Additional Documents/Auction Sheet/Brochure</h4>
                          <div className="flex w-20 h-0.5">
                            <div className="w-1/2 bg-green-500"></div>
                            <div className="w-1/2 bg-gray-500/20"></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-5 gap-4 mt-4 mb-4">
                          <div className="flex justify-center items-center">
                            <label
                              htmlFor="additional-document-file"
                              className="flex-1 h-40 flex flex-col justify-center items-center gap-2 cursor-pointer border border-dashed border-gray-400 rounded-lg text-center hover:border-blue-500 transition bg-gray-100"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-6 h-6 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 7h2l2-3h10l2 3h2a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z"
                                />
                                <circle cx="12" cy="13" r="4" />
                              </svg>
                              <input
                                id="additional-document-file"
                                type="file"
                                accept="image/*,.pdf,.doc,.docx"
                                multiple
                                className="hidden"
                                onChange={handleAdditionalDocumentFileChange}
                              />
                            </label>
                          </div>

                          <div className="col-span-4">
                            {additionalDocumentPreviews.length > 0 && (
                              <div className="grid grid-cols-6 gap-4">
                                {additionalDocumentPreviews.map((preview, index) => (
                                  <div key={index} className="w-40 h-40 border rounded-lg overflow-hidden relative">
                                    <img
                                      src={preview.url}
                                      alt={`Document Preview ${index + 1}`}
                                      className="object-cover w-full h-full"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteAdditionalDocument(preview.fileIndex)}
                                      className="absolute top-1 right-1 bg-white p-1 rounded-full shadow hover:bg-red-100 transition"
                                      aria-label="Delete document image"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 text-red-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            {additionalDocumentFiles.length > 0 && (
                              <p className="text-xs text-gray-600 mt-1">
                                {additionalDocumentFiles.length} file selected
                              </p>
                            )}
                          </div>
                        </div>

                      </div>


                      {/* PBL section */}
                      {
                        ((user?.user_mode === 'supreme') || (user?.user_mode === 'admin') || (user?.user_mode === 'pbl')) && (
                          <div className="border border-gray-900 rounded-lg p-4 mb-4">
                            <div className="mb-3 mt-4">
                              <h4 className="text-lg font-bold text-gray-800 mb-1">PBL Section</h4>
                              <div className="flex w-24 h-1">
                                <div className="w-2/3 bg-green-500"></div>
                                <div className="w-1/2 bg-gray-500/20"></div>
                              </div>
                            </div>




                            <div>
                              <div className="mb-3 mt-4">
                                <h4 className="text-sm font-semibold text-gray-800 mb-1">Secret Documents</h4>
                                <div className="flex w-20 h-0.5">
                                  <div className="w-1/2 bg-green-500"></div>
                                  <div className="w-1/2 bg-gray-500/20"></div>
                                </div>
                              </div>

                              <div className="grid grid-cols-5 gap-4 mt-4 mb-4">
                                <div className="flex justify-center items-center">
                                  <label
                                    htmlFor="secret-document-file"
                                    className="flex-1 h-40 flex flex-col justify-center items-center gap-2 cursor-pointer border border-dashed border-gray-400 rounded-lg text-center hover:border-blue-500 transition bg-gray-100"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="w-6 h-6 text-gray-500"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 7h2l2-3h10l2 3h2a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z"
                                      />
                                      <circle cx="12" cy="13" r="4" />
                                    </svg>
                                    <input
                                      id="secret-document-file"
                                      type="file"
                                      accept="image/*,.pdf,.doc,.docx"
                                      multiple
                                      className="hidden"
                                      onChange={handleSecretDocumentFileChange}
                                    />
                                  </label>
                                </div>

                                <div className="col-span-4">
                                  {secretDocumentPreviews.length > 0 && (
                                    <div className="grid grid-cols-6 gap-4">
                                      {secretDocumentPreviews.map((preview, index) => (
                                        <div key={index} className="w-40 h-40 border rounded-lg overflow-hidden relative">
                                          <img
                                            src={preview.url}
                                            alt={`Secret Document Preview ${index + 1}`}
                                            className="object-cover w-full h-full"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteSecretDocument(preview.fileIndex)}
                                            className="absolute top-1 right-1 bg-white p-1 rounded-full shadow hover:bg-red-100 transition"
                                            aria-label="Delete secret document image"
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-4 w-4 text-red-500"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                              strokeWidth={2}
                                            >
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {secretDocumentFiles.length > 0 && (
                                    <p className="text-xs text-gray-600 mt-1">
                                      {secretDocumentFiles.length} file selected
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>


                            <div className="grid grid-cols-4 gap-4 mb-4">

                              <div className="mb-2">
                                <label className="text-base font-medium" htmlFor="customer-name">
                                  PBL Additional Price
                                </label>
                                <div className="relative">
                                  <Input
                                    id="vp_pbl_additional_amount"
                                    name="vp_pbl_additional_amount"
                                    placeholder="Enter PBL Additional Price"
                                    {...register("vp_pbl_additional_amount")}
                                    type="text"
                                    inputMode="decimal"
                                    value={formatIndianNumber(userPblAdditionalPrice, true)}
                                    onChange={(e) => {
                                      const cleaned = String(e.target.value)
                                        .replace(/,/g, '')
                                        .replace(/[^\d.]/g, '');
                                      const [integerPart = '', decimalPart = ''] = cleaned.split('.');
                                      const normalizedInteger = integerPart.replace(/\D+/g, '').slice(0, 12);
                                      const normalizedDecimal = decimalPart.replace(/\D+/g, '').slice(0, 2);
                                      const normalizedValue = cleaned.includes('.')
                                        ? `${normalizedInteger}.${normalizedDecimal}`
                                        : normalizedInteger;

                                      setValue('vp_pbl_additional_amount', normalizedValue, { shouldDirty: true, shouldValidate: true });
                                      setSelectedPblAdditionalOption('');
                                      setIsPblAdditionalDropdownOpen(normalizedInteger.length > 0);
                                    }}
                                    onFocus={() => setIsPblAdditionalDropdownOpen(pblAdditionalPriceOptions.length > 0)}
                                    onBlur={() => {
                                      setTimeout(() => setIsPblAdditionalDropdownOpen(false), 120);
                                    }}
                                    onKeyDown={onlyDecimalInput}
                                  />
                                  {isPblAdditionalDropdownOpen && pblAdditionalPriceOptions.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                                      {pblAdditionalPriceOptions.map((option) => {
                                        const isSelected = selectedPblAdditionalOption === option.value;
                                        return (
                                          <button
                                            key={option.value}
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                                            onClick={() => {
                                              setValue('vp_pbl_additional_amount', option.value, { shouldDirty: true, shouldValidate: true });
                                              setSelectedPblAdditionalOption(option.value);
                                              setIsPblAdditionalDropdownOpen(false);
                                            }}
                                          >
                                            <div className="min-w-0">
                                              <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                                              <p className="mt-1 text-xs text-gray-700">{option.words}</p>
                                            </div>
                                            {/* <span className={`mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? 'border-blue-600' : 'border-gray-400'}`}>
                                                  {isSelected ? <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> : null}
                                                </span> */}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="mb-2">
                                <label className="text-base font-medium" htmlFor="customer-name">
                                  PBL Asking Price
                                </label>
                                <div className="relative">
                                  <Input
                                    id="vp_pbl_asking_price"
                                    name="vp_pbl_asking_price"
                                    placeholder="Enter PBL Asking Price"
                                    {...register("vp_pbl_asking_price")}
                                    type="text"
                                    inputMode="decimal"
                                    value={formatIndianNumber(userPblAskingPrice, true)}
                                    onChange={(e) => {
                                      const cleaned = String(e.target.value)
                                        .replace(/,/g, '')
                                        .replace(/[^\d.]/g, '');
                                      const [integerPart = '', decimalPart = ''] = cleaned.split('.');
                                      const normalizedInteger = integerPart.replace(/\D+/g, '').slice(0, 12);
                                      const normalizedDecimal = decimalPart.replace(/\D+/g, '').slice(0, 2);
                                      const normalizedValue = cleaned.includes('.')
                                        ? `${normalizedInteger}.${normalizedDecimal}`
                                        : normalizedInteger;

                                      setValue('vp_pbl_asking_price', normalizedValue, { shouldDirty: true, shouldValidate: true });
                                      setSelectedPblAskingOption('');
                                      setIsPblAskingDropdownOpen(normalizedInteger.length > 0);
                                    }}
                                    onFocus={() => setIsPblAskingDropdownOpen(pblAskingPriceOptions.length > 0)}
                                    onBlur={() => {
                                      setTimeout(() => setIsPblAskingDropdownOpen(false), 120);
                                    }}
                                    onKeyDown={onlyDecimalInput}
                                  />
                                  {isPblAskingDropdownOpen && pblAskingPriceOptions.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                                      {pblAskingPriceOptions.map((option) => {
                                        const isSelected = selectedPblAskingOption === option.value;
                                        return (
                                          <button
                                            key={option.value}
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                                            onClick={() => {
                                              setValue('vp_pbl_asking_price', option.value, { shouldDirty: true, shouldValidate: true });
                                              setSelectedPblAskingOption(option.value);
                                              setIsPblAskingDropdownOpen(false);
                                            }}
                                          >
                                            <div className="min-w-0">
                                              <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                                              <p className="mt-1 text-xs text-gray-700">{option.words}</p>
                                            </div>
                                            {/* <span className={`mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? 'border-blue-600' : 'border-gray-400'}`}>
                                                  {isSelected ? <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> : null}
                                                </span> */}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <label className="text-base font-medium" htmlFor="customer-name">
                                  PBL Price Negotiation
                                </label>
                                <Controller
                                  name="vp_pbl_price_status"
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      {...field}
                                      options={[
                                        { value: '', label: 'Select PBL Price Negotiation' },
                                        { value: 'negotiable', label: 'Negotiation' },
                                        { value: 'fixed', label: 'Fixed' },
                                        { value: 'variable', label: 'Variable' },
                                      ]}
                                      onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                      value={[
                                        { value: '', label: 'Select PBL Price Negotiation' },
                                        { value: 'negotiable', label: 'Negotiation' },
                                        { value: 'fixed', label: 'Fixed' },
                                        { value: 'variable', label: 'Variable' },
                                      ].find(option => option.value === field.value)}
                                      placeholder="Select PBL Price Negotiation"
                                      className="basic-single"
                                      classNamePrefix="select"
                                    />
                                  )}
                                />
                              </div>

                              <div className="mb-2">
                                <label className="text-base font-medium" htmlFor="customer-name">
                                  PBL Partner Code
                                </label>
                                <Input
                                  id="pbl_partner_code"
                                  name="pbl_partner_code"
                                  placeholder="Enter PBL Partner Code"
                                  {...register("pbl_partner_code")}
                                  onKeyDown={onlyDecimalInput}
                                />
                              </div>


                              {
                                user && (user.user_mode === 'pbl' || user.user_mode === 'admin' || user.user_mode === 'supreme') && (
                                  <>
                                    <div className="mb-2">
                                      <label className="text-base font-medium" htmlFor="customer-name">
                                        Priority
                                      </label>
                                      <Input
                                        id="v_priority"
                                        name="v_priority"
                                        placeholder="Select Priority"
                                        {...register("v_priority")}
                                        onKeyDown={onlyNumberInput}
                                      />
                                      {errors.v_priority && (
                                        <p className="text-red-500 text-sm">{errors.v_priority.message}</p>
                                      )}
                                    </div>
                                  </>
                                )
                              }

                            </div>
                          </div>
                        )
                      }
                    </>
                  )}






                  {showAdditionalFields && (
                    <>
                      <div className="border border-gray-300 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Package
                            </label>
                            <Controller
                              name="v_edition_id"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={packageData}
                                  onChange={(selectedOption) => {
                                    field.onChange(selectedOption ? selectedOption.value : '');
                                    handlePackageClick(selectedOption ? selectedOption.value : '');
                                  }}
                                  value={packageData.find(option => option.value === field.value)}
                                  placeholder={isPackageLoading ? "Loading..." : "Select Package"}
                                  isDisabled={isPackageLoading}
                                  className="basic-single"
                                  classNamePrefix="select"
                                />
                              )}
                            />
                          </div>

                          <div>
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Condition
                            </label>
                            <Controller
                              name="v_condition_id"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={conditionData}
                                  onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                  value={conditionData.find(option => option.value === field.value)}
                                  placeholder="Select Condition"
                                  className="basic-single"
                                  classNamePrefix="select"
                                />
                              )}
                            />
                          </div>

                          <div>
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Model Year
                            </label>
                            <Controller
                              name="v_mod_year"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={years.map(year => ({ value: year, label: year }))}
                                  onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                  value={years.find(year => year === field.value) ? { value: field.value, label: field.value } : null}
                                  placeholder="Select Model Year"
                                  className="basic-single"
                                  classNamePrefix="select"
                                />
                              )}
                            />
                          </div>

                          <div>
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Registration Year
                            </label>
                            <Controller
                              name="v_registration"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={years.map(year => ({ value: year, label: year }))}
                                  onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                  value={years.find(year => year === field.value) ? { value: field.value, label: field.value } : null}
                                  placeholder="Select Registration Year"
                                  className="basic-single"
                                  classNamePrefix="select"
                                />
                              )}
                            />
                          </div>

                          <div>
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Point
                            </label>
                            <Controller
                              name="v_grade_id"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={gradeData}
                                  onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                  value={gradeData.find(option => option.value === field.value)}
                                  placeholder="Select Point"
                                  className="basic-single"
                                  classNamePrefix="select"
                                />
                              )}
                            />
                          </div>

                          <div>
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Exterior Grade
                            </label>
                            <Controller
                              name="v_ext_grade_id"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={exteriorGradeData}
                                  onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                  value={exteriorGradeData.find(option => option.value === field.value)}
                                  placeholder="Select Exterior Grade"
                                  className="basic-single"
                                  classNamePrefix="select"
                                />
                              )}
                            />
                          </div>

                          <div>
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Interior Grade
                            </label>
                            <Controller
                              name="v_int_grade_id"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={interiorGradeData}
                                  onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                  value={interiorGradeData.find(option => option.value === field.value)}
                                  placeholder="Select Interior Grade"
                                  className="basic-single"
                                  classNamePrefix="select"
                                />
                              )}
                            />
                          </div>

                          <div className="mb-2">
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Mileage
                            </label>
                            <Input
                              id="v_mileage"
                              name="v_mileage"
                              placeholder="Enter Mileage"
                              {...register("v_mileage")}
                              onKeyDown={onlyNumberInput}
                            />
                          </div>

                          <div>
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Color
                            </label>
                            <Controller
                              name="v_color_id"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={colorData}
                                  onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                  value={colorData.find(option => option.value === field.value)}
                                  placeholder="Select Color"
                                  className="basic-single"
                                  classNamePrefix="select"
                                />
                              )}
                            />
                          </div>

                          <div>
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Fuel
                            </label>
                            <Controller
                              name="v_fuel_id"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={fuelData}
                                  onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                  value={fuelData.find(option => option.value === field.value)}
                                  placeholder="Select Fuel"
                                  className="basic-single"
                                  classNamePrefix="select"
                                />
                              )}
                            />
                          </div>

                          <div>
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Transmission
                            </label>
                            <Controller
                              name="v_transmission_id"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={transmissionData}
                                  onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                  value={transmissionData.find(option => option.value === field.value)}
                                  placeholder="Select Transmission"
                                  className="basic-single"
                                  classNamePrefix="select"
                                />
                              )}
                            />
                          </div>

                          <div className="mb-2">
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Capacity (CC)
                            </label>
                            <Input
                              id="v_capacity"
                              name="v_capacity"
                              placeholder="Enter Capacity (CC)"
                              {...register("v_capacity")}
                              onKeyDown={onlyDecimalInput}
                            />
                          </div>

                          <div>
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Body
                            </label>
                            <Controller
                              name="v_skeleton_id"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={skeletonData}
                                  onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                  value={skeletonData.find(option => option.value === field.value)}
                                  placeholder="Select Body"
                                  className="basic-single"
                                  classNamePrefix="select"
                                />
                              )}
                            />
                          </div>

                          <div>
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Seat
                            </label>
                            <Controller
                              name="v_seat_id"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={seatData}
                                  onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                  value={seatData.find(option => option.value === field.value)}
                                  placeholder="Select Seat"
                                  className="basic-single"
                                  classNamePrefix="select"
                                />
                              )}
                            />
                          </div>

                          <div className="mb-2">
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Chassis No
                            </label>
                            <Input
                              id="v_chassis"
                              name="v_chassis"
                              placeholder="Enter Chassis No"
                              {...register("v_chassis")}
                            />
                          </div>

                          <div className="mb-2">
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Engine No
                            </label>
                            <Input
                              id="v_engine"
                              name="v_engine"
                              placeholder="Enter Engine No"
                              {...register("v_engine")}
                            />
                          </div>

                          <div>
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Tax Token Exp. Date
                            </label>
                            <input type="date" {...register("v_tax_token_exp_date")} className="outline-none py-2 px-3 rounded border w-full" />

                            {errors.v_tax_token_exp_date && (
                              <p className="text-red-500 text-sm">{errors.v_tax_token_exp_date.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Fitness Exp. Date
                            </label>
                            <input type="date" {...register("v_fitness_exp_date")} className="outline-none py-2 px-3 rounded border w-full" />
                            {errors.v_fitness_exp_date && (
                              <p className="text-red-500 text-sm">{errors.v_fitness_exp_date.message}</p>
                            )}
                          </div>


                          <div>
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Arrival Date
                            </label>

                            <input type="date" {...register("v_arrival_date")} className="outline-none py-2 px-3 rounded border w-full" />
                          </div>
                        </div>


                        {/* Outlet */}
                        <div className="grid grid-cols-4 gap-4 mb-4 mt-4">
                          <div>
                            <label className="text-base font-medium" htmlFor="v_availability_id">
                              Outlet List
                            </label>
                            <Controller
                              name="v_availability_id"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={
                                    isOutletLoading ? [{ value: "Loading...", label: "Loading..." }] :
                                      outletData
                                  }
                                  onChange={(selectedOption) => {
                                    field.onChange(selectedOption ? selectedOption.value : '');
                                    // fetchShopDetails(selectedOption ? selectedOption.value : '');
                                  }}
                                  value={outletData.find(option => option.value === field.value) || null}
                                  placeholder={selectedShopId ? "Select Outlet" : "Select Shop First"}
                                  isDisabled={!selectedShopId}
                                  className="basic-single"
                                  classNamePrefix="select"
                                />
                              )}
                            />
                          </div>
                          {/* shopData */}

                          <div>
                            <label className="text-base font-medium" htmlFor="v_country_id">
                              Country List
                            </label>
                            <Controller
                              name="v_country_id"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={countryData}
                                  onChange={(selectedOption) => {
                                    field.onChange(selectedOption ? selectedOption.value : '');
                                    fetchLocationDetails(selectedOption ? selectedOption.value : '');
                                    setValue('v_location_id', null);
                                  }}
                                  value={countryData.find(option => option.value === field.value)}
                                  placeholder="Select Country"
                                  className="basic-single"
                                  classNamePrefix="select"
                                />
                              )}
                            />
                          </div>

                          {/* locationData */}
                          <div>
                            <label className="text-base font-medium" htmlFor="v_location_id">
                              Location List
                            </label>
                            <Controller
                              name="v_location_id"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={
                                    isLocationLoading
                                      ? [{
                                        value: '',
                                        label: 'Loading...'
                                      }]
                                      : locationData
                                  }
                                  onChange={(selectedOption) => {
                                    field.onChange(selectedOption ? selectedOption.value : '');
                                  }}
                                  value={locationData.find(option => option.value === field.value) || null}
                                  placeholder={selectedCountryId ? "Select Location" : "Select Country First"}
                                  isDisabled={!selectedCountryId}
                                  className="basic-single"
                                  classNamePrefix="select"
                                />
                              )}
                            />
                          </div>

                          {/* v_availability_status */}
                          <div>
                            <label className="text-base font-medium" htmlFor="v_availability_status">
                              Availability Status
                            </label>
                            <Controller
                              name="v_availability_status"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  options={availabilityStatusData}
                                  onChange={(selectedOption) => {
                                    field.onChange(selectedOption ? selectedOption.value : '');
                                    // fetchLocationDetails(selectedOption ? selectedOption.value : '');
                                  }}
                                  value={availabilityStatusData.find(option => option.value === field.value)}
                                  placeholder="Select Status"
                                  className="basic-single"
                                  classNamePrefix="select"
                                />
                              )}
                            />
                          </div>





                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="v_video_user">
                              Video Link (User)
                            </label>
                            <Input
                              id="v_video_user"
                              name="v_video_user"
                              placeholder="User Video Link"
                              {...register("v_video_user")}
                            />
                          </div>


                          <div>
                            <label className="text-base font-medium" htmlFor="customer-name">
                              Google link (Pic)
                            </label>

                            <Input
                              id="v_video_gdocuser"
                              name="v_video_gdocuser"
                              placeholder="Enter Google Link"
                              {...register("v_video_gdocuser")}
                            />
                          </div>

                        </div>
                      </div>

                      {
                        ((user?.user_mode === 'supreme') || (user?.user_mode === 'admin') || (user?.user_mode === 'pbl')) && (
                          <div className="mt-4 border border-gray-900 rounded-lg p-4">

                            {/* --------------------------------- */}
                            <div className="mb-4 flex flex-row justify-center gap-2">
                              <h4 className="text-2xl font-bold text-gray-800 mb-1 border-b-2 border-gray-500">PBL Section</h4>
                            </div>

                            {/* Description section */}
                            <div className="mb-3 mt-4">
                              <h4 className="text-lg font-semibold text-gray-800 mb-1">Description (PB)</h4>
                              <div className="flex w-24 h-1">
                                <div className="w-2/3 bg-green-500"></div>
                                <div className="w-1/2 bg-gray-500/20"></div>
                              </div>
                            </div>

                            <div>
                              <textarea
                                id="v_description"
                                name="v_description"
                                placeholder="Description (PB)"
                                rows="6"
                                className="outline-none py-2 px-3 rounded border w-full"
                                {...register("v_description")}
                              ></textarea>
                              {errors.v_description && (
                                <p className="text-red-500 text-sm">{errors.v_description.message}</p>
                              )}
                            </div>

                            {/* Special Description section */}
                            <div className="mb-3 mt-4">
                              <h4 className="text-lg font-bold text-gray-800 mb-1">Special Description (PB)</h4>
                              <div className="flex w-40 h-1">
                                <div className="w-2/3 bg-green-500"></div>
                                <div className="w-1/2 bg-gray-500/20"></div>
                              </div>
                            </div>

                            <div>
                              <textarea
                                id="vm_description"
                                name="vm_description"
                                placeholder="Special Description"
                                rows="4"
                                className="outline-none py-2 px-3 rounded border w-full"
                                {...register("vm_description")}
                              ></textarea>
                              {errors.vm_description && (
                                <p className="text-red-500 text-sm">{errors.vm_description.message}</p>
                              )}
                            </div>

                            <div className="mb-2 w-[50%]">
                              <label className="text-base font-medium" htmlFor="customer-name">
                                Google link (Pic)
                              </label>

                              <Input
                                id="v_video_gdocpbl"
                                name="v_video_gdocpbl"
                                placeholder="Enter Google Link"
                                {...register("v_video_gdocpbl")}
                              />
                            </div>



                            <div className="mb-2 w-[50%]">
                              <label className="text-base font-medium" htmlFor="v_auction_type">
                                Auction Types
                              </label>
                              <Controller
                                name="v_auction_type"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    options={auctionType}
                                    onChange={(selectedOption) => {
                                      field.onChange(selectedOption ? selectedOption.value : '');
                                    }}
                                    value={auctionType.find(option => option.value === field.value) || null}
                                    placeholder="Select Auction Type"
                                    className="basic-single"
                                    classNamePrefix="select"
                                  />
                                )}
                              />
                            </div>


                            <div className="mb-2 w-[50%]">
                              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="v_video_pbl">
                                Video Link (PBL)
                              </label>
                              <Input
                                id="v_video_pbl"
                                name="v_video_pbl"
                                placeholder="PBL Video Link"
                                {...register("v_video_pbl")}
                              />
                            </div>

                          </div>
                        )
                      }



                      <div className="mt-4 mb-4">

                        <div className="flex items-center mt-4">

                          <input
                            type="checkbox"
                            id="terms"
                            name="terms"
                            className="mr-2"
                            disabled={user?.user_mode == 'member'}
                            {...register("v_is_saleBy_pbl")}
                          />
                          <label htmlFor="terms" className={`text-sm ${user?.user_mode == 'member' ? 'text-gray-400' : 'text-gray-600'}`}>
                            I am pilotbazar.com Partner. I Certify that this Product and Information is Authentic and According to Signed &nbsp;
                            <Link href="/terms-and-conditions" className="text-blue-500 hover:underline">
                              Terms and Conditions
                            </Link>. Please Sale My Product and Increase My Profit.
                          </label>
                        </div>


                        {/* <div className="flex items-center mt-4">

                          <input
                            type="checkbox"
                            id="partnership"
                            name="partnership"
                            className="mr-2"
                            disabled={user?.user_mode == 'partner' || user?.user_mode == 'user'}
                            {...register("v_to_be_partner")}
                          />
                          <label htmlFor="partnership" className={`text-sm ${(user?.user_mode == 'partner' || user?.user_mode == 'user') ? 'text-gray-400' : 'text-gray-600'}`}>
                            I Want to be a Partner of pilotbazar.com. Please Click the Checkbox and Submit to be Our Partner. If You Click the Checkbox pilotbazar.com team will Call You Soon. Or Call pilotbazar.com Hotline Number 01969444000 to be Our Partner. &nbsp;
                          </label>
                        </div> */}

                      </div>
                    </>
                  )}

                  <hr />

                  <div className="mt-3 flex justify-center gap-2 mt-4">

                    {/* {showAdditionalFields && (
                      <button
                        type="button"
                        onClick={() => setShowAdditionalFields(false)}
                        className="bg-gray-400 text-white px-6 py-2.5 rounded font-medium rounded-lg"
                      >
                        Previous
                      </button>
                    )} */}

                    {showAdditionalFields ? (
                      <button
                        type="submit"
                        className={`text-white px-6 py-2.5 font-medium rounded-lg ${isUpdate === 'processing' ? 'bg-blue-200' : 'bg-blue-600'
                          }`}
                        disabled={isUpdate === 'processing'}
                      >
                        {isUpdate === 'processing'
                          ? 'Your Request is Processing. Please Wait!'
                          : isUpdate === 'update'
                            ? 'Save'
                            : 'Insert'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="bg-blue-600 text-white px-6 py-2.5 font-medium rounded-lg"
                      >
                        Save & Next
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

          </div>
        )}

        {/* Product Feature Specification Modal */}
        <ProductFeatureSpecificationModal
          open={featureModalShow}
          setFeatureModalShow={setFeatureModalShow}
          formData={formData}
          setFormData={setFormData}
          featureData={featureData}
          setSelectedFsId={setSelectedFsId}
          user={user}
        />
      </div>
    </>
  );
};

export default Vehicle;
