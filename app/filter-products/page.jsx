"use client";

import CustomDatePicker from "@/components/CustomDatePicker";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import RangeSlider from "@/components/RangeSlider";
import CardViewFilteredProducts from "@/components/advance-filter/CardViewFilteredProducts";
import CategorySubcategorySection from "@/components/advance-filter/CategorySubcategorySection";
import FilterActionButtons from "@/components/advance-filter/FilterActionButtons";
import PageHeaderSection from "@/components/advance-filter/PageHeaderSection";
import SearchHistorySection from "@/components/advance-filter/SearchHistorySection";
import CustomerFoundDetailsSection from "@/components/advance-filter/CustomerFoundDetailsSection";
import VehicleFiltersSection from "@/components/advance-filter/VehicleFiltersSection";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import EditCustomerModal from "@/components/modals/EditCustomerModal";
import FollowupModal from "@/components/modals/FollowupModal";
import PasswordModal from "@/components/modals/PasswordModal";
import { Button } from "@/components/ui/button";
import { AdvanceFilterProductContextProvider, useAdvanceFilterProductContext } from "@/context/AdvanceFilterProductContextProvider";
import { useAppContext } from "@/context/AppContext";
import { API_URL } from "@/helpers/apiUrl";
import { createApiRequest } from "@/helpers/axios";
import constData from "@/lib/constant";
import CustomerService from "@/services/CustomerService";
import FilterProductService from "@/services/FilterProductService";
import SearchHistoryService from "@/services/SearchHistoryService";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import Link from "next/link";
import "rc-slider/assets/index.css";
import { useEffect, useState, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import Select from "react-select";

const FilterProducts = () => {
  const { getAllProduct, total, loading } = useAdvanceFilterProductContext();
  const { user } = useAppContext();
  const hasInitializedRef = useRef(false);
  
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

  const canAccessToChasisNo = useMemo(() => {
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
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [subcategoryData, setSubcategories] = useState([]);
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
  const [customerSearchMobile, setCustomerSearchMobile] = useState("");
  const [customerSearchName, setCustomerSearchName] = useState("");
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
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [customerNotFound, setCustomerNotFound] = useState(false);
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [salesTeamActivities, setSalesTeamActivities] = useState([]);
  const [salesActivitiesLoading, setSalesActivitiesLoading] = useState(false);
  const [customerDetailsNonce, setCustomerDetailsNonce] = useState(0);
  const apiClient = useMemo(() => createApiRequest(API_URL), []);

  useEffect(() => {
    if (!foundCustomer?.id) {
      setSalesTeamActivities([]);
      setSalesActivitiesLoading(false);
      return undefined;
    }

    let cancelled = false;
    setSalesActivitiesLoading(true);

    apiClient
      .get("api/sales-team-activities", { params: { customer_id: foundCustomer.id } })
      .then((res) => {
        if (cancelled) return;
        const list = res?.data;
        setSalesTeamActivities(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setSalesTeamActivities([]);
      })
      .finally(() => {
        if (!cancelled) setSalesActivitiesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [foundCustomer?.id, customerDetailsNonce, apiClient]);

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

  const applyCustomerDetailsFromPayload = (customerData, mobileFallback = "") => {
    setFoundCustomer(customerData);
    setCustomerNotFound(false);
    const { purchase_reason, bank_loan_amount, client_seriousness, description, facebook_messenger_link, interested_for_loan, ready_budget } =
      customerData.customer_details?.[0] || {};

    const readyBudget = ready_budget ? JSON.parse(ready_budget) : [0, 500000000];
    setCustomerId(customerData.id || null);
    setCustomerName(customerData.name || "");
    setCustomerMobile(customerData.mobile || mobileFallback || "");
    setCustomerSearchName(customerData.name || "");
    setCustomerSearchMobile(customerData.mobile || mobileFallback || "");
    setCustomerEmail(customerData.email || "");
    setCustomerAddress(customerData.address || "");
    setDateOfBirth(customerData.date_of_birth || "");
    setAnniversaryDate(customerData.anniversary_date || "");
    setSelectedCustomerId(customerData.id || null);
    setFilterFields((prev) => ({
      ...prev,
      readyBudget,
    }));

    setPurchaseReason((purchase_reason && parseInt(purchase_reason)) || "");
    setBankLoanAmount((bank_loan_amount && parseInt(bank_loan_amount)) || 0);
    setClientSeriousness((client_seriousness && parseInt(client_seriousness)) || 0);
    setInterestedLoan(interested_for_loan || "");

    setFacebookIdLink(customerData.facebook_id_link || "");
    setFacebookMessengerLink(facebook_messenger_link || "");
    setClientCompanyTransaction((customerData.client_company_transaction && parseInt(customerData.client_company_transaction.md_id)) || "");

    setClientIncome((customerData.client_income_per_month && parseInt(customerData.client_income_per_month.md_id)) || "");
    setClientLevel((customerData.client_level && parseInt(customerData.client_level.md_id)) || "");

    setCarExchangeCategory((customerData.car_exchange_category_per_year && parseInt(customerData.car_exchange_category_per_year.md_id)) || "");
    setDescription(description || "");
    setCarAvailable((customerData.car_available && parseInt(customerData.car_available.md_id)) || 0);
    setClientAttitude(customerData.client_attitude ? String(customerData.client_attitude).split(",").map(Number) : []);
    setClientProfession((customerData.client_profession && parseInt(customerData.client_profession.md_id)) || 0);
    setFilterFields((prev) => ({ ...prev, clientLastPurchaseDate: customerData.client_last_purchase_date || null }));
    setCustomerDetailsNonce((n) => n + 1);
  };

  /** Backend CustomResponse: success must include `data` with a customer `id`. */
  const isCustomerLookupSuccess = (res) => {
    if (!res || typeof res !== "object") return false;
    if (res.status === "fail" || res.status === "error") return false;
    if (res.status !== "success") return false;
    const d = res.data;
    return d != null && typeof d === "object" && d.id != null;
  };

  const fetchCustomerDetailsByCustomerId = async (customerId) => {
    if (!customerId) return;
    setIsLoading(true);
    try {
      const apiRes = await CustomerService.Queries.getCustomerById(customerId);
      if (apiRes?.status !== "success" || !apiRes?.data) {
        setFoundCustomer(null);
        setCustomerNotFound(true);
        setSelectedCustomerId(null);
        setSearchHistory([]);
        toast.error(apiRes?.message || "Could not load customer.");
        return;
      }
      const customerData = apiRes.data;
      const mobileForHistory = (customerData.mobile || "").trim();
      const historyResponse = mobileForHistory
        ? await SearchHistoryService.Queries.getSearchHistory(mobileForHistory)
        : await SearchHistoryService.Queries.getSearchHistoryByCustomerId(customerId);

      applyCustomerDetailsFromPayload(customerData, mobileForHistory);

      if (historyResponse.status === "success") {
        setSearchHistory(historyResponse.data);
      } else {
        setSearchHistory([]);
      }
    } catch (error) {
      console.error("Failed to fetch customer details:", error);
      setFoundCustomer(null);
      setCustomerNotFound(true);
      setSelectedCustomerId(null);
      setSearchHistory([]);
      toast.error(error?.response?.data?.message || error?.message || "Failed to load customer details.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerDetailsBasedOnMobile = async (mobile) => {
    setIsLoading(true);
    try {
      const customerResponse = await SearchHistoryService.Queries.getCustomerByMobile(mobile);

      if (isCustomerLookupSuccess(customerResponse)) {
        applyCustomerDetailsFromPayload(customerResponse.data, mobile);
      } else {
        setFoundCustomer(null);
        setCustomerNotFound(true);
        setSelectedCustomerId(null);
        setSearchHistory([]);
        toast.error(customerResponse?.message || "No customer found with this mobile number or name.");
      }

      try {
        const historyResponse = await SearchHistoryService.Queries.getSearchHistory(mobile);
        if (historyResponse?.status === "success" && historyResponse.data != null) {
          setSearchHistory(Array.isArray(historyResponse.data) ? historyResponse.data : []);
        } else {
          setSearchHistory([]);
        }
      } catch (histErr) {
        console.error("Failed to fetch search history:", histErr);
        setSearchHistory([]);
      }
    } catch (error) {
      console.error("Failed to fetch customer by mobile:", error);
      setFoundCustomer(null);
      setCustomerNotFound(true);
      setSelectedCustomerId(null);
      setSearchHistory([]);
      toast.error(error?.response?.data?.message || error?.message || "Could not search customer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindExistingCustomer = async () => {
    const trimmedMobile = customerSearchMobile.trim();
    const trimmedName = customerSearchName.trim();

    if (!trimmedMobile && !trimmedName) {
      toast.error("Please enter mobile number or customer name to find customer.");
      return;
    }

    setFoundCustomer(null);
    setCustomerNotFound(false);

    if (trimmedMobile) {
      await fetchCustomerDetailsBasedOnMobile(trimmedMobile);
      return;
    }

    setIsLoading(true);
    try {
      const customerResponse = await SearchHistoryService.Queries.searchCustomer({
        mobile: "",
        name: trimmedName,
      });

      if (!isCustomerLookupSuccess(customerResponse)) {
        setFoundCustomer(null);
        setCustomerNotFound(true);
        setSearchHistory([]);
        toast.error(customerResponse?.message || "No customer found with this mobile number or name.");
        return;
      }

      const matchedCustomer = customerResponse.data;
      setCustomerSearchMobile(matchedCustomer.mobile || "");
      setCustomerSearchName(matchedCustomer.name || "");
      // If the customer has no mobile, look up by ID to avoid "mobile required" validation error.
      if (matchedCustomer.mobile?.trim()) {
        await fetchCustomerDetailsBasedOnMobile(matchedCustomer.mobile.trim());
      } else if (matchedCustomer.id) {
        await fetchCustomerDetailsByCustomerId(matchedCustomer.id);
      } else {
        setFoundCustomer(null);
        setCustomerNotFound(true);
        setSearchHistory([]);
        toast.error("Customer found but could not load details (no mobile or ID).");
      }
    } catch (error) {
      console.error("Failed to find customer:", error);
      setFoundCustomer(null);
      setCustomerNotFound(true);
      setSearchHistory([]);
      toast.error(error?.response?.data?.message || error?.message || "Failed to find customer.");
    } finally {
      setIsLoading(false);
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
  const [strictSortOrder, setStrictSortOrder] = useState("");
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
    subcategory: "",
  });

  // category data get from api
  const getCategories = async () => {
    await FilterProductService.Actions.loadCategoryOptions({ setCategories, setIsCategoryLoading, toast });
  };

  const getSubcategories = async (parentCategoryId) => {
    await FilterProductService.Actions.loadSubcategoryOptions({ parentCategoryId, setSubcategories });
  };

  // brand data get from api
  const getBrands = async () => {
    await FilterProductService.Actions.loadBrandOptions({ setBrands, toast });
  };

  // shops data get from api
  const getShops = async () => {
    await FilterProductService.Actions.loadShopsOptions({
      normalizedUserId: normalizedUser?.id,
      setShopsLoading,
      setShopsData,
      setSelectedShops,
      toast,
    });
  };

  // model data get from api
  const getModels = async (brandIds) => {
    await FilterProductService.Actions.loadModelOptions({ brandIds, setModels, toast });
  };

  const getPackages = async (brandIds, modelIds) => {
    await FilterProductService.Actions.loadPackageOptions({
      brandIds,
      modelIds,
      setPackageData,
      setFilterFields,
      toast,
    });
  };

  const getTransmissions = async () => {
    await FilterProductService.Actions.loadTransmissionOptions({ setTransmission, toast });
  };

  const getColors = async () => {
    await FilterProductService.Actions.loadColorOptions({ setColors, toast });
  };

  const getFuels = async () => {
    await FilterProductService.Actions.loadFuelOptions({ setFuels, toast });
  };

  const getPurchaseReasons = async () => {
    await FilterProductService.Actions.loadPurchaseReasonOptions({ setPurchaseReasonData, toast });
  };

  const getClientIncomes = async () => {
    await FilterProductService.Actions.loadClientIncomeOptions({ setClientIncomeData, toast });
  };

  const getClientCompanyTransaction = async () => {
    await FilterProductService.Actions.loadClientCompanyTransactionOptions({ setClientCompanyTransactionData, toast });
  };

  const getBankLoanAmounts = async () => {
    await FilterProductService.Actions.loadBankLoanAmountOptions({ setBankLoanAmountData, toast });
  };

  const getCarAvailable = async () => {
    await FilterProductService.Actions.loadCarAvailableOptions({ setCarAvailableData, toast });
  };

  const getClientAttitude = async () => {
    await FilterProductService.Actions.loadClientAttitudeOptions({ setClientAttitudeData, toast });
  };

  const getClientProfession = async () => {
    await FilterProductService.Actions.loadClientProfessionOptions({ setClientProfessionData, toast });
  };

  const getClientLevel = async () => {
    await FilterProductService.Actions.loadClientLevelOptions({ setClientLevelData, toast });
  };

  const getClientSeriousness = async () => {
    await FilterProductService.Actions.loadClientSeriousnessOptions({ setClientSeriousnessData, toast });
  };

  const getCarExchangeCategory = async () => {
    await FilterProductService.Actions.loadCarExchangeCategoryOptions({ setCarExchangeCategoryData, toast });
  };

  const getLocations = async () => {
    await FilterProductService.Actions.loadLocationOptions({ setLocationData, toast });
  };

  // 2. Fetch skeleton data from API (similar to getColors)
  const getSkeletons = async () => {
    await FilterProductService.Actions.loadSkeletonOptions({ setSkeletonData, toast });
  };

  const getConditionData = async () => {
    await FilterProductService.Actions.loadConditionOptions({ setConditionData, toast });
  };

  const getGradeData = async () => {
    await FilterProductService.Actions.loadGradeOptions({ setGradeData, toast });
  };

  const getExteriorGradeData = async () => {
    await FilterProductService.Actions.loadExteriorGradeOptions({ setExteriorGradeData, toast });
  };

  const getInteriorGradeData = async () => {
    await FilterProductService.Actions.loadInteriorGradeOptions({ setInteriorGradeData, toast });
  };

  const getSeatData = async () => {
    await FilterProductService.Actions.loadSeatOptions({ setSeatData, toast });
  };

  const geAvailabilityData = async () => {
    await FilterProductService.Actions.loadAvailabilityOptions({ setAvailabilityData, toast });
  };

  // Fetch initial data when component mounts
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

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
      const initialParams = initialFilterData || filterFields;
      const params = { ...initialParams };
      if (Array.isArray(params.budget) && params.budget.length === 2 && Number(params.budget[0]) === 0 && Number(params.budget[1]) === 500000000) delete params.budget;
      getAllProduct(params, true);
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
        setStrictSortOrder(parsedData.strict_sort || parsedData.sort_order || "");
        setIsConsolidatedView(parsedData.consolidated); // Set consolidated view
        fetchInitialData(formattedParsedData);
        setOperationType(parsedData.operation_type || "new_search");
        setCustomerMobile(parsedData.customerMobile || "");
        setCustomerSearchMobile(parsedData.customerMobile || "");
        if (canSeeCustomerInfo && parsedData.customerMobile) {
          fetchCustomerDetailsBasedOnMobile(parsedData.customerMobile);
        }
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

  useEffect(() => {
    if (filterFields?.category) {
      getSubcategories(filterFields.category);
    } else {
      setSubcategories([{ value: "", label: "-Select Subcategory-" }]);
    }
  }, [filterFields?.category]);

  // Fetch shops when user is loaded
  useEffect(() => {
    if (normalizedUser?.id) {
      getShops();
    }
  }, [normalizedUser?.id]);

  // Default budget 0–500000000: omit from request so backend doesn't filter by it
  const isDefaultBudget = (b) =>
    Array.isArray(b) && b.length === 2 && Number(b[0]) === 0 && Number(b[1]) === 500000000;

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

    if (searchType === "strict" && strictSortOrder) {
      formattedFilterFields.strict_sort = strictSortOrder;
    }

    const paramsForProduct = { ...formattedFilterFields };
    if (isDefaultBudget(paramsForProduct.budget)) delete paramsForProduct.budget;
    getAllProduct(paramsForProduct, true);

    const resolvedCustomerId = selectedCustomerId || customerId || foundCustomer?.id;
    const hasMobileForHistory = !!(customerMobile && String(customerMobile).trim());
    if (canSeeCustomerInfo && (hasMobileForHistory || resolvedCustomerId)) {
      const customerInfo = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_mobile: customerMobile || "",
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
      if (resolvedCustomerId) {
        customerInfo.customer_id = resolvedCustomerId;
      }

      const searchParamsForSave = { ...formattedFilterFields };
      delete searchParamsForSave.readyBudget;
      delete searchParamsForSave.clientLastPurchaseDate;
      if (isDefaultBudget(searchParamsForSave.budget)) delete searchParamsForSave.budget;

      const searchData = {
        search_params: searchParamsForSave,
        customer_info: customerInfo,
        visiting_card_image: visitingCardImage,
        consolidated: isConsolidatedView ? 1 : 0,
      };

      if (operationType === "update_search" && oldHistoryId) {
        await SearchHistoryService.Queries.updateSearchHistory(oldHistoryId, searchData);
        toast.success("Search history updated successfully!");
      } else {
        const history = await SearchHistoryService.Queries.saveSearchHistory(searchData);
        setOperationType("update_search");
        setOldHistoryId(history?.data?.id || null);
        toast.success("New search history saved successfully!");
      }
      setCustomerDetailsNonce((n) => n + 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!filterFields?.category) {
      toast.error("Please select a category before searching.");
      return;
    }
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

  const selectedCategoryOption = categoryData.find((opt) => opt.value === filterFields?.category);
  const showVehicleFilters =
    selectedCategoryOption?.label?.toLowerCase() === "vehicle" ||
    String(filterFields?.category || "").toLowerCase() === "vehicle";
  const isCategorySelected = Boolean(filterFields?.category);

  return (
    <>
      {!isClient ? null : (
        <div>
          <Navbar />

          <form onSubmit={handleSubmit} className="md:px-6 ">
            {/* Page Header Section */}
            <PageHeaderSection />
            {canSeeCustomerInfo && foundCustomer && (
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

            <SearchHistorySection
              searchHistory={searchHistory}
              showSearchHistory={showSearchHistory}
              setShowSearchHistory={setShowSearchHistory}
              oldHistoryId={oldHistoryId}
              setFilterFields={setFilterFields}
              setPurchaseReason={setPurchaseReason}
              setInterestedLoan={setInterestedLoan}
              setBankLoanAmount={setBankLoanAmount}
              setCarAvailable={setCarAvailable}
              setClientIncome={setClientIncome}
              setClientCompanyTransaction={setClientCompanyTransaction}
              setFacebookIdLink={setFacebookIdLink}
              setFacebookMessengerLink={setFacebookMessengerLink}
              setClientLevel={setClientLevel}
              setClientSeriousness={setClientSeriousness}
              setCarExchangeCategory={setCarExchangeCategory}
              setDescription={setDescription}
              setSearchType={setSearchType}
              setStrictSortOrder={setStrictSortOrder}
              setIsConsolidatedView={setIsConsolidatedView}
              setSelectedUserModes={setSelectedUserModes}
              shopsData={shopsData}
              setSelectedShops={setSelectedShops}
              setDisplayVisitingCardImage={setDisplayVisitingCardImage}
              setVisitingCardImage={setVisitingCardImage}
              setOperationType={setOperationType}
              setOldHistoryId={setOldHistoryId}
              getAllProduct={getAllProduct}
            />

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
                    {/* Search bar */}
                    <div className="mt-4 p-4 rounded-lg border border-orange-200 bg-orange-50/40">
                      <p className="text-base font-semibold text-orange-700 mb-3">Find Existing Customer</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-medium" htmlFor="find-customer-mobile">Mobile Number</label>
                          <input
                            id="find-customer-mobile"
                            type="tel"
                            placeholder="Enter mobile number"
                            className="outline-none py-2 px-3 rounded border border-gray-500/40"
                            value={customerSearchMobile}
                            onChange={(e) => setCustomerSearchMobile(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleFindExistingCustomer(); } }}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-medium" htmlFor="find-customer-name">Customer Name</label>
                          <input
                            id="find-customer-name"
                            type="text"
                            placeholder="Enter customer name"
                            className="outline-none py-2 px-3 rounded border border-gray-500/40"
                            value={customerSearchName}
                            onChange={(e) => setCustomerSearchName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleFindExistingCustomer(); } }}
                          />
                        </div>
                        <div className="flex flex-wrap items-end gap-2 justify-start">
                          <button
                            type="button"
                            className="shrink-0 w-auto max-w-[10.5rem] whitespace-nowrap bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium min-h-[42px] py-2.5 px-3 rounded inline-flex items-center justify-center disabled:opacity-60"
                            onClick={handleFindExistingCustomer}
                            disabled={isLoading}
                          >
                            {isLoading ? "Searching..." : "Search Customer"}
                          </button>
                          <button
                            type="button"
                            className="shrink-0 w-auto max-w-[10.5rem] whitespace-nowrap bg-green-600 hover:bg-green-700 text-white text-xs font-medium min-h-[42px] py-2.5 px-3 rounded inline-flex items-center justify-center gap-1.5"
                            onClick={() => setIsAddCustomerModalOpen(true)}
                          >
                            <Plus className="h-4 w-4 shrink-0" />
                            New Customer
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Customer not found */}
                    {customerNotFound && !foundCustomer && (
                      <div className="mt-4 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                        <p className="text-sm text-yellow-800 font-medium">No customer found. Would you like to create a new one?</p>
                      </div>
                    )}

                    {/* Customer found — view mode (full customer + sales team activity) */}
                    {foundCustomer && (
                      <div className="mt-4 p-4">
                        <div className="flex items-center justify-end mb-4">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded border border-orange-500 text-orange-600 bg-white hover:bg-orange-50"
                            onClick={() => setIsEditCustomerModalOpen(true)}
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit Customer
                          </button>
                        </div>
                        <CustomerFoundDetailsSection
                          customer={foundCustomer}
                          activities={salesTeamActivities}
                          activitiesLoading={salesActivitiesLoading}
                        />
                      </div>
                    )}

                    {foundCustomer && showAdditionalInfo && (
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
                  <CategorySubcategorySection
                    categoryData={categoryData}
                    subcategoryData={subcategoryData}
                    filterFields={filterFields}
                    setFilterFields={setFilterFields}
                    isCategoryLoading={isCategoryLoading}
                  />

                  {showVehicleFilters && (
                    <VehicleFiltersSection
                      canSeeUserModes={canSeeUserModes}
                      selectedUserModes={selectedUserModes}
                      setSelectedUserModes={setSelectedUserModes}
                      shopsData={shopsData}
                      selectedShops={selectedShops}
                      setSelectedShops={setSelectedShops}
                      shopsLoading={shopsLoading}
                      searchType={searchType}
                      setSearchType={setSearchType}
                      strictSortOrder={strictSortOrder}
                      setStrictSortOrder={setStrictSortOrder}
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
                      budgetInputInFocus={budgetInputInFocus}
                      setBudgetInputInFocus={setBudgetInputInFocus}
                      mileageInputInFocus={mileageInputInFocus}
                      setMileageInputInFocus={setMileageInputInFocus}
                      yearOptions={yearOptions}
                      userRoleName={userRoleName}
                      capacityInputInFocus={capacityInputInFocus}
                      setCapacityInputInFocus={setCapacityInputInFocus}
                      transmissionData={transmissionData}
                      availabilityData={availabilityData}
                      canAccessToChasisNo={canAccessToChasisNo}
                      locationData={locationData}
                    />
                  )}

                </>
              )}
            </div>

            <FilterActionButtons
              isCategorySelected={isCategorySelected}
              onClear={() => {
                setFilterFields({
                  budget: [0, 50000000],
                  readyBudget: [0, 50000000],
                  category: "",
                  subcategory: "",
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
                setStrictSortOrder("");
                setSearchHistory([]);
                setCustomerName("");
                setCustomerEmail("");
                setCustomerAddress("");
              }}
            />
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
          {isEditCustomerModalOpen && foundCustomer && (
            <EditCustomerModal
              isOpen={isEditCustomerModalOpen}
              onClose={() => setIsEditCustomerModalOpen(false)}
              customer={foundCustomer}
              onSuccess={() => {
                setIsEditCustomerModalOpen(false);
                if (foundCustomer?.id) {
                  fetchCustomerDetailsByCustomerId(foundCustomer.id);
                } else if (foundCustomer?.mobile) {
                  fetchCustomerDetailsBasedOnMobile(foundCustomer.mobile);
                }
              }}
            />
          )}
          {isAddCustomerModalOpen && (
            <EditCustomerModal
              isOpen={isAddCustomerModalOpen}
              onClose={() => setIsAddCustomerModalOpen(false)}
              customer={null}
              onSuccess={async (saved) => {
                if (saved?.id) {
                  await fetchCustomerDetailsByCustomerId(saved.id);
                } else if (saved?.mobile) {
                  await fetchCustomerDetailsBasedOnMobile(saved.mobile);
                }
              }}
            />
          )}
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
