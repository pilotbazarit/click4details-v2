"use client";

import CustomDatePicker from "@/components/CustomDatePicker";
import DateRangePicker from "@/components/DateRangePicker";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import RangeSlider from "@/components/RangeSlider";
import CardViewFilteredProducts from "@/components/advance-filter/CardViewFilteredProducts";
import PageHeaderSection from "@/components/advance-filter/PageHeaderSection";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import FollowupModal from "@/components/modals/FollowupModal";
import PasswordModal from "@/components/modals/PasswordModal";
import { Button } from "@/components/ui/button";
import { AdvanceFilterProductContextProvider, useAdvanceFilterProductContext } from "@/context/AdvanceFilterProductContextProvider";
import { useAppContext } from "@/context/AppContext";
import { API_URL } from "@/helpers/apiUrl";
import { createApiRequest } from "@/helpers/axios";
import constData from "@/lib/constant";
import CategoryService from "@/services/CategoryService";
import CustomerService from "@/services/CustomerService";
import LocationService from "@/services/LocationService";
import MasterDataService from "@/services/MasterDataService";
import PackageService from "@/services/PackageService";
import SearchHistoryService from "@/services/SearchHistoryService";
import ShopService from "@/services/ShopService";
import dayjs from "dayjs";
import { Plus, Search, Star, User, Users, X } from "lucide-react";
import Link from "next/link";
import "rc-slider/assets/index.css";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import Select from "react-select";

