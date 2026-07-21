"use client";
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Loading from '@/components/Loading';
import PblHistoryPanel from '@/components/PblHistoryPanel';
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import VehicleService from "@/services/VehicleService";
import ShopService from "@/services/ShopService";
import UserService from "@/services/UserService";
import constData from "@/lib/constant";
import { formatPermissions, onlyDecimalInput, onlyNumberInput } from "@/helpers/functions";
import { hasPermission } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";
import MasterDataService from "@/services/MasterDataService";
import PackageService from "@/services/PackageService";
import GiftService from "@/services/GiftService";
import VehicleModelService from "@/services/VehicleModelService";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import ProductFeatureSpecificationModal from "./modals/ProductFeatureSpecificationModal";
import dynamic from 'next/dynamic';
import OutletService from "@/services/OutletService";
import LocationService from "@/services/LocationService";
import VehiclePricingSection from "@/components/pricing/VehiclePricingSection";
import CategoryService from "@/services/CategoryService";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";

import { parseStoredUser } from "@/lib/parseStoredUser";
const Select = dynamic(() => import('react-select'), { ssr: false });

// Yup Validation Schema
const schema = yup.object().shape({
    v_product_type_id: yup.string().required("Product Type is Required"),
    category: yup.string().required("Category is Required"),
    v_title: yup.string().required("Title is Required"),
    v_brand_id: yup.string().required("Brand is Required"),
    v_model_id: yup.string().required("Model is Required"),

    v_shop_id: yup.string().required("Shop is Required"),
    // v_code: yup.string().required("Code is Required")
});

const MAX_ADDITIONAL_IMAGES = 12;

const deliveryConditionOptions = [
    { value: "Japan Condition", label: "Japan Condition" },
    { value: "Shipment Condition", label: "Shipment Condition" },
    { value: "As it is Port Delivery", label: "As it is Port Delivery" },
    { value: "Port Condition", label: "Port Condition" },
    { value: "Showroom Condition", label: "Showroom Condition" },
    { value: "Auction Sheet Condition", label: "Auction Sheet Condition" },
];

const auctionTypeOptions = [
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
];

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

