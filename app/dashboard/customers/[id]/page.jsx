"use client";
import FollowupsSection from "@/components/CustomerCare/FollowupsSection";
import SearchHistorySection from "@/components/CustomerCare/SearchHistorySection";
import DateRangePicker from "@/components/DateRangePicker";
import EditCustomerModal from "@/components/modals/EditCustomerModal";
import EditSearchHistoryModal from "@/components/modals/EditSearchHistoryModal";
import RangeSlider from "@/components/RangeSlider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAppContext } from "@/context/AppContext";
import { API_URL } from "@/helpers/apiUrl";
import { createApiRequest } from "@/helpers/axios";
import constData from "@/lib/constant";
import LocationService from "@/services/LocationService";
import CategoryService from "@/services/CategoryService";
import MasterDataService from "@/services/MasterDataService";
import PackageService from "@/services/PackageService";
import SearchHistoryService from "@/services/SearchHistoryService";
import ShopService from "@/services/ShopService";
import dayjs from "dayjs";
import { ArrowLeft, ExternalLink, Eye, History, MessageSquare } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import FollowupModal from "../../../../components/modals/FollowupModal";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, comment, setComment }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Are you sure?</h2>
        <p className="text-gray-600 mb-4">Do you really want to stop this followup? This action cannot be undone.</p>
        <p className="text-red-500 text-base font-semibold mb-6">Warning: This will also delete all subsequent, unfinished followups in this sequence.</p>
        <textarea
          value={comment || ""}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-6"
          placeholder="Please provide a reason for stopping (optional)..."
          rows="3"
        ></textarea>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Stop Followup
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
        <p className="text-gray-600 mb-4">Are you sure you want to delete this {itemName}? This action cannot be undone.</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const SearchHistoryEditModal = ({ isOpen, onClose, onSave, historyItem, customer, router, searchHistoryId, allLocations, allShops }) => {
  const { user } = useAppContext();
  const normalizedUser =
    typeof user === "string"
      ? (() => {
          try {
            return JSON.parse(user);
          } catch {
            return null;
          }
        })()
      : user;
  const userRoleName = normalizedUser?.role?.name || normalizedUser?.role_name || normalizedUser?.role || normalizedUser?.user_role;

  const [isConsolidatedView, setIsConsolidatedView] = useState(false);
  const [selectedUserModes, setSelectedUserModes] = useState(["Partner"]);
  const [shopsData, setShopsData] = useState([]);
  const [selectedShops, setSelectedShops] = useState([]);
  const [pendingPackageIds, setPendingPackageIds] = useState(null);

  const [filterFields, setFilterFields] = useState({
    budget: [0, 500000000],
    readyBudget: [0, 500000000],
    v_tax_token_exp_date_from: null,
    v_tax_token_exp_date_to: null,
    v_fitness_exp_date_from: null,
    v_fitness_exp_date_to: null,
    v_insurance_exp_date_from: null,
    v_insurance_exp_date_to: null,
    clientLastPurchaseDate: null,
    availability: [],
    transmission: [],
    registration_year: [],
    model_year: [],
    model: [],
    brand: [],
    int_grade: [],
    ext_grade: [],
    grade: [],
    skeleton: [],
    seat: [],
    fuel: [],
    color: [],
    condition: [],
    package: [],
    category: "",
    title: "",
    code: "",
    mileage: [0, 100000],
    capacity: [0, 50000],
    chassis: "",
    engine: "",
    location: [],
  });

  const [searchType, setSearchType] = useState("wide");

  const [categoryData, setCategories] = useState([]);
  const [brandData, setBrands] = useState([]);
  const [modelData, setModels] = useState([]);
  const [colorData, setColors] = useState([]);
  const [fuelData, setFuels] = useState([]);
  const [transmissionData, setTransmission] = useState([]);
  const [skeletonData, setSkeletonData] = useState([]);
  const [seatData, setSeatData] = useState([]);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [conditionData, setConditionData] = useState([]);
  const [gradeData, setGradeData] = useState([]);
  const [exteriorGradeData, setExteriorGradeData] = useState([]);
  const [interiorGradeData, setInteriorGradeData] = useState([]);
  const [packageData, setPackageData] = useState([]);
  const [locationData, setLocationData] = useState(allLocations);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const yearOptions = [
    { value: "", label: "-Select Year-" },
    ...years.map((year) => ({
      value: year,
      label: year.toString(),
    })),
  ];

  // category data get from api
  const getCategories = async () => {
    try {
      const response = await CategoryService.Queries.getCategories({
        _page: 1,
        _perPage: 1000,
        _parent_id: 0, // Only fetch main categories (parent_id = 0)
      });

      if (response?.status === "success") {
        const categoriesMasterData = response.data?.data || [];
        const categoryData = [
          {
            value: "",
            label: "-Select Category-",
          },
          ...categoriesMasterData.map((category) => ({
            value: category.c_id,
            label: category.c_name,
          })),
        ];
        setCategories(categoryData);
      } else {
        setCategories([{ value: "", label: "-Select Category-" }]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Failed to fetch categories");
      }
      setCategories([{ value: "", label: "-Select Category-" }]);
    }
  };

  // brand data get from api
  const getBrands = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.BRAND_MD_CODE);

      const brandMasterData = response.data?.master_data;
      const brandData = [
        {
          value: "",
          label: "-Select Brand-",
        },
        // First placeholder option
        ...brandMasterData.map((brand) => ({
          value: brand.md_id,
          label: brand.md_title,
        })),
      ];

      setBrands(brandData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  // model data get from api
  const getModels = async (brandIds) => {
    if (!brandIds || brandIds.length === 0) {
      setModels([]);
      return;
    }

    try {
      const response = await MasterDataService.Queries.getModelsByBrand(brandIds);

      const modelMasterData = response.data?.data || response.data || [];
      const modelData = [
        {
          value: "",
          label: "-Select Model-",
        }, // Default placeholder option
        ...modelMasterData.map((model) => ({
          value: model.vm_id,
          label: model.vm_name,
        })),
      ];
      setModels(modelData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const getPackages = async (brandIds, modelIds) => {
    if (!brandIds || brandIds.length === 0 || !modelIds || modelIds.length === 0) {
      setPackageData([{ value: "", label: "-Select Package-" }]);
      return;
    }

    try {
      const response = await PackageService.Queries.getDependentPackages(brandIds, modelIds);

      const packageMasterData = response.data?.data || response.data || [];
      const packageData = [
        {
          value: "",
          label: "-Select Package-",
        },
        ...packageMasterData.map((edition) => ({
          value: edition.p_id,
          label: edition.p_name,
        })),
      ];
      setPackageData(packageData);

      // Check if there are pending package selections from loaded history
      if (pendingPackageIds && pendingPackageIds.length > 0) {
        // Filter to only include valid package IDs that exist in the fetched data
        const validPackageIds = pendingPackageIds.filter(pkgId => 
          packageData.some(pkg => pkg.value === pkgId || pkg.value === String(pkgId))
        );
        
        if (validPackageIds.length > 0) {
          setFilterFields(prev => ({ ...prev, package: validPackageIds }));
        }
        // Clear pending packages after applying
        setPendingPackageIds(null);
      }
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "An unknown error occurred while fetching packages.");
      }
    }
  };

  const getTransmissions = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.TRANSACTION_MD_CODE);

      const transmissionMasterData = response.data?.master_data;
      const transmissionData = [
        {
          value: "",
          label: "-Select Transmission-",
        },
        // First placeholder option
        ...transmissionMasterData.map((transmission) => ({
          value: transmission.md_id,
          label: transmission.md_title,
        })),
      ];

      setTransmission(transmissionData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const getColors = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.COLOR_MD_CODE);

      const colorMasterData = response.data?.master_data;
      const colorData = [
        {
          value: "",
          label: "-Select Color-",
        },
        // First placeholder option
        ...colorMasterData.map((color) => ({
          value: color.md_id,
          label: color.md_title,
        })),
      ];

      setColors(colorData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const getFuels = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.FUEL_MD_CODE);

      const fuelMasterData = response.data?.master_data;
      const fuelData = [
        {
          value: "",
          label: "-Select Fuel-",
        },
        // First placeholder option
        ...fuelMasterData.map((fuel) => ({
          value: fuel.md_id,
          label: fuel.md_title,
        })),
      ];

      setFuels(fuelData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  // 2. Fetch skeleton data from API (similar to getColors)
  const getSkeletons = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.SKELETON_MD_CODE);
      const skeletonMasterData = response.data?.master_data;
      const skeletonOptions = [
        { value: "", label: "-Select Skeleton-" },
        ...skeletonMasterData.map((skeleton) => ({
          value: skeleton.md_id,
          label: skeleton.md_title,
        })),
      ];
      setSkeletonData(skeletonOptions);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const getConditionData = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.CONSTANTS_MD_CODE);
      const conditionMasterData = response.data?.master_data;
      const conditionOptions = [
        { value: "", label: "-Select Condition-" },
        ...conditionMasterData.map((condition) => ({
          value: condition.md_id,
          label: condition.md_title,
        })),
      ];
      setConditionData(conditionOptions);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const getGradeData = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.GRADE_MD_CODE);

      const gradeMasterData = response.data?.master_data;

      const gradeOptions = [
        { value: "", label: "-Select Point-" },
        ...gradeMasterData.map((grade) => ({
          value: grade.md_id,
          label: grade.md_title,
        })),
      ];
      setGradeData(gradeOptions);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const getExteriorGradeData = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.EXTERIOR_GRADE_MD_CODE);

      const gradeMasterData = response.data?.master_data;
      const gradeOptions = [
        { value: "", label: "-Select Grade-" },
        ...gradeMasterData.map((grade) => ({
          value: grade.md_id,
          label: grade.md_title,
        })),
      ];
      setExteriorGradeData(gradeOptions);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const getInteriorGradeData = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.INTERIOR_GRADE_MD_CODE);

      const gradeMasterData = response.data?.master_data;
      const gradeOptions = [
        { value: "", label: "-Select Grade-" },
        ...gradeMasterData.map((grade) => ({
          value: grade.md_id,
          label: grade.md_title,
        })),
      ];
      setInteriorGradeData(gradeOptions);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const getSeatData = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.SEAT_CODE);

      const seatMasterData = response.data?.master_data;
      const seatOptions = [
        { value: "", label: "-Select Grade-" },
        ...seatMasterData.map((seat) => ({
          value: seat.md_id,
          label: seat.md_title,
        })),
      ];
      setSeatData(seatOptions);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const geAvailabilityData = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.USER_AVAILABILITY_MD_CODE);

      const seatMasterData = response.data?.master_data;
      const options = [
        { value: "", label: "-Select Availability-" },
        ...seatMasterData.map((item) => ({
          value: item.md_id,
          label: item.md_title,
        })),
      ];
      setAvailabilityData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([
        getCategories(),
        getBrands(),
        getConditionData(),
        getGradeData(),
        getExteriorGradeData(),
        getInteriorGradeData(),
        getColors(),
        getFuels(),
        getTransmissions(),
        getSkeletons(),
        getSeatData(),
        geAvailabilityData(),
      ]);
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (historyItem) {
      const parsedParams = typeof historyItem.search_params === "string" ? JSON.parse(historyItem.search_params) : historyItem.search_params;

      // Handle packages separately - store them for later application after API fetch
      if (parsedParams.package && Array.isArray(parsedParams.package) && parsedParams.package.length > 0) {
        setPendingPackageIds(parsedParams.package);
      } else if (parsedParams.package && !Array.isArray(parsedParams.package)) {
        setPendingPackageIds([parsedParams.package]);
      } else {
        setPendingPackageIds(null);
      }

      // Set filter fields - ensure all string fields default to empty string, not null
      setFilterFields((prev) => ({
        ...prev,
        title: parsedParams.title || "",
        code: parsedParams.code || "",
        chassis: parsedParams.chassis || "",
        engine: parsedParams.engine || "",
        category: parsedParams.category || "",
        budget: parsedParams.budget || [0, 500000000],
        mileage: parsedParams.mileage || [0, 100000],
        capacity: parsedParams.capacity || [0, 50000],
        availability: Array.isArray(parsedParams.availability) ? parsedParams.availability : parsedParams.availability ? [parsedParams.availability] : [],
        transmission: Array.isArray(parsedParams.transmission) ? parsedParams.transmission : parsedParams.transmission ? [parsedParams.transmission] : [],
        registration_year: Array.isArray(parsedParams.registration_year)
          ? parsedParams.registration_year
          : parsedParams.registration_year
          ? [parsedParams.registration_year]
          : [],
        model_year: Array.isArray(parsedParams.model_year) ? parsedParams.model_year : parsedParams.model_year ? [parsedParams.model_year] : [],
        brand: Array.isArray(parsedParams.brand) ? parsedParams.brand : parsedParams.brand ? [parsedParams.brand] : [],
        model: Array.isArray(parsedParams.model) ? parsedParams.model : parsedParams.model ? [parsedParams.model] : [],
        // package intentionally omitted - will be set after getPackages fetches options
        color: Array.isArray(parsedParams.color) ? parsedParams.color : parsedParams.color ? [parsedParams.color] : [],
        condition: Array.isArray(parsedParams.condition) ? parsedParams.condition : parsedParams.condition ? [parsedParams.condition] : [],
        fuel: Array.isArray(parsedParams.fuel) ? parsedParams.fuel : parsedParams.fuel ? [parsedParams.fuel] : [],
        seat: Array.isArray(parsedParams.seat) ? parsedParams.seat : parsedParams.seat ? [parsedParams.seat] : [],
        skeleton: Array.isArray(parsedParams.skeleton) ? parsedParams.skeleton : parsedParams.skeleton ? [parsedParams.skeleton] : [],
        grade: Array.isArray(parsedParams.grade) ? parsedParams.grade : parsedParams.grade ? [parsedParams.grade] : [],
        ext_grade: Array.isArray(parsedParams.ext_grade) ? parsedParams.ext_grade : parsedParams.ext_grade ? [parsedParams.ext_grade] : [],
        int_grade: Array.isArray(parsedParams.int_grade) ? parsedParams.int_grade : parsedParams.int_grade ? [parsedParams.int_grade] : [],
        location: Array.isArray(parsedParams.location) ? parsedParams.location : parsedParams.location ? [parsedParams.location] : [],
        v_tax_token_exp_date_from: parsedParams.v_tax_token_exp_date_from ? dayjs(parsedParams.v_tax_token_exp_date_from).toDate() : null,
        v_tax_token_exp_date_to: parsedParams.v_tax_token_exp_date_to ? dayjs(parsedParams.v_tax_token_exp_date_to).toDate() : null,
        v_fitness_exp_date_from: parsedParams.v_fitness_exp_date_from ? dayjs(parsedParams.v_fitness_exp_date_from).toDate() : null,
        v_fitness_exp_date_to: parsedParams.v_fitness_exp_date_to ? dayjs(parsedParams.v_fitness_exp_date_to).toDate() : null,
        v_insurance_exp_date_from: parsedParams.v_insurance_exp_date_from ? dayjs(parsedParams.v_insurance_exp_date_from).toDate() : null,
        v_insurance_exp_date_to: parsedParams.v_insurance_exp_date_to ? dayjs(parsedParams.v_insurance_exp_date_to).toDate() : null,
        clientLastPurchaseDate: parsedParams.clientLastPurchaseDate ? dayjs(parsedParams.clientLastPurchaseDate).toDate() : null,
      }));

      // Set other states
      setSearchType(parsedParams.search_type || "wide");
      setIsConsolidatedView(historyItem.consolidated === 1);
      setSelectedUserModes(parsedParams.user_modes || ["Partner"]);
      
      // Load selected shops from historyItem
      if (parsedParams.shops && Array.isArray(parsedParams.shops) && allShops && allShops.length > 0) {
        const selectedShopObjects = parsedParams.shops.map(shopId => {
          const shop = allShops.find(s => s.value === shopId || s.value === String(shopId));
          return shop || { value: shopId, label: `Shop ${shopId}` };
        });
        setSelectedShops(selectedShopObjects);
      } else {
        setSelectedShops([]);
      }
    }
  }, [historyItem, allShops]);

  // Set shops data when allShops prop is available
  useEffect(() => {
    if (allShops && allShops.length > 0) {
      const shopsOptions = [
        { value: "all", label: "All Shops" },
        ...allShops.filter(shop => shop.value !== "").map(shop => ({
          value: shop.value,
          label: shop.label,
        }))
      ];
      setShopsData(shopsOptions);
    }
  }, [allShops]);

  useEffect(() => {
    if (filterFields.brand && filterFields.brand.length > 0) {
      getModels(filterFields.brand);
    } else {
      setModels([]);
    }
  }, [filterFields.brand]);

  useEffect(() => {
    if (filterFields.brand && filterFields.brand.length > 0 && filterFields.model && filterFields.model.length > 0) {
      getPackages(filterFields.brand, filterFields.model);
    } else {
      setPackageData([{ value: "", label: "-Select Package-" }]);
    }
  }, [filterFields.brand, filterFields.model]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const requestBody = {
      search_params: {
        ...filterFields,
        search_type: searchType,
        user_modes: selectedUserModes,
        shops: selectedShops.map(shop => shop.value),
        v_tax_token_exp_date_from: filterFields.v_tax_token_exp_date_from ? dayjs(filterFields.v_tax_token_exp_date_from).format("YYYY-MM-DD") : null,
        v_tax_token_exp_date_to: filterFields.v_tax_token_exp_date_to ? dayjs(filterFields.v_tax_token_exp_date_to).format("YYYY-MM-DD") : null,
        v_fitness_exp_date_from: filterFields.v_fitness_exp_date_from ? dayjs(filterFields.v_fitness_exp_date_from).format("YYYY-MM-DD") : null,
        v_fitness_exp_date_to: filterFields.v_fitness_exp_date_to ? dayjs(filterFields.v_fitness_exp_date_to).format("YYYY-MM-DD") : null,
        v_insurance_exp_date_from: filterFields.v_insurance_exp_date_from ? dayjs(filterFields.v_insurance_exp_date_from).format("YYYY-MM-DD") : null,
        v_insurance_exp_date_to: filterFields.v_insurance_exp_date_to ? dayjs(filterFields.v_insurance_exp_date_to).format("YYYY-MM-DD") : null,
        clientLastPurchaseDate: filterFields.clientLastPurchaseDate ? dayjs(filterFields.clientLastPurchaseDate).format("YYYY-MM-DD") : null,
      },
      consolidated: isConsolidatedView ? 1 : 0,
    };

    const success = await onSave(requestBody);

    if (success) {
      const prepopulatedData = {
        ...requestBody.search_params,
        consolidated: requestBody.consolidated,
        customerMobile: customer?.mobile,
        operation_type: "update_search",
        history_id: searchHistoryId,
      };
      localStorage.setItem("prepopulatedFilterData", JSON.stringify(prepopulatedData));
      router.push("/filter-products/");
    }
  };

  return (
    <EditSearchHistoryModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      searchType={searchType}
      setSearchType={setSearchType}
      isConsolidatedView={isConsolidatedView}
      setIsConsolidatedView={setIsConsolidatedView}
      selectedUserModes={selectedUserModes}
      setSelectedUserModes={setSelectedUserModes}
      shopsData={shopsData}
      selectedShops={selectedShops}
      setSelectedShops={setSelectedShops}
      categoryData={categoryData}
      filterFields={filterFields}
      setFilterFields={setFilterFields}
      brandData={brandData}
      modelData={modelData}
      packageData={packageData}
      colorData={colorData}
      conditionData={conditionData}
      fuelData={fuelData}
      seatData={seatData}
      skeletonData={skeletonData}
      gradeData={gradeData}
      exteriorGradeData={exteriorGradeData}
      interiorGradeData={interiorGradeData}
      yearOptions={yearOptions}
      transmissionData={transmissionData}
      availabilityData={availabilityData}
      locationData={locationData}
      userRoleName={userRoleName}
      RangeSlider={RangeSlider}
      DateRangePicker={DateRangePicker}
    />
  );
};