const FilterProducts = () => {
  const { getAllProduct, total, loading } = useAdvanceFilterProductContext();
  const { user } = useAppContext();
  
  // Memoize normalizedUser to prevent unnecessary recalculations
  // User is now loaded synchronously from localStorage in AppContext, so it's available on first render
  const normalizedUser = useMemo(() => {
    if (user === null || user === undefined) {
      return null;
    }
    if (typeof user === "string") {
      try {
        return JSON.parse(user);
      } catch {
        return null;
      }
    }
    return user;
  }, [user]);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const allowedRoles = new Set(["Customer Care", "Admin", "Co-Admin"]);
  const userRoleName = normalizedUser?.role?.name || normalizedUser?.role_name || normalizedUser?.role || normalizedUser?.user_role;
  // const canSeeCustomerInfo = !!(userRoleName && allowedRoles.has(userRoleName));
  
 
  const canSeeUserModes = useMemo(() => {
    return normalizedUser?.user_mode === "pbl" || normalizedUser?.user_mode === "supreme" || normalizedUser?.user_mode === "admin";
  }, [normalizedUser?.user_mode]);

  // Memoize canSeeCustomerInfo to prevent unnecessary recalculations
  const canSeeCustomerInfo = useMemo(() => {
    return normalizedUser?.user_mode === "pbl" || normalizedUser?.user_mode === "supreme";
  }, [normalizedUser?.user_mode]);

  // Log when values change (user is now available on first render, so this will only log once per actual change)
  useEffect(() => {
    console.log('canSeeUserModes', canSeeUserModes);
    console.log('canSeeCustomerInfo', canSeeCustomerInfo);
    console.log('normalizedUser', normalizedUser);
  }, [canSeeUserModes, canSeeCustomerInfo, normalizedUser]);
  // useEffect(() => {
  //   if (isClient) {
  //     console.log("userRoleName", userRoleName);
  //   }
  // }, [isClient, userRoleName]);

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
  const [locationData, setLocationData] = useState([]);
  const [operationType, setOperationType] = useState("new_search");
  const [oldHistoryId, setOldHistoryId] = useState(null);
  const [customerId, setCustomerId] = useState(null);

  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [anniversaryDate, setAnniversaryDate] = useState("");
  const [purchaseReason, setPurchaseReason] = useState("");
  const [interestedLoan, setInterestedLoan] = useState("");
  const [bankLoanAmount, setBankLoanAmount] = useState("");
  const [bankLoanAmountData, setBankLoanAmountData] = useState([]);

  const [carAvailable, setCarAvailable] = useState("");
  const [carAvailableData, setCarAvailableData] = useState([]);

  const [purchaseReasonData, setPurchaseReasonData] = useState([]);
  const [clientIncome, setClientIncome] = useState("");
  const [clientCompanyTransaction, setClientCompanyTransaction] = useState("");
  const [clientCompanyTransactionData, setClientCompanyTransactionData] = useState([]);
  const [facebookIdLink, setFacebookIdLink] = useState("");
  const [facebookMessengerLink, setFacebookMessengerLink] = useState("");
  const [clientLevel, setClientLevel] = useState("");
  const [clientSeriousness, setClientSeriousness] = useState("");
  const [clientSeriousnessData, setClientSeriousnessData] = useState([]);
  const [clientIncomeData, setClientIncomeData] = useState([]);
  const [clientAttitude, setClientAttitude] = useState([]);
  const [clientAttitudeData, setClientAttitudeData] = useState([]);
  const [clientProfession, setClientProfession] = useState("");
  const [clientProfessionData, setClientProfessionData] = useState([]);
  const [clientLevelData, setClientLevelData] = useState([]);
  const [carExchangeCategory, setCarExchangeCategory] = useState("");
  const [carExchangeCategoryData, setCarExchangeCategoryData] = useState([]);

  const [description, setDescription] = useState("");

  const [searchHistory, setSearchHistory] = useState([]);
  const [visitingCardImage, setVisitingCardImage] = useState(null);
  const [originalVisitingCardFile, setOriginalVisitingCardFile] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [displayVisitingCardImage, setDisplayVisitingCardImage] = useState(null);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [selectedFollowupForEdit, setSelectedFollowupForEdit] = useState(null);

  const handleOpenFollowupModal = (customerId = null) => {
    setSelectedFollowupForEdit(null);
    setIsFollowupModalOpen(true);
    // This will be passed to the FollowupModal
    // We'll need to modify FollowupModal to accept this prop
    // and set the customer_id in its formData
  };

  const handleOpenFollowupModalWithCustomer = (customerId) => {
    setSelectedFollowupForEdit(null);
    setIsFollowupModalOpen(true);
    // This will be passed to the FollowupModal
    // We'll need to modify FollowupModal to accept this prop
    // and set the customer_id in its formData
  };

  const handleCloseFollowupModal = () => {
    setIsFollowupModalOpen(false);
    setSelectedCustomerId(null);
  };

  useEffect(() => {
    if (customerMobile && customerMobile.length === 11) {
      fetchCustomerDetailsBasedOnMobile(customerMobile);
    }
  }, [customerMobile]);

  const handleFollowupSuccess = () => {
    setIsFollowupModalOpen(false);
    toast.success("Follow-up created successfully!");
  };

  const handleSaveCustomer = async () => {
    if (!customerName) {
      toast.error("Please enter a customer name.");
      return;
    }

    const customerData = {
      name: customerName,
      mobile: customerMobile,
      email: customerEmail,
      address: customerAddress,
      date_of_birth: dateOfBirth,
      anniversary_date: anniversaryDate,
      purchase_reason: String(purchaseReason),
      interested_for_loan: interestedLoan,
      bank_loan_amount: String(bankLoanAmount),
      car_available: String(carAvailable),
      client_income_per_month: String(clientIncome),
      client_company_transaction: String(clientCompanyTransaction),
      facebook_id_link: facebookIdLink,
      facebook_messenger_link: facebookMessengerLink,
      client_level: String(clientLevel),
      client_seriousness: String(clientSeriousness),
      car_exchange_category_per_year: String(carExchangeCategory),
      description: description,
      ready_budget: JSON.stringify(filterFields.readyBudget),
      client_last_purchase_date: filterFields.clientLastPurchaseDate ? dayjs(filterFields.clientLastPurchaseDate).format("YYYY-MM-DD") : null,
      visiting_card_image: visitingCardImage,
      client_attitude: Array.isArray(clientAttitude) ? clientAttitude.join(",") : String(clientAttitude),
      client_profession: String(clientProfession),
    };

    try {
      const response = await CustomerService.Commands.saveCustomerInfo(customerData);
      if (response.status === "success") {
        toast.success("Customer information saved successfully!");
        if (response.data && response.data.id) {
          setSelectedCustomerId(response.data.id);
        }
      } else {
        toast.error(response.message || "Failed to save customer information.");
      }
    } catch (error) {
      console.error("Failed to save customer information:", error);
      toast.error("An error occurred while saving customer information.");
    }
  };

  const fetchCustomerDetailsBasedOnMobile = async (mobile) => {
    setIsLoading(true);
    try {
      const [customerResponse, response] = await Promise.all([
        SearchHistoryService.Queries.getCustomerByMobile(mobile),
        SearchHistoryService.Queries.getSearchHistory(mobile),
      ]);

      if (customerResponse.status === "success") {
        const { purchase_reason, bank_loan_amount, client_seriousness, description, facebook_messenger_link, interested_for_loan, ready_budget } =
          customerResponse.data.customer_details[0] || {};

        const readyBudget = ready_budget ? JSON.parse(ready_budget) : [0, 500000000];
        setCustomerId(customerResponse.data.id || null);
        setCustomerName(customerResponse.data.name || "");
        setCustomerEmail(customerResponse.data.email || "");
        setCustomerAddress(customerResponse.data.address || "");
        setDateOfBirth(customerResponse.data.date_of_birth || "");
        setAnniversaryDate(customerResponse.data.anniversary_date || "");
        setSelectedCustomerId(customerResponse.data.id || null);
        setFilterFields((prev) => ({
          ...prev,
          readyBudget,
        }));

        setPurchaseReason((purchase_reason && parseInt(purchase_reason)) || "");
        setBankLoanAmount((bank_loan_amount && parseInt(bank_loan_amount)) || 0);
        setClientSeriousness((client_seriousness && parseInt(client_seriousness)) || 0);
        setInterestedLoan(interested_for_loan || "");

        setFacebookIdLink(customerResponse.data.facebook_id_link || "");
        setFacebookMessengerLink(facebook_messenger_link || "");
        setClientCompanyTransaction(
          (customerResponse.data.client_company_transaction && parseInt(customerResponse.data.client_company_transaction.md_id)) || ""
        );

        setClientIncome((customerResponse.data.client_income_per_month && parseInt(customerResponse.data.client_income_per_month.md_id)) || "");
        setClientLevel((customerResponse.data.client_level && parseInt(customerResponse.data.client_level.md_id)) || "");

        setCarExchangeCategory(
          (customerResponse.data.car_exchange_category_per_year && parseInt(customerResponse.data.car_exchange_category_per_year.md_id)) || ""
        );
        setDescription(description || "");
        setCarAvailable((customerResponse.data.car_available && parseInt(customerResponse.data.car_available.md_id)) || 0);
        setClientAttitude(customerResponse.data.client_attitude ? String(customerResponse.data.client_attitude).split(",").map(Number) : []);
        setClientProfession((customerResponse.data.client_profession && parseInt(customerResponse.data.client_profession.md_id)) || 0);
        setFilterFields((prev) => ({ ...prev, clientLastPurchaseDate: customerResponse.data.client_last_purchase_date || null }));
      } else {
        setSelectedCustomerId(null);
        setSearchHistory([]);
      }

      if (response.status === "success") {
        setSearchHistory(response.data);
      } else {
        setSearchHistory([]);
      }
    } catch (error) {
      console.error("Failed to fetch search history:", error);
      setSearchHistory([]);
      toast.error("Failed to fetch search history.");
    } finally {
      setIsLoading(false); // Hide loader
    }
  };

  const handlePasswordVerify = async (password) => {
    try {
      const api = createApiRequest(API_URL);
      const response = await api.post("api/verify-password", { password }); // Assuming this endpoint exists in your backend
      if (response.status === "success") {
        setShowCustomerInfo(true);
        setShowAdditionalInfo(true);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Password verification API error:", error);
      return false;
    }
  };

  const [showCustomerInfo, setShowCustomerInfo] = useState(true);
  const [showFilterSection, setShowFilterSection] = useState(true);
  const [showFilterResult, setShowFilterResult] = useState(true);
  const [showSearchHistory, setShowSearchHistory] = useState(true);

  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [searchType, setSearchType] = useState("wide");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isConsolidatedView, setIsConsolidatedView] = useState(false);
  const [selectedUserModes, setSelectedUserModes] = useState([""]); // New state for user modes
  const [shopsData, setShopsData] = useState([]);
  const [selectedShops, setSelectedShops] = useState([]); // Array of selected shop objects
  const [shopsLoading, setShopsLoading] = useState(false); // Loading state for shops
  const [mileageInputInFocus, setMileageInputInFocus] = useState(null);
  const [capacityInputInFocus, setCapacityInputInFocus] = useState(null);
  const [budgetInputInFocus, setBudgetInputInFocus] = useState(null);
  const [readyBudgetInputInFocus, setReadyBudgetInputInFocus] = useState(null);
  // const [searchingItem, setSearchingItem] = useState([]);

  const api = createApiRequest(API_URL);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const yearOptions = [
    { value: "", label: "-Select Year-" },
    ...years.map((year) => ({
      value: year,
      label: year.toString(),
    })),
  ];

  const [viewMode, setViewMode] = useState("grid");

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
    location: [],
  });

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

  // shops data get from api
  const getShops = async () => {
    try {
      // Don't fetch shops if user is not loaded yet
      if (!normalizedUser?.id) {
        return;
      }

      setShopsLoading(true);

      const params = {
        _page: 1,
        _perPage: 1000,
        order: "desc",
        orderBy: "s_id",
        _user_id: normalizedUser.id, // Always filter by logged-in user's ID
      };

      const response = await ShopService.Queries.getShops(params);
      const companyShopsResponse = await ShopService.Queries.getCompanyShops(normalizedUser.id);
      
      const shopsDataFromAPI = response?.data?.data || [];
      const companyShopsDataFromAPI = companyShopsResponse?.data || [];
      
      const newCompanyShopsData = companyShopsDataFromAPI.map(shop => ({
        value: shop.shop.s_id,
        label: shop.shop.s_title,
      }));

      const userShopsData = shopsDataFromAPI.map(shop => ({
        value: shop.s_id,
        label: shop.s_title,
      }));
      let allShopsData = [];
      // const allShopsData = [{ value: "all", label: "All Shops" }, ...userShopsData, ...newCompanyShopsData];
      if(canSeeUserModes) {
        allShopsData = [{ value: "all", label: "All Shops" }, { value: "pbhome", label: "PBL Home" }, ...userShopsData, ...newCompanyShopsData];
      } else {
        allShopsData = [{ value: "all", label: "All Shops" }, { value: "pbhome", label: "PBL Home" }, ...userShopsData, ...newCompanyShopsData];
      }

      setShopsData(allShopsData);

      // Check if there are pending shop selections from prepopulated data
      const pendingShops = sessionStorage.getItem("pendingShopSelection");
      if (pendingShops) {
        try {
          const shopIds = JSON.parse(pendingShops);
          const selectedShopObjects = shopIds.map(shopId => {
            const shop = allShopsData.find(s => s.value === shopId || s.value === String(shopId));
            return shop || { value: shopId, label: `Shop ${shopId}` };
          });
          setSelectedShops(selectedShopObjects);
          sessionStorage.removeItem("pendingShopSelection");
        } catch (error) {
          console.error("Error loading pending shop selection:", error);
          sessionStorage.removeItem("pendingShopSelection");
        }
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Failed to fetch shops");
      }
    } finally {
      setShopsLoading(false);
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
      
      // Check if there are pending package selections from prepopulated data
      const pendingPackages = sessionStorage.getItem("pendingPackageSelection");
      if (pendingPackages) {
        try {
          const packageIds = JSON.parse(pendingPackages);
          // Filter to only include valid package IDs that exist in the fetched data
          const validPackageIds = packageIds.filter(pkgId => 
            packageData.some(pkg => pkg.value === pkgId || pkg.value === String(pkgId))
          );
          
          if (validPackageIds.length > 0) {
            setFilterFields(prev => ({ ...prev, package: validPackageIds }));
          }
          sessionStorage.removeItem("pendingPackageSelection");
        } catch (error) {
          console.error("Error loading pending package selection:", error);
          sessionStorage.removeItem("pendingPackageSelection");
        }
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

  const getPurchaseReasons = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.PURCHASE_REASON_MD_CODE);
      const purchaseReasonMasterData = response.data?.master_data;
      const options = [
        { value: "", label: "-Select Purchase Reason-" },
        ...purchaseReasonMasterData.map((reason) => ({
          value: reason.md_id,
          label: reason.md_title,
        })),
      ];
      setPurchaseReasonData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const getClientIncomes = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.CLIENT_INCOME_MD_CODE);
      const clientIncomeMasterData = response.data?.master_data;
      const options = [
        { value: "", label: "-Select Client Income-" },
        ...clientIncomeMasterData.map((income) => ({
          value: income.md_id,
          label: income.md_title,
        })),
      ];
      setClientIncomeData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const getClientCompanyTransaction = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode("client_company_transaction_per_year_1758360851");
      const clientCompanyTransactionMasterData = response.data?.master_data;
      const options = [
        { value: "", label: "-Select Client Company Transaction-" },
        ...clientCompanyTransactionMasterData.map((transaction) => ({
          value: transaction.md_id,
          label: transaction.md_title,
        })),
      ];
      setClientCompanyTransactionData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const getBankLoanAmounts = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.BANK_LOAN_AMOUNT_MD_CODE);
      const bankLoanAmountMasterData = response.data?.master_data;
      const options = [
        { value: "", label: "-Select Bank Loan Amount-" },
        ...bankLoanAmountMasterData.map((loan) => ({
          value: loan.md_id,
          label: loan.md_title,
        })),
      ];
      setBankLoanAmountData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const getCarAvailable = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.CAR_AVAILABLE_MD_CODE);
      const carAvailableMasterData = response.data?.master_data;
      const options = [
        { value: "", label: "-Select Car Available-" },
        ...carAvailableMasterData.map((car) => ({
          value: car.md_id,
          label: car.md_title,
        })),
      ];
      setCarAvailableData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

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

  const getClientProfession = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.CLIENT_PROFESSION_MD_CODE);
      const clientProfessionMasterData = response.data?.master_data;
      const options = [
        { value: "", label: "-Select Client Profession-" },
        ...clientProfessionMasterData.map((profession) => ({
          value: profession.md_id,
          label: profession.md_title,
        })),
      ];
      setClientProfessionData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const getClientLevel = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode("client_level_1758127591");
      const clientLevelMasterData = response.data?.master_data;
      const options = [
        { value: "", label: "-Select Client Level-" },
        ...clientLevelMasterData.map((level) => ({
          value: level.md_id,
          label: level.md_title,
        })),
      ];
      setClientLevelData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const getClientSeriousness = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode("client_seriousness_1758128063");
      const clientSeriousnessMasterData = response.data?.master_data;
      const options = [
        { value: "", label: "-Select Client Seriousness-" },
        ...clientSeriousnessMasterData.map((level) => ({
          value: level.md_id,
          label: level.md_title,
        })),
      ];
      setClientSeriousnessData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const getCarExchangeCategory = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterDataByTypeCode("car_exchange_category_per_year_1758128234");
      const carExchangeCategoryMasterData = response.data?.master_data;
      const options = [
        { value: "", label: "-Select Car Exchange Category-" },
        ...carExchangeCategoryMasterData.map((level) => ({
          value: level.md_id,
          label: level.md_title,
        })),
      ];
      setCarExchangeCategoryData(options);
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
      const options = [
        { value: "", label: "-Select Location-" },
        ...locations.map((loc) => ({
          value: loc.l_id,
          label: loc.l_name,
        })),
      ];
      setLocationData(options);
    } catch (error) {
      toast.error("Failed to fetch locations.");
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

  // Fetch initial data when component mounts
  useEffect(() => {
    const fetchInitialData = async (initialFilterData = null) => {
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
        getPurchaseReasons(),
        getClientIncomes(),
        getClientCompanyTransaction(),
        getBankLoanAmounts(),
        getCarAvailable(),
        getClientAttitude(),
        getClientProfession(),
        getClientLevel(),
        getClientSeriousness(),
        getCarExchangeCategory(),
        getLocations(),
      ]);
      getAllProduct(initialFilterData || filterFields, true);
    };

    const prepopulatedData = localStorage.getItem("prepopulatedFilterData");
    if (prepopulatedData) {
      localStorage.removeItem("prepopulatedFilterData");
      try {
        const parsedData = JSON.parse(prepopulatedData);
        // Convert date strings back to Date objects for date pickers
        const formattedParsedData = {
          ...parsedData,
          v_tax_token_exp_date_from: parsedData.v_tax_token_exp_date_from ? dayjs(parsedData.v_tax_token_exp_date_from).toDate() : null,
          v_tax_token_exp_date_to: parsedData.v_tax_token_exp_date_to ? dayjs(parsedData.v_tax_token_exp_date_to).toDate() : null,
          v_fitness_exp_date_from: parsedData.v_fitness_exp_date_from ? dayjs(parsedData.v_fitness_exp_date_from).toDate() : null,
          v_fitness_exp_date_to: parsedData.v_fitness_exp_date_to ? dayjs(parsedData.v_fitness_exp_date_to).toDate() : null,
          v_insurance_exp_date_from: parsedData.v_insurance_exp_date_from ? dayjs(parsedData.v_insurance_exp_date_from).toDate() : null,
          v_insurance_exp_date_to: parsedData.v_insurance_exp_date_to ? dayjs(parsedData.v_insurance_exp_date_to).toDate() : null,
          clientLastPurchaseDate: parsedData.clientLastPurchaseDate ? dayjs(parsedData.clientLastPurchaseDate).toDate() : null,
        };
        // Handle packages separately - store them for later application after API fetch
        let packageIds = null;
        if (parsedData.package && Array.isArray(parsedData.package) && parsedData.package.length > 0) {
          packageIds = parsedData.package;
          sessionStorage.setItem("pendingPackageSelection", JSON.stringify(packageIds));
          // Remove package from formattedParsedData to prevent premature setting
          delete formattedParsedData.package;
        }
        
        setFilterFields(formattedParsedData);
        setSearchType(parsedData.search_type || "wide"); // Set searchType here
        setIsConsolidatedView(parsedData.consolidated); // Set consolidated view
        fetchInitialData(formattedParsedData);
        setOperationType(parsedData.operation_type || "new_search");
        setCustomerMobile(parsedData.customerMobile || "");
        setSelectedUserModes([...parsedData.user_modes]); // Set user modes
        setOldHistoryId(parsedData.history_id || null);
        
        // Load selected shops from prepopulated data
        if (parsedData.shops && Array.isArray(parsedData.shops)) {
          // Store shop IDs to be loaded after shops data is fetched
          sessionStorage.setItem("pendingShopSelection", JSON.stringify(parsedData.shops));
        }
      } catch (e) {
        console.error("Failed to parse prepopulated filter data from localStorage", e);
        fetchInitialData();
      }
    } else {
      fetchInitialData();
    }
  }, []);

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

  // Fetch shops when user is loaded
  useEffect(() => {
    if (normalizedUser?.id) {
      getShops();
    }
  }, [normalizedUser?.id]);

  const executeSearch = async (e) => {
    const formattedFilterFields = {
      ...filterFields,
      search_type: searchType,
      user_modes: selectedUserModes, // Added user modes
      shops: selectedShops.map(shop => shop.value), // Added selected shops (array of shop IDs)
      v_tax_token_exp_date_from: filterFields.v_tax_token_exp_date_from ? dayjs(filterFields.v_tax_token_exp_date_from).format("YYYY-MM-DD") : null,
      v_tax_token_exp_date_to: filterFields.v_tax_token_exp_date_to ? dayjs(filterFields.v_tax_token_exp_date_to).format("YYYY-MM-DD") : null,
      v_fitness_exp_date_from: filterFields.v_fitness_exp_date_from ? dayjs(filterFields.v_fitness_exp_date_from).format("YYYY-MM-DD") : null,
      v_fitness_exp_date_to: filterFields.v_fitness_exp_date_to ? dayjs(filterFields.v_fitness_exp_date_to).format("YYYY-MM-DD") : null,
      v_insurance_exp_date_from: filterFields.v_insurance_exp_date_from ? dayjs(filterFields.v_insurance_exp_date_from).format("YYYY-MM-DD") : null,
      v_insurance_exp_date_to: filterFields.v_insurance_exp_date_to ? dayjs(filterFields.v_insurance_exp_date_to).format("YYYY-MM-DD") : null,
    };
    getAllProduct(formattedFilterFields, true);

    if (canSeeCustomerInfo && customerMobile) {
      const customerInfo = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_mobile: customerMobile,
        purchaseReason,
        interestedLoan,
        bankLoanAmount,
        clientIncome,
        clientCompanyTransaction,
        facebook_id_link: facebookIdLink,
        facebook_messenger_link: facebookMessengerLink,
        clientLevel,
        clientSeriousness,
        carExchangeCategory,
        description,
        carAvailable,
        clientAttitude: clientAttitude.join(","),
        clientProfession,
        clientLastPurchaseDate: filterFields.clientLastPurchaseDate ? dayjs(filterFields.clientLastPurchaseDate).format("YYYY-MM-DD") : null,
        anniversary_date: anniversaryDate,
        date_of_birth: dateOfBirth,
        customer_address: customerAddress,
        readyBudget: filterFields.readyBudget,
      };

      const searchParamsForSave = { ...formattedFilterFields };
      delete searchParamsForSave.readyBudget;
      delete searchParamsForSave.clientLastPurchaseDate;

      const searchData = {
        search_params: searchParamsForSave,
        customer_info: customerInfo,
        visiting_card_image: visitingCardImage,
        consolidated: isConsolidatedView ? 1 : 0,
      };

      if (operationType === "update_search" && oldHistoryId) {
        SearchHistoryService.Queries.updateSearchHistory(oldHistoryId, searchData);
        toast.success("Search history updated successfully!");
      } else {
        const history = await SearchHistoryService.Queries.saveSearchHistory(searchData);
        setOperationType("update_search");
        setOldHistoryId(history?.data?.id || null);
        toast.success("New search history saved successfully!");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isConsolidatedView) {
      executeSearch(e);
    } else {
      setIsConfirmModalOpen(true);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setOriginalVisitingCardFile(file);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageToCrop(reader.result);
        setModalOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedImageData) => {
    // Convert base64 to Blob
    const response = await fetch(croppedImageData);
    const blob = await response.blob();

    // Create a File object from the Blob
    const croppedFile = new File([blob], "visiting_card.png", { type: "image/png" });
    setVisitingCardImage(croppedFile);
    setDisplayVisitingCardImage(URL.createObjectURL(croppedFile));
  };

  return (
    <>
      {!isClient ? null : (
        <div>
          <Navbar />

          <form onSubmit={handleSubmit} className="md:px-6 ">
            {/* Page Header Section */}
            <PageHeaderSection />
            {canSeeCustomerInfo && customerMobile && (
              <div className="flex justify-end md:px-10">
                {/* Add New Followup Button */}
                <button
                  type="button"
                  onClick={() => handleOpenFollowupModal(selectedCustomerId)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Followup
                </button>
              </div>
            )}

            {/* Search History Section */}
            {searchHistory.length > 0 && (
              <div className="w-full mt-6 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setShowSearchHistory((prev) => !prev)}>
                  <p className="text-lg font-semibold text-orange-700">Search History</p>
                  <span className="text-orange-600">
                    {showSearchHistory ? (
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 15l6-6 6 6" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                      </svg>
                    )}
                  </span>
                </div>

                {showSearchHistory && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {searchHistory.map((historyItem, index) => (
                      <li
                        key={index}
                        className={`p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                          historyItem.id === oldHistoryId ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
                        }`}
                        onClick={() => {
                          const historySearchParams = JSON.parse(historyItem.search_params);
                          const historyCustomerInfo = JSON.parse(historyItem.customer_info);

                          const searchParams = historySearchParams;
                          const customerInfo = historyCustomerInfo;

                          // Format search params, especially dates
                          const formattedSearchParams = {
                            ...searchParams,
                            v_tax_token_exp_date_from: searchParams.v_tax_token_exp_date_from ? dayjs(searchParams.v_tax_token_exp_date_from).toDate() : null,
                            v_tax_token_exp_date_to: searchParams.v_tax_token_exp_date_to ? dayjs(searchParams.v_tax_token_exp_date_to).toDate() : null,
                            v_fitness_exp_date_from: searchParams.v_fitness_exp_date_from ? dayjs(searchParams.v_fitness_exp_date_from).toDate() : null,
                            v_fitness_exp_date_to: searchParams.v_fitness_exp_date_to ? dayjs(searchParams.v_fitness_exp_date_to).toDate() : null,
                            v_insurance_exp_date_from: searchParams.v_insurance_exp_date_from ? dayjs(searchParams.v_insurance_exp_date_from).toDate() : null,
                            v_insurance_exp_date_to: searchParams.v_insurance_exp_date_to ? dayjs(searchParams.v_insurance_exp_date_to).toDate() : null,
                            clientLastPurchaseDate: searchParams.clientLastPurchaseDate ? dayjs(searchParams.clientLastPurchaseDate).toDate() : null,
                          };
                          setFilterFields(formattedSearchParams);

                          // Load customer info
                          // Load additional customer info (from customer_info JSON)
                          setPurchaseReason(customerInfo.purchaseReason || "");
                          setInterestedLoan(customerInfo.interestedLoan || "");
                          setBankLoanAmount(customerInfo.bankLoanAmount || "");
                          setCarAvailable(customerInfo.carAvailable || "");
                          setClientIncome(customerInfo.clientIncome || "");
                          setClientCompanyTransaction(customerInfo.clientCompanyTransaction || "");
                          setFacebookIdLink(customerInfo.facebook_id_link || "");
                          setFacebookIdLink(customerInfo.facebook_messenger_link || "");
                          setClientLevel(customerInfo.clientLevel || "");
                          setClientSeriousness(customerInfo.clientSeriousness || "");
                          setCarExchangeCategory(customerInfo.carExchangeCategory || "");
                          setDescription(customerInfo.description || "");

                          // Load other UI states
                          setSearchType(searchParams.search_type || "wide");
                          setIsConsolidatedView(historyItem.consolidated === 1);
                          setSelectedUserModes(searchParams.user_modes || ["Partner"]);
                          
                          // Load selected shops
                          if (searchParams.shops && Array.isArray(searchParams.shops)) {
                            const selectedShopObjects = searchParams.shops.map(shopId => {
                              // Find the shop in shopsData to get the label
                              const shop = shopsData.find(s => s.value === shopId || s.value === String(shopId));
                              return shop || { value: shopId, label: `Shop ${shopId}` };
                            });
                            setSelectedShops(selectedShopObjects);
                          } else {
                            setSelectedShops([]);
                          }
                          
                          setDisplayVisitingCardImage(historyItem.visiting_card_image || null);
                          setVisitingCardImage(null);

                          // Set up for update operation
                          setOperationType("update_search");
                          setOldHistoryId(historyItem.id);

                          // Immediately trigger search, as per prepopulatedData logic
                          getAllProduct(formattedSearchParams, true);

                          toast.success("History loaded and search results updated.");
                        }}
                      >
                        <p className={`text-sm ${historyItem.id === oldHistoryId ? "text-white" : "text-[rgb(17,111,165)]"}`}>
                          {dayjs(historyItem.created_at).format("YYYY-MM-DD hh:mm a")}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Customer Info Section */}
            {canSeeCustomerInfo && (
              <div className="w-full mt-6 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <button type="button" className="mr-2 text-orange-600" onClick={() => setIsPasswordModalOpen(true)}>
                      {showAdditionalInfo ? (
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                          <path
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                          />
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                          <path
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
                          />
                        </svg>
                      )}
                    </button>
                    <p className="text-lg font-semibold text-orange-700">Customer Information</p>
                    {selectedCustomerId && customerName && (
                      <Link
                        href={`/dashboard/customers/${selectedCustomerId}`}
                        className="ml-2 text-blue-600 hover:underline text-lg font-semibold"
                        target="_blank"
                      >
                        ({customerName})
                      </Link>
                    )}
                  </div>
                  <div className="cursor-pointer select-none" onClick={() => setShowCustomerInfo((prev) => !prev)}>
                    <span className="text-orange-600">
                      {showCustomerInfo ? (
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 15l6-6 6 6" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                        </svg>
                      )}
                    </span>
                  </div>
                </div>

                {showCustomerInfo && (
                  <>
                    {/* Customer Info  */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                      {/* Customer Mobile */}
                      <div className="flex flex-col gap-1">
                        <label className="text-base font-medium" htmlFor="customer-mobile">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="customer-mobile"
                            type="tel"
                            placeholder="Enter mobile number"
                            className="outline-none py-2 px-3 rounded border border-gray-500/40 w-full"
                            value={customerMobile}
                            onChange={async (e) => {
                              setCustomerMobile(e.target.value);
                            }}
                          />
                          {isLoading && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Customer Name */}
                      <div className="flex flex-col gap-1">
                        <label className="text-base font-medium" htmlFor="customer-name">
                          Customer Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="customer-name"
                          type="text"
                          placeholder="Enter customer name"
                          className="outline-none py-2 px-3 rounded border border-gray-500/40"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                        />
                      </div>

                      {/* Customer Email */}
                      <div className="flex flex-col gap-1">
                        <label className="text-base font-medium" htmlFor="customer-email">
                          Email
                        </label>
                        <input
                          id="customer-email"
                          type="email"
                          placeholder="Enter email address"
                          className="outline-none py-2 px-3 rounded border border-gray-500/40"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                        />
                      </div>
                      {/* Customer Address */}
                      <div className="flex flex-col gap-1">
                        <label className="text-base font-medium" htmlFor="customer-address">
                          Address
                        </label>
                        <input
                          id="customer-address"
                          type="text"
                          placeholder="Enter customer address"
                          className="outline-none py-2 px-3 rounded border border-gray-500/40"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                        />
                      </div>
                    </div>

                    {showAdditionalInfo && (
                      <>
                        {/* Budget and Ready Budget Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-6 mt-4">
                          {/* Purchase Reason */}
                          <div className="flex flex-col gap-1">
                            <label className="text-base font-medium" htmlFor="purchase-reason">
                              Purchase Reason
                            </label>
                            <Select
                              id="purchase-reason"
                              options={purchaseReasonData}
                              value={purchaseReasonData.find((opt) => opt.value === purchaseReason) || null}
                              onChange={(option) => setPurchaseReason(option ? option.value : "")}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              placeholder="-Select Purchase Reason-"
                            />
                          </div>
                          {/* Ready Budget (Price Range) */}
                          <div className="flex flex-col gap-1">
                            <label className="text-base font-medium" htmlFor="ready-budget-range">
                              Ready Budget (Price Range)
                            </label>
                            {/* <span className="text-xs text-gray-400 mt-1">
                                                        Eg: 13,00,000 to 20,00,000
                                                    </span> */}
                            <div className="flex gap-2">
                              <input
                                id="ready-budget-min"
                                type="text"
                                value={
                                  readyBudgetInputInFocus === "min" ? filterFields.readyBudget?.[0] : (filterFields.readyBudget?.[0] || 0).toLocaleString()
                                }
                                onFocus={() => setReadyBudgetInputInFocus("min")}
                                onBlur={() => setReadyBudgetInputInFocus(null)}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/,/g, "");
                                  if (!isNaN(value)) {
                                    setFilterFields((prev) => ({ ...prev, readyBudget: [Number(value), prev.readyBudget?.[1] || 500000000] }));
                                  }
                                }}
                                className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
                              />
                              <span className="self-center">to</span>
                              <input
                                id="ready-budget-max"
                                type="text"
                                value={
                                  readyBudgetInputInFocus === "max"
                                    ? filterFields.readyBudget?.[1]
                                    : (filterFields.readyBudget?.[1] || 500000000).toLocaleString()
                                }
                                onFocus={() => setReadyBudgetInputInFocus("max")}
                                onBlur={() => setReadyBudgetInputInFocus(null)}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/,/g, "");
                                  if (!isNaN(value)) {
                                    setFilterFields((prev) => ({ ...prev, readyBudget: [prev.readyBudget?.[0] || 0, Number(value)] }));
                                  }
                                }}
                                className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
                              />
                            </div>
                            <div className="mt-2 px-6">
                              <RangeSlider
                                budget={filterFields?.readyBudget || [0, 500000000]}
                                setBudget={(newBudget) => setFilterFields((prev) => ({ ...prev, readyBudget: newBudget }))}
                              />
                            </div>
                          </div>

                          {/* Date of Birth */}
                          <div className="flex flex-col gap-1">
                            <label className="text-base font-medium" htmlFor="date-of-birth">
                              Date of Birth
                            </label>
                            <input
                              id="date-of-birth"
                              type="date"
                              className="outline-none py-2 px-3 rounded border border-gray-500/40"
                              value={dateOfBirth}
                              onChange={(e) => setDateOfBirth(e.target.value)}
                            />
                          </div>

                          {/* Anniversary Date */}
                          <div className="flex flex-col gap-1">
                            <label className="text-base font-medium" htmlFor="anniversary-date">
                              Anniversary Date
                            </label>
                            <input
                              id="anniversary-date"
                              type="date"
                              className="outline-none py-2 px-3 rounded border border-gray-500/40"
                              value={anniversaryDate}
                              onChange={(e) => setAnniversaryDate(e.target.value)}
                            />
                          </div>

                          {/* make client area dropdown */}
                        </div>

                        {/* Loan Info  */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                          {/* Interested for Loan */}
                          <div className="flex flex-col gap-1">
                            <label className="text-base font-medium" htmlFor="interested-loan">
                              Interested for Loan
                            </label>
                            <Select
                              id="interested-loan"
                              options={[
                                { value: "yes", label: "Yes" },
                                { value: "no", label: "No" },
                              ]}
                              value={interestedLoan ? { value: interestedLoan, label: interestedLoan === "yes" ? "Yes" : "No" } : null}
                              onChange={(option) => setInterestedLoan(option ? option.value : "")}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              placeholder="Select option"
                            />
                          </div>
                          {/* Bank Loan Amount */}
                          <div className="flex flex-col gap-1">
                            <label className="text-base font-medium" htmlFor="bank-loan-amount">
                              Bank Loan Amount
                            </label>
                            <Select
                              id="bank-loan-amount"
                              options={bankLoanAmountData}
                              value={bankLoanAmountData.find((opt) => opt.value === bankLoanAmount) || null}
                              onChange={(option) => setBankLoanAmount(option ? option.value : "")}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              placeholder="-Select Bank Loan Amount-"
                            />
                          </div>

                          {/* Car Available */}
                          <div className="flex flex-col gap-1">
                            <label className="text-base font-medium" htmlFor="car-available">
                              Car Available
                            </label>
                            <Select
                              id="car-available"
                              options={carAvailableData}
                              value={carAvailableData.find((opt) => opt.value === carAvailable) || null}
                              onChange={(option) => setCarAvailable(option ? option.value : "")}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              placeholder="-Select Car Available-"
                            />
                          </div>

                          {/* Client Attitude */}
                          <div className="flex flex-col gap-1">
                            <label className="text-base font-medium" htmlFor="client-attitude">
                              Client Attitude
                            </label>
                            <Select
                              id="client-attitude"
                              options={clientAttitudeData}
                              isMulti
                              value={clientAttitude ? clientAttitudeData.filter((opt) => clientAttitude.includes(opt.value)) : []}
                              onChange={(selectedOptions) => {
                                const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
                                setClientAttitude(values);
                              }}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              placeholder="-Select Client Attitude-"
                            />
                          </div>

                          {/* Client Profession */}
                          <div className="flex flex-col gap-1">
                            <label className="text-base font-medium" htmlFor="client-profession">
                              Client Profession
                            </label>
                            <Select
                              id="client-profession"
                              options={clientProfessionData}
                              value={clientProfessionData.find((opt) => opt.value === clientProfession) || null}
                              onChange={(option) => setClientProfession(option ? option.value : "")}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              placeholder="-Select Client Profession-"
                            />
                          </div>
                          {/* Client Income */}
                          <div className="flex flex-col gap-1">
                            <label className="text-base font-medium" htmlFor="client-income">
                              Client Income Per Month
                            </label>
                            <Select
                              id="client-income"
                              options={clientIncomeData}
                              value={clientIncomeData.find((opt) => opt.value === clientIncome) || null}
                              onChange={(option) => setClientIncome(option ? option.value : "")}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              placeholder="-Select Client Income-"
                            />
                          </div>
                          {/* Client Company Transaction */}
                          <div className="flex flex-col gap-1">
                            <label className="text-base font-medium" htmlFor="client-company-transaction">
                              Client Company Transaction Per Year
                            </label>
                            <Select
                              id="client-company-transaction"
                              options={clientCompanyTransactionData}
                              value={clientCompanyTransactionData.find((opt) => opt.value === clientCompanyTransaction) || null}
                              onChange={(option) => setClientCompanyTransaction(option ? option.value : "")}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              placeholder="-Select Company Transaction-"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-base font-medium" htmlFor="facebook-id-link">
                              Facebook Id Link
                            </label>
                            <input
                              id="facebook-id-link"
                              type="text"
                              placeholder="Enter Facebook id link"
                              className="outline-none py-2 px-3 rounded border border-gray-500/40"
                              value={facebookIdLink}
                              onChange={(e) => setFacebookIdLink(e.target.value)}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-base font-medium" htmlFor="facebook-messenger-link">
                              Facebook Messenger Link
                            </label>
                            <input
                              id="facebook-messenger-link"
                              type="text"
                              placeholder="Enter Facebook messenger link"
                              className="outline-none py-2 px-3 rounded border border-gray-500/40"
                              value={facebookMessengerLink}
                              onChange={(e) => setFacebookMessengerLink(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Performance Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-6 mt-8">
                          {/* Client Level */}
                          <div className="flex flex-col gap-1">
                            <label className="text-base font-medium" htmlFor="client-level">
                              Client Level
                            </label>
                            <Select
                              id="client-level"
                              options={clientLevelData}
                              value={clientLevelData.find((opt) => opt.value === clientLevel) || null}
                              onChange={(option) => setClientLevel(option ? option.value : "")}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              placeholder="Select level"
                            />
                          </div>
                          {/* Client Seriousness */}
                          <div className="flex flex-col gap-1">
                            <label className="text-base font-medium" htmlFor="client-seriousness">
                              Client Seriousness
                            </label>
                            <Select
                              id="client-seriousness"
                              options={clientSeriousnessData}
                              value={clientSeriousnessData.find((opt) => opt.value === clientSeriousness) || null}
                              onChange={(option) => setClientSeriousness(option ? option.value : "")}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              placeholder="Select seriousness"
                            />
                          </div>
                          {/* Car Exchange Category */}
                          <div className="flex flex-col gap-1">
                            <label className="text-base font-medium" htmlFor="car-exchange-category">
                              Car Exchange Category Per Year
                            </label>
                            <Select
                              id="car-exchange-category"
                              options={carExchangeCategoryData}
                              value={carExchangeCategoryData.find((opt) => opt.value === carExchangeCategory) || null}
                              onChange={(option) => setCarExchangeCategory(option ? option.value : "")}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              placeholder="Select car exchange category"
                            />
                          </div>

                          {/* Client Last Purchase Date */}
                          <div className="flex flex-col gap-1">
                            <label className="text-base font-medium" htmlFor="client-last-purchase-date">
                              Client Last Purchase Date
                            </label>

                            <CustomDatePicker
                              selected={filterFields.clientLastPurchaseDate}
                              onChange={(date) => setFilterFields((prev) => ({ ...prev, clientLastPurchaseDate: date }))}
                              placeholderText="Select date"
                            />
                          </div>

                          {/* Description */}
                          <div className="flex flex-col gap-1 col-span-2 w-full">
                            <label className="text-base font-medium" htmlFor="description">
                              Description
                            </label>
                            <textarea
                              id="description"
                              placeholder="Enter description"
                              className="outline-none py-2 px-3 rounded border border-gray-500/40 resize-none w-full"
                              rows={3}
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} id="visiting-card-upload" />
                            <Button type="button" onClick={() => typeof window !== "undefined" && document.getElementById("visiting-card-upload").click()}>
                              Upload Visiting Card
                            </Button>
                            {displayVisitingCardImage ? (
                              <div>
                                <img
                                  src={displayVisitingCardImage}
                                  alt="Cropped Visiting Card"
                                  className="mt-2 max-w-xs h-auto border border-gray-300 rounded-md"
                                />
                              </div>
                            ) : (
                              <p className="mt-2 text-sm text-gray-500">No visiting card uploaded.</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={handleSaveCustomer}
                        className="relative inline-flex items-center px-3 py-1.5 text-sm font-medium transition-colors border rounded-md bg-orange-500 text-white border-orange-500 z-10"
                      >
                        Save Customer
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Filter Section  */}
            <div className="w-full mt-5 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between select-none">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center cursor-pointer" onClick={() => setShowFilterSection((prev) => !prev)}>
                    <p className="text-lg font-semibold text-orange-700">Apply Filter</p>
                  </div>

                  {showFilterSection && (
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setIsConsolidatedView(!isConsolidatedView)}>
                      <span className="text-sm font-medium text-orange-700">Consolidated</span>
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
                    </div>
                  )}
                </div>

                <div className="cursor-pointer" onClick={() => setShowFilterSection((prev) => !prev)}>
                  <span className="text-orange-600">
                    {showFilterSection ? (
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 15l6-6 6 6" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                      </svg>
                    )}
                  </span>
                </div>
              </div>

              {showFilterSection && (
                <>
                  {/* Product Name and Code Filter Section */}
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-4 mb-4 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
                    {/* User Mode Button Group */}
                    {canSeeUserModes && (
                      <div className="flex flex-col gap-2">
                        <label className="text-base font-medium text-gray-700 mb-2">User Mode</label>
                        <div className="inline-flex rounded-md shadow-sm">
                          {["Partner", "Member", "User"].map((mode, index) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => {
                                const newSelectedUserModes = selectedUserModes.includes(mode)
                                  ? selectedUserModes.filter((item) => item !== mode)
                                  : [...selectedUserModes, mode];
                                setSelectedUserModes(newSelectedUserModes);
                              }}
                              className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium transition-colors border border-gray-300 ${
                                index === 0 ? "rounded-l-md" : ""
                              } ${index === 2 ? "rounded-r-md" : "-ml-px"} ${
                                selectedUserModes.includes(mode)
                                  ? "bg-orange-500 text-white border-orange-500 z-10"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              {mode === "Partner" && <Users className="w-4 h-4 mr-2" />}
                              {mode === "Member" && <Star className="w-4 h-4 mr-2" />}
                              {mode === "User" && <User className="w-4 h-4 mr-2" />}
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Shops Multiselect Dropdown */}
                    <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                      <label className="text-base font-medium text-gray-700 mb-2">Filter by Shops</label>
                      <Select
                        isMulti
                        options={shopsData}
                        value={selectedShops}
                        onChange={(selected) => {
                          const selectedArray = selected || [];
                          
                          // Check if "All Shops" was just selected
                          const hasAllShops = selectedArray.some(shop => shop.value === "all");
                          const hadAllShops = selectedShops.some(shop => shop.value === "all");
                          
                          if (hasAllShops && !hadAllShops) {
                            // "All Shops" was just selected, keep only "All Shops"
                            setSelectedShops([{ value: "all", label: "All Shops" }]);
                          } else if (!hasAllShops && hadAllShops) {
                            // "All Shops" was removed, keep other selections
                            setSelectedShops(selectedArray);
                          } else if (hasAllShops && selectedArray.length > 1) {
                            // User selected a specific shop while "All Shops" was selected, remove "All Shops"
                            setSelectedShops(selectedArray.filter(shop => shop.value !== "all"));
                          } else {
                            // Normal selection
                            setSelectedShops(selectedArray);
                          }
                        }}
                        placeholder={shopsLoading ? "Loading shops..." : "Select shops..."}
                        isLoading={shopsLoading}
                        isDisabled={shopsLoading}
                        loadingMessage={() => "Loading shops..."}
                        className="text-sm"
                        classNamePrefix="react-select"
                      />
                    </div>

                    {/* Search Type Button Group */}
                    <div className="flex flex-col gap-2">
                      <label className="text-base font-medium text-gray-700 mb-2">Search Type</label>
                      <div className="inline-flex rounded-md shadow-sm">
                        {[
                          { value: "wide", label: "Wide Search" },
                          // { value: "flexible", label: "Flexible Search" },
                          { value: "strict", label: "Strict Search" },
                        ].map((type, index) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setSearchType(type.value)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium transition-colors border border-gray-300 ${
                              index === 0 ? "rounded-l-md" : ""
                            } ${index === 2 ? "rounded-r-md" : "-ml-px"} ${
                              searchType === type.value
                                ? "bg-orange-500 text-white border-orange-500 z-10"
                                : "bg-orange-500/20 text-orange-700 hover:bg-orange-500/30"
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
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

                          // const lastSelected = selectedOptions[selectedOptions.length - 1].label;
                          // if (searchingItem.includes(lastSelected)) {
                          //   setSearchingItem((pre) => {
                          //     const filtered = pre.filter((item) => item !== lastSelected);
                          //     return [...filtered];
                          //   });
                          // } else {
                          //   setSearchingItem((pre) => [...pre, lastSelected]);
                          // }
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
                          type="text"
                          value={budgetInputInFocus === "min" ? filterFields.budget?.[0] : (filterFields.budget?.[0] || 0).toLocaleString()}
                          onFocus={() => setBudgetInputInFocus("min")}
                          onBlur={() => setBudgetInputInFocus(null)}
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, "");
                            if (!isNaN(value)) {
                              setFilterFields((prev) => ({ ...prev, budget: [Number(value), prev.budget?.[1] || 500000000] }));
                            }
                          }}
                          className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
                        />
                        <span className="self-center">to</span>
                        <input
                          id="budget-max"
                          type="text"
                          value={budgetInputInFocus === "max" ? filterFields.budget?.[1] : (filterFields.budget?.[1] || 500000000).toLocaleString()}
                          onFocus={() => setBudgetInputInFocus("max")}
                          onBlur={() => setBudgetInputInFocus(null)}
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, "");
                            if (!isNaN(value)) {
                              setFilterFields((prev) => ({ ...prev, budget: [prev.budget?.[0] || 0, Number(value)] }));
                            }
                          }}
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
                          type="text"
                          value={mileageInputInFocus === "min" ? filterFields.mileage?.[0] : (filterFields.mileage?.[0] || 0).toLocaleString()}
                          onFocus={() => setMileageInputInFocus("min")}
                          onBlur={() => setMileageInputInFocus(null)}
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, "");
                            if (!isNaN(value)) {
                              setFilterFields((prev) => ({ ...prev, mileage: [Number(value), prev.mileage?.[1] || 500000] }));
                            }
                          }}
                          className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
                        />
                        <span className="self-center">to</span>
                        <input
                          id="mileage-max"
                          type="text"
                          value={mileageInputInFocus === "max" ? filterFields.mileage?.[1] : (filterFields.mileage?.[1] || 500000).toLocaleString()}
                          onFocus={() => setMileageInputInFocus("max")}
                          onBlur={() => setMileageInputInFocus(null)}
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, "");
                            if (!isNaN(value)) {
                              setFilterFields((prev) => ({ ...prev, mileage: [prev.mileage?.[0] || 0, Number(value)] }));
                            }
                          }}
                          className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
                        />
                      </div>
                      <div className="mt-2 px-6">
                        <RangeSlider
                          budget={filterFields?.mileage || [0, 500000]}
                          setBudget={(newMileage) => setFilterFields((prev) => ({ ...prev, mileage: newMileage }))}
                          step={50}
                          maxValue={500000}
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
                          type="text"
                          value={capacityInputInFocus === "min" ? filterFields.capacity?.[0] : (filterFields.capacity?.[0] || 0).toLocaleString()}
                          onFocus={() => setCapacityInputInFocus("min")}
                          onBlur={() => setCapacityInputInFocus(null)}
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, "");
                            if (!isNaN(value)) {
                              setFilterFields((prev) => ({ ...prev, capacity: [Number(value), prev.capacity?.[1] || 50000] }));
                            }
                          }}
                          className="outline-none py-2 px-3 rounded border border-gray-500/40 w-1/2"
                        />
                        <span className="self-center">to</span>
                        <input
                          id="capacity-max"
                          type="text"
                          value={capacityInputInFocus === "max" ? filterFields.capacity?.[1] : (filterFields.capacity?.[1] || 50000).toLocaleString()}
                          onFocus={() => setCapacityInputInFocus("max")}
                          onBlur={() => setCapacityInputInFocus(null)}
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, "");
                            if (!isNaN(value)) {
                              setFilterFields((prev) => ({ ...prev, capacity: [prev.capacity?.[0] || 0, Number(value)] }));
                            }
                          }}
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
              )}
            </div>

            <div className="flex justify-end gap-4 w-full mt-8 pt-6 border-t border-gray-200/80">
              <button
                type="button"
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
                onClick={() => {
                  setFilterFields({
                    budget: [0, 50000000],
                    readyBudget: [0, 50000000],
                    availability: [],
                    transmission: [],
                    registration_year: [],
                    model_year: [],
                    location: [],
                  });
                  getAllProduct({}, true);
                  setOperationType("new_search");
                  setCustomerMobile("");
                  setSelectedUserModes([""]);
                  setOldHistoryId();
                  setIsConsolidatedView(false);
                  setSearchType("wide");
                  setSearchHistory([]);
                  setCustomerName("");
                  setCustomerEmail("");
                  setCustomerAddress("");
                }}
              >
                <X className="w-5 h-5" />
                Clear
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200 flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </form>

          {/* Filter Result Section */}
          <div className="md:px-6 mt-8">
            <div className="w-full mb-6 bg-white border border-gray-200/80 rounded-xl p-6 shadow-sm">
              <div
                className="flex items-center justify-between cursor-pointer select-none border-gray-200/80 pb-4"
                onClick={() => setShowFilterResult((prev) => !prev)}
              >
                <div className="flex items-center">
                  <p className="text-lg font-semibold text-gray-800">Filter Result</p>
                  {!loading && (
                    <span className="ml-3 inline-flex items-center px-3 py-1 text-sm font-medium text-orange-800 bg-orange-100 rounded-full">
                      {total} products found
                    </span>
                  )}
                </div>
                <span className="text-gray-600">
                  {showFilterResult ? (
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 15l6-6 6 6" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                    </svg>
                  )}
                </span>
              </div>
              {showFilterResult && (
                <div className="mt-0">
                  {/* View Switcher as Button Group */}
                  <div className="flex items-center gap-0 mb-4">
                    {/* Grid Layout  */}
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-l border border-r-0 ${
                        viewMode === "grid" ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      Grid
                    </button>

                    {/* List Layout */}
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-r border ${
                        viewMode === "list" ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                      }`}
                      onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
                    >
                      List
                    </button>
                  </div>

                  {/* Products */}
                  <CardViewFilteredProducts filterFields={filterFields} />
                </div>
              )}
            </div>
          </div>

          <Footer />
          {/* Followup Modal for creating/editing followups */}
          <FollowupModal
            isOpen={isFollowupModalOpen}
            onClose={handleCloseFollowupModal}
            onSuccess={handleFollowupSuccess}
            followup={selectedFollowupForEdit}
            customerID={customerId}
          />
          <PasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} onVerify={handlePasswordVerify} />
          <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={executeSearch}
            title="Confirm Search"
            description="Do you want to search without pressing consolidated"
          />
        </div>
      )}
    </>
  );
};

export default function Page() {
  return (
    <AdvanceFilterProductContextProvider>
      <FilterProducts />
    </AdvanceFilterProductContextProvider>
  );
}
