"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
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
import { onlyDecimalInput, onlyNumberInput } from "@/helpers/functions";
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
import { Cog } from "lucide-react";
import { hasPermission } from "@/lib/utils";

// Yup Validation Schema
const schema = yup.object().shape({
  v_title: yup.string().required("Title is Required"),
  v_brand_id: yup.string().required("Brand is Required"),
  v_model_id: yup.string().required("Model is Required"),
  v_shop_id: yup.string().required("Shop is Required"),
  // v_code: yup.string().required("Code is Required"),
});


const Vehicle = () => {
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
  const [featureData, setFeatureData] = useState([]);
  const [featureModalShow, setFeatureModalShow] = useState(false);
  const [fontImageError, setFontImageError] = useState(false);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [priceSelection, setPriceSelection] = useState('fixed');
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
  ]);
  const [partnerData, setPartnerData] = useState([]);

  const { selectedShop, permissionList, selectedCompanyShop } = useAppContext();


  const router = useRouter();

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
      vp_show_price: "fixed"
    }
  });

  const selectedShopId = watch("v_shop_id");
  const selectedBrandId = watch("v_brand_id");
  const selectedModelId = watch("v_model_id");
  const vUrgentSale = watch("v_urgent_sale");
  const userFixedPrice = watch("vp_user_fixed_price");
  const selectedCountryId = watch("v_country_id");

  // v_shop_idW

  // console.log("--------------------------------00000-9==")
  // console.log("selected shop id", watch('v_shop_id'))
  // console.log("selected Company Shop id", selectedCompanyShop?.shop?.s_id)



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


  // console.log("shopCodeData", shopCodeData);

  const [isHandleNext, setIsHandleNext] = useState(false);
  const [isUpdate, setIsUpdate] = useState('new');
  // const 

  const handleNext = async () => {
    setIsUpdate('processing');
    const result = await trigger([
      "v_title",
      "v_brand_id",
      "v_model_id",
      "v_shop_id",
      // "v_code",
      "v_priority",
      "v_user_mode",
      "vp_user_fixed_price",
      "vp_show_price",
      "vp_user_asking_price",
      "vp_user_variable_price",
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
        formData.append("v_title", watch("v_title"));
        formData.append("v_brand_id", watch("v_brand_id"));
        formData.append("v_model_id", watch("v_model_id"));
        formData.append("v_shop_id", watch("v_shop_id"));
        // formData.append("v_code", watch("v_code"));
        formData.append("v_priority", watch("v_priority") || '');
        formData.append("v_user_mode", watch("v_user_mode") || '');
        formData.append("vp_user_fixed_price", watch("vp_user_fixed_price"));
        formData.append("vp_user_asking_price", watch("vp_user_asking_price"));
        formData.append("vp_user_variable_price", watch("vp_user_variable_price"));
        formData.append("vp_show_price", watch("vp_show_price"));

        // Add front image
        if (frontImageFile) {
          formData.append("vi_front_image", frontImageFile);
        }

        additionalImages.forEach((file) => {
          formData.append("vi_image[]", file);
        });

        setShowAdditionalFields(true);

        // Call initial submission API
        const response = await VehicleService.Commands.storeVehicle(formData);

        // console.log("response::", response);

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

    // console.log("v_user_mode", data);
    // process.exit();
    if (isHandleNext) {

      const formData = new FormData();

      // Include all fields for the update
      for (let key in data) {
        if (key !== "v_id") { // Don't include the ID in the form data
          formData.append(key, data[key]);
        }
      }

      // Include all fields for the update
      for (let key in data) {
        formData.append(key, data[key]);
      }

      // Transform checkbox values
      formData.append("vp_show_price", data.vp_show_price ? "fixed" : "asking");
      formData.append("v_urgent_sale", data.v_urgent_sale ? 1 : 0);
      formData.append("v_is_saleBy_pbl", data.v_is_saleBy_pbl ? 1 : 0);
      formData.append("v_location_id", data.v_location_id ? data.v_location_id : '');
      formData.append("v_availability_id", data.v_availability_id ? data.v_availability_id : '');
      formData.append("v_outlet_id", data.v_outlet_id ? data.v_outlet_id : '');
      formData.append("v_capacity", data.v_capacity ? data.v_capacity : '');
      formData.append("v_mileage", data.v_mileage ? data.v_mileage : '');
      formData.append("v_registration", data.v_registration ? data.v_registration : '');
      formData.append("v_mod_year", data.v_mod_year ? data.v_mod_year : '');
      formData.append("v_seat_id", data.v_seat_id ? data.v_seat_id : '');
      formData.append("v_chassis", data.v_chassis ? data.v_chassis : '');
      formData.append("v_engine", data.v_engine ? data.v_engine : '');
      formData.append("v_country_id", data.v_country_id ? data.v_country_id : '');
      formData.append("v_fuel_id", data.v_fuel_id ? data.v_fuel_id : '');
      // formData.append("v_code", data.v_code ? data.v_code : '');
      formData.append("v_priority", data.v_priority ? data.v_priority : '');


      formData.append("vp_user_purchase_price", data.vp_user_purchase_price ? data.vp_user_purchase_price : '');
      formData.append("vp_user_fixed_price", data.vp_user_fixed_price ? data.vp_user_fixed_price : '');
      formData.append("vp_user_asking_price", data.vp_user_asking_price ? data.vp_user_asking_price : '');
      formData.append("vp_user_variable_price", data.vp_user_variable_price ? data.vp_user_variable_price : '');
      formData.append("vp_pbl_additional_amount", data.vp_pbl_additional_amount ? data.vp_pbl_additional_amount : '');
      formData.append('v_user_mode', data.v_user_mode ? data.v_user_mode : '');
      formData.append("vp_pbl_price_status", data.vp_pbl_price_status ? 1 : 0);
      formData.append("vp_pbl_hs_price_status", data.vp_pbl_hs_price_status ? 1 : 0);
      formData.append("v_int_grade_id", data.v_int_grade_id ? data.v_int_grade_id : '');
      formData.append("v_ext_grade_id", data.v_ext_grade_id ? data.v_ext_grade_id : '');
      formData.append("v_condition_id", data.v_condition_id ? data.v_condition_id : '');
      formData.append("v_transmission_id", data.v_transmission_id ? data.v_transmission_id : '');
      formData.append("v_fuel_id", data.v_fuel_id ? data.v_fuel_id : '');
      formData.append("v_grade_id", data.v_grade_id ? data.v_grade_id : '');
      formData.append("v_skeleton_id", data.v_skeleton_id ? data.v_skeleton_id : '');
      formData.append("v_color_id", data.v_color_id ? data.v_color_id : '');
      formData.append("v_edition_id", data.v_edition_id ? data.v_edition_id : '');



      // v_location_id




      if (!data.v_id) {
        if (isUpdate === 'failed') {
          setLoading(true);
          // Add front image
          if (frontImageFile) {
            formData.append("vi_front_image", frontImageFile);
          }

          additionalImages.forEach((file) => {
            formData.append("vi_image[]", file);
          });

          // setShowAdditionalFields(true);

          // Call initial submission API
          try {
            const response = await VehicleService.Commands.storeVehicle(formData);

            if (response.status == 'success') {
              setAdditionalImages([]);
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

        formData.append("v_int_grade_id", data?.v_int_grade_id || '');
        formData.append("v_ext_grade_id", data.v_ext_grade_id || '');
        formData.append("v_condition_id", data.v_condition_id || '');
        formData.append("v_transmission_id", data.v_transmission_id || '');
        formData.append("v_fuel_id", data.v_fuel_id || '');
        formData.append("v_grade_id", data.v_grade_id || '');
        formData.append("v_skeleton_id", data.v_skeleton_id || '');
        formData.append("v_color_id", data.v_color_id || '');
        formData.append("v_edition_id", data.v_edition_id || '');

        formData.append("v_availability_id", data.v_availability_id || '');
        formData.append("v_capacity", data.v_capacity || '');
        formData.append("v_mileage", data.v_mileage || '');
        formData.append("v_registration", data.v_registration || '');
        formData.append("v_mod_year", data.v_mod_year || '');

        formData.append("v_seat_id", data.v_seat_id || '');
        formData.append("vp_user_purchase_price", data.vp_user_purchase_price || '');
        formData.append("vp_user_fixed_price", data.vp_user_fixed_price || '');
        formData.append("vp_user_asking_price", data.vp_user_asking_price || '');
        formData.append("vp_user_variable_price", data.vp_user_variable_price || '');
        formData.append("vp_pbl_additional_amount", data.vp_pbl_additional_amount || '');
        formData.append("vp_pbl_price_status", data.vp_pbl_price_status ? 1 : 0);
        formData.append("vp_pbl_hs_price_status", data.vp_pbl_hs_price_status ? 1 : 0);


        selectedFsId.forEach((fsId) => {
          formData.append("v_fs[]", fsId);
        });


        formData.append('_method', 'PUT');

        try {
          // Call update API instead of store
          const response = await VehicleService.Commands.updateVehicle(data.v_id, formData);

          if (response.status == 'success') {
            setAdditionalImages([]);
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  // shop data get from api
  const getShopData = async () => {
    try {
      const userData = localStorage.getItem("user");
      const userInfo = userData && JSON.parse(userData);
      const user = JSON.parse(userInfo);


      // Build request params conditionally
      const params = {
        order: "desc",
        orderBy: "md_id",
        _page: 1,
        _perPage: 1000,
        ...(user?.user_mode !== "admin" && { _user_id: user?.id }),
        // _user_id: user?.id,
        // ...(user.user_mode !== "pbl" && user.user_mode !== "supreme" && { _user_id: user?.id })
      };

      const response = await ShopService.Queries.getShops(params);

      const shopOptions = response.data.data.map((shop) => ({
        value: shop.s_id,
        label: shop.s_title,
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
      const userData = localStorage.getItem("user");
      const userInfo = userData && JSON.parse(userData);
      const user = JSON.parse(userInfo);


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

      // console.log("User Response", response);

      const partnerOptions = response.data.data.map((partner) => ({
        value: partner.id,
        label: partner.name,
      }));

      setPartnerData(partnerOptions);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch data");
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
        label: brand.md_title,
        _page: 1,
        _perPage: 1000,
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



  // ProductFeatureSpecificationModal
  const handlePackageClick = async (id) => {
    setSelectedFsId([]);
    await getFeatureData(id);
    setFeatureModalShow(true);
  }

  // console.log("user\;;;;;;;-----------------------------------------", user?.id);






  const fetchCompanyShops = useCallback(async () => {
    try {
      const response = await ShopService.Queries.getCompanyShops(user?.id);

      if (response.status == 'success') {
        let shopArrayData = [];

        response?.data.forEach((item) => {
          if (item.shop) {
            // console.log("item.shop.s_id:", item.shop.s_id);
            // console.log("permissionList:", permissionList);

            let companyShopId = item.shop.s_id;
            let priceAction = "Create"

            const hasCreatePermission = hasPermission(permissionList, companyShopId, "Vehicle", priceAction);

            // console.log("hasCreatePermission:", hasCreatePermission);
            if (hasCreatePermission) {
              shopArrayData.push({
                value: item.shop.s_id,
                label: item.shop.s_title,
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

    const userData = localStorage.getItem("user");
    const userInfo = userData && JSON.parse(userData);
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }

    getShopData();
    getPartnerData();
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


  // useEffect(() => {
  //   if (companyShops && companyShops.length > 0) {
  //     companyShops.forEach((item) => {
  //       if (item.shop) {
  //         if (!shopData.includes(item.shop.s_id)) {
  //           shopData.push({
  //             value: item.shop.s_id,
  //             label: item.shop.s_title,
  //           });
  //         }

  //       }
  //     });
  //   }
  // }, [companyShops]);




  // console.log("selectedShop", selectedShop);
  // console.log("companyShops::::", companyShops);
  // console.log("shopData::::", shopData);

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
                  {!showAdditionalFields && (
                    <>
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Product Info</h4>
                        <div className="flex w-20 h-1">
                          <div className="w-2/3 bg-green-500"></div>
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
                          ((user?.user_mode === 'supreme') || (user?.user_mode === 'admin')) && (
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

                        {/* <div>
                          <label className="text-base font-medium" htmlFor="customer-name">
                            Code <span className="text-red-500">*</span>
                          </label>
                          <Controller
                            name="v_code"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                options={
                                  isShopCodeLoading ? [{ value: "Loading...", label: "Loading..." }] :
                                    shopCodeData.map(item => ({
                                      value: String(item.code),
                                      label: `${item.exist ? "⚪️" : "🟢"} ${item.code}`,
                                    }))}
                                onChange={(selectedOption) => {
                                  field.onChange(selectedOption ? selectedOption.value : '');
                                  handleSelectChange({ target: { value: selectedOption ? selectedOption.value : '' } });
                                }}
                                value={shopCodeData.find(item => String(item.code) === field.value) ? { value: field.value, label: `${shopCodeData.find(item => String(item.code) === field.value).exist ? "⚪️" : "🟢"} ${field.value}` } : null}
                                placeholder={selectedShopId ? "Select Code" : "Select Shop First"}
                                isDisabled={!selectedShopId}
                                className="basic-single"
                                classNamePrefix="select"
                              />
                            )}
                          />
                          {errors.v_code && (
                            <p className="text-red-500 text-sm">{errors.v_code.message}</p>
                          )}
                        </div> */}

                    
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
                                <Controller
                                  name="v_user_mode"
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      {...field}
                                      options={userModeData}
                                      onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                      value={userModeData.find(option => option.value === field.value)}
                                      placeholder="Select User Mode"
                                      className="basic-single"
                                      classNamePrefix="select"
                                    />
                                  )}
                                />
                              </div>
                            </>
                          )
                        }
                      </div>

                      <hr />

                      <div>
                        <span className="text-sm font-semibold text-gray-600 mb-1">Call PBL Hotline to be Partner</span>
                      </div>


                      {/* User Pricing section */}
                      <div className="mb-3 mt-4">
                        <h4 className="text-sm font-bold text-gray-800 mb-1">User Pricing</h4>
                        <div className="flex w-20 h-1">
                          <div className="w-2/3 bg-green-500"></div>
                          <div className="w-1/3 bg-gray-500/20"></div>
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


                      {/* PBL Pricing section */}
                      {
                        ((user?.user_mode === 'supreme') || (user?.user_mode === 'admin')) && (
                          <div>
                            <div className="mb-3 mt-4">
                              <h4 className="text-lg font-bold text-gray-800 mb-1">PBL Pricing</h4>
                              <div className="flex w-24 h-1">
                                <div className="w-2/3 bg-green-500"></div>
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
                                <Controller
                                  name="vp_pbl_hs_price_status"
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


                              
                            </div>
                          </div>
                        )
                      }

                      {/* <div className="grid grid-cols-4 gap-4">
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

                    </>
                  )}

                  {showAdditionalFields && (
                    <>
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
                          {/* {errors.v_edition_id && (
                            <p className="text-red-500 text-sm">{errors.v_edition_id.message}</p>
                          )} */}
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
                          {/* {errors.v_condition_id && ( <p className="text-red-500 text-sm">{errors.v_condition_id.message}</p> )} */}
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
                          {/* {errors.v_mod_year && ( <p className="text-red-500 text-sm">{errors.v_mod_year.message}</p> )} */}
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
                          {/* {errors.v_grade_id && ( <p className="text-red-500 text-sm">{errors.v_grade_id.message}</p> )} */}
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
                          {/* {errors.v_color_id && ( <p className="text-red-500 text-sm">{errors.v_mileage.message}</p> )} */}
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
                          {/* {errors.v_color_id && ( <p className="text-red-500 text-sm">{errors.v_color_id.message}</p> )} */}
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
                          {/* {errors.v_fuel_id && ( <p className="text-red-500 text-sm">{errors.v_fuel_id.message}</p> )} */}
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
                          {/* {errors.v_seat_id && ( <p className="text-red-500 text-sm">{errors.v_seat_id.message}</p> )} */}
                        </div>

                        {/* <div className="grid grid-cols-4 gap-4 mb-4"> */}
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
                        {/* </div> */}

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

                      </div>

                      {/* <div className="grid grid-cols-2 gap-2 mt-4 mb-4">
                        <div>
                          <label className="text-base font-medium" htmlFor="customer-name">
                            Availability
                          </label>
                          <Controller
                            name="v_availability_id"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                options={availabilityData}
                                onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                                value={availabilityData.find(option => option.value === field.value)}
                                placeholder="Availability"
                                className="basic-single"
                                classNamePrefix="select"
                              />
                            )}
                          />

                        </div>
                      </div> */}

                      {/* <div className="mt-2">
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
                      </div> */}




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



                      {
                        (user?.user_mode === 'supreme') || (user?.user_mode === 'admin') && (
                          <>
                            {/* --------------------------------- */}

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

                            {/* ------------------------------------- */}
                          </>
                        )
                      }


                      {/* SEO Description section */}
                      <div className="mb-3 mt-4">
                        <h4 className="text-lg font-semibold text-gray-800 mb-1">Video Link</h4>
                        <div className="flex w-20 h-1">
                          <div className="w-2/3 bg-green-500"></div>
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
                          <label htmlFor="terms" className={`text-sm ${user?.user_mode == 'member' ? 'text-gray-400' : 'text-gray-600'}`}>
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
        />
      </div>
    </>
  );
};

export default Vehicle;
