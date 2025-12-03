"use client";

import dynamic from "next/dynamic";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHeaderSection from "@/components/advance-filter/PageHeaderSection";
import { AdvanceFilterProductContextProvider } from "@/context/AdvanceFilterProductContextProvider";
import { useAppContext } from "@/context/AppContext";
import { API_URL } from "@/helpers/apiUrl";
import { Button } from "@/components/ui/button";
import { createApiRequest } from "@/helpers/axios";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ChevronRight, ChevronDown, Search, X, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MasterDataService from "@/services/MasterDataService";
import VehicleModelService from "@/services/VehicleModelService";
import ShopService from "@/services/ShopService";
import VehicleService from "@/services/VehicleService";
import PackageService from "@/services/PackageService";
import LocationService from "@/services/LocationService";
import OutletService from "@/services/OutletService";
import constData from "@/lib/constant";
import FeatureSpecificationService from "@/services/FeatureSpecificationService";
import CategoryService from "@/services/CategoryService";
import GeneralProductService from "@/services/GeneralProductService";
import Swal from "sweetalert2";
import ProductFeatureSpecificationModal from "@/components/modals/ProductFeatureSpecificationModal";

// Import react-select dynamically (disable SSR)
const Select = dynamic(() => import("react-select"), { ssr: false });

const schema = yup.object().shape({
    productName: yup.string().required("Product name is required"),
    brand: yup.string().nullable(),
    model: yup.string().nullable(),
    p_package_id: yup.string().nullable(),
    shop: yup.string().nullable(),
    // code: yu/p.string(),
    location: yup.string().nullable(),
    outlet: yup.string().nullable(),
    category: yup.number().required("Category is required"),
    country: yup.string(),
    serialNumber: yup.string(),
    videoLink: yup.string().url("Must be a valid URL").nullable(),
    pbl_description: yup.string(),
    special_description: yup.string(),
    user_description: yup.string(),
    image: yup.mixed().required("A main image is required."),
    images: yup.array(),
    prices: yup.array().of(
        yup.object().shape({
            // purchase_price: yup.string().required("Purchase price is required"),
            regular_price: yup.string().required("Regular price is required"),
            discount: yup.number()
                .transform(value => (isNaN(value) ? undefined : value))
                .nullable()
                .max(100, 'Discount cannot be more than 100%'),
            unit_id: yup.string().required("Unit is required"),
            unit_count: yup.string().required("Unit count is required"),
        })
    ),
    // attributes: yup.array().of(
    //     yup.object().shape({
    //         attribute_id: yup.string(),
    //         attribute_value_id: yup.string(),
    //     })
    // ),
    // extraInfo: yup.array().of(
    //     yup.object().shape({
    //         title: yup.string(),
    //         value: yup.string(),
    //     })
    // ),
});

