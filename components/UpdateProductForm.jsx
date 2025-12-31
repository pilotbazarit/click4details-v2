"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Loading from '@/components/Loading';
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import VehicleService from "@/services/VehicleService";
import ShopService from "@/services/ShopService";
import constData from "@/lib/constant";
import { onlyDecimalInput, onlyNumberInput } from "@/helpers/functions";
import MasterDataService from "@/services/MasterDataService";
import PackageService from "@/services/PackageService";
import VehicleModelService from "@/services/VehicleModelService";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import ProductFeatureSpecificationModal from "./modals/ProductFeatureSpecificationModal";
import dynamic from 'next/dynamic';
import OutletService from "@/services/OutletService";
import LocationService from "@/services/LocationService";
const Select = dynamic(() => import('react-select'), { ssr: false });

// Yup Validation Schema
const schema = yup.object().shape({
    v_title: yup.string().required("Title is Required"),
    v_brand_id: yup.string().required("Brand is Required"),
    v_model_id: yup.string().required("Model is Required"),

    v_shop_id: yup.string().required("Shop is Required"),
    // v_code: yup.string().required("Code is Required")
});

const UpdateProductForm = ({ productId }) => {
    const [loading, setLoading] = useState(false);
    const [frontImageFile, setFrontImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [additionalImages, setAdditionalImages] = useState([]); // store File objects
    const [additionalPreviews, setAdditionalPreviews] = useState([]); // for UI previews

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
    const [isMasterDataReady, setIsMasterDataReady] = useState(false);
    const [removeAdditionalImage, setRemoveAdditionalImage] = useState([]);
    const [fontImageError, setFontImageError] = useState(false);
    const [selectedFsId, setSelectedFsId] = useState([]);
    const [priceSelection, setPriceSelection] = useState('fixed');
    const [user, setUser] = useState(null);
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
    });

    const selectedShopId = watch("v_shop_id");
    const selectedBrandId = watch("v_brand_id");
    const selectedModelId = watch("v_model_id");
    const vUrgentSale = watch("v_urgent_sale");
    const userFixedPrice = watch("vp_user_fixed_price");

    const selectedCountryId = watch("v_country_id");

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
                setPriceSelection('fixed');
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
        const userData = localStorage.getItem("user");
        const userInfo = userData && JSON.parse(userData);
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
    }, []);


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

    const handleDeleteAdditionalImage = (url, index) => {

        const isCloudinaryImage = url.includes('res.cloudinary.com') && url.includes('/image/upload/');

        if (isCloudinaryImage) {
            const urlParts = url.split("/");

            const fileNameWithExt = urlParts[urlParts.length - 1];

            const folderIndex = urlParts.findIndex(part => part === "upload") + 2;

            const publicId = urlParts.slice(folderIndex).join("/").replace(/\.[^/.]+$/, "");

            if (!removeAdditionalImage.includes(publicId)) {
                setRemoveAdditionalImage(prev => [...prev, publicId]);
            }
        }

        setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
        setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

    const getShopData = async () => {
        try {
            const userData = localStorage.getItem("user");
            const userInfo = userData && JSON.parse(userData);
            const user = JSON.parse(userInfo);

            // console.log("user", user?.user_mode);

            const response = await ShopService.Queries.getShops({
                order: "desc",
                orderBy: "md_id",
                ...(user?.user_mode !== "admin" && { _user_id: user?.id }),
                _page: 1,
                _perPage: 1000
            });

            const shopOptions = response.data.data.map((shop) => ({
                value: shop.s_id,
                label: shop.s_title,
            }));

            setShopData(shopOptions);
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

                // Populate fields instantly
                setValue('v_brand_id', brandId);
                setValue('v_model_id', modelId);
                setValue('v_edition_id', editionId);

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

                        const isValidModel = fetchedModelData.some(item => item.value === modelId);
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

                        const isValidEdition = fetchedPackageData.some(item => item.value === editionId);
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
                if (data?.vehicle_images?.length > 0) {
                    data.vehicle_images.forEach((img) => {
                        if (img.url !== "") {
                            vehicleImgArr.push(img.url);
                        }
                    });
                }

                setAdditionalPreviews(vehicleImgArr);
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

                setValue('v_availability_id', data.v_availability_id);
                setValue('v_country_id', data?.v_location?.country_id);
                setValue('v_location_id', data?.v_location?.location_id);
                setValue('v_availability_status', data?.v_availability_status || '');
                setValue('v_shop_id', data.v_shop_id);
                // setValue('v_code', data.v_code && String(data.v_code.split("-")[1]));
                setValue('v_priority', data.v_priority);
                setValue('vp_user_fixed_price', data?.vehicle_db_price?.vp_user_fixed_price);
                setValue('vp_user_asking_price', data?.vehicle_db_price?.vp_user_asking_price);
                setValue('vp_user_variable_price', data?.vehicle_db_price?.vp_user_variable_price);
                setValue('vp_show_price', data?.vehicle_db_price?.vp_show_price);
                if (data?.vehicle_db_price?.vp_show_price) {
                    setPriceSelection(data.vehicle_db_price.vp_show_price);
                }

                setValue('v_urgent_sale', data.v_urgent_sale == 1);
                setValue('vp_user_price_status', data?.vehicle_db_price?.vp_user_price_status);
                setValue('vp_user_purchase_price', data?.vehicle_price?.v_purchase_price);
                setValue('vp_pbl_additional_amount', data?.vehicle_db_price?.vp_pbl_additional_amount);
                setValue('vp_pbl_price_status', data?.vehicle_price?.v_pbl_price_status);
                setValue('vp_pbl_asking_price', data?.vehicle_db_price?.vp_pbl_asking_price);
                setValue('vp_user_costing_price', data?.vehicle_db_price?.vp_user_costing_price);

                setValue('pbl_partner_code', data.pbl_partner_code);
                setValue('v_description', data.v_description);
                setValue('v_user_description', data.v_user_description);
                setValue('vm_description', data?.v_metadata?.vm_description);
                setValue('v_video', data.v_video);
                setValue('v_is_saleBy_pbl', data.v_is_saleBy_pbl == 1);
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


    // Load master data
    const loadAllMasterData = async () => {
        try {
            await Promise.all([
                getShopData(),
                getBrandData(),
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

        setFontImageError(false);

        setLoading(true);

        // ✅ Convert checkboxes  formData.append('v_edition_id', data.v_edition_id ? 1 : 0);
        data.v_urgent_sale = data.v_urgent_sale ? 1 : 0;
        data.v_is_saleBy_pbl = data.v_is_saleBy_pbl ? 1 : 0;
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
        data.vp_pbl_hs_asking_price = data.vp_pbl_hs_asking_price ? data?.vp_pbl_hs_asking_price : '';
        data.vp_pbl_hs_asking_price = data.vp_pbl_hs_asking_price ? data?.vp_pbl_hs_asking_price : '';
        data.v_priority = data.v_priority ? data?.v_priority : '';
        data.v_shop_id = data.v_shop_id ? data?.v_shop_id : '';
        data.v_country_id = data.v_country_id ? data?.v_country_id : '';
        data.v_availability_status = (data.v_availability_status && data.v_availability_status !== 'undefined') ? data.v_availability_status : 'available';
        // data.v_code = data.v_code ? data?.v_code : '';
        data.v_description = data.v_description ? data?.v_description : '';
        data.v_user_description = data.v_user_description ? data?.v_user_description : '';
        data.vm_description = data.vm_description ? data?.vm_description : '';
        data.v_video = data.v_video ? data?.v_video : '';
        data.v_chassis = data.v_chassis ? data?.v_chassis : '';
        data.v_engine = data.v_engine ? data?.v_engine : '';
        data.v_tax_token_exp_date = data.v_tax_token_exp_date ? data?.v_tax_token_exp_date : '';
        data.v_fitness_exp_date = data.v_fitness_exp_date ? data?.v_fitness_exp_date : '';
        data.pbl_partner_code = data.pbl_partner_code ? data?.pbl_partner_code : '';



        const formData = new FormData();

        // ✅ Append form fields
        for (let key in data) {
            formData.append(key, data[key]);
        }

        // ✅ Append images
        if (frontImageFile) {
            formData.append("vi_front_image", frontImageFile);
        }

        additionalImages && additionalImages.forEach((file) => {
            formData.append("vi_image[]", file);
        });

        if (removeAdditionalImage && removeAdditionalImage.length > 0) {
            removeAdditionalImage.forEach(img => {
                formData.append("v_remove_image[]", img);
            });
        }

        selectedFsId.forEach((fsId) => {
            formData.append("v_fs[]", fsId);
        });

        // ✅ Append method override
        formData.append('_method', 'PUT');

        try {
            const response = await VehicleService.Commands.updateVehicle(productId, formData);

            if (response.status === 'success') {
                setAdditionalImages([]);
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
                                    <div className="mb-3">
                                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Product Info</h4>
                                        <div className="flex w-20 h-0.5">
                                            <div className="w-1/2 bg-green-500"></div>
                                            <div className="w-1/2 bg-gray-500/20"></div>
                                        </div>
                                    </div>

                                    {/* Product Info section */}
                                    <div className="mb-2">
                                        <div className="w-[50%]">
                                            <label className="text-base font-medium" htmlFor="customer-name">
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
                                        <div>
                                            <label className="text-base font-medium" htmlFor="customer-name">
                                                Shop List <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                id="v_shop_id"
                                                name="v_shop_id"
                                                className="outline-none py-2 px-3 rounded border w-full"
                                                {...register("v_shop_id")}
                                            >
                                                <option value=""> Select Shop</option>
                                                {
                                                    shopData.map((shop) => (
                                                        <option key={shop.value} value={shop.value}>
                                                            {shop.label}
                                                        </option>
                                                    ))
                                                }

                                            </select>
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


                                                    <div>
                                                        <label className="text-base font-medium" htmlFor="customer-name">
                                                            Users Mode
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
                                                        {/* {errors.v_user_mode && (
                                                            <p className="text-red-500 text-sm">{errors.v_user_mode.message}</p>
                                                          )} */}
                                                    </div>

                                                </>
                                            )
                                        }


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

                                    <hr />

                                    <div>
                                        <span className="text-sm font-semibold text-gray-600 mb-1">Call PBL Hotline to be Partner</span>
                                    </div>


                                    {/* User Pricing section */}
                                    <div className="mb-3 mt-4">
                                        <h4 className="text-sm font-semibold text-gray-800 mb-1">User Pricing</h4>
                                        <div className="flex w-20 h-0.5">
                                            <div className="w-1/2 bg-green-500"></div>
                                            <div className="w-1/2 bg-gray-500/20"></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="mb-2">
                                            <label className="text-base font-medium" htmlFor="customer-name">
                                                User Fixed Price
                                            </label>
                                            <div className="flex items-center">
                                                <Input
                                                    id="vp_user_fixed_price"
                                                    name="vp_user_fixed_price"
                                                    placeholder="Enter User Fixed Price"
                                                    {...register("vp_user_fixed_price")}
                                                    onKeyDown={onlyDecimalInput}
                                                />
                                                <input
                                                    type="radio"
                                                    id="fixed_price_radio"
                                                    name="price_selection"
                                                    value="fixed"
                                                    checked={priceSelection === 'fixed'}
                                                    onChange={() => {
                                                        setPriceSelection('fixed');
                                                        setValue('vp_show_price', 'fixed');
                                                    }}
                                                    className="ml-2"
                                                />
                                            </div>

                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="mb-2">
                                            <label className="text-base font-medium" htmlFor="customer-name">
                                                User Asking Price
                                            </label>
                                            <div className="flex items-center">
                                                <Input
                                                    id="vp_user_asking_price"
                                                    name="vp_user_asking_price"
                                                    placeholder="Enter User Asking Price"
                                                    {...register("vp_user_asking_price")}
                                                    onKeyDown={onlyDecimalInput}
                                                />
                                                <input
                                                    type="radio"
                                                    id="asking_price_radio"
                                                    name="price_selection"
                                                    value="asking"
                                                    checked={priceSelection === 'asking'}
                                                    onChange={() => {
                                                        setPriceSelection('asking');
                                                        setValue('vp_show_price', 'asking');
                                                    }}
                                                    className="ml-2"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="mb-2">
                                            <label className="text-base font-medium" htmlFor="customer-name">
                                                User Variable Price
                                            </label>
                                            <div className="flex items-center">
                                                <Input
                                                    id="vp_user_variable_price"
                                                    name="vp_user_variable_price"
                                                    placeholder="Enter User Variable Price"
                                                    {...register("vp_user_variable_price")}
                                                    onKeyDown={onlyDecimalInput}
                                                />
                                                <input
                                                    type="radio"
                                                    id="variable_price_radio"
                                                    name="price_selection"
                                                    value="variable"
                                                    checked={priceSelection === 'variable'}
                                                    onChange={() => {
                                                        setPriceSelection('variable');
                                                        setValue('vp_show_price', 'variable');
                                                    }}
                                                    className="ml-2"
                                                />
                                            </div>
                                        </div>
                                    </div>


                                    <div className="mt-2 mb-4">
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


                                    {/* --------------------------------------- */}


                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="mb-2">
                                            <label className="text-base font-medium" htmlFor="customer-name">
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


                                        <div className=" mb-2">
                                            <label className="text-base font-medium" htmlFor="customer-name">
                                                User Purchase Price
                                            </label>
                                            <Input
                                                id="vp_user_purchase_price"
                                                name="vp_user_purchase_price"
                                                placeholder="Enter User Purchase Price"
                                                {...register("vp_user_purchase_price")}
                                                onKeyDown={onlyDecimalInput}
                                            />
                                        </div>



                                    </div>

                                    {/* <div className="grid grid-cols-5 grid-rows-5 gap-4">
                                        <div>
                                            <label className="text-base font-medium" htmlFor="customer-name">
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

                                        <div className=" mb-2">
                                            <label className="text-base font-medium" htmlFor="customer-name">
                                                User Purchase Price
                                            </label>
                                            <Input
                                                id="vp_user_purchase_price"
                                                name="vp_user_purchase_price"
                                                placeholder="Enter User Purchase Price"
                                                {...register("vp_user_purchase_price")}
                                                onKeyDown={onlyDecimalInput}
                                            />
                                        </div>
                                    </div> */}


                                    {/* PBL Pricing section */}
                                    {
                                        (user?.user_mode === 'supreme' || user?.user_mode === 'admin') && (
                                            <>
                                                <div className="mb-3">
                                                    <h4 className="text-sm font-semibold text-gray-800 mb-1">PBL Pricing</h4>
                                                    <div className="flex w-20 h-0.5">
                                                        <div className="w-1/2 bg-green-500"></div>
                                                        <div className="w-1/2 bg-gray-500/20"></div>
                                                    </div>
                                                </div>


                                                <div className="grid grid-cols-4 gap-4 mb-4">

                                                    <div className="mb-2">
                                                        <label className="text-base font-medium" htmlFor="customer-name">
                                                            PBL Additional Price
                                                        </label>
                                                        <Input
                                                            id="vp_pbl_additional_amount"
                                                            name="vp_pbl_additional_amount"
                                                            placeholder="Enter PBL Additional Price"
                                                            {...register("vp_pbl_additional_amount")}
                                                            onKeyDown={onlyDecimalInput}
                                                        />
                                                    </div>

                                                    <div className="mb-2">
                                                        <label className="text-base font-medium" htmlFor="customer-name">
                                                            PBL Asking Price
                                                        </label>
                                                        <Input
                                                            id="vp_pbl_asking_price"
                                                            name="vp_pbl_asking_price"
                                                            placeholder="Enter PBL Asking Price"
                                                            {...register("vp_pbl_asking_price")}
                                                            onKeyDown={onlyDecimalInput}
                                                        />
                                                    </div>


                                                    <div className="mb-2">
                                                        <label className="text-base font-medium" htmlFor="customer-name">
                                                            User Costing Price
                                                        </label>
                                                        <Input
                                                            id="vp_user_costing_price"
                                                            name="vp_user_costing_price"
                                                            placeholder="Enter PBL Additional Price"
                                                            {...register("vp_user_costing_price")}
                                                            onKeyDown={onlyDecimalInput}
                                                        />
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
                                                </div>
                                            </>
                                        )
                                    }

                                    <hr />

                                    {/* Description section */}
                                    <div className="mb-3 mt-4">
                                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Description</h4>
                                        <div className="flex w-20 h-0.5">
                                            <div className="w-1/2 bg-green-500"></div>
                                            <div className="w-1/2 bg-gray-500/20"></div>
                                        </div>
                                    </div>

                                    {/* <div>
                                        <textarea
                                            id="v_description"
                                            name="v_description"
                                            placeholder="Description"
                                            rows="6"
                                            className="outline-none py-2 px-3 rounded border w-full"
                                            {...register("v_description")}
                                        ></textarea>
                                        {errors.v_description && (
                                            <p className="text-red-500 text-sm">{errors.v_description.message}</p>
                                        )}
                                    </div> */}
                                    {
                                        (user?.user_mode === 'supreme' || user?.user_mode === 'admin') ? (
                                            <div>
                                                <textarea
                                                    id="v_description"
                                                    name="v_description"
                                                    placeholder="Description"
                                                    rows="6"
                                                    className="outline-none py-2 px-3 rounded border w-full"
                                                    {...register("v_description")}
                                                ></textarea>
                                                {errors.v_description && (
                                                    <p className="text-red-500 text-sm">{errors.v_description.message}</p>
                                                )}
                                            </div>
                                        ) : (
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
                                        )
                                    }

                                    {/* Special Description section */}
                                    <div className="mb-3 mt-4">
                                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Special Description</h4>
                                        <div className="flex w-20 h-0.5">
                                            <div className="w-1/2 bg-green-500"></div>
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

                                    {/* PBL Pricing section */}
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

                                    <hr />

                                    {/* SEO Description section */}
                                    <div className="mb-3 mt-4">
                                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Video Link</h4>
                                        <div className="flex w-20 h-0.5">
                                            <div className="w-1/2 bg-green-500"></div>
                                            <div className="w-1/2 bg-gray-500/20"></div>
                                        </div>
                                    </div>


                                    <div className="text-center mb-2 w-[50%]">
                                        <Input
                                            id="v_video"
                                            name="v_video"
                                            placeholder="Video Link"
                                            {...register("v_video")}
                                        />
                                    </div>

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


                                        <div className="flex items-center mt-4">

                                            <input
                                                type="checkbox"
                                                id="want_to_be_partner"
                                                name="terms"
                                                className="mr-2"
                                                disabled={user?.user_mode == 'partner' || user?.user_mode == 'user'}
                                                {...register("want_to_be_partner")}
                                            />
                                            <label htmlFor="want_to_be_partner" className={`text-sm ${(user?.user_mode == 'partner' || user?.user_mode == 'user') ? 'text-gray-400' : 'text-gray-600'}`}>
                                                I Want to be a Partner of pilotbazar.com. Please Click the Checkbox and Submit to be Our Partner. If You Click the Checkbox pilotbazar.com team will Call You Soon. Or Call pilotbazar.com Hotline Number 01969444000 to be Our Partner. &nbsp;
                                            </label>
                                        </div>

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
                />
            </div>
        </>
    );
};

export default UpdateProductForm;