const UpdateProductForm = ({ productId }) => {
    const [loading, setLoading] = useState(false);
    const [frontImageFile, setFrontImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [additionalImages, setAdditionalImages] = useState([]); // store File objects
    const [additionalPreviews, setAdditionalPreviews] = useState([]); // for UI previews
    const [additionalImagePublicIds, setAdditionalImagePublicIds] = useState([]); // public_id per preview, null for unsaved local files
    const [additionalDocumentFiles, setAdditionalDocumentFiles] = useState([]); // store File objects
    const [additionalDocumentPreviews, setAdditionalDocumentPreviews] = useState([]); // for UI previews
    const [additionalDocumentPublicIds, setAdditionalDocumentPublicIds] = useState([]); // public_id per preview, null for unsaved local files
    const [secretDocumentFiles, setSecretDocumentFiles] = useState([]); // store File objects
    const [secretDocumentPreviews, setSecretDocumentPreviews] = useState([]); // for UI previews
    const [secretDocumentPublicIds, setSecretDocumentPublicIds] = useState([]); // public_id per preview, null for unsaved local files

    const [shopData, setShopData] = useState([]);
    const [partnerData, setPartnerData] = useState([]);
    const [brandData, setBrandData] = useState([]);
    const [colorData, setColorData] = useState([]);
    const [conditionData, setConditionData] = useState([]);
    const [packageData, setPackageData] = useState([]);
    const [giftData, setGiftData] = useState([]);
    const [isGiftLoading, setIsGiftLoading] = useState(false);
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
    const [isMasterDataReady, setIsMasterDataReady] = useState(false);
    const [removeAdditionalImage, setRemoveAdditionalImage] = useState([]);
    const [removeAdditionalDocument, setRemoveAdditionalDocument] = useState([]);
    const [removeSecretDocument, setRemoveSecretDocument] = useState([]);
    const [fontImageError, setFontImageError] = useState(false);
    const [selectedFsId, setSelectedFsId] = useState([]);
    const [isPblAdditionalDropdownOpen, setIsPblAdditionalDropdownOpen] = useState(false);
    const [selectedPblAdditionalOption, setSelectedPblAdditionalOption] = useState('');
    const [isPblAskingDropdownOpen, setIsPblAskingDropdownOpen] = useState(false);
    const [selectedPblAskingOption, setSelectedPblAskingOption] = useState('');
    const [masterCategoryItems, setMasterCategoryItems] = useState([]);
    const [categoryItems, setCategoryItems] = useState([]);
    const [categoryHistory, setCategoryHistory] = useState([]);
    const [selectedCategoryLabel, setSelectedCategoryLabel] = useState("");
    const [isCategoryLoading, setIsCategoryLoading] = useState(false);
    const [isCategoryListVisible, setIsCategoryListVisible] = useState(false);
    const categoryDropdownRef = useRef(null);
    const [user, setUser] = useState(null);
    const [sellerInfoRows, setSellerInfoRows] = useState([{ name: "", phone: "" }]);
    const [moreInformation, setMoreInformation] = useState([{ id: "more-info-0", key: "", value: "" }]);
    const { permissionList } = useAppContext();

    const handleSellerInfoChange = (index, field, value) => {
        setSellerInfoRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
    };

    const handleAddSellerInfoRow = () => {
        setSellerInfoRows((prev) => [...prev, { name: "", phone: "" }]);
    };

    const handleRemoveSellerInfoRow = (index) => {
        setSellerInfoRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
    };

    const setMoreInformationRow = (id, patch) => {
        setMoreInformation((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    };

    const addMoreInformationRow = () => {
        setMoreInformation((current) => [...current, { id: `more-info-${Date.now()}-${current.length}`, key: "", value: "" }]);
    };

    const removeMoreInformationRow = (id) => {
        setMoreInformation((current) => {
            const nextRows = current.filter((row) => row.id !== id);
            return nextRows.length ? nextRows : [{ id: "more-info-0", key: "", value: "" }];
        });
    };

    const canShowSellerMobileToggle = (targetUser = user) => {
        if (!targetUser) return false;
        const targetPermissions = permissionList?.length
            ? permissionList
            : formatPermissions(targetUser?.permissions ?? []);
        const userMode = String(targetUser?.user_mode ?? "").toLowerCase();

        return userMode === "supreme" || hasPermission(targetPermissions, 0, "Vehicle", "Edit");
    };
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

    const [isOutletLoading, setIsOutletLoading] = useState(false);
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    const [outletData, setOutletData] = useState([]);


    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
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
        },
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
    const additionalImageSlotsLeft = Math.max(
        MAX_ADDITIONAL_IMAGES - additionalPreviews.length,
        0
    );
    const isAdditionalImageLimitReached = additionalImageSlotsLeft === 0;

    // Fetch outlet data when shop changes
    useEffect(() => {
        const fetchOutletDetails = async (shopId) => {
            if (!shopId) {
                setOutletData([]);
                return;
            }
            try {
                // Replace with your actual OutletService import and method
                // const response = await import('@/services/OutletService').then(m => m.default.Queries.getOutletByShopId({ _shop_id: shopId }));

                const response = await OutletService.Queries.getOutletByShopId({
                    _page: 1,
                    _perPage: 1000,
                    _shop_id: shopId,
                });
                if (response?.status === 'success') {
                    const outletOptions = response?.data?.data.map((outlet) => ({
                        value: outlet.uo_id,
                        label: outlet.uo_name,
                    }));
                    setOutletData(outletOptions);
                } else {
                    setOutletData([]);
                }
            } catch (error) {
                setOutletData([]);
            }
        };
        fetchOutletDetails(selectedShopId);
    }, [selectedShopId]);

    // Fetch location data when country changes
    useEffect(() => {
        const fetchLocationDetails = async (countryId) => {

            if (!countryId) {
                setLocationData([]);
                return;
            }
            try {
                // Replace with your actual MasterDataService import and method
                // const response = await import('@/services/MasterDataService').then(m => m.default.Queries.getLocationByCountryId({ _country_id: countryId }));
                const response = await LocationService.Queries.getLocationByCountryId({
                    _country_id: countryId,
                    _page: 1,
                    _perPage: 1000,
                });

                if (response?.status === 'Success') {
                    const locationOptions = response?.data?.data.map((location) => ({
                        value: location.l_id,
                        label: location.l_name,
                    }));
                    setLocationData(locationOptions);
                } else {
                    setLocationData([]);
                }
            } catch (error) {
                setLocationData([]);
            }
        };
        fetchLocationDetails(selectedCountryId);
    }, [selectedCountryId]);

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

    //get package by modelId
    useEffect(() => {
        if (selectedModelId && isMasterDataReady) {
            fetchPackageData(selectedModelId);
        }
    }, [selectedModelId, isMasterDataReady]);

    //get model by brandId
    useEffect(() => {
        if (selectedBrandId && isMasterDataReady) {
            fetchModelData(selectedBrandId);
        }
    }, [selectedBrandId, isMasterDataReady]);


    //get code by shopId
    // useEffect(() => {
    //     if (selectedShopId && isMasterDataReady) {
    //         fetchShopDetails(selectedShopId);
    //     }
    // }, [selectedShopId, isMasterDataReady]);

    useEffect(() => {
        if (productId && isMasterDataReady) {
            fetchProductDetails();
        }
    }, [productId, isMasterDataReady]);

    useEffect(() => {
        if (selectedProductTypeId !== "1") {
            setValue("v_product_type_id", "1", { shouldValidate: true });
            setCategoryHistory([]);
            setSelectedCategoryLabel("");
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


    useEffect(() => {
        const userInfo = parseStoredUser(localStorage.getItem("user"));
        if (userInfo) {
            setUser(userInfo);
        }
    }, []);



    //  console.log("user---------------------------------------", user)

    const fetchModelData = async (selectedBrandId) => {
        if (selectedBrandId) {
            setIsModelLoading(true);
            setModelData([]);
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

    // fetchPackageData
    const fetchPackageData = async (selectedModelId) => {
        if (selectedModelId) {
            setIsPackageLoading(true);
            // setPackageData([]);
            // setValue("v_edition_id", "");
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



    const fetchShopDetails = async (shopId) => {
        try {
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
        } catch (error) {
            console.log("Error fetching shop details:", error);
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
        setSelectedCategoryLabel(category.c_name || "");
        setCategoryHistory((prev) => [...prev, category]);
        fetchCategories(category.c_id);
        setIsCategoryListVisible(false);
    };

    const handleCategoryBack = () => {
        if (categoryHistory.length === 0) return;

        const newHistory = [...categoryHistory];
        newHistory.pop();
        const parentCategory = newHistory[newHistory.length - 1];

        setValue("category", parentCategory ? String(parentCategory.c_id) : "", { shouldValidate: true });
        setCategoryHistory(newHistory);
        setSelectedCategoryLabel(parentCategory ? parentCategory.c_name : "");

        const parentId = parentCategory ? parentCategory.c_id : selectedProductTypeId;
        if (parentId) {
            fetchCategories(parentId);
        } else {
            setCategoryItems([]);
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
        const files = Array.from(e.target.files || []);
        const remainingSlots = MAX_ADDITIONAL_IMAGES - additionalPreviews.length;

        if (files.length === 0) {
            return;
        }

        if (remainingSlots <= 0) {
            toast.error(`Maximum ${MAX_ADDITIONAL_IMAGES} additional images allowed.`);
            e.target.value = "";
            return;
        }

        if (files.length > remainingSlots) {
            toast.error(
                `You can add only ${remainingSlots} more additional image${remainingSlots > 1 ? "s" : ""}. Maximum total is ${MAX_ADDITIONAL_IMAGES}.`
            );
        }

        const filesToAdd = files.slice(0, remainingSlots);
        const previews = filesToAdd.map((file) => URL.createObjectURL(file));

        setAdditionalImages((prev) => [...prev, ...filesToAdd]);
        setAdditionalPreviews((prev) => [...prev, ...previews]);
        setAdditionalImagePublicIds((prev) => [...prev, ...filesToAdd.map(() => null)]);
        e.target.value = "";
    };

    const handleDeleteAdditionalImage = (url, index) => {

        const isNewImage = typeof url === "string" && url.startsWith("blob:");
        const publicId = additionalImagePublicIds[index];

        if (publicId && !removeAdditionalImage.includes(publicId)) {
            setRemoveAdditionalImage(prev => [...prev, publicId]);
        }

        if (isNewImage) {
            const newImageIndex = additionalPreviews
                .slice(0, index)
                .filter((previewUrl) => typeof previewUrl === "string" && previewUrl.startsWith("blob:"))
                .length;

            URL.revokeObjectURL(url);
            setAdditionalImages((prev) => prev.filter((_, i) => i !== newImageIndex));
        }

        setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
        setAdditionalImagePublicIds((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAdditionalDocumentFileChange = (e) => {
        const files = Array.from(e.target.files);
        const totalAllowed = 12;
        const remainingSlots = totalAllowed - additionalDocumentPreviews.length;

        if (remainingSlots <= 0) return;

        const filesToAdd = files.slice(0, remainingSlots);
        const previews = filesToAdd.map((file) => URL.createObjectURL(file));

        setAdditionalDocumentFiles((prev) => [...prev, ...filesToAdd]);
        setAdditionalDocumentPreviews((prev) => [...prev, ...previews]);
        setAdditionalDocumentPublicIds((prev) => [...prev, ...filesToAdd.map(() => null)]);
        e.target.value = "";
    };

    const handleDeleteAdditionalDocument = (url, index) => {
        const isNewDocument = typeof url === "string" && url.startsWith("blob:");
        const publicId = additionalDocumentPublicIds[index];

        if (publicId && !removeAdditionalDocument.includes(publicId)) {
            setRemoveAdditionalDocument(prev => [...prev, publicId]);
        }

        if (isNewDocument) {
            const newDocumentIndex = additionalDocumentPreviews
                .slice(0, index)
                .filter((previewUrl) => typeof previewUrl === "string" && previewUrl.startsWith("blob:"))
                .length;

            URL.revokeObjectURL(url);
            setAdditionalDocumentFiles((prev) => prev.filter((_, i) => i !== newDocumentIndex));
        }

        setAdditionalDocumentPreviews((prev) => prev.filter((_, i) => i !== index));
        setAdditionalDocumentPublicIds((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSecretDocumentFileChange = (e) => {
        const files = Array.from(e.target.files);
        const totalAllowed = 12;
        const remainingSlots = totalAllowed - secretDocumentPreviews.length;

        if (remainingSlots <= 0) return;

        const filesToAdd = files.slice(0, remainingSlots);
        const previews = filesToAdd.map((file) => URL.createObjectURL(file));

        setSecretDocumentFiles((prev) => [...prev, ...filesToAdd]);
        setSecretDocumentPreviews((prev) => [...prev, ...previews]);
        setSecretDocumentPublicIds((prev) => [...prev, ...filesToAdd.map(() => null)]);
        e.target.value = "";
    };

    const handleDeleteSecretDocument = (url, index) => {
        const isNewDocument = typeof url === "string" && url.startsWith("blob:");
        const publicId = secretDocumentPublicIds[index];

        if (publicId && !removeSecretDocument.includes(publicId)) {
            setRemoveSecretDocument(prev => [...prev, publicId]);
        }

        if (isNewDocument) {
            const newDocumentIndex = secretDocumentPreviews
                .slice(0, index)
                .filter((previewUrl) => typeof previewUrl === "string" && previewUrl.startsWith("blob:"))
                .length;

            URL.revokeObjectURL(url);
            setSecretDocumentFiles((prev) => prev.filter((_, i) => i !== newDocumentIndex));
        }

        setSecretDocumentPreviews((prev) => prev.filter((_, i) => i !== index));
        setSecretDocumentPublicIds((prev) => prev.filter((_, i) => i !== index));
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

    const getShopData = async () => {
        try {
            const user = parseStoredUser(localStorage.getItem("user"));

            // console.log("user", user?.user_mode);

            const response = await ShopService.Queries.getShops({
                order: "desc",
                orderBy: "md_id",
                ...(user?.user_mode !== "admin" && { _user_id: user?.id }),
                _page: 1,
                _perPage: 1000
            });

            const shopOptions = response.data.data.map((shop) => ({
                value: shop?.s_id,
                label: shop?.s_title,
                phone: shop?.user?.phone || shop?.s_user_phone || "",
                s_user_id: shop?.s_user_id,
                s_id: shop?.s_id,
                shop_name: "my-shop",
            }));

            setShopData(shopOptions);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch data");
        }
    };

    const getPartnerData = async () => {
        try {
            const params = {
                order: "desc",
                orderBy: "md_id",
                _page: 1,
                _perPage: 1000,
                _mode: "partner",
                _status: "active",
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

    const getBrandData = async () => {
        try {
            const brand_code = constData.BRAND_MD_CODE;
            const response = await MasterDataService.Queries.getMasterDataByTypeCode(brand_code);

            const brandMasterData = response.data?.master_data;
            const brandData = brandMasterData.map((brand) => ({
                value: brand.md_id,
                label: brand.md_title,
                _page: 1,
                _perPage: 1000
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


    const getSkeletonData = async () => {
        try {
            const skeleton_code = constData.SKELETON_MD_CODE;
            const response = await MasterDataService.Queries.getMasterDataByTypeCode(skeleton_code);

            const skeletonMasterData = response.data?.master_data;
            const skeletonData = skeletonMasterData.map((skeleton) => ({
                value: skeleton.md_id,
                label: skeleton.md_title,
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

    const getExteriorData = async () => {
        try {
            const exterior_grade_code = constData.EXTERIOR_GRADE_MD_CODE;
            const response = await MasterDataService.Queries.getMasterDataByTypeCode(exterior_grade_code);

            const gradeMasterData = response.data?.master_data;
            const exteriorGradeData = gradeMasterData.map((grade) => ({
                value: grade.md_id,
                label: grade.md_title,
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

    const [isModelLoading, setIsModelLoading] = useState(false);
    const [isPackageLoading, setIsPackageLoading] = useState(false);

    const getFuelData = async () => {
        try {
            const fuel_code = constData.FUEL_MD_CODE;
            const response = await MasterDataService.Queries.getMasterDataByTypeCode(fuel_code);

            const fuelMasterData = response.data?.master_data;
            const fuelData = fuelMasterData.map((model) => ({
                value: model.md_id,
                label: model.md_title,
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

    //Fetch and Populate Data
    const fetchProductDetails = async () => {
        try {
            const res = await VehicleService.Queries.getVehicleDetailById(productId);
            if (res.status === 'success') {
                const data = res.data;

                // Set brand and model IDs
                const brandId = data.v_brand_id;
                const modelId = data.v_model_id;
                const editionId = data.v_edition_id;

                // Populate form fields
                setValue('v_title', data.v_title);
                setValue('v_brand_id', brandId);
                setValue('v_product_type_id', "1");

                const rawCategoryId = data?.v_category_id || data?.v_category?.c_id || "";
                const rawCategoryName = data?.v_category?.c_name || "";
                const rawCategoryParentId = data?.v_category?.c_parent_id;
                const isRootCategory =
                    String(rawCategoryId) === "1" ||
                    Number(rawCategoryParentId) === 0;
                const hasValidCategory = !!rawCategoryId && !isRootCategory;

                setValue('category', hasValidCategory ? String(rawCategoryId) : "");
                setSelectedCategoryLabel(hasValidCategory && rawCategoryName ? String(rawCategoryName) : "");
                setCategoryHistory([]);

                // Populate fields instantly
                setValue('v_brand_id', brandId);
                setValue('v_model_id', modelId);
                setValue('v_edition_id', editionId);
                setValue('v_user_gift', data.v_user_gift || '');
                setValue('v_pbl_gift', data.v_pbl_gift || '');

                // === Fetch Models ===
                if (brandId) {
                    setIsModelLoading(true);
                    try {
                        const modelResponse = await VehicleModelService.Queries.getModelsByBrand({
                            _brand_id: brandId,
                            _page: 1,
                            _perPage: 1000,
                        });


                        const fetchedModelData = modelResponse.data?.data.map((model) => ({
                            value: model.vm_id,
                            label: model.vm_name,
                        }));

                        setModelData(fetchedModelData);

                        const isValidModel = fetchedModelData.some(item => Number(item.value) === Number(modelId));

                        if (isValidModel) {
                            setTimeout(() => {
                                setValue('v_model_id', modelId);
                            }, 50);
                        }
                    } catch (error) {
                        toast.error("Failed to fetch models");
                    } finally {
                        setIsModelLoading(false);
                    }
                }

                // === Fetch Packages ===
                if (modelId) {
                    setIsPackageLoading(true);
                    try {
                        const packageResponse = await PackageService.Queries.getPackageById({
                            _model_id: modelId,
                            _page: 1,
                            _perPage: 1000,
                        });

                        const fetchedPackageData = packageResponse.data?.data.map((edition) => ({
                            value: edition.p_id,
                            label: edition.p_name,
                        }));

                        setPackageData(fetchedPackageData);

                        const isValidEdition = fetchedPackageData.some(item => Number(item.value) === Number(editionId));
                        if (isValidEdition) {
                            setTimeout(() => {
                                setValue('v_edition_id', editionId);
                            }, 50);
                        }
                    } catch (error) {
                        toast.error("Failed to fetch packages");
                    } finally {
                        setIsPackageLoading(false);
                    }
                }

                const vehicleImgArr = [];
                const vehicleImgPublicIds = [];
                if (data?.vehicle_images?.length > 0) {
                    data.vehicle_images.forEach((img) => {
                        if (img.url !== "") {
                            vehicleImgArr.push(img.url);
                            vehicleImgPublicIds.push(img?.public_id || null);
                        }
                    });
                }

                const vehicleDocArr = [];
                const vehicleDocPublicIds = [];
                if (data?.v_docs?.length > 0) {
                    data.v_docs.forEach((doc) => {
                        if (doc?.url) {
                            vehicleDocArr.push(doc.url);
                            vehicleDocPublicIds.push(doc?.public_id || null);
                        }
                    });
                }

                const vehicleSecretDocArr = [];
                const vehicleSecretDocPublicIds = [];
                if (data?.v_secret_docs?.length > 0) {
                    data.v_secret_docs.forEach((doc) => {
                        if (doc?.url) {
                            vehicleSecretDocArr.push(doc.url);
                            vehicleSecretDocPublicIds.push(doc?.public_id || null);
                        }
                    });
                }

                setAdditionalPreviews(vehicleImgArr);
                setAdditionalImagePublicIds(vehicleImgPublicIds);
                setAdditionalDocumentPreviews(vehicleDocArr);
                setAdditionalDocumentPublicIds(vehicleDocPublicIds);
                setSecretDocumentPreviews(vehicleSecretDocArr);
                setSecretDocumentPublicIds(vehicleSecretDocPublicIds);
                setPreview(data?.vehicle_front_image?.url);

                // Populate other form fields
                setValue('v_condition_id', data?.v_condition_id);
                setValue('v_mod_year', data?.v_mod_year);
                setValue('v_registration', data.v_registration);
                setValue('v_grade_id', data.v_grade_id);
                setValue('v_ext_grade_id', data?.v_ext_grade_id);
                setValue('v_int_grade_id', data.v_int_grade_id);
                setValue('v_mileage', data.v_mileage);
                setValue('v_color_id', data.v_color_id);
                setValue('v_fuel_id', data.v_fuel_id);
                setValue('v_transmission_id', data.v_transmission_id);
                setValue('v_capacity', data.v_capacity);
                setValue('v_skeleton_id', data.v_skeleton_id);
                setValue('v_seat_id', data.v_seat_id);
                setValue('v_chassis', data.v_chassis ? data?.v_chassis : '');
                setValue('v_engine', data?.v_engine ? data?.v_engine : '');

                if (data?.v_tax_token_exp_date) {
                    const rawDate = new Date(data.v_tax_token_exp_date);
                    const formatted = rawDate.toISOString().split("T")[0];
                    setValue("v_tax_token_exp_date", formatted);
                }

                if (data?.v_fitness_exp_date) {
                    const rawDate = new Date(data.v_fitness_exp_date);
                    const formatted = rawDate.toISOString().split("T")[0];
                    setValue("v_fitness_exp_date", formatted);
                }

                if (data?.v_arrival_date) {
                    const rawDate = new Date(data.v_arrival_date);
                    const formatted = rawDate.toISOString().split("T")[0];
                    setValue("v_arrival_date", formatted);
                } else {
                    setValue("v_arrival_date", "");
                }

                setValue('v_availability_id', data.v_availability_id);
                setValue('v_country_id', data?.v_location?.country_id);
                setValue('v_location_id', data?.v_location?.location_id);
                setValue(
                    'v_availability_status',
                    (data?.v_availability_status && data.v_availability_status !== 'undefined')
                        ? data.v_availability_status
                        : 'available'
                );
                setValue('v_auction_type', data?.v_auction_type || '');
                const currentShop = shopData.find((shop) => String(shop.value) === String(data.v_shop_id));
                const partnerId =
                    data?.v_user_id ||
                    data?.v_shop?.s_user_id ||
                    data?.shop?.s_user_id ||
                    data?.shop?.user_id ||
                    data?.v_shop_user_id ||
                    currentShop?.s_user_id;

                if (partnerId) {
                    setValue('v_partner_id', partnerId);
                }

                const currentShopLabel =
                    data?.v_shop?.s_title ||
                    data?.shop?.s_title ||
                    data?.v_shop_name ||
                    currentShop?.label;

                if (data.v_shop_id && currentShopLabel && !currentShop) {
                    setShopData((prevShopData) => [
                        ...prevShopData,
                        {
                            value: data.v_shop_id,
                            label: currentShopLabel,
                            phone: data?.v_shop?.user?.phone || data?.shop?.user?.phone || data?.v_shop_user_phone || "",
                            s_user_id: partnerId,
                            s_id: data.v_shop_id,
                        },
                    ]);
                }

                setValue('v_shop_id', data.v_shop_id);
                // setValue('v_code', data.v_code && String(data.v_code.split("-")[1]));
                setValue('v_priority', data.v_priority);
                setValue('vp_user_fixed_price', data?.vehicle_db_price?.vp_user_fixed_price);
                setValue('vp_user_asking_price', data?.vehicle_db_price?.vp_user_asking_price);
                setValue('vp_user_variable_price', data?.vehicle_db_price?.vp_user_variable_price);
                setValue('vp_show_price', data?.vehicle_db_price?.vp_show_price);
                setValue('vp_currency', data?.vehicle_db_price?.vp_currency || 'BDT');

                setValue('v_urgent_sale', data.v_urgent_sale == 1);
                setValue('vp_user_price_status', data?.vehicle_db_price?.vp_user_price_status);
                setValue('vp_user_purchase_price', data?.vehicle_price?.v_purchase_price);
                setValue('vp_pbl_additional_amount', data?.vehicle_db_price?.vp_pbl_additional_amount);
                setValue('vp_pbl_price_status', data?.vehicle_price?.v_pbl_price_status);
                setValue('vp_pbl_asking_price', data?.vehicle_db_price?.vp_pbl_asking_price);
                setValue('vp_user_costing_price', data?.vehicle_db_price?.vp_user_costing_price);
                setValue('vp_user_to_pbl_price', data?.vehicle_db_price?.vp_user_to_pbl_price);
                setValue('vp_conv_rate', data?.vehicle_db_price?.vp_conv_rate ? String(data.vehicle_db_price.vp_conv_rate) : '1');
                setValue('vp_bd_tax', data?.vehicle_db_price?.vp_bd_tax ? String(data.vehicle_db_price.vp_bd_tax) : '');

                const otherCosts = Array.isArray(data?.vehicle_db_price?.vp_other_cost)
                    ? data.vehicle_db_price.vp_other_cost
                    : [];
                setValue(
                    'vp_other_cost',
                    otherCosts.length > 0
                        ? otherCosts.map((item) => ({
                            name: item?.name ? String(item.name) : '',
                            amount: item?.amount ? String(item.amount) : '',
                        }))
                        : [{ name: '', amount: '' }],
                );

                const purchaseCosts = Array.isArray(data?.vehicle_db_price?.vp_purchase_cost)
                    ? data.vehicle_db_price.vp_purchase_cost
                    : [];
                setValue(
                    'vp_purchase_cost',
                    purchaseCosts.length > 0
                        ? purchaseCosts.map((item) => ({
                            name: item?.name ? String(item.name) : '',
                            amount: item?.amount ? String(item.amount) : '',
                        }))
                        : [{ name: '', amount: '' }],
                );

                setValue('pbl_partner_code', data.pbl_partner_code);
                setValue('v_pbl_partnership_expire_date', data.v_pbl_partnership_expire_date || '');
                setValue('v_description', data.v_description);
                setValue('v_user_description', data.v_user_description);
                setValue('vm_description', data?.v_metadata?.vm_description);
                setValue('v_pbl_text', data.v_pbl_text || '');
                setValue('v_delivery_condition', data.v_delivery_condition || '');
                setValue('v_secret_text', data.v_secret_text || '');
                setValue('v_secret_video_link', data.v_secret_video_link || '');
                const sellerInfoData = Array.isArray(data?.v_seller_info) ? data.v_seller_info : [];
                setSellerInfoRows(
                    sellerInfoData.length > 0
                        ? sellerInfoData.map((row) => ({ name: row?.name || '', phone: row?.phone || '' }))
                        : [{ name: '', phone: '' }]
                );
                const moreInfoData = Array.isArray(data?.v_more_information) ? data.v_more_information : [];
                setMoreInformation(
                    moreInfoData.length > 0
                        ? moreInfoData.map((row, index) => ({ id: `more-info-${index}`, key: row?.label || '', value: row?.value || '' }))
                        : [{ id: 'more-info-0', key: '', value: '' }]
                );
                const videoData = data?.v_video;
                const userVideo = (videoData && typeof videoData === 'object')
                    ? (videoData?.user ? String(videoData.user) : '')
                    : (videoData ? String(videoData) : '');
                const pblVideo = (videoData && typeof videoData === 'object')
                    ? (videoData?.pbl ? String(videoData.pbl) : '')
                    : '';
                const gdocVideo = (videoData && typeof videoData === 'object')
                    ? (videoData?.gdocpbl ? String(videoData.gdocpbl) : '')
                    : '';
                const gdocUserVideo = (videoData && typeof videoData === 'object')
                    ? (videoData?.gdocuser ? String(videoData.gdocuser) : '')
                    : '';
                setValue('v_video_user', userVideo);
                setValue('v_video_pbl', pblVideo);
                setValue('v_video_gdocpbl', gdocVideo);
                setValue('v_video_gdocuser', gdocUserVideo);
                setValue('v_is_saleBy_pbl', data.v_is_saleBy_pbl == 1);
                setValue('v_show_seller_mobile', Number(data.v_show_seller_mobile) === 1);
                // setValue('v_to_be_partner', data.v_to_be_partner == 1);
            }
        } catch (error) {
            console.log('Error fetching product by ID:', error);
        }
    };

    const [featureData, setFeatureData] = useState([]);
    const [featureModalShow, setFeatureModalShow] = useState(false);
    const [formData, setFormData] = useState({
        vsm_feature_id: 0,
        vsm_model_id: "",
        vsm_ve_id: "",
        vsm_fs_id: [],
    });

    const getFeatureData = async (id) => {
        if (id) {
            const response = await PackageService.Queries.getFeatureByPackage(id, productId);
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


    const handlePackageClick = async (id) => {
        setSelectedFsId([]);
        await getFeatureData(id);
        setFeatureModalShow(true);

    }

    const getGiftData = async () => {
        try {
            setIsGiftLoading(true);
            const response = await GiftService.Queries.getGifts({
                _page: 1,
                _perPage: 400,
                _status: 'active',
            });

            const gifts = response.data?.data || [];
            setGiftData(gifts.map((gift) => ({ value: gift.g_id, label: gift.g_title })));
        } catch (error) {
            if (error.errors) {
                Object.values(error.errors).forEach((e) => toast.error(e[0]));
            } else {
                toast.error(error.message || "Something went wrong");
            }
        } finally {
            setIsGiftLoading(false);
        }
    }


    // Load master data
    const loadAllMasterData = async () => {
        try {
            await Promise.all([
                getShopData(),
                getPartnerData(),
                getBrandData(),
                fetchMasterCategories(),
                getColorData(),
                getCountryData(),
                getConditionData(),
                getSkeletonData(),
                getTransmissionData(),
                getGradeData(),
                getExteriorData(),
                getInteriorData(),
                getFuelData(),
                getUserModeData(),
                getAvailabilityData(),
                getSeatData(),
                getGiftData(),
            ]);
            setIsMasterDataReady(true);
        } catch (error) {
            toast.error('Failed to load master data');
        }
    };

    useEffect(() => {
        loadAllMasterData();
    }, []);

    const onSubmit = async (data) => {

        if (!frontImageFile && preview == null) {
            setFontImageError(true);
            return;
        }

        if (additionalPreviews.length > MAX_ADDITIONAL_IMAGES) {
            toast.error(`Maximum ${MAX_ADDITIONAL_IMAGES} additional images allowed.`);
            return;
        }

        setFontImageError(false);

        setLoading(true);

        // ✅ Convert checkboxes  formData.append('v_edition_id', data.v_edition_id ? 1 : 0);
        data.v_urgent_sale = data.v_urgent_sale ? 1 : 0;
        data.v_is_saleBy_pbl = data.v_is_saleBy_pbl ? 1 : 0;
        data.v_show_seller_mobile = data.v_show_seller_mobile ? 1 : 0;
        // data.v_to_be_partner = data.v_to_be_partner ? 1 : 0;
        data.v_int_grade_id = data?.v_int_grade_id ? data?.v_int_grade_id : '';
        data.v_ext_grade_id = data?.v_ext_grade_id ? data?.v_ext_grade_id : '';
        data.v_condition_id = data.v_condition_id ? data?.v_condition_id : '';
        data.v_transmission_id = data.v_transmission_id ? data?.v_transmission_id : '';
        data.v_fuel_id = data.v_fuel_id ? data?.v_fuel_id : '';
        data.v_grade_id = data.v_grade_id ? data?.v_grade_id : '';
        data.v_skeleton_id = data.v_skeleton_id ? data?.v_skeleton_id : '';
        data.v_color_id = data.v_color_id ? data?.v_color_id : '';
        data.v_edition_id = data.v_edition_id ? data?.v_edition_id : '';

        data.v_location_id = data.v_location_id ? data?.v_location_id : '';
        data.v_availability_id = data.v_availability_id ? data?.v_availability_id : '';
        data.v_capacity = data.v_capacity ? data?.v_capacity : '';
        data.v_mileage = data.v_mileage ? data?.v_mileage : '';
        data.v_registration = data.v_registration ? data?.v_registration : '';
        data.v_mod_year = data.v_mod_year ? data?.v_mod_year : '';
        data.v_seat_id = data.v_seat_id ? data?.v_seat_id : '';
        data.vp_user_purchase_price = data.vp_user_purchase_price ? data?.vp_user_purchase_price : '';
        data.vp_user_asking_price = data.vp_user_asking_price ? data?.vp_user_asking_price : '';
        data.vp_user_fixed_price = data.vp_user_fixed_price ? data?.vp_user_fixed_price : '';
        data.vp_user_variable_price = data.vp_user_variable_price ? data?.vp_user_variable_price : '';
        data.vp_pbl_additional_amount = data.vp_pbl_additional_amount ? data?.vp_pbl_additional_amount : '';
        data.vp_pbl_price_status = data.vp_pbl_price_status ? data?.vp_pbl_price_status : '';
        data.vp_pbl_asking_price = data.vp_pbl_asking_price ? data?.vp_pbl_asking_price : '';
        data.vp_user_costing_price = data.vp_user_costing_price ? data?.vp_user_costing_price : '';
        data.vp_user_to_pbl_price = data.vp_user_to_pbl_price ? data?.vp_user_to_pbl_price : '';
        data.vp_conv_rate = data.vp_conv_rate ? String(data.vp_conv_rate) : '1';
        data.vp_bd_tax = data.vp_bd_tax ? String(data.vp_bd_tax) : '';
        data.vp_pbl_hs_asking_price = data.vp_pbl_hs_asking_price ? data?.vp_pbl_hs_asking_price : '';
        data.vp_pbl_hs_asking_price = data.vp_pbl_hs_asking_price ? data?.vp_pbl_hs_asking_price : '';
        data.v_priority = data.v_priority ? data?.v_priority : '';
        data.v_product_type_id = data.v_product_type_id ? data?.v_product_type_id : '1';
        data.category = data.category ? data?.category : '';
        data.v_shop_id = data.v_shop_id ? data?.v_shop_id : '';
        data.v_country_id = data.v_country_id ? data?.v_country_id : '';
        data.v_availability_status = (data.v_availability_status && data.v_availability_status !== 'undefined') ? data.v_availability_status : 'available';
        // data.v_code = data.v_code ? data?.v_code : '';
        data.v_description = data.v_description ? data?.v_description : '';
        data.v_user_description = data.v_user_description ? data?.v_user_description : '';
        data.vm_description = data.vm_description ? data?.vm_description : '';
        data.v_pbl_text = data.v_pbl_text ? data?.v_pbl_text : '';
        data.v_delivery_condition = data.v_delivery_condition ? data?.v_delivery_condition : '';
        data.v_video_user = data.v_video_user ? data?.v_video_user : '';
        data.v_video_pbl = data.v_video_pbl ? data?.v_video_pbl : '';
        data.v_video_gdocpbl = data.v_video_gdocpbl ? data?.v_video_gdocpbl : '';
        data.v_video_gdocuser = data.v_video_gdocuser ? data?.v_video_gdocuser : '';
        data.v_chassis = data.v_chassis ? data?.v_chassis : '';
        data.v_engine = data.v_engine ? data?.v_engine : '';
        data.v_tax_token_exp_date = data.v_tax_token_exp_date ? data?.v_tax_token_exp_date : '';
        data.v_fitness_exp_date = data.v_fitness_exp_date ? data?.v_fitness_exp_date : '';
        data.v_arrival_date = data.v_arrival_date ? data?.v_arrival_date : '';
        data.v_auction_type = data.v_auction_type ? data?.v_auction_type : '';
        data.pbl_partner_code = data.pbl_partner_code ? data?.pbl_partner_code : '';



        const formData = new FormData();

        // ✅ Append form fields
        for (let key in data) {
            if (key !== "vp_other_cost" && key !== "vp_purchase_cost" && key !== "v_video_user" && key !== "v_video_pbl" && key !== "v_video_gdocpbl" && key !== "v_video_gdocuser" && key !== "v_video" && key !== "v_product_type_id" && key !== "category" && key !== "v_partner_id") {
                appendFormValue(formData, key, data[key]);
            }
        }

        const sellerInfoPayload = sellerInfoRows.filter((row) => (row.name && row.name.trim()) || (row.phone && row.phone.trim()));
        appendFormValue(formData, "v_seller_info", JSON.stringify(sellerInfoPayload));

        formData.append("extended_data_clear", "1");
        moreInformation
            .map((item) => ({ key: String(item.key || "").trim(), value: String(item.value || "").trim() }))
            .filter((item) => item.key || item.value)
            .forEach((item) => {
                formData.append("ed_entity[]", "vehicle");
                formData.append("ed_entity_key[]", item.key);
                formData.append("ed_entity_value[]", item.value);
            });

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
        appendFormValue(formData, "v_vehicle_type_id", data.v_product_type_id ? data.v_product_type_id : "1");
        appendFormValue(formData, "v_type_id", data.v_product_type_id ? data.v_product_type_id : "1");
        appendFormValue(formData, "v_category_id", data.category ? data.category : "");

        // ✅ Append images
        if (frontImageFile) {
            appendFormValue(formData, "vi_front_image", frontImageFile);
        }

        additionalImages && additionalImages.forEach((file) => {
            formData.append("vi_image[]", file);
        });
        additionalDocumentFiles && additionalDocumentFiles.forEach((file, index) => {
            formData.append(`v_docs[${index}]`, file);
        });
        secretDocumentFiles && secretDocumentFiles.forEach((file, index) => {
            formData.append(`v_secret_docs[${index}]`, file);
        });

        if (removeAdditionalImage && removeAdditionalImage.length > 0) {
            removeAdditionalImage.forEach(img => {
                formData.append("v_remove_image[]", img);
            });
        }
        if (removeAdditionalDocument && removeAdditionalDocument.length > 0) {
            removeAdditionalDocument.forEach(doc => {
                formData.append("v_docs_remove[]", doc);
            });
        }
        if (removeSecretDocument && removeSecretDocument.length > 0) {
            removeSecretDocument.forEach((doc, index) => {
                formData.append(`v_secret_docs_remove[${index}]`, doc);
            });
        }

        selectedFsId.forEach((fsId) => {
            formData.append("v_fs[]", fsId);
        });

        // ✅ Append method override
        appendFormValue(formData, '_method', 'PUT');

        try {
            const response = await VehicleService.Commands.updateVehicle(productId, formData);

            if (response.status === 'success') {
                setAdditionalImages([]);
                setAdditionalDocumentFiles([]);
                setAdditionalDocumentPreviews([]);
                setSecretDocumentFiles([]);
                setSecretDocumentPreviews([]);
                setRemoveSecretDocument([]);
                setPreview(null);
                setLoading(false);
                toast.success("Vehicle updated successfully!");
                router.push("/dashboard/product-list/");
            }
        } catch (error) {
            setLoading(false);
            toast.error("Vehicle update failed!");
        }
    };

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
        if (!item?.value) {
            setShopData([]);
            setValue("v_shop_id", "");
            setValue("v_availability_id", null);
            return;
        }

        try {
            const params = {
                order: "desc",
                orderBy: "md_id",
                _page: 1,
                _perPage: 1000,
                _user_id: item.value,
            };

            const response = await ShopService.Queries.getShops(params);

            const shopOptions = response.data.data.map((shop) => ({
                value: shop?.s_id,
                label: shop?.s_title,
                phone: shop?.user?.phone || shop?.s_user_phone || "",
                s_user_id: shop?.s_user_id,
                s_id: shop?.s_id,
                shop_name: "partner-shop",
            }));

            setShopData(shopOptions);
            setValue("v_shop_id", "");
            setValue("v_availability_id", null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch data");
        }
    };

    return (
        <>
            <div className="flex-1 min-h-screen flex flex-col justify-between">
                {loading ? (
                    <Loading />
                ) : (
                    <div className="w-full md:p-10 p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-white shadow-sm rounded-lg mb-6 border border-gray-200">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    ✏️ Edit Vehicle
                                </h2>



                                <p className="text-sm text-gray-500 mt-1">
                                    Update existing vehicle details.
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

                        {/* <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Add Vehicle</h2>
            </div> */}

                        <div className="w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="p-4">
                                    <div className="border border-gray-300 rounded-lg p-4 mb-4">
                                        <div className="mb-3">
                                            <h4 className="text-sm font-semibold text-gray-800 mb-1">Product Info</h4>
                                            <div className="flex w-20 h-0.5">
                                                <div className="w-1/2 bg-green-500"></div>
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
                                                            {categoryHistory.length === 0 && (
                                                                selectedCategoryLabel
                                                                    ? selectedCategoryLabel
                                                                    : (selectedProductTypeId ? "Select a category..." : "Select Product Type first")
                                                            )}
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
                                                <select
                                                    id="v_brand_id"
                                                    name="v_brand_id"
                                                    className="outline-none py-2 px-3 rounded border w-full"
                                                    {...register("v_brand_id")}
                                                >
                                                    <option value="">Select Brand</option>
                                                    {
                                                        brandData.map((brand) => (
                                                            <option key={brand.value} value={brand.value}>
                                                                {brand.label}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                                {errors.v_brand_id && (
                                                    <p className="text-red-500 text-sm">{errors.v_brand_id.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="text-base font-medium" htmlFor="customer-name">
                                                    Model <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    id="v_model_id"
                                                    name="v_model_id"
                                                    className="outline-none py-2 px-3 rounded border w-full"
                                                    {...register("v_model_id")}
                                                    disabled={isModelLoading}
                                                >
                                                    <option value="">{isModelLoading ? 'Loading...' : 'Select Model'}</option>
                                                    {
                                                        modelData.map((model) => (
                                                            <option key={model.value} value={model.value}>
                                                                {model.label}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                                {errors.v_model_id && (
                                                    <p className="text-red-500 text-sm">{errors.v_model_id.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="text-base font-medium" htmlFor="customer-name">
                                                    Package
                                                    {/* <span className="text-red-500">*</span> */}
                                                </label>
                                                <select
                                                    id="v_edition_id"
                                                    name="v_edition_id"
                                                    className="outline-none py-2 px-3 rounded border w-full"
                                                    {...register("v_edition_id")}
                                                    onChange={(e) => handlePackageClick(e.target.value)}
                                                    disabled={isPackageLoading}
                                                >
                                                    <option value="">{isPackageLoading ? 'Loading...' : 'Select Package'}</option>
                                                    {
                                                        packageData.map((edition) => (
                                                            <option key={edition.value} value={edition.value}>
                                                                {edition.label}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                                {errors.v_edition_id && (
                                                    <p className="text-red-500 text-sm">{errors.v_edition_id.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="text-base font-medium" htmlFor="v_user_gift">
                                                    User Gift
                                                </label>
                                                <select
                                                    id="v_user_gift"
                                                    name="v_user_gift"
                                                    className="outline-none py-2 px-3 rounded border w-full"
                                                    {...register("v_user_gift")}
                                                    disabled={isGiftLoading}
                                                >
                                                    <option value="">{isGiftLoading ? 'Loading...' : 'Select gift from seller'}</option>
                                                    {
                                                        giftData.map((gift) => (
                                                            <option key={gift.value} value={gift.value}>
                                                                {gift.label}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-base font-medium" htmlFor="v_pbl_gift">
                                                    PBL Gift
                                                </label>
                                                <select
                                                    id="v_pbl_gift"
                                                    name="v_pbl_gift"
                                                    className="outline-none py-2 px-3 rounded border w-full"
                                                    {...register("v_pbl_gift")}
                                                    disabled={isGiftLoading}
                                                >
                                                    <option value="">{isGiftLoading ? 'Loading...' : 'Select PilotBazar gift'}</option>
                                                    {
                                                        giftData.map((gift) => (
                                                            <option key={gift.value} value={gift.value}>
                                                                {gift.label}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-base font-medium" htmlFor="customer-name">
                                                    Condition
                                                </label>
                                                <select
                                                    id="v_condition_id"
                                                    name="v_condition_id"
                                                    className="outline-none py-2 px-3 rounded border w-full"
                                                    {...register("v_condition_id")}
                                                >
                                                    <option value="">Select Condition</option>
                                                    {
                                                        conditionData.map((condition) => (
                                                            <option key={condition.value} value={condition.value}>
                                                                {condition.label}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                                {/* {errors.v_condition_id && (
                                                                <p className="text-red-500 text-sm">{errors.v_condition_id.message}</p>
                                                            )} */}
                                            </div>


                                            <div>
                                                <label className="text-base font-medium" htmlFor="customer-name">
                                                    Model Year
                                                </label>
                                                <select
                                                    id="v_mod_year"
                                                    name="v_mod_year"
                                                    className="outline-none py-2 px-3 rounded border w-full"
                                                    {...register("v_mod_year")}
                                                >
                                                    <option value="">Select Model Year</option>
                                                    {years.map((year) => (
                                                        <option key={year} value={year}>
                                                            {year}
                                                        </option>
                                                    ))}
                                                </select>
                                                {/* {errors.v_mod_year && (
                                                                <p className="text-red-500 text-sm">{errors.v_mod_year.message}</p>
                                                            )} */}
                                            </div>


                                            <div>
                                                <label className="text-base font-medium" htmlFor="customer-name">
                                                    Registration Year
                                                </label>
                                                <select
                                                    id="v_registration"
                                                    name="v_registration"
                                                    className="outline-none py-2 px-3 rounded border w-full"
                                                    {...register("v_registration")}
                                                >
                                                    <option value="" >Select Registration Year</option>
                                                    {years.map((year) => (
                                                        <option key={year} value={year}>
                                                            {year}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>


                                            <div>
                                                <label className="text-base font-medium" htmlFor="customer-name">
                                                    Point
                                                </label>
                                                <select
                                                    id="v_grade_id"
                                                    name="v_grade_id"
                                                    className="outline-none py-2 px-3 rounded border w-full"
                                                    {...register("v_grade_id")}
                                                >
                                                    <option value="">Select Point</option>
                                                    {
                                                        gradeData.map((grade) => (
                                                            <option key={grade.value} value={grade.value}>
                                                                {grade.label}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                                {/* {errors.v_grade_id && (
                                                                <p className="text-red-500 text-sm">{errors.v_grade_id.message}</p>
                                                            )} */}
                                            </div>


                                            <div>
                                                <label className="text-base font-medium" htmlFor="customer-name">
                                                    Exterior Grade
                                                </label>
                                                <select
                                                    id="v_ext_grade_id"
                                                    name="v_ext_grade_id"
                                                    className="outline-none py-2 px-3 rounded border w-full"
                                                    {...register("v_ext_grade_id")}
                                                >
                                                    <option value="">Select Exterior Grade</option>
                                                    {
                                                        exteriorGradeData.map((grade) => (
                                                            <option key={grade.value} value={grade.value}>
                                                                {grade.label}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                            </div>


                                            <div>
                                                <label className="text-base font-medium" htmlFor="customer-name">
                                                    Interior Grade
                                                </label>
                                                <select
                                                    id="v_int_grade_id"
                                                    name="v_int_grade_id"
                                                    className="outline-none py-2 px-3 rounded border w-full"
                                                    {...register("v_int_grade_id")}
                                                >
                                                    <option value="">Select Interior Grade</option>
                                                    {
                                                        interiorGradeData.map((grade) => (
                                                            <option key={grade.value} value={grade.value}>
                                                                {grade.label}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
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
                                                {/* {errors.v_color_id && (
                                                                <p className="text-red-500 text-sm">{errors.v_mileage.message}</p>
                                                            )} */}
                                            </div>

                                            <div className="mb-2">
                                                <label className="text-base font-medium" htmlFor="v_delivery_condition">
                                                    Delivery Condition
                                                </label>
                                                <Controller
                                                    name="v_delivery_condition"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            {...field}
                                                            options={deliveryConditionOptions}
                                                            onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                                            value={deliveryConditionOptions.find(option => option.value === field.value) || null}
                                                            placeholder="Select Delivery Condition"
                                                            className="basic-single"
                                                            classNamePrefix="select"
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <div>
                                                <label className="text-base font-medium" htmlFor="customer-name">
                                                    Color
                                                </label>
                                                <select
                                                    id="v_color_id"
                                                    name="v_color_id"
                                                    className="outline-none py-2 px-3 rounded border w-full"
                                                    {...register("v_color_id")}
                                                >
                                                    <option value="">Select Color</option>
                                                    {
                                                        colorData.map((color) => (
                                                            <option key={color.value} value={color.value}>
                                                                {color.label}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                                {/* {errors.v_color_id && (
                                                                <p className="text-red-500 text-sm">{errors.v_color_id.message}</p>
                                                            )} */}
                                            </div>







                                            <div>
                                                <label className="text-base font-medium" htmlFor="customer-name">
                                                    Fuel
                                                </label>
                                                <select
                                                    id="v_fuel_id"
                                                    name="v_fuel_id"
                                                    className="outline-none py-2 px-3 rounded border w-full"
                                                    {...register("v_fuel_id")}
                                                >
                                                    <option value="">Select Fuel</option>
                                                    {
                                                        fuelData.map((fuel) => (
                                                            <option key={fuel.value} value={fuel.value}>
                                                                {fuel.label}
                                                            </option>
                                                        ))
                                                    }0
                                                </select>
                                                {/* {errors.v_fuel_id && (
                                                                <p className="text-red-500 text-sm">{errors.v_fuel_id.message}</p>
                                                            )} */}
                                            </div>

                                            <div>
                                                <label className="text-base font-medium" htmlFor="customer-name">
                                                    Transmission
                                                </label>
                                                <select
                                                    id="v_transmission_id"
                                                    name="v_transmission_id"
                                                    className="outline-none py-2 px-3 rounded border w-full"
                                                    {...register("v_transmission_id")}
                                                >
                                                    {/* Option */}
                                                    <option value="">Select Transmission</option>
                                                    {
                                                        transmissionData.map((transmission) => (
                                                            <option key={transmission.value} value={transmission.value}>
                                                                {transmission.label}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
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
                                                <select
                                                    id="v_skeleton_id"
                                                    name="v_skeleton_id"
                                                    className="outline-none py-2 px-3 rounded border w-full"
                                                    {...register("v_skeleton_id")}
                                                >
                                                    <option value="">Select Body</option>
                                                    {
                                                        skeletonData.map((skeleton) => (
                                                            <option key={skeleton.value} value={skeleton.value}>
                                                                {skeleton.label}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                            </div>


                                            <div>
                                                <label className="text-base font-medium" htmlFor="customer-name">
                                                    Seat
                                                </label>
                                                <select
                                                    id="v_seat_id"
                                                    name="v_seat_id"
                                                    className="outline-none py-2 px-3 rounded border w-full"
                                                    {...register("v_seat_id")}
                                                >
                                                    <option value="">Select Seat</option>
                                                    {
                                                        seatData.map((seat) => (
                                                            <option key={seat.value} value={seat.value}>
                                                                {seat.label}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                                {/* {errors.v_seat_id && (
                                                                <p className="text-red-500 text-sm">{errors.v_seat_id.message}</p>
                                                            )} */}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-4 mb-4">
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
                                                {/* {errors.v_chassis && (
                                                            <p className="text-red-500 text-sm">{errors.v_chassis.message}</p>
                                                            )} */}
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
                                                <div>
                                                    <label className="text-base font-medium" htmlFor="customer-name">
                                                        Arrival Date to BD
                                                    </label>
                                                    <input type="date" {...register("v_arrival_date")} className="outline-none py-2 px-3 rounded border w-full" />
                                                </div>
                                            </div>

                                            <div>
                                                <div>
                                                    <label className="text-base font-medium" htmlFor="customer-name">
                                                         Google link (Pic)
                                                    </label>
                                                    {/* <input type="date" {...register("v_arrival_date")} className="outline-none py-2 px-3 rounded border w-full" /> */}
                                                    <Input
                                                        id="v_video_gdocuser"
                                                        name="v_video_gdocuser"
                                                        placeholder="Enter Google Link"
                                                        {...register("v_video_gdocuser")}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                       

                                        {/* <div className="grid grid-cols-2 gap-2 mt-4 mb-4">
                                            <div>
                                                <label className="text-base font-medium" htmlFor="customer-name">
                                                    Availability
                                                </label>
                                                <select
                                                    id="v_availability_id"
                                                    name="v_availability_id"
                                                    className="outline-none py-2 px-3 rounded border w-full"
                                                    {...register("v_availability_id")}
                                                >
                                                    <option value="">Availability</option>
                                                    {
                                                        availabilityData.map((availability) => (
                                                            <option key={availability.value} value={availability.value}>
                                                                {availability.label}
                                                            </option>
                                                        ))
                                                    }
                                                </select>

                                            </div>
                                        </div> */}
                                        <hr />

                                        {/* Shop section */}
                                        <div className="mb-3 mt-4">
                                            <h4 className="text-sm font-semibold text-gray-800 mb-1">Shop</h4>
                                            <div className="flex w-20 h-0.5">
                                                <div className="w-1/2 bg-green-500"></div>
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
                                                            control={control}
                                                            rules={{ required: "Partner is required" }}
                                                            render={({ field }) => (
                                                                <Select
                                                                    {...field}
                                                                    options={partnerData}
                                                                    onChange={(selectedOption) => {
                                                                        field.onChange(selectedOption ? selectedOption.value : "");
                                                                        handlePartnerChange(selectedOption);
                                                                    }}
                                                                    value={partnerData.find((option) => String(option.value) === String(field.value)) || null}
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
                                                <label className="text-base font-medium" htmlFor="v_shop_id">
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
                                                                setValue('v_availability_id', null);
                                                            }}
                                                            value={shopData.find((option) => String(option.value) === String(field.value)) || null}
                                                            placeholder="Select Shop"
                                                            className="basic-single"
                                                            classNamePrefix="select"
                                                            formatOptionLabel={(option) => (
                                                                <div className="flex items-center justify-between gap-3">
                                                                    <span>{option.label}</span>
                                                                    {option.phone ? <span className="text-xs text-gray-400">{option.phone}</span> : null}
                                                                </div>
                                                            )}
                                                            filterOption={(option, input) => {
                                                                const term = input.trim().toLowerCase();
                                                                if (!term) return true;
                                                                return (
                                                                    option.label.toLowerCase().includes(term) ||
                                                                    String(option.data.phone || "").toLowerCase().includes(term)
                                                                );
                                                            }}
                                                        />
                                                    )}
                                                />
                                                {errors.v_shop_id && (
                                                    <p className="text-red-500 text-sm">{errors.v_shop_id.message}</p>
                                                )}
                                            </div>



                                            {/* <div className="hidden">
                                                <select
                                                    id="v_code"
                                                    name="v_code"
                                                    className="outline-none py-2 px-3 rounded border w-full"
                                                    {...register("v_code")}
                                                >
                                                    <option value="">Select Code</option>
                                                    {shopCodeData.map((item, index) => (
                                                        <option key={index} value={String(item.code)}>
                                                            {item.exist ? "⚪️" : "🟢"} {item.code}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div> */}


                                            {/* <div>
                                                <label className="text-base font-medium" htmlFor="v_code">
                                                    Code <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    id="v_code"
                                                    name="v_code"
                                                    className="outline-none py-2 px-3 rounded border w-full"
                                                    {...register("v_code")}
                                                    onChange={handleSelectChange}
                                                >
                                                    <option value="">Select Code</option>
                                                    {shopCodeData.map((item, index) => (
                                                        <option key={index} value={String(item.code)}>
                                                            {item.exist ? "⚪️" : "🟢"} {item.code}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div> */}

                                            {/* 🟢 "🟢" : "⚪️" */}


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
                                                                // fetchLocationDetails(selectedOption ? selectedOption.value : '');
                                                                // setValue('v_location_id', null);
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
                                        </div>




                                        {/* User Description section */}
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



                                        <div className="mb-2 w-[50%]">
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



                                        <hr />

                                        <VehiclePricingSection
                                            register={register}
                                            watch={watch}
                                            setValue={setValue}
                                            control={control}
                                            purchasePriceField="vp_user_purchase_price"
                                            partnerPriceLabel="Partner Price"
                                            hotlineText="Call PBL Hotline to be Partner"
                                        />

                                        <div className="grid grid-cols-4 gap-4 mb-4 mt-4">
                                            <div className="mb-2">
                                                <label className="text-base font-medium" htmlFor="vp_user_price_status">
                                                    User Price Negotiation
                                                </label>
                                                <select
                                                    id="vp_user_price_status"
                                                    name="vp_user_price_status"
                                                    className="outline-none py-2 px-3 rounded border w-full"
                                                    {...register("vp_user_price_status")}
                                                >
                                                    <option value="" className="text-gray-800">Select </option>
                                                    <option value="negotiable">Negotiation</option>
                                                    <option value="fixed">Fixed</option>
                                                    <option value="variable">Variable</option>
                                                </select>
                                                {errors.vp_user_price_status && (
                                                    <p className="text-red-500 text-sm">{errors.vp_user_price_status.message}</p>
                                                )}
                                            </div>
                                        </div>


                                        {/* Front Image section */}
                                        <div className="mb-3 mt-4">
                                            <h4 className="text-sm font-semibold text-gray-800 mb-1">Front Image</h4>
                                            <div className="flex w-20 h-0.5">
                                                <div className="w-1/2 bg-green-500"></div>
                                                <div className="w-1/2 bg-gray-500/20"></div>
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
                                                    fontImageError && <span className="text-red-500 text-lg font-bold mt-2 ">Front Image is required</span>
                                                }
                                            </div>

                                            {/* Preview Box */}
                                            <div className="col-span-4 relative">
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
                                                )}
                                            </div>
                                        </div>


                                        {/* Additional Images section */}
                                        <div className="mb-3 mt-4">
                                            <h4 className="text-sm font-semibold text-gray-800 mb-1">
                                                Additional Images ({additionalPreviews.length}/{MAX_ADDITIONAL_IMAGES})
                                            </h4>
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
                                                    className={`flex-1 h-40 flex flex-col justify-center items-center gap-2 border border-dashed border-gray-400 rounded-lg text-center transition ${isAdditionalImageLimitReached ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-blue-500"}`}
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
                                                        disabled={isAdditionalImageLimitReached}
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
                                                                onClick={() => handleDeleteAdditionalImage(img, index)}
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
                                                    htmlFor="additional-documents-upload"
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
                                                        type="file"
                                                        id="additional-documents-upload"
                                                        name="additionalDocuments"
                                                        accept="image/*,.pdf,.doc,.docx"
                                                        multiple
                                                        className="hidden"
                                                        onChange={handleAdditionalDocumentFileChange}
                                                    />
                                                </label>
                                            </div>

                                            <div className="col-span-4">
                                                <div className="grid grid-cols-6 gap-4 image-preview">
                                                    {additionalDocumentPreviews.map((doc, index) => (
                                                        <div key={index} className="w-40 h-40 border rounded-lg overflow-hidden relative">
                                                            <img
                                                                src={doc}
                                                                alt={`Document Preview ${index}`}
                                                                className="object-cover w-full h-full"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteAdditionalDocument(doc, index)}
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
                                            </div>
                                        </div>

                                    </div>

                                    <div className="mb-3 mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-800">More Information</h4>
                                                <p className="text-xs text-gray-500">Add public vehicle facts like warranty, service history, or extra features.</p>
                                            </div>
                                            <button
                                                type="button"
                                                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800"
                                                onClick={addMoreInformationRow}
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add Row
                                            </button>
                                        </div>

                                        <div className="grid gap-3">
                                            {moreInformation.map((item) => (
                                                <div key={item.id} className="grid gap-2 md:grid-cols-[220px_1fr_40px]">
                                                    <input
                                                        value={item.key}
                                                        placeholder="Label, e.g. Warranty"
                                                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900"
                                                        onChange={(event) => setMoreInformationRow(item.id, { key: event.target.value })}
                                                    />
                                                    <input
                                                        value={item.value}
                                                        placeholder="Value, e.g. 1 year service warranty"
                                                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900"
                                                        onChange={(event) => setMoreInformationRow(item.id, { value: event.target.value })}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                                                        onClick={() => removeMoreInformationRow(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* PBL Section */}
                                    {
                                        (user?.user_mode === 'supreme' || user?.user_mode === 'admin' || user?.user_mode === 'pbl') && (
                                            <div className="border border-gray-900 rounded-lg p-4 mb-4">
                                                <div className="mb-4 flex flex-row justify-center gap-2">
                                                    <h4 className="text-2xl font-bold text-gray-800 mb-1 border-b-2 border-gray-500">PBL Section</h4>
                                                    {/* <div className="flex w-20 h-0.5">
                                                        <div className="w-1/2 bg-green-500"></div>
                                                        <div className="w-1/2 bg-gray-500/20"></div>
                                                    </div> */}
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
                                                                htmlFor="secret-documents-upload"
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
                                                                    type="file"
                                                                    id="secret-documents-upload"
                                                                    name="secretDocuments"
                                                                    accept="image/*,.pdf,.doc,.docx"
                                                                    multiple
                                                                    className="hidden"
                                                                    onChange={handleSecretDocumentFileChange}
                                                                />
                                                            </label>
                                                        </div>

                                                        <div className="col-span-4">
                                                            <div className="grid grid-cols-6 gap-4 image-preview">
                                                                {secretDocumentPreviews.map((doc, index) => (
                                                                    <div key={index} className="w-40 h-40 border rounded-lg overflow-hidden relative">
                                                                        <img
                                                                            src={doc}
                                                                            alt={`Secret Document Preview ${index}`}
                                                                            className="object-cover w-full h-full"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDeleteSecretDocument(doc, index)}
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
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mb-2 w-[50%]">
                                                    <label className="text-base font-medium" htmlFor="v_secret_text">
                                                        Secret Text
                                                    </label>
                                                    <textarea
                                                        id="v_secret_text"
                                                        name="v_secret_text"
                                                        placeholder="Secret Text"
                                                        rows="4"
                                                        className="outline-none py-2 px-3 rounded border w-full"
                                                        {...register("v_secret_text")}
                                                    ></textarea>
                                                </div>

                                                <div className="mb-2 w-[50%]">
                                                    <label className="text-base font-medium" htmlFor="v_secret_video_link">
                                                        Secret Video Link
                                                    </label>
                                                    <Input
                                                        id="v_secret_video_link"
                                                        name="v_secret_video_link"
                                                        placeholder="Enter Secret Video Link"
                                                        {...register("v_secret_video_link")}
                                                    />
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
                                                        <select
                                                            id="vp_pbl_hs_price_status"
                                                            name="vp_pbl_hs_price_status"
                                                            className="outline-none py-2 px-3 rounded border w-full"
                                                            {...register("vp_pbl_hs_price_status")}
                                                        >
                                                            <option value="" className="text-gray-800">Select PBL Price Negotiation</option>
                                                            <option value="negotiable">Negotiation</option>
                                                            <option value="fixed">Fixed</option>
                                                            <option value="variable">Variable</option>
                                                        </select>
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

                                                    <div className="mb-2">
                                                        <label className="text-base font-medium" htmlFor="v_pbl_partnership_expire_date">
                                                            Partnership Expire Date
                                                        </label>
                                                        <Input
                                                            id="v_pbl_partnership_expire_date"
                                                            type="date"
                                                            {...register("v_pbl_partnership_expire_date")}
                                                        />
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            After this date, the vehicle is automatically removed from PBL sale (home &amp; category pages).
                                                        </p>
                                                    </div>

                                                    <PblHistoryPanel type="vehicle" id={productId} />



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


                                                    <div>
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



                                                    

                                                    <div>
                                                        <label className="text-base font-medium" htmlFor="v_auction_type">
                                                            Auction Types
                                                        </label>
                                                        <Controller
                                                            name="v_auction_type"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Select
                                                                    {...field}
                                                                    options={auctionTypeOptions}
                                                                    onChange={(selectedOption) => {
                                                                        field.onChange(selectedOption ? selectedOption.value : '');
                                                                    }}
                                                                    value={auctionTypeOptions.find(option => option.value === field.value) || null}
                                                                    placeholder="Select Auction Type"
                                                                    className="basic-single"
                                                                    classNamePrefix="select"
                                                                />
                                                            )}
                                                        />
                                                    </div>


                                                    {/* <div className="">
                                                        <label className="text-base font-medium" htmlFor="customer-name">
                                                            Users Mode (Call PBL Hotline to be Partner)
                                                        </label>
                                                        <select
                                                            id="v_user_mode"
                                                            name="v_user_mode"
                                                            className="outline-none py-2 px-3 rounded border w-full"
                                                            {...register("v_user_mode")}
                                                        >
                                                            <option value="">Select User Mode</option>
                                                            {
                                                                userModeData.map((userMode) => (
                                                                    <option key={userMode.value} value={userMode.value}>
                                                                        {userMode.label}
                                                                    </option>
                                                                ))
                                                            }
                                                        </select>
                                                    </div> */}
                                                    {/* <div className="mb-3 mt-4">
        <span className="text-sm font-semibold text-gray-600 mb-1">{hotlineText}</span>
        </div> */}


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



                                                {/* Video Link PBL section */}
                                                <div className="mb-3 mt-4">
                                                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Video Link</h4>
                                                    <div className="flex w-20 h-0.5">
                                                        <div className="w-1/2 bg-green-500"></div>
                                                        <div className="w-1/2 bg-gray-500/20"></div>
                                                    </div>
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

                                                {/* Vendor Agreement section */}
                                                <div className="mb-3 mt-4">
                                                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Vendor Agreement</h4>
                                                    <div className="flex w-24 h-1">
                                                        <div className="w-2/3 bg-green-500"></div>
                                                        <div className="w-1/2 bg-gray-500/20"></div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <textarea
                                                        id="v_pbl_text"
                                                        name="v_pbl_text"
                                                        placeholder="Vendor Agreement"
                                                        rows="4"
                                                        className="outline-none py-2 px-3 rounded border w-full"
                                                        {...register("v_pbl_text")}
                                                    ></textarea>
                                                </div>

                                                {canShowSellerMobileToggle() && (
                                                    <div className="mt-4 flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id="v_show_seller_mobile"
                                                            className="mr-2"
                                                            {...register("v_show_seller_mobile")}
                                                        />
                                                        <label htmlFor="v_show_seller_mobile" className="text-sm font-medium text-gray-700">
                                                            Show Seller Mobile Number
                                                        </label>
                                                    </div>
                                                )}

                                                {canShowSellerMobileToggle() && watch("v_show_seller_mobile") && (
                                                    <div className="mt-4">
                                                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Sellers</h4>
                                                        {sellerInfoRows.map((row, index) => (
                                                            <div key={index} className="flex items-end gap-2 mb-2">
                                                                <div className="flex-1">
                                                                    <label className="text-sm font-medium text-gray-700">Seller Name</label>
                                                                    <Input
                                                                        value={row.name}
                                                                        placeholder="Seller Name"
                                                                        onChange={(e) => handleSellerInfoChange(index, "name", e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <label className="text-sm font-medium text-gray-700">Phone</label>
                                                                    <Input
                                                                        value={row.phone}
                                                                        placeholder="Phone"
                                                                        onChange={(e) => handleSellerInfoChange(index, "phone", e.target.value)}
                                                                    />
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveSellerInfoRow(index)}
                                                                    className="px-3 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            onClick={handleAddSellerInfoRow}
                                                            className="mt-1 px-3 py-1.5 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                                                        >
                                                            + Add Seller
                                                        </button>
                                                    </div>
                                                )}

                                            </div>
                                        )
                                    }

                                    <hr />





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
                                            <label htmlFor="terms" className={`text-sm ${(user?.user_mode == 'member' || user?.user_mode == 'user') ? 'text-gray-400' : 'text-gray-600'}`}>
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

                                    <hr />

                                    <div className="flex justify-center gap-2 mt-4">

                                        <button
                                            type="submit"
                                            className="bg-gray-400 text-white px-6 py-2.5 rounded font-medium rounded-lg"
                                        >
                                            Save As Draft
                                        </button>

                                        <button
                                            type="submit"
                                            className="bg-blue-600 text-white px-6 py-2.5 rounded font-medium rounded-lg"
                                        >
                                            Submit
                                        </button>
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

export default UpdateProductForm;