const AttributeField = ({ control, index, watch, features, remove, showRemoveButton, setValue, errors }) => {
    const [featureItems, setFeatureItems] = useState([]);
    const [isFeatureItemLoading, setIsFeatureItemLoading] = useState(false);
    const selectedFeatureId = watch(`attributes.${index}.attribute_id`);


    // console.log("selectedFeatureId:::::", selectedFeatureId);

    useEffect(() => {
        const fetchFeatureItems = async () => {
            if (selectedFeatureId) {
                setIsFeatureItemLoading(true);
                setFeatureItems([]);
                setValue(`attributes.${index}.attribute_value_id`, null);
                try {
                    const response = await FeatureSpecificationService.Queries.getFeatureSpecification({
                        _feature_id: selectedFeatureId,
                        _page: 1,
                        _perPage: 1000,
                    });

                    // console.log("response feature", response);

                    const featureItemData = response.data?.data.map((item) => ({
                        value: item.fs_id,
                        label: item.fs_title,
                    }));
                    setFeatureItems(featureItemData);
                } catch (error) {
                    toast.error("Failed to fetch feature items");
                } finally {
                    setIsFeatureItemLoading(false);
                }
            } else {
                setFeatureItems([]);
            }
        };
        fetchFeatureItems();
    }, [selectedFeatureId, setValue, index]);

    return (
        <div className="border rounded-lg p-4 bg-white shadow-sm mb-4">
            <div className="flex items-center w-full">
                <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-base font-medium">
                                Feature
                            </label>
                            <Controller
                                name={`attributes.${index}.attribute_id`}
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={features}
                                        onChange={(selectedOption) => {
                                            field.onChange(selectedOption ? selectedOption.value : '');
                                        }}
                                        value={features.find(option => option.value === field.value)}
                                        placeholder="Select Feature"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                )}
                            />
                            {errors.attributes?.[index]?.attribute_id && <p className="text-red-500 text-sm">{errors.attributes?.[index]?.attribute_id.message}</p>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-base font-medium">
                                Feature Item
                            </label>
                            <Controller
                                name={`attributes.${index}.attribute_value_id`}
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={featureItems}
                                        onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                        value={featureItems.find(option => option.value === field.value)}
                                        placeholder={isFeatureItemLoading ? "Loading..." : "Select Feature Item"}
                                        isDisabled={!selectedFeatureId || isFeatureItemLoading}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                )}
                            />
                            {errors.attributes?.[index]?.attribute_value_id && <p className="text-red-500 text-sm">{errors.attributes?.[index]?.attribute_value_id.message}</p>}
                        </div>
                    </div>
                </div>
                {showRemoveButton && (
                    <div className="border-l ml-4 pl-4">
                        <button
                            type="button"
                            className="ml-4 mt-6 bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded-full shadow"
                            onClick={() => remove(index)}
                        >
                            &times;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const GeneralProductCreate = () => {
    const { user } = useAppContext();
    const api = createApiRequest(API_URL);
    const router = useRouter();

    const [imagePreview, setImagePreview] = useState(null);
    const [imagesPreview, setImagesPreview] = useState([]);

    const [brandData, setBrandData] = useState([]);
    const [modelData, setModelData] = useState([]);
    const [isModelLoading, setIsModelLoading] = useState(false);

    const [shopData, setShopData] = useState([]);
    // const [shopCodeData, setShopCodeData] = useState([]);
    const [isShopCodeLoading, setIsShopCodeLoading] = useState(false);

    const [packageData, setPackageData] = useState([]);
    const [isPackageLoading, setIsPackageLoading] = useState(false);
    const [countryData, setCountryData] = useState([]);
    const [locationData, setLocationData] = useState([]);
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    const [outletData, setOutletData] = useState([]);
    const [unitData, setUnitData] = useState([]);
    const [isOutletLoading, setIsOutletLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // =========for category=========
    const [categoryItems, setCategoryItems] = useState([]);
    const [isCategoryLoading, setIsCategoryLoading] = useState(false);
    const [categoryHistory, setCategoryHistory] = useState([]);
    const [isCategoryListVisible, setIsCategoryListVisible] = useState(false);
    const categoryDropdownRef = useRef(null);
    const [selectedFsId, setSelectedFsId] = useState([]);
    const [featureModalShow, setFeatureModalShow] = useState(false);
    const [materCategoryItems, setMaterCategoryItems] = useState([]);


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



    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        resetField,
        getValues,
        setValue,
        watch,
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onSubmit",
        defaultValues: {
            productName: "",
            brand: "",
            model: "",
            p_package_id: "",
            shop: "",
            // code: "",
            location: "",
            outlet: "",
            category: null,
            country: "",
            serialNumber: "",
            videoLink: "",
            pbl_description: "",
            special_description: "",
            user_description: "",
            image: null,
            images: [],
            attributes: [{ attribute_id: "", attribute_value_id: "" }],
            prices: [{ purchase_price: "", regular_price: "", discount: "", discount_price: "", asking_price: "", fixed_price: "", unit_id: "", unit_count: "", wholesale_price: "", min_unit_wholesale: "" }],
            extraInfo: [{ title: "", value: "" }]
        },
    });

    const { fields: priceFields, append: appendPrice, remove: removePrice } = useFieldArray({
        control,
        name: "prices",
    });

    const { fields: attributeFields, append: appendAttribute, remove: removeAttribute } = useFieldArray({
        control,
        name: "attributes",
    });

    const { fields: extraInfoFields, append: appendExtraInfo, remove: removeExtraInfo } = useFieldArray({
        control,
        name: "extraInfo",
    });

    const selectedBrandId = watch("brand");
    const selectedShopId = watch("shop");
    const selectedModelId = watch("model");
    const selectedCountryId = watch("country");
    const selectedProductTypeId = watch("p_type_id");

    const fetchMasterCategories = async (parentId) => {
        setIsCategoryLoading(true);
        try {

            const response = await CategoryService.Queries.getCategories({
                _page: 1,
                _perPage: 1000,
                _parent_id: 0
            })


            // console.log("response::::::", response);

            if (response.status === "success") {
                const categories = response?.data?.data;
                const masterCategory = categories.map(item => ({
                    c_id: item.c_id,
                    c_name: item.c_name,
                }));
                setMaterCategoryItems(masterCategory);
            } else {
                setMaterCategoryItems([]);
            }
        } catch (error) {
            toast.error("Failed to fetch categories");
            setCategoryItems([]);
        } finally {
            setIsCategoryLoading(false);
        }
    };


    // console.log("materCategoryItems", materCategoryItems);

    const fetchCategories = async (parentId) => {
        setIsCategoryLoading(true);
        try {
            const response = await CategoryService.Queries.getCategories({
                _page: 1,
                _perPage: 5000,
                _parent_id: parentId,
            });

            if (response.status === "success") {
                const categories = response?.data?.data;
                const categoryItemData = categories.map(item => ({
                    c_id: item.c_id,
                    c_name: item.c_name,
                }));
                setCategoryItems(categoryItemData);
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


    const getBrandData = async (selectedProductTypeId) => {
        try {
            const brand_code = constData.BRAND_MD_CODE;
            const response = await MasterDataService.Queries.getMasterDataByTypeCodeParam({
                code: brand_code,
                _cat_id: selectedProductTypeId
            });



            // const response = await MasterDataService.Queries.getMasterDataByTypeCode(brand_code);

            // console.log("response master data", response);

            const brandMasterData = response.data?.master_data;
            const brandData = brandMasterData.map((brand) => ({
                value: brand.md_id,
                label: brand.md_title
            }));
            setBrandData(brandData);
        } catch (error) {
            toast.error(error.message || "Something went wrong");
        }
    }


    const getFeatureItemData = async (selectedProductTypeId) => {

        try {
            // const response = await MasterDataService.Queries.getMasterData({
            //     _type_code: constData.FEATURE_CODE,
            //     _cat_id: selectedProductTypeId,
            //     _status: 'active',
            //     _perPage: 1000 // Fetch all active features
            // });

            const feature_code = constData.FEATURE_CODE;


            // console.log("feature_code", feature_code);

            const response = await MasterDataService.Queries.getMasterDataByTypeCodeParam({
                code: feature_code,
                _cat_id: selectedProductTypeId
            });


            console.log("feature response", response);




            const featureMasterData = response.data?.master_data;

            const featureData = featureMasterData.map((item) => ({
                value: item.md_id,
                label: item.md_title,
            }));

            setFeatures(featureData);

        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to fetch data types"
            );
        }
    }


    const [featureData, setFeatureData] = useState([]);
    const [formData, setFormData] = useState({
        vsm_feature_id: 0,
        vsm_model_id: "",
        vsm_ve_id: "",
        vsm_fs_id: [],
    });

    const getFeatureData = async (id) => {
        if (id) {
            const response = await PackageService.Queries.getFeatureByPackage(id, 0);

            // console.log("res package", response);

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



    useEffect(() => {
        if (selectedProductTypeId) {
            fetchCategories(selectedProductTypeId);
            getBrandData(selectedProductTypeId);
            getFeatureItemData(selectedProductTypeId);
        } else {
            setCategoryItems([]);
            setCategoryHistory([]);
        }
    }, [selectedProductTypeId]);

    const handleCategoryClick = (category) => {
        setValue("category", category.c_id, { shouldValidate: true });
        setCategoryHistory(prev => [...prev, category]);
        fetchCategories(category.c_id);
    };

    const handleCategoryBack = () => {
        if (categoryHistory.length > 0) {
            const newHistory = [...categoryHistory];
            newHistory.pop();
            const parentCategory = newHistory[newHistory.length - 1];
            setValue("category", parentCategory ? parentCategory.c_id : null, { shouldValidate: true });
            setCategoryHistory(newHistory);
            // Fetch categories for the parent level
            const parentId = parentCategory ? parentCategory.c_id : selectedProductTypeId;
            if (parentId) {
                fetchCategories(parentId);
            }
        }
    };

    // ----------category section end----------
    useEffect(() => {
        const getMasterCategories = async () => {
            await fetchMasterCategories();
        }
        getMasterCategories();
    }, []);

    const [features, setFeatures] = useState([]);
    const [featureSpecification, setFeatureSpecification] = useState([]);

    console.log("selectedProductTypeId", selectedProductTypeId);

    useEffect(() => {


        const getShopData = async () => {
            try {
                const response = await ShopService.Queries.getShops({ _page: 1, _perPage: 1000 });
                const shopOptions = response.data.data.map((shop) => ({
                    value: shop.s_id,
                    label: shop.s_title,
                }));
                setShopData(shopOptions);
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to fetch data");
            }
        };
        getShopData();
        const getCountryData = async () => {
            try {
                const country_code = constData.COUNTRY_CODE;
                const response = await MasterDataService.Queries.getMasterDataByTypeCode(country_code);
                const countryMasterData = response.data?.master_data;
                const countryData = countryMasterData.map((country) => ({
                    value: country.md_id,
                    label: country.md_title,
                }));
                setCountryData(countryData);
            } catch (error) {
                toast.error(error.message || "Something went wrong");
            }
        }
        getCountryData();

        const getUnitData = async () => {
            try {
                const unit_code = constData.UNIT_CODE;
                const response = await MasterDataService.Queries.getMasterDataByTypeCode(unit_code);
                const unitMasterData = response.data?.master_data;
                const units = unitMasterData.map((unit) => ({
                    value: unit.md_id,
                    label: unit.md_title,
                }));
                setUnitData(units);
            } catch (error) {
                toast.error(error.message || "Something went wrong while fetching units.");
            }
        }
        getUnitData();






    }, []);

    useEffect(() => {
        const fetchModels = async () => {
            if (selectedBrandId) {
                setIsModelLoading(true);
                setModelData([]);
                setValue("model", null);
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
            }
        };
        fetchModels();
    }, [selectedBrandId, setValue]);

    // useEffect(() => {
    //     const fetchShopDetails = async () => {
    //         if (selectedShopId) {
    //             setIsShopCodeLoading(true);
    //             setShopCodeData([]);
    //             setValue("code", null);
    //             try {
    //                 const response = await VehicleService.Queries.getVehicleCodeByShopeId(selectedShopId);
    //                 const sortedData = Array.isArray(response?.data)
    //                     ? [...response.data].sort((a, b) => {
    //                         if (a.exist === b.exist) return 0;
    //                         return a.exist ? 1 : -1;
    //                     })
    //                     : [];
    //                 setShopCodeData(sortedData);
    //             } catch (error) {
    //                 console.log("Error fetching shop details:", error);
    //             } finally {
    //                 setIsShopCodeLoading(false);
    //             }
    //         }
    //     };
    //     fetchShopDetails();
    // }, [selectedShopId, setValue]);

    useEffect(() => {
        const fetchPackages = async () => {
            if (selectedModelId) {
                setIsPackageLoading(true);
                setPackageData([]);
                setValue("package", null);
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

    const getFeatureSpecification = async () => {
        try {
            // setLoading(true);
            const response = await FeatureSpecificationService.Queries.getFeatureSpecification({
                _page: currentPage,
                _perPage: itemsPerPage,
                // _title: value,
            });

            if (response?.status == "success") {
                setTotalItems(response?.data?.total)
                setFeatureSpecification(response?.data?.data)
                // setLoading(false);
            }
        } catch (error) {
            // setLoading(false);
            toast.error(
                error.response?.data?.message || "Failed to fetch data types"
            );
        }
    }

    // useEffect(() => {
    // getFeatures();
    // getFeatureSpecification();
    // }, [])

    // console.log("setFeatures", features);
    // console.log("getFeatureSpecification", featureSpecification);

    useEffect(() => {
        const fetchLocationDetails = async () => {
            if (selectedCountryId) {
                setIsLocationLoading(true);
                setLocationData([]);
                setValue("location", null);
                try {
                    const response = await LocationService.Queries.getLocationByCountryId({
                        _country_id: selectedCountryId,
                        _page: 1,
                        _perPage: 1000,
                    });
                    const locationData = response.data?.data.map((location) => ({
                        value: location.l_id,
                        label: location.l_name,
                    }));
                    setLocationData(locationData);
                } catch (error) {
                    toast.error("Failed to fetch locations");
                } finally {
                    setIsLocationLoading(false);
                }
            } else {
                setLocationData([]);
            }
        };
        fetchLocationDetails();
    }, [selectedCountryId, setValue]);

    useEffect(() => {
        const fetchOutletDetails = async () => {
            if (selectedShopId) {
                setIsOutletLoading(true);
                setOutletData([]);
                setValue("outlet", null);
                try {
                    const response = await OutletService.Queries.getOutletByShopId({
                        _shop_id: selectedShopId,
                        _page: 1,
                        _perPage: 1000,
                    });
                    const outletOptions = response?.data?.data.map((outlet) => ({
                        value: outlet.uo_id,
                        label: outlet.uo_name,
                    }));
                    setOutletData(outletOptions);
                } catch (error) {
                    toast.error("Failed to fetch outlets");
                } finally {
                    setIsOutletLoading(false);
                }
            } else {
                setOutletData([]);
            }
        };
        fetchOutletDetails();
    }, [selectedShopId, setValue]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        console.log("Data", data);
        const formData = new FormData();
        formData.append("p_type_id", data.p_type_id || '')
        formData.append("p_category_id", data.category || '');
        formData.append("p_name", data.productName || '');
        formData.append("p_brand_id", data.brand || '');
        formData.append("p_model_id", data.model || '');
        formData.append("p_package_id", data.p_package_id || 0);
        formData.append("p_shop_id", data.shop || '');
        formData.append("p_outlet_id", data.outlet || 0);
        // formData.append("p_country_id", data.country || '');
        formData.append("p_location_id", data.location || '');
        formData.append("p_serial_no", data.serialNumber);
        formData.append("p_video_link", data.videoLink);
        formData.append("p_description[pbl]", data.pbl_description || '');
        formData.append("p_description[meta]", data.special_description || '');
        formData.append("p_description[user]", data.user_description || '');
        // formData.append("p_code", data.code);

        formData.append("p_primary_image", data.image);

        data.images.length > 0 && data.images.forEach((file) => {
            formData.append("p_images[]", file);
        });


        data.prices.length > 0 && data.prices.forEach((item, index) => {
            formData.append("pp_serial_number[]", index + 1);
            formData.append("pp_purchase_price[]", item.purchase_price || '');
            formData.append("pp_regular_price[]", item.regular_price || '');
            formData.append("pp_discount_percentage[]", item.discount || '');
            formData.append("pp_discount_price[]", item.discount_price || '');
            formData.append("pp_asking_price[]", item.asking_price || '');
            formData.append("pp_fixed_price[]", item.fixed_price || '');
            formData.append("pp_unit_id[]", item.unit_id);
            formData.append("pp_unit_count[]", item.unit_count);
        });

        console.log("Data.attributes", data.attributes);

        // Add attributes data
        data.attributes.length > 0 && data.attributes.forEach((item, index) => {
            if (item.attribute_id && item.attribute_value_id) {
                formData.append("pam_attr_id[]", item.attribute_id);
                formData.append("pam_attr_value_id[]", item.attribute_value_id);
            }
        });

        console.log("Data.extraInfo", data.extraInfo);

        // Add extra information
        data.extraInfo.length > 0 && data.extraInfo.forEach((item, index) => {
            if (item.title && item.value) {
                formData.append("ed_entity[]", 'Product');
                formData.append("ed_entity_key[]", item.title);
                formData.append("ed_entity_value[]", item.value);
            }
        });

        selectedFsId.forEach((fsId) => {
          formData.append("p_fs[]", fsId);
        });



        // console.log("Form Data Entries:", [...formData.entries()]);
        // console.log("Form Data Entries:", [...formData.entries()]);

        try {
            const response = await GeneralProductService.Commands.createGeneralProduct(formData);

            if (response.status == 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Product created successfully!',
                }).then(() => {
                    reset();
                    router.push("/dashboard/products/general-product/list");
                });
            }
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setIsSubmitting(false);
        }



    };



    console.log("selectedFsId", selectedFsId);

    const handleRemoveImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
            resetField("image");
        }
    };

    const handleRemoveImages = (index) => {
        URL.revokeObjectURL(imagesPreview[index]);

        const newImagesPreview = imagesPreview.filter((_, i) => i !== index);
        setImagesPreview(newImagesPreview);

        const currentImages = getValues("images");
        const newImages = currentImages.filter((_, i) => i !== index);
        setValue("images", newImages, { shouldValidate: true });
    };

    useEffect(() => {
        // Revoke the data uris to avoid memory leaks
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
            imagesPreview.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreview, imagesPreview]);



    // ProductFeatureSpecificationModal
    const handlePackageClick = async (id) => {
        setSelectedFsId([]);
        await getFeatureData(id);
        setFeatureModalShow(true);
    }


    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className="md:px-6 ">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-white shadow-sm rounded-lg mb-6 border border-gray-200 mt-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            ➕ Add Product
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Create a new product listing.
                        </p>
                    </div>
                    <div className="text-right">
                        <Button
                            type="button"
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

                <div className="w-full mt-5 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                    {/* ----------Section One---------- */}
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-4">

                            {/* Product Type */}
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="p_type_id">
                                    Product Type
                                </label>
                                <Controller
                                    name="p_type_id" // This is the field for the product type
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            id="p_type_id"
                                            options={materCategoryItems.map(item => ({ value: String(item.c_id), label: item.c_name }))}
                                            onChange={(selectedOption) => {
                                                const value = selectedOption ? selectedOption.value : '';
                                                field.onChange(value);
                                                // When product type changes, reset the category selection
                                                setValue("category", null, { shouldValidate: true });
                                                setCategoryHistory([]);
                                                if (value) {
                                                    fetchCategories(value);
                                                }
                                            }}
                                            value={materCategoryItems.map(item => ({ value: String(item.c_id), label: item.c_name })).find(opt => opt.value === field.value) || null}
                                            placeholder="Select Product Type"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    )}
                                />
                                {errors.p_type_id && <p className="text-red-500 text-sm">{errors.p_type_id.message}</p>}
                            </div>


                            {/* materCategoryItems */}



                            {/* Category */}
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="category">
                                    Category
                                </label>
                                <div className="relative" ref={categoryDropdownRef}>
                                    <div onClick={() => selectedProductTypeId && setIsCategoryListVisible(!isCategoryListVisible)} className={`flex justify-between items-center border rounded-lg p-2 bg-white shadow-sm ${selectedProductTypeId ? 'cursor-pointer' : 'cursor-not-allowed bg-gray-100'}`}>
                                        <span className="text-sm text-gray-500">
                                            {categoryHistory.length === 0 && (selectedProductTypeId ? "Select a category..." : "Select Product Type first")}
                                            {categoryHistory.map((cat, index) => (
                                                <span key={cat.c_id}>
                                                    {cat.c_name} {index < categoryHistory.length - 1 ? ' / ' : ''}
                                                </span>
                                            ))}
                                        </span>
                                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isCategoryListVisible ? 'rotate-180' : ''}`} />
                                    </div>

                                    {isCategoryListVisible && selectedProductTypeId && (
                                        <div className="absolute top-full left-0 w-full bg-white border mt-1 rounded-lg shadow-lg z-10 p-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    {categoryHistory.length > 0 && (
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); handleCategoryBack(); }} className="hover:underline text-red-500 pr-2">Back</button>
                                                    )}
                                                </div>
                                            </div>
                                            {isCategoryLoading ? (
                                                <div>Loading...</div>
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
                                    render={({ field }) => <input {...field} value={field.value || ''} type="hidden" />}
                                />
                                {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
                            </div>


                            {/* Product Name */}
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="product-name">
                                    Product Name
                                </label>
                                <input
                                    id="product-name"
                                    type="text"
                                    placeholder="Product name"
                                    className={`outline-none py-2 px-4 rounded border ${errors.productName ? "border-red-500" : "border-gray-300"} focus:border-orange-500 transition`}
                                    {...register("productName")}
                                />
                                {errors.productName && <p className="text-red-500 text-sm">{errors.productName.message}</p>}
                            </div>


                            {/* Brand */}
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="brand">
                                    Brand
                                </label>
                                <Controller
                                    name="brand"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={brandData}
                                            onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                            value={brandData.find(option => option.value === field.value)}
                                            placeholder="Select Brand"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    )}
                                />
                                {errors.brand && <p className="text-red-500 text-sm">{errors.brand.message}</p>}
                            </div>


                            {/* Model */}
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="model">
                                    Model
                                </label>
                                <Controller
                                    name="model"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={modelData}
                                            onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                            value={modelData.find(option => option.value === field.value)}
                                            placeholder={isModelLoading ? "Loading..." : "Select Model"}
                                            isDisabled={!selectedBrandId || isModelLoading}
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    )}
                                />
                                {errors.model && <p className="text-red-500 text-sm">{errors.model.message}</p>}
                            </div>


                            {/* Package */}
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="p_package_id">
                                    Package
                                </label>
                                <Controller
                                    name="p_package_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={packageData}
                                            onChange={(selectedOption) => {
                                                field.onChange(selectedOption ? selectedOption.value : '');
                                                handlePackageClick(selectedOption ? selectedOption.value : '');
                                            }}
                                            // onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                            value={packageData.find(option => option.value === field.value)}
                                            placeholder={isPackageLoading ? "Loading..." : "Select Package"}
                                            isDisabled={!selectedModelId || isPackageLoading}
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    )}
                                />
                                {errors.p_package_id && <p className="text-red-500 text-sm">{errors.p_package_id.message}</p>}
                            </div>



                            {/* Shop */}
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="shop">
                                    Shop
                                </label>
                                <Controller
                                    name="shop"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={shopData}
                                            onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                            value={shopData.find(option => option.value === field.value)}
                                            placeholder="Select Shop"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    )}
                                />
                                {errors.shop && <p className="text-red-500 text-sm">{errors.shop.message}</p>}
                            </div>


                            {/* Code */}
                            {/* <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="code">
                                    Code
                                </label>
                                <Controller
                                    name="code"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={isShopCodeLoading ? [{ value: "Loading...", label: "Loading..." }] :
                                                shopCodeData.map(item => ({
                                                    value: String(item.code),
                                                    label: `${item.exist ? "⚪️" : "🟢"} ${item.code}`,
                                                }))}
                                            onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                            value={shopCodeData.find(item => String(item.code) === field.value) ? { value: field.value, label: `${shopCodeData.find(item => String(item.code) === field.value).exist ? "⚪️" : "🟢"} ${field.value}` } : null}
                                            placeholder={selectedShopId ? "Select Code" : "Select Shop First"}
                                            isDisabled={!selectedShopId || isShopCodeLoading}
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    )}
                                />
                                {errors.code && <p className="text-red-500 text-sm">{errors.code.message}</p>}
                            </div> */}





                            {/* Outlet */}
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="outlet">
                                    Outlet
                                </label>
                                <Controller
                                    name="outlet"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={outletData}
                                            onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                            value={outletData.find(option => option.value === field.value)}
                                            placeholder={isOutletLoading ? "Loading..." : "Select Outlet"}
                                            isDisabled={!selectedShopId || isOutletLoading}
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    )}
                                />
                                {errors.outlet && <p className="text-red-500 text-sm">{errors.outlet.message}</p>}
                            </div>


                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="country">
                                    Country
                                </label>
                                <Controller
                                    name="country"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={countryData}
                                            onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                            value={countryData.find(option => option.value === field.value)}
                                            placeholder="Select Country"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    )}
                                />
                                {errors.country && <p className="text-red-500 text-sm">{errors.country.message}</p>}
                            </div>


                            {/* Location */}
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="location">
                                    Location
                                </label>
                                <Controller
                                    name="location"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={locationData}
                                            onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                            value={locationData.find(option => option.value === field.value)}
                                            placeholder={isLocationLoading ? "Loading..." : "Select Location"}
                                            isDisabled={!selectedCountryId || isLocationLoading}
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    )}
                                />
                                {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
                            </div>



                            {/* Serial Number  */}
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="serial-number">
                                    Serial Number
                                </label>
                                <input
                                    id="serial-number"
                                    type="text"
                                    placeholder="Serial Number"
                                    className={`outline-none py-2 px-4 rounded border ${errors.serialNumber ? "border-red-500" : "border-gray-300"} focus:border-orange-500 transition`}
                                    {...register("serialNumber")}
                                />
                                {errors.serialNumber && <p className="text-red-500 text-sm">{errors.serialNumber.message}</p>}
                            </div>


                            {/* Video Link */}
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="video-link">
                                    Video Link
                                </label>
                                <input
                                    id="video-link"
                                    type="text"
                                    placeholder="https://example.com/video"
                                    className={`outline-none py-2 px-4 rounded border ${errors.videoLink ? "border-red-500" : "border-gray-300"} focus:border-orange-500 transition`}
                                    {...register("videoLink")}
                                />
                                {errors.videoLink && <p className="text-red-500 text-sm">{errors.videoLink.message}</p>}
                            </div>

                            {/* PBL Description  */}
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="pbl_description">
                                    PBL Description
                                </label>
                                <textarea
                                    id="pbl_description"
                                    placeholder="PBL description"
                                    className={`outline-none py-2 px-4 rounded border ${errors.pbl_description ? "border-red-500" : "border-gray-300"} focus:border-orange-500 transition`}
                                    {...register("pbl_description")}
                                    rows="6"
                                />
                                {errors.pbl_description && <p className="text-red-500 text-sm">{errors.pbl_description.message}</p>}
                            </div>

                            {/* Special Description  */}
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="special_description">
                                    Special Description
                                </label>
                                <textarea
                                    id="special_description"
                                    placeholder="PBL description"
                                    className={`outline-none py-2 px-4 rounded border ${errors.special_description ? "border-red-500" : "border-gray-300"} focus:border-orange-500 transition`}
                                    {...register("special_description")}
                                    rows="6"
                                />
                                {errors.special_description && <p className="text-red-500 text-sm">{errors.special_description.message}</p>}
                            </div>


                            {/* Special Description  */}
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="user_description">
                                    User Description
                                </label>
                                <textarea
                                    id="user_description"
                                    placeholder="User description"
                                    className={`outline-none py-2 px-4 rounded border ${errors.user_description ? "border-red-500" : "border-gray-300"} focus:border-orange-500 transition`}
                                    {...register("user_description")}
                                    rows="6"
                                />
                                {errors.user_description && <p className="text-red-500 text-sm">{errors.user_description.message}</p>}
                            </div>


                        </div>

                        {/* -------------Image Section-------------- */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* image */}
                            <div className="col-span-1 flex flex-col gap-2">
                                <label className="text-base font-medium">Image</label>
                                <Controller
                                    name="image"
                                    control={control}
                                    render={({ field: { onChange } }) => (
                                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-lg p-6 hover:border-blue-500 transition">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id="profilePic"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (imagePreview) URL.revokeObjectURL(imagePreview);
                                                        setImagePreview(URL.createObjectURL(file));
                                                        onChange(file);
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor="profilePic"
                                                className="cursor-pointer flex flex-col items-center gap-2 text-blue-600 font-medium"
                                            >
                                                <div className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                                                    Drop here to attach or Upload
                                                </div>
                                                <span className="text-sm text-gray-500">Max size: 10MB</span>
                                            </label>
                                        </div>
                                    )}
                                />
                                <div className="mt-2">
                                    <div className="relative flex items-center justify-center">
                                        {imagePreview ? (
                                            <>
                                                <div className="relative h-28 w-28">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="h-28 w-28 object-cover rounded-md shadow-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveImage}
                                                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-base shadow"
                                                        style={{ zIndex: 2 }}
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="h-28 w-28 flex items-center justify-center rounded-md shadow-lg bg-gray-100 border border-gray-300 text-gray-400 text-2xl">
                                                <span className="">+</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
                            </div>

                            {/*Images */}
                            <div className="col-span-2 flex flex-col gap-2">
                                <label className="text-base font-medium">Images</label>
                                <Controller
                                    name="images"
                                    control={control}
                                    render={({ field: { onChange } }) => (
                                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-lg p-6 hover:border-blue-500 transition">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id="nidFiles"
                                                className="hidden"
                                                multiple
                                                onChange={(e) => {
                                                    const newFiles = Array.from(e.target.files || []);
                                                    if (newFiles.length > 0) {
                                                        const existingFiles = getValues("images") || [];

                                                        // Prevent duplicates
                                                        const uniqueNewFiles = newFiles.filter(
                                                            (newFile) =>
                                                                !existingFiles.some(
                                                                    (existingFile) =>
                                                                        existingFile.name === newFile.name &&
                                                                        existingFile.size === newFile.size &&
                                                                        existingFile.lastModified === newFile.lastModified
                                                                )
                                                        );

                                                        if (uniqueNewFiles.length === 0) return;

                                                        // Limit to max 12 images
                                                        const totalImages = existingFiles.length + uniqueNewFiles.length;
                                                        let combinedFiles = [...existingFiles, ...uniqueNewFiles];
                                                        if (totalImages > 12) {
                                                            toast.error("Maximum 12 images allowed.");
                                                            combinedFiles = combinedFiles.slice(0, 12);
                                                        }
                                                        const allowedNewPreviews = 12 - existingFiles.length;
                                                        const newPreviewUrls = uniqueNewFiles.slice(0, allowedNewPreviews).map((file) =>
                                                            URL.createObjectURL(file)
                                                        );

                                                        setImagesPreview((prev) => [...prev, ...newPreviewUrls].slice(0, 12));
                                                        onChange(combinedFiles);
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor="nidFiles"
                                                className="cursor-pointer flex flex-col items-center gap-2 text-blue-600 font-medium"
                                            >
                                                <div className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                                                    Drop here to attach or Upload
                                                </div>
                                                <span className="text-sm text-gray-500">Max size: 10MB</span>
                                            </label>
                                        </div>
                                    )}
                                />
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {imagesPreview.map((url, index) => (
                                        <div key={url} className="relative">
                                            <img
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                className="h-28 w-28 object-cover rounded-md shadow-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImages(index)}
                                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-base shadow"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                    {[...Array(12 - imagesPreview.length)].map((_, index) => (
                                        <div key={`placeholder-${index}`} className="h-28 w-28 flex items-center justify-center rounded-md shadow-lg bg-gray-100 border border-gray-300 text-gray-400 text-2xl">
                                            <span className="">+</span>
                                        </div>
                                    ))}
                                </div>
                                {errors.images && (!imagesPreview.length || getValues('images').length === 0) && (
                                    <p className="text-red-500 text-sm">{errors.images.message}</p>
                                )}
                            </div>
                        </div>
                        {/* ----------------------- */}

                        {/* <div className="mt-6 mb-4 border-t pt-4">
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
                                >
                                    Next Step
                                </button>
                            </div>
                        </div> */}
                    </div>

                    {/* ----------Section One---------- */}
                    <div>
                        <h1 className="text-2xl font-medium mb-4 border-b pb-2">Product Price</h1>
                        {/* ----------Product Price------------- */}
                        {priceFields.map((field, index) => (
                            <div key={field.id} className="border rounded-lg p-4 bg-white shadow-sm mb-4">
                                <div className="flex flex-col gap-4 w-full">
                                    {/* Price Inputs */}
                                    <div className="flex items-center w-full mb-4">
                                        <div className="flex-1">
                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-base font-medium">Purchase Price</label>
                                                    <Controller name={`prices.${index}.purchase_price`} control={control} render={({ field }) => <input {...field} type="number" className={`outline-none py-2 px-4 rounded border ${errors.prices?.[index]?.purchase_price ? "border-red-500" : "border-gray-300"} focus:border-orange-500 transition`} />} />
                                                    {errors.prices?.[index]?.purchase_price && <p className="text-red-500 text-sm">{errors.prices?.[index]?.purchase_price.message}</p>}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-base font-medium">Regular Price</label>
                                                    <Controller name={`prices.${index}.regular_price`} control={control} render={({ field }) => <input {...field} type="number" className={`outline-none py-2 px-4 rounded border ${errors.prices?.[index]?.regular_price ? "border-red-500" : "border-gray-300"} focus:border-orange-500 transition`} />} />
                                                    {errors.prices?.[index]?.regular_price && <p className="text-red-500 text-sm">{errors.prices?.[index]?.regular_price.message}</p>}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-base font-medium">Discount(%)</label>
                                                    <Controller
                                                        name={`prices.${index}.discount`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <input
                                                                {...field}
                                                                type="number"
                                                                onChange={(e) => {
                                                                    const value = Math.max(0, Math.min(100, Number(e.target.value)));
                                                                    field.onChange(value);
                                                                }}
                                                                className="outline-none py-2 px-4 rounded border border-gray-300 focus:border-orange-500 transition"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-base font-medium">Discount Price</label>
                                                    <Controller name={`prices.${index}.discount_price`} control={control} render={({ field }) => <input {...field} type="number" className="outline-none py-2 px-4 rounded border border-gray-300 focus:border-orange-500 transition" />} />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-base font-medium">Asking Price</label>
                                                    <Controller name={`prices.${index}.asking_price`} control={control} render={({ field }) => <input {...field} type="number" className="outline-none py-2 px-4 rounded border border-gray-300 focus:border-orange-500 transition" />} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full mt-4">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-base font-medium">Fixed Price</label>
                                                    <Controller name={`prices.${index}.fixed_price`} control={control} render={({ field }) => <input {...field} type="number" className="outline-none py-2 px-4 rounded border border-gray-300 focus:border-orange-500 transition" />} />
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <label className="text-base font-medium" htmlFor={`unit_id_${index}`}>
                                                        Unit
                                                    </label>
                                                    <Controller
                                                        name={`prices.${index}.unit_id`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Select
                                                                {...field}
                                                                id={`unit_id_${index}`}
                                                                options={unitData}
                                                                value={unitData.find(option => option.value === field.value)}
                                                                onChange={option => field.onChange(option.value)}
                                                                className="react-select-container"
                                                                classNamePrefix="react-select"
                                                            />
                                                        )}
                                                    />
                                                    {errors.prices?.[index]?.unit_id && <p className="text-red-500 text-sm">{errors.prices?.[index]?.unit_id.message}</p>}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-base font-medium">Unit Count</label>
                                                    <Controller name={`prices.${index}.unit_count`} control={control} render={({ field }) => <input {...field} type="text" className={`outline-none py-2 px-4 rounded border ${errors.prices?.[index]?.unit_count ? "border-red-500" : "border-gray-300"} focus:border-orange-500 transition`} />} />
                                                    {errors.prices?.[index]?.unit_count && <p className="text-red-500 text-sm">{errors.prices?.[index]?.unit_count.message}</p>}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-base font-medium">Wholesale Price</label>
                                                    <Controller name={`prices.${index}.wholesale_price`} control={control} render={({ field }) => <input {...field} type="number" className="outline-none py-2 px-4 rounded border border-gray-300 focus:border-orange-500 transition" />} />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-base font-medium">
                                                        Min Unit to Order Wholesale
                                                    </label>
                                                    <Controller name={`prices.${index}.min_unit_wholesale`} control={control} render={({ field }) => <input {...field} type="number" className="outline-none py-2 px-4 rounded border border-gray-300 focus:border-orange-500 transition" />} />
                                                </div>
                                            </div>
                                        </div>

                                        {
                                            priceFields.length > 1 && (
                                                <div className="border-l ml-4 pl-4">
                                                    <button
                                                        type="button"
                                                        className="ml-4 mt-6 bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded-full shadow"
                                                        onClick={() => removePrice(index)}
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            )
                                        }

                                    </div>

                                </div>
                            </div>
                        ))}

                        <div className="flex flex-col items-end justify-end w-full md:w-auto mt-2">
                            <button
                                type="button"
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition font-semibold"
                                onClick={() => appendPrice({ purchase_price: "", regular_price: "", discount: "", discount_price: "", asking_price: "", fixed_price: "", unit_id: "", unit_count: "", wholesale_price: "", min_unit_wholesale: "" })}
                            >
                                <Plus />
                            </button>
                        </div>
                        {/* End Product Price Section */}
                    </div>



                    {/* Product Attribute */}
                    <div className="mb-4">
                        <h1 className="text-2xl font-medium mb-4 border-b pb-2">Product Feature</h1>
                        {attributeFields.map((field, index) => (
                            <AttributeField
                                key={field.id}
                                control={control}
                                index={index}
                                watch={watch}
                                features={features}
                                remove={removeAttribute}
                                showRemoveButton={attributeFields.length > 1}
                                setValue={setValue}
                                errors={errors}
                            />
                        ))}
                        <div className="flex flex-col items-end justify-end w-full md:w-auto mt-2">
                            <button
                                type="button"
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition font-semibold"
                                onClick={() => appendAttribute({ attribute_id: "", attribute_value_id: "" })}
                            >
                                <Plus />
                            </button>
                        </div>
                    </div>

                    {/* Extra Information */}
                    <div className="mb-4">
                        <h1 className="text-2xl font-medium mb-4 border-b pb-2">Extra Information</h1>
                        {extraInfoFields.map((field, index) => (
                            <div key={field.id} className="border rounded-lg p-4 bg-white shadow-sm mb-4">
                                <div className="flex items-center w-full">
                                    <div className="flex-1">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-base font-medium">Information Title</label>
                                                <Controller name={`extraInfo.${index}.title`} control={control} render={({ field }) => <input {...field} type="text" className="outline-none py-2 px-4 rounded border border-gray-300 focus:border-orange-500 transition" />} />
                                                {errors.extraInfo?.[index]?.title && <p className="text-red-500 text-sm">{errors.extraInfo?.[index]?.title.message}</p>}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-base font-medium">Information Value</label>
                                                <Controller name={`extraInfo.${index}.value`} control={control} render={({ field }) => <input {...field} type="text" className="outline-none py-2 px-4 rounded border border-gray-300 focus:border-orange-500 transition" />} />
                                                {errors.extraInfo?.[index]?.value && <p className="text-red-500 text-sm">{errors.extraInfo?.[index]?.value.message}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    {extraInfoFields.length > 1 && (
                                        <div className="border-l ml-4 pl-4">
                                            <button
                                                type="button"
                                                className="ml-4 mt-6 bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded-full shadow"
                                                onClick={() => removeExtraInfo(index)}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div className="flex flex-col items-end justify-end w-full md:w-auto mt-2">
                            <button
                                type="button"
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition font-semibold"
                                onClick={() => appendExtraInfo({ title: "", value: "" })}
                            >
                                <Plus />
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 mb-4 border-t pt-4">
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
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
    );
};

export default function Page() {
    return (
        <>
            <GeneralProductCreate />
        </>
    );
}