const CustomerInfoSection = ({ customer, formatDate, searchHistories, clientAttitudeData, onEdit }) => {
  const { user } = useAppContext();
  const parsedUser = typeof user === "string" ? JSON.parse(user) : user;
  const canModify = parsedUser?.id === customer.created_by?.id || parsedUser?.user_mode === "Admin";

  const formatLabel = (key) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const InfoField = ({ label, value, fieldName }) => {
    let displayValue = value;

    if (value === null || value === undefined || value === "") {
      displayValue = "N/A";
    } else {
      // Check for specific fields that should display master data titles
      const masterDataFields = [
        "bank_loan_amount",
        "car_available",
        "client_attitude",
        "client_profession",
        "client_income_per_month",
        "client_level",
        "client_seriousness",
        "car_exchange_category_per_year",
        "purchase_reason",
        "created_by",
        "client_company_transaction",
      ];

      if (masterDataFields.includes(fieldName)) {
        if (fieldName === "client_attitude" && Array.isArray(clientAttitudeData) && value) {
          const selectedAttitudes = String(value).split(",").map(Number);
          const attitudeTitles = selectedAttitudes.map((id) => {
            const option = clientAttitudeData.find((opt) => opt.value === id);
            return option ? option.label : String(id); // Fallback to ID if not found
          });
          displayValue = attitudeTitles.join(", ");
        } else if (typeof value === "object" && value !== null && value.md_title) {
          displayValue = value.md_title;
        } else if (typeof value === "object" && value !== null && value.name) {
          displayValue = value.name;
        } else {
          displayValue = value;
        }
      }

      if (fieldName === "facebook_id_link" || fieldName === "facebook_messenger_link") {
        let formattedValue = value;
        if (value && !value.startsWith("http://") && !value.startsWith("https://")) {
          formattedValue = `https://${value}`;
        }
        return (
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">{label}</span>
            <a href={formattedValue} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
              {value.length > 25 ? `${value.substring(0, 25)}...` : value} <ExternalLink className="ml-1 w-4 h-4" />
            </a>
          </div>
        );
      }
    }

    return (
      <div className="flex flex-col">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-gray-900">{String(displayValue)}</span>
      </div>
    );
  };

  const fields = [
    "name",
    "mobile",
    "email",
    "address",
    "date_of_birth",
    "anniversary_date",
    "facebook_id_link",
    "facebook_messenger_link",
    "purchase_reason",
    "ready_budget",
    "interested_for_loan",
    "bank_loan_amount",
    "car_available",
    "client_attitude",
    "client_profession",
    "client_income_per_month",
    "client_company_transaction",
    "client_level",
    "client_seriousness",
    "car_exchange_category_per_year",
    "client_last_purchase_date",
    "created_by",
  ];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Customer Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {fields.map((field) => (
            <InfoField key={field} label={formatLabel(field)} value={customer?.[field]} fieldName={field} />
          ))}
          <InfoField label="Created At" value={customer?.created_at ? formatDate(customer.created_at) : null} />
          <InfoField label="Last Updated" value={customer?.updated_at ? formatDate(customer.updated_at) : null} />
          <InfoField label="Last Search" value={searchHistories.length > 0 ? formatDate(searchHistories[0].created_at) : null} />
        </div>
        {customer?.description && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <InfoField label="Description" value={customer.description} />
          </div>
        )}
        {canModify && (
          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
            <button onClick={onEdit} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
              Edit Customer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CustomerDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAppContext();
  
  // Normalize user data
  const normalizedUser = typeof user === "string" 
    ? (() => {
        try {
          return JSON.parse(user);
        } catch {
          return null;
        }
      })()
    : user;

  const [customer, setCustomer] = useState(null);
  const [searchHistories, setSearchHistories] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFollowupDetailId, setSelectedFollowupDetailId] = useState(null);
  const [stopComment, setStopComment] = useState("");

  // New state for followup entry
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [selectedFollowupForEdit, setSelectedFollowupForEdit] = useState(null);
  const [followupModalKey, setFollowupModalKey] = useState(0);
  const [clientAttitudeData, setClientAttitudeData] = useState([]);
  const [allLocations, setAllLocations] = useState([]); // New state for all locations
  const [allShops, setAllShops] = useState([]); // New state for all shops

  // State for Search History Edit Modal
  const [isSearchHistoryModalOpen, setIsSearchHistoryModalOpen] = useState(false);
  const [selectedSearchHistory, setSelectedSearchHistory] = useState(null);
  const [searchHistoryId, setSearchHistoryId] = useState(null);

  // State for Search History Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [historyToDelete, setHistoryToDelete] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const customerId = params.id;
  const api = createApiRequest(API_URL);

  const getClientAttitude = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.CLIENT_ATTITUDE_MD_CODE);
      const clientAttitudeMasterData = response.data?.master_data;
      const options = [
        { value: "", label: "-Select Client Attitude-" },
        ...clientAttitudeMasterData.map((attitude) => ({
          value: attitude.md_id,
          label: attitude.md_title,
        })),
      ];
      setClientAttitudeData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const getLocations = async () => {
    try {
      const response = await LocationService.Queries.getAllLocation();
      const locations = response.data?.data || response.data || [];
      const locationOptions = [
        { value: "", label: "-Select Location-" },
        ...locations
          .map((loc) => ({
            value: loc.l_id,
            label: loc.l_name,
          }))
          .filter((option) => option.value !== null && option.value !== undefined && option.value !== ""),
      ];
      setAllLocations(locationOptions);
    } catch (error) {
      toast.error("Failed to fetch locations.");
    }
  };

  const getShops = async () => {
    try {
      // Only fetch shops if user is available
      if (!normalizedUser?.id) {
        return;
      }

      const response = await ShopService.Queries.getShops({
        _page: 1,
        _perPage: 1000,
        order: "desc",
        orderBy: "s_id",
        _user_id: normalizedUser.id, // Filter by logged-in user's ID
      });
      const shops = response.data?.data || [];
      const shopOptions = [
        { value: "", label: "-Select Shop-" },
        ...shops
          .map((shop) => ({
            value: shop.s_id,
            label: shop.s_title,
          }))
          .filter((option) => option.value !== null && option.value !== undefined && option.value !== ""),
      ];
      setAllShops(shopOptions);
    } catch (error) {
      toast.error("Failed to fetch shops.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchCustomerDetails(), getClientAttitude(), getLocations()]); // Fetch initial data
    };
    fetchData();
  }, [customerId]);

  // Fetch shops when user is available
  useEffect(() => {
    if (normalizedUser?.id) {
      getShops();
    }
  }, [normalizedUser?.id]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch customer
      const customerResponse = await api.get(`api/customers/${customerId}`);
      const customerData = customerResponse.data;
      setCustomer(customerData);

      // Fetch search history by customer ID (new endpoint)
      if (customerData && customerData.id) {
        try {
          const historyResponse = await api.get(`api/search-history/by-customer-id?customer_id=${customerData.id}`);
          const hStatus = historyResponse?.data?.status;
          const hPayload = historyResponse?.data;
          const hItems = hPayload?.data?.data ?? hPayload?.data ?? [];
          if (hStatus === "success" && Array.isArray(hItems)) {
            setSearchHistories(hItems);
          } else if (Array.isArray(hPayload)) {
            setSearchHistories(hPayload);
          } else {
            setSearchHistories([]);
          }
        } catch (err) {
          setSearchHistories([]);
        }
      } else {
        setSearchHistories([]);
      }

      // Fetch followups (paginated)
      try {
        const followupsResponse = await api.get(`api/followups?perPage=100&customer_id=${customerId}`);
        if (followupsResponse?.status === "success") {
          const items = followupsResponse.data?.data || [];
          setFollowups(Array.isArray(items) ? items : []);
        } else {
          setFollowups([]);
        }
      } catch (err) {
        setFollowups([]);
      }

      // Fetch messages (non-paginated array in data)
      try {
        const messagesResponse = await api.get(`api/followup-messages?perPage=100&customer_id=${customerId}`);
        if (messagesResponse?.status === "success") {
          const items = messagesResponse.data?.data || messagesResponse.data.data || [];
          setMessages(Array.isArray(items) ? items : []);
        } else {
          setMessages([]);
        }
      } catch (err) {
        setMessages([]);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch customer details";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const parseSearchParams = (params) => {
    if (!params) return null;
    if (typeof params === "string") {
      try {
        return JSON.parse(params);
      } catch {
        return null;
      }
    }
    if (typeof params === "object") return params;
    return null;
  };

  const isEmptyValue = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") return Object.keys(value).length === 0;
    return false;
  };

  const formatValue = (value) => {
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (value === null || value === undefined) return "N/A";

    // Check if the value is a number and format it with comma separators
    if (typeof value === "number" || (typeof value === "string" && !isNaN(Number(value)) && value.trim() !== "")) {
      const numValue = Number(value);
      // Ensure it's a finite number before formatting
      if (isFinite(numValue)) {
        return numValue.toLocaleString();
      }
    }

    return String(value);
  };

  // Handlers for followup entry
  const handleOpenFollowupModal = (followup = null) => {
    setFollowupModalKey((prevKey) => prevKey + 1);
    setSelectedFollowupForEdit(followup);
    setIsFollowupModalOpen(true);
  };

  const handleCloseFollowupModal = () => {
    setIsFollowupModalOpen(false);
    setSelectedFollowupForEdit(null);
  };

  const handleFollowupSuccess = () => {
    toast.success(selectedFollowupForEdit ? "Followup updated successfully!" : "Followup created successfully!");
    fetchCustomerDetails();
    handleCloseFollowupModal();
  };

  // Handlers for stopping followup
  const openConfirmationModal = (followupDetailId) => {
    setSelectedFollowupDetailId(followupDetailId);
    setIsModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setSelectedFollowupDetailId(null);
    setIsModalOpen(false);
    setStopComment("");
  };

  const handleConfirmStopFollowup = async () => {
    if (!selectedFollowupDetailId) return;
    try {
      const response = await api.post(`api/followups/stop/${selectedFollowupDetailId}`, { comment: stopComment });
      if (response.status === "success") {
        toast.success("Follow-up stopped successfully");
        fetchCustomerDetails();
      } else {
        toast.error(response.message || "Failed to stop follow-up");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "An error occurred";
      toast.error(errorMessage);
    } finally {
      closeConfirmationModal();
    }
  };

  // Handlers for Search History Edit Modal
  const handleOpenSearchHistoryModal = (historyItem) => {
    setSelectedSearchHistory(historyItem);
    setSearchHistoryId(historyItem.id);
    setIsSearchHistoryModalOpen(true);
  };

  const handleCloseSearchHistoryModal = () => {
    setSelectedSearchHistory(null);
    setIsSearchHistoryModalOpen(false);
  };

  const handleSaveSearchHistory = async (updatedParams) => {
    if (!selectedSearchHistory) return false;
    try {
      const response = await SearchHistoryService.Queries.updateSearchHistory(selectedSearchHistory.id, updatedParams);
      if (response.status == "Search history updated successfully") {
        fetchCustomerDetails(); // Refresh data
        return true; // Indicate success
      } else {
        toast.error("Failed to update search history.");
        return false; // Indicate failure
      }
    } catch (err) {
      const errorMessage = "An error occurred while updating.";
      toast.error(errorMessage);
      return false; // Indicate failure
    } finally {
      handleCloseSearchHistoryModal();
    }
  };

  const handleOpenDeleteModal = (history) => {
    setHistoryToDelete(history);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setHistoryToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    console.log(historyToDelete);
    if (!historyToDelete) return;
    try {
      await SearchHistoryService.Queries.deleteSearchHistory(historyToDelete.id);
      toast.success("Search history deleted successfully.");
      fetchCustomerDetails(); // To refresh the list
    } catch (err) {
      toast.error("Failed to delete search history.");
    }
  };

  const openEditModal = () => {
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  if (loading) return <LoadingSpinner message="Loading customer details..." />;

  if (error) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500 text-lg">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 text-lg">Customer not found</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleConfirmStopFollowup}
        comment={stopComment}
        setComment={setStopComment}
      />
      <FollowupModal
        key={followupModalKey}
        isOpen={isFollowupModalOpen}
        onClose={handleCloseFollowupModal}
        onSuccess={handleFollowupSuccess}
        followup={selectedFollowupForEdit}
        customer={customer}
      />
      <SearchHistoryEditModal
        isOpen={isSearchHistoryModalOpen}
        onClose={handleCloseSearchHistoryModal}
        onSave={handleSaveSearchHistory}
        historyItem={selectedSearchHistory}
        customer={customer}
        router={router}
        searchHistoryId={searchHistoryId}
        allLocations={allLocations}
        allShops={allShops}
      />
      <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} onConfirm={handleConfirmDelete} itemName="search history" />
      {isEditModalOpen && <EditCustomerModal isOpen={isEditModalOpen} onClose={closeEditModal} customer={customer} onSuccess={fetchCustomerDetails} />}
      <div className="p-6 space-y-6 bg-gray-50">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium underline hover:no-underline transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Customers</span>
            </button>
          </div>
        </div>

        {/* Historical Data Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {/* Search History */}
          <button
            onClick={() => router.push(`/dashboard/search-history?customer_id=${customerId}`)}
            className="flex items-center justify-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
          >
            <History className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Search History</div>
              <div className="text-sm text-gray-500">{searchHistories.length} records</div>
            </div>
          </button>

          {/* Followups */}
          <button
            onClick={() => router.push(`/dashboard/followups?perPage=100&customer_id=${customerId}`)}
            className="flex items-center justify-center space-x-3 bg-white p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200"
          >
            <Eye className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Followups</div>
              <div className="text-sm text-gray-500">{followups.length} records</div>
            </div>
          </button>

          {/* Messages */}
          <button
            onClick={() => router.push(`/dashboard/followup-messages?customer_id=${customerId}`)}
            className="flex items-center justify-center space-x-3 bg-white p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
          >
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Messages</div>
              <div className="text-sm text-gray-500">{messages.length} records</div>
            </div>
          </button>
        </div>

        {/* Customer Information */}
        <CustomerInfoSection
          customer={customer}
          formatDate={formatDate}
          searchHistories={searchHistories}
          clientAttitudeData={clientAttitudeData}
          onEdit={openEditModal}
        />

        {/* Search History */}
        <SearchHistorySection
          searchHistories={searchHistories}
          handleOpenSearchHistoryModal={handleOpenSearchHistoryModal}
          formatDate={formatDate}
          parseSearchParams={parseSearchParams}
          isEmptyValue={isEmptyValue}
          formatValue={formatValue}
          customer={customer}
          router={router}
          onDelete={(history) => handleOpenDeleteModal(history)}
          allLocations={allLocations}
          allShops={allShops}
        />

        {/* Followups Section */}
        <FollowupsSection
          followups={followups}
          handleOpenFollowupModal={handleOpenFollowupModal}
          formatDate={formatDate}
          openConfirmationModal={openConfirmationModal}
        />
      </div>
    </>
  );
};

export default CustomerDetailPage;
