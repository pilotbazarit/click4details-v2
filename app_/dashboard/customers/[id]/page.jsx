"use client";
import FollowupsSection from "@/components/CustomerCare/FollowupsSection";
import SearchHistorySection from "@/components/CustomerCare/SearchHistorySection";
import DateRangePicker from "@/components/DateRangePicker";
import EditCustomerModal from "@/components/modals/EditCustomerModal";
import RangeSlider from "@/components/RangeSlider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAppContext } from "@/context/AppContext";
import { API_URL } from "@/helpers/apiUrl";
import { createApiRequest } from "@/helpers/axios";
import constData from "@/lib/constant";
import LocationService from "@/services/LocationService";
import MasterDataService from "@/services/MasterDataService";
import PackageService from "@/services/PackageService";
import SearchHistoryService from "@/services/SearchHistoryService";
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
          value={comment}
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

const SearchHistoryEditModal = ({ isOpen, onClose, onSave, historyItem, customer, router, searchHistoryId, allLocations }) => {
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
    const categoryData = [
      {
        value: "",
        label: "-Select Category-",
      },
      {
        value: "1",
        label: "Vehicle",
      },
      {
        value: "2",
        label: "Land",
      },
      {
        value: "3",
        label: "Home",
      },
      {
        value: "4",
        label: "Motorcycle",
      },
      {
        value: "5",
        label: "Mobile",
      },
    ];

    setCategories(categoryData);
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

      // Set filter fields
      setFilterFields((prev) => ({
        ...prev,
        ...parsedParams,
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
        package: Array.isArray(parsedParams.package) ? parsedParams.package : parsedParams.package ? [parsedParams.package] : [],
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
    }
  }, [historyItem]);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-[90vw] my-8">
        <h2 className="text-xl font-semibold mb-4">Edit Search History</h2>
        <div className="max-h-[80vh] overflow-y-auto pr-4">
          <div className="w-full mt-5 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between select-none">
              <div className="flex items-center">
                <p className="text-lg font-semibold text-orange-700">Apply Filter</p>
              </div>

              {
                <div className="w-2/4">
                  <div className="flex items-center rounded-lg shadow-sm bg-gray-100 p-1 space-x-1">
                    {/* Custom Toggle Switch for Consolidated */}
                    <div className="flex items-center space-x-2 p-2 cursor-pointer" onClick={() => setIsConsolidatedView(!isConsolidatedView)}>
                      <div
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                          isConsolidatedView ? "bg-orange-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isConsolidatedView ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </div>
                      <span className="text-sm font-medium text-orange-700">Consolidated</span>
                    </div>
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium rounded-md w-full transition-colors ${
                        searchType === "wide" ? "bg-orange-500 text-white" : "bg-orange-500/20 text-orange-700 hover:bg-orange-500/30"
                      }`}
                      onClick={() => setSearchType("wide")}
                    >
                      Wide Search
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium rounded-md w-full transition-colors ${
                        searchType === "flexible" ? "bg-orange-500 text-white" : "bg-orange-500/20 text-orange-700 hover:bg-orange-500/30"
                      }`}
                      onClick={() => setSearchType("flexible")}
                    >
                      Flexible Search
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium rounded-md w-full transition-colors ${
                        searchType === "strict" ? "bg-orange-500 text-white" : "bg-orange-500/20 text-orange-700 hover:bg-orange-500/30"
                      }`}
                      onClick={() => setSearchType("strict")}
                    >
                      Strict Search
                    </button>
                  </div>
                </div>
              }
            </div>
            <>
              {/* Product Name and Code Filter Section */}
              {/* User Mode Checkbox Group - Improved Design */}
              <div className="flex flex-col gap-2 mt-4 mb-4 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
                <label className="text-base font-medium text-gray-700 mb-2">User Mode</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {["Partner", "Supreme", "User", "Pbl"].map((mode) => (
                    <div
                      key={mode}
                      className="flex items-center p-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                    >
                      <input
                        type="checkbox"
                        id={`user-mode-${mode}`}
                        name="userMode"
                        value={mode}
                        checked={selectedUserModes.includes(mode)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUserModes((prev) => [...prev, mode]);
                          } else {
                            setSelectedUserModes((prev) => prev.filter((item) => item !== mode));
                          }
                        }}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                      />
                      <label htmlFor={`user-mode-${mode}`} className="ml-2 text-sm text-gray-700 flex-grow cursor-pointer">
                        {mode}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-4">
                {/* Category select */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="category">
                    Category
                  </label>
                  <Select
                    id="category"
                    options={categoryData}
                    value={categoryData.find((opt) => opt.value === filterFields?.category) || null}
                    onChange={(option) => {
                      setFilterFields((prev) => ({ ...prev, category: option.value }));
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>

                {/* Product Name - 8 columns */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="product-name">
                    Product Name
                  </label>
                  <input
                    id="product-name"
                    type="text"
                    placeholder="Search by product name"
                    className="outline-none py-2 px-4 rounded border border-gray-300 focus:border-orange-500 transition"
                    // onChange={(e) => setTitle(e.target.value)}
                    onChange={(e) => setFilterFields((prev) => ({ ...prev, title: e.target.value }))}
                    value={filterFields?.title}
                  />
                </div>

                {/* Product Code - 4 columns */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="product-code">
                    Product Code
                  </label>
                  <input
                    id="product-code"
                    type="text"
                    placeholder="Search by product code"
                    className="outline-none py-2 px-4 rounded border border-gray-300 focus:border-orange-500 transition"
                    // onChange={(e) => setCode(e.target.value)}
                    onChange={(e) => setFilterFields((prev) => ({ ...prev, code: e.target.value }))}
                    value={filterFields?.code}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Brand select */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium text-blue-600" htmlFor="brand">
                    Brand
                  </label>
                  <Select
                    id="brand"
                    options={brandData}
                    isMulti
                    value={filterFields?.brand ? brandData.filter((opt) => filterFields.brand.includes(opt.value)) : []}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                      setFilterFields((prev) => ({ ...prev, brand: values, model: [], package: "" }));
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
                {/* Model select */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium text-blue-600" htmlFor="model">
                    Model
                  </label>

                  <Select
                    inputId="model"
                    options={modelData}
                    isMulti
                    value={filterFields?.model ? modelData.filter((opt) => filterFields.model.includes(opt.value)) : []}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                      setFilterFields((prev) => ({ ...prev, model: values, package: "" }));
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select a model"
                    isDisabled={!filterFields?.brand || filterFields.brand.length === 0}
                  />
                </div>
                {/* Package select */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium text-blue-600" htmlFor="package">
                    Package
                  </label>

                  <Select
                    inputId="package"
                    options={packageData}
                    isMulti
                    value={filterFields?.package ? packageData.filter((opt) => filterFields.package.includes(opt.value)) : []}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                      setFilterFields((prev) => ({ ...prev, package: values }));
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select a package"
                    isDisabled={!filterFields?.brand || filterFields.brand.length === 0 || !filterFields?.model || filterFields.model.length === 0}
                  />
                </div>
                {/* Color Select */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium text-blue-600" htmlFor="color">
                    Color
                  </label>
                  <Select
                    inputId="color"
                    options={colorData}
                    isMulti
                    value={filterFields?.color ? colorData.filter((opt) => filterFields.color.includes(opt.value)) : []}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                      setFilterFields((prev) => ({ ...prev, color: values }));
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="-Select Color-"
                  />
                </div>
                {/* Budget Range */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium text-blue-600" htmlFor="budget-range">
                    Budget (Price Range)
                  </label>

                  {/* <span className="text-xs text-gray-400 mt-1">
                                            Eg: 13,00,000 to 20,00,000
                                            </span> */}
                  <div className="flex gap-2">
                    <input
                      id="budget-min"
                      type="number"
                      min={0}
                      max={500000000}
                      value={filterFields?.budget?.[0] || 0}
                      onChange={(e) => setFilterFields((prev) => ({ ...prev, budget: [Number(e.target.value), prev.budget?.[1] || 500000000] }))}
                      className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
                    />
                    <span className="self-center">to</span>
                    <input
                      id="budget-max"
                      type="number"
                      min={0}
                      max={500000000}
                      value={filterFields?.budget?.[1] || 500000000}
                      onChange={(e) => setFilterFields((prev) => ({ ...prev, budget: [prev.budget?.[0] || 0, Number(e.target.value)] }))}
                      className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
                    />
                  </div>
                  <div className="mt-2 px-6">
                    <RangeSlider
                      budget={filterFields?.budget || [0, 500000000]}
                      setBudget={(newBudget) => setFilterFields((prev) => ({ ...prev, budget: newBudget }))}
                    />
                  </div>
                </div>
                {/* Condition Select */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium text-blue-600" htmlFor="condition">
                    Condition
                  </label>
                  <Select
                    inputId="condition"
                    options={conditionData}
                    isMulti
                    value={filterFields?.condition ? conditionData.filter((opt) => filterFields.condition.includes(opt.value)) : []}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                      setFilterFields((prev) => ({ ...prev, condition: values }));
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="-Select Condition-"
                  />
                </div>
                {/* Fuel Select */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium text-blue-600" htmlFor="fuel">
                    Fuel
                  </label>
                  <Select
                    inputId="fuel"
                    options={fuelData}
                    isMulti
                    value={filterFields?.fuel ? fuelData.filter((opt) => filterFields.fuel.includes(opt.value)) : []}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                      setFilterFields((prev) => ({ ...prev, fuel: values }));
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="-Select Fuel-"
                  />
                </div>
                {/* Seat Select */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium text-blue-600" htmlFor="seat">
                    Seat
                  </label>
                  <Select
                    inputId="seat"
                    options={seatData}
                    isMulti
                    value={filterFields?.seat ? seatData.filter((opt) => filterFields.seat.includes(opt.value)) : []}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                      setFilterFields((prev) => ({ ...prev, seat: values }));
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="-Select Seat-"
                  />
                </div>
                {/* Body Select */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium text-blue-600" htmlFor="skeleton">
                    Body
                  </label>
                  <Select
                    inputId="skeleton"
                    options={skeletonData}
                    isMulti
                    value={filterFields?.skeleton ? skeletonData.filter((opt) => filterFields.skeleton.includes(opt.value)) : []}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                      setFilterFields((prev) => ({ ...prev, skeleton: values }));
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="-Select Body-"
                  />
                </div>
                {/* Point Select */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium text-gray-600" htmlFor="grade">
                    Point
                  </label>
                  <Select
                    inputId="grade"
                    options={gradeData}
                    isMulti
                    value={filterFields?.grade ? gradeData.filter((opt) => filterFields.grade.includes(opt.value)) : []}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                      setFilterFields((prev) => ({ ...prev, grade: values }));
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="-Select Point-"
                  />
                </div>
                {/* Exterior Grade Select */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="ext_grade">
                    Exterior Grade
                  </label>
                  <Select
                    inputId="ext_grade"
                    options={exteriorGradeData}
                    isMulti
                    value={filterFields?.ext_grade ? exteriorGradeData.filter((opt) => filterFields.ext_grade.includes(opt.value)) : []}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                      setFilterFields((prev) => ({ ...prev, ext_grade: values }));
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="-Select Grade-"
                  />
                </div>
                {/* Interior Grade Select */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="int_grade">
                    Interior Grade
                  </label>
                  <Select
                    inputId="int_grade"
                    options={interiorGradeData}
                    isMulti
                    value={filterFields?.int_grade ? interiorGradeData.filter((opt) => filterFields.int_grade.includes(opt.value)) : []}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                      setFilterFields((prev) => ({ ...prev, int_grade: values }));
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="-Select Grade-"
                  />
                </div>
                {/* Mileage */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium text-blue-600" htmlFor="mileage-range">
                    Mileage (Range)
                  </label>

                  <div className="flex gap-2">
                    <input
                      id="mileage-min"
                      type="number"
                      min={0}
                      max={100000}
                      value={filterFields?.mileage?.[0] || 0}
                      onChange={(e) => setFilterFields((prev) => ({ ...prev, mileage: [Number(e.target.value), prev.mileage?.[1] || 100000] }))}
                      className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
                    />
                    <span className="self-center">to</span>
                    <input
                      id="mileage-max"
                      type="number"
                      min={0}
                      max={100000}
                      value={filterFields?.mileage?.[1] || 100000}
                      onChange={(e) => setFilterFields((prev) => ({ ...prev, mileage: [prev.mileage?.[0] || 0, Number(e.target.value)] }))}
                      className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
                    />
                  </div>
                  <div className="mt-2 px-6">
                    <RangeSlider
                      budget={filterFields?.mileage || [0, 100000]}
                      setBudget={(newMileage) => setFilterFields((prev) => ({ ...prev, mileage: newMileage }))}
                      step={50}
                      maxValue={100000}
                    />
                  </div>
                </div>
                {/* Model Year */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="model_year">
                    Model Year
                  </label>
                  <Select
                    inputId="model_year"
                    options={yearOptions}
                    isMulti
                    value={filterFields?.model_year ? yearOptions.filter((opt) => filterFields.model_year.includes(opt.value)) : []}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                      setFilterFields((prev) => ({ ...prev, model_year: values }));
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="-Select Model Year-"
                  />
                </div>
                {userRoleName === "Customer Care" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="registration_year">
                      Registration Year
                    </label>
                    <Select
                      inputId="registration_year"
                      options={yearOptions}
                      isMulti
                      value={filterFields?.registration_year ? yearOptions.filter((opt) => filterFields.registration_year.includes(opt.value)) : []}
                      onChange={(selectedOptions) => {
                        const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                        setFilterFields((prev) => ({ ...prev, registration_year: values }));
                      }}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      placeholder="-Select Registration Year-"
                    />
                  </div>
                )}
                {/* Capacity */}
                <div className="flex flex-col gap-1 pr-4">
                  <label className="text-base font-medium" htmlFor="capacity-range">
                    Capacity (CC)
                  </label>

                  <div className="flex gap-2">
                    <input
                      id="capacity-min"
                      type="number"
                      min={0}
                      max={50000}
                      value={filterFields?.capacity?.[0] || 0}
                      onChange={(e) => setFilterFields((prev) => ({ ...prev, capacity: [Number(e.target.value), prev.capacity?.[1] || 50000] }))}
                      className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
                    />
                    <span className="self-center">to</span>
                    <input
                      id="capacity-max"
                      type="number"
                      min={0}
                      max={50000}
                      value={filterFields?.capacity?.[1] || 50000}
                      onChange={(e) => setFilterFields((prev) => ({ ...prev, capacity: [prev.capacity?.[0] || 0, Number(e.target.value)] }))}
                      className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
                    />
                  </div>
                  <div className="mt-2 px-6">
                    <RangeSlider
                      budget={filterFields?.capacity || [0, 50000]}
                      setBudget={(newCapacity) => setFilterFields((prev) => ({ ...prev, capacity: newCapacity }))}
                      step={100}
                      maxValue={50000}
                    />
                  </div>
                </div>
                {/* Transmission Select */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="transmission">
                    Transmission
                  </label>
                  <Select
                    inputId="transmission"
                    options={transmissionData}
                    isMulti
                    value={filterFields?.transmission ? transmissionData.filter((opt) => filterFields.transmission.includes(opt.value)) : []}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                      setFilterFields((prev) => ({ ...prev, transmission: values }));
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="-Select Transmission-"
                  />
                </div>
                {/* Availability Select */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="availability">
                    Availability
                  </label>
                  <Select
                    inputId="availability"
                    options={availabilityData}
                    isMulti
                    value={filterFields?.availability ? availabilityData.filter((opt) => filterFields.availability.includes(opt.value)) : []}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                      setFilterFields((prev) => ({ ...prev, availability: values }));
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="-Select Availability-"
                  />
                </div>
                {/* Chassis No Input */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="chassis">
                    Chassis No
                  </label>
                  <input
                    id="chassis"
                    value={filterFields?.chassis || ""}
                    onChange={(e) => setFilterFields((prev) => ({ ...prev, chassis: e.target.value }))}
                    type="text"
                    placeholder="Enter Chassis No"
                    className="outline-none py-2 px-3 rounded border border-gray-500/40"
                  />
                </div>
                {/* Location Select */}
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium" htmlFor="location">
                    Location
                  </label>
                  <Select
                    inputId="location"
                    options={locationData}
                    isMulti
                    value={filterFields?.location ? locationData.filter((opt) => filterFields.location.includes(opt.value)) : []}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                      setFilterFields((prev) => ({ ...prev, location: values }));
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="-Select Location-"
                    menuPlacement="top"
                  />
                </div>

                {userRoleName === "Customer Care" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="engine">
                      Engine No
                    </label>
                    <input
                      id="engine"
                      value={filterFields?.engine || ""}
                      onChange={(e) => setFilterFields((prev) => ({ ...prev, engine: e.target.value }))}
                      type="text"
                      placeholder="Enter Engine No"
                      className="outline-none py-2 px-3 rounded border border-gray-500/40"
                    />
                  </div>
                )}
                {userRoleName === "Customer Care" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-base font-medium">Tax Token Expiry Date</label>
                    <DateRangePicker
                      startDate={filterFields.v_tax_token_exp_date_from}
                      endDate={filterFields.v_tax_token_exp_date_to}
                      onChange={(dates) => {
                        const [start, end] = dates;
                        setFilterFields((prev) => ({
                          ...prev,
                          v_tax_token_exp_date_from: start,
                          v_tax_token_exp_date_to: end,
                        }));
                      }}
                    />
                  </div>
                )}
                {userRoleName === "Customer Care" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-base font-medium">Fitness Exp. Date</label>
                    <DateRangePicker
                      startDate={filterFields.v_fitness_exp_date_from}
                      endDate={filterFields.v_fitness_exp_date_to}
                      onChange={(dates) => {
                        const [start, end] = dates;
                        setFilterFields((prev) => ({
                          ...prev,
                          v_fitness_exp_date_from: start,
                          v_fitness_exp_date_to: end,
                        }));
                      }}
                    />
                  </div>
                )}
                {userRoleName === "Customer Care" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-base font-medium">Insurance Exp. Date</label>
                    <DateRangePicker
                      startDate={filterFields.v_insurance_exp_date_from}
                      endDate={filterFields.v_insurance_exp_date_to}
                      onChange={(dates) => {
                        const [start, end] = dates;
                        setFilterFields((prev) => ({
                          ...prev,
                          v_insurance_exp_date_from: start,
                          v_insurance_exp_date_to: end,
                        }));
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomerInfoSection = ({ customer, formatDate, searchHistories, clientAttitudeData, onEdit }) => {
  const { user } = useAppContext();
  const parsedUser = JSON.parse(user);
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

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchCustomerDetails(), getClientAttitude(), getLocations()]); // Add getLocations() here
    };
    fetchData();
  }, [customerId]);

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
