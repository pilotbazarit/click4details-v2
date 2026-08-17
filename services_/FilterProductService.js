import CategoryService from "@/services/CategoryService";
import constData from "@/lib/constant";
import LocationService from "@/services/LocationService";
import MasterDataService from "@/services/MasterDataService";
import PackageService from "@/services/PackageService";
import ShopService from "@/services/ShopService";

// Session-scoped cache: key = "cat_root" | "cat_{parentId}"
const _categoryCache = new Map();

const Queries = {
  getColorOptions: async () => {
    const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.COLOR_MD_CODE);
    const colorMasterData = response.data?.master_data || [];

    return [
      {
        value: "",
        label: "-Select Color-",
      },
      ...colorMasterData.map((color) => ({
        value: color.md_id,
        label: color.md_title,
      })),
    ];
  },
  getFuelOptions: async () => {
    const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.FUEL_MD_CODE);
    const fuelMasterData = response.data?.master_data || [];

    return [
      {
        value: "",
        label: "-Select Fuel-",
      },
      ...fuelMasterData.map((fuel) => ({
        value: fuel.md_id,
        label: fuel.md_title,
      })),
    ];
  },
  getPurchaseReasonOptions: async () => {
    const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.PURCHASE_REASON_MD_CODE);
    const purchaseReasonMasterData = response.data?.master_data || [];

    return [
      { value: "", label: "-Select Purchase Reason-" },
      ...purchaseReasonMasterData.map((reason) => ({
        value: reason.md_id,
        label: reason.md_title,
      })),
    ];
  },
  getClientIncomeOptions: async () => {
    const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.CLIENT_INCOME_MD_CODE);
    const clientIncomeMasterData = response.data?.master_data || [];

    return [
      { value: "", label: "-Select Client Income-" },
      ...clientIncomeMasterData.map((income) => ({
        value: income.md_id,
        label: income.md_title,
      })),
    ];
  },
  getClientCompanyTransactionOptions: async () => {
    const response = await MasterDataService.Queries.getMasterDataByTypeCode("client_company_transaction_per_year_1758360851");
    const clientCompanyTransactionMasterData = response.data?.master_data || [];

    return [
      { value: "", label: "-Select Client Company Transaction-" },
      ...clientCompanyTransactionMasterData.map((transaction) => ({
        value: transaction.md_id,
        label: transaction.md_title,
      })),
    ];
  },
  getBankLoanAmountOptions: async () => {
    const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.BANK_LOAN_AMOUNT_MD_CODE);
    const bankLoanAmountMasterData = response.data?.master_data || [];

    return [
      { value: "", label: "-Select Bank Loan Amount-" },
      ...bankLoanAmountMasterData.map((loan) => ({
        value: loan.md_id,
        label: loan.md_title,
      })),
    ];
  },
  getCarAvailableOptions: async () => {
    const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.CAR_AVAILABLE_MD_CODE);
    const carAvailableMasterData = response.data?.master_data || [];

    return [
      { value: "", label: "-Select Car Available-" },
      ...carAvailableMasterData.map((car) => ({
        value: car.md_id,
        label: car.md_title,
      })),
    ];
  },
  getClientAttitudeOptions: async () => {
    const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.CLIENT_ATTITUDE_MD_CODE);
    const clientAttitudeMasterData = response.data?.master_data || [];

    return [
      { value: "", label: "-Select Client Attitude-" },
      ...clientAttitudeMasterData.map((attitude) => ({
        value: attitude.md_id,
        label: attitude.md_title,
      })),
    ];
  },
  getClientProfessionOptions: async () => {
    const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.CLIENT_PROFESSION_MD_CODE);
    const clientProfessionMasterData = response.data?.master_data || [];

    return [
      { value: "", label: "-Select Client Profession-" },
      ...clientProfessionMasterData.map((profession) => ({
        value: profession.md_id,
        label: profession.md_title,
      })),
    ];
  },
  getClientLevelOptions: async () => {
    const response = await MasterDataService.Queries.getMasterDataByTypeCode("client_level_1758127591");
    const clientLevelMasterData = response.data?.master_data || [];

    return [
      { value: "", label: "-Select Client Level-" },
      ...clientLevelMasterData.map((level) => ({
        value: level.md_id,
        label: level.md_title,
      })),
    ];
  },
  getClientSeriousnessOptions: async () => {
    const response = await MasterDataService.Queries.getMasterDataByTypeCode("client_seriousness_1758128063");
    const clientSeriousnessMasterData = response.data?.master_data || [];

    return [
      { value: "", label: "-Select Client Seriousness-" },
      ...clientSeriousnessMasterData.map((level) => ({
        value: level.md_id,
        label: level.md_title,
      })),
    ];
  },
  getCarExchangeCategoryOptions: async () => {
    const response = await MasterDataService.Queries.getMasterDataByTypeCode("car_exchange_category_per_year_1758128234");
    const carExchangeCategoryMasterData = response.data?.master_data || [];

    return [
      { value: "", label: "-Select Car Exchange Category-" },
      ...carExchangeCategoryMasterData.map((level) => ({
        value: level.md_id,
        label: level.md_title,
      })),
    ];
  },
  getSkeletonOptions: async () => {
    const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.SKELETON_MD_CODE);
    const skeletonMasterData = response.data?.master_data || [];

    return [
      { value: "", label: "-Select Skeleton-" },
      ...skeletonMasterData.map((skeleton) => ({
        value: skeleton.md_id,
        label: skeleton.md_title,
      })),
    ];
  },
  getConditionOptions: async () => {
    const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.CONSTANTS_MD_CODE);
    const conditionMasterData = response.data?.master_data || [];

    return [
      { value: "", label: "-Select Condition-" },
      ...conditionMasterData.map((condition) => ({
        value: condition.md_id,
        label: condition.md_title,
      })),
    ];
  },
  getGradeOptions: async () => {
    const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.GRADE_MD_CODE);
    const gradeMasterData = response.data?.master_data || [];

    return [
      { value: "", label: "-Select Point-" },
      ...gradeMasterData.map((grade) => ({
        value: grade.md_id,
        label: grade.md_title,
      })),
    ];
  },
  getExteriorGradeOptions: async () => {
    const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.EXTERIOR_GRADE_MD_CODE);
    const gradeMasterData = response.data?.master_data || [];

    return [
      { value: "", label: "-Select Grade-" },
      ...gradeMasterData.map((grade) => ({
        value: grade.md_id,
        label: grade.md_title,
      })),
    ];
  },
  getInteriorGradeOptions: async () => {
    const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.INTERIOR_GRADE_MD_CODE);
    const gradeMasterData = response.data?.master_data || [];

    return [
      { value: "", label: "-Select Grade-" },
      ...gradeMasterData.map((grade) => ({
        value: grade.md_id,
        label: grade.md_title,
      })),
    ];
  },
  getSeatOptions: async () => {
    const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.SEAT_CODE);
    const seatMasterData = response.data?.master_data || [];

    return [
      { value: "", label: "-Select Grade-" },
      ...seatMasterData.map((seat) => ({
        value: seat.md_id,
        label: seat.md_title,
      })),
    ];
  },
  getAvailabilityOptions: async () => {
    const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.USER_AVAILABILITY_MD_CODE);
    const availabilityMasterData = response.data?.master_data || [];

    return [
      { value: "", label: "-Select Availability-" },
      ...availabilityMasterData.map((item) => ({
        value: item.md_id,
        label: item.md_title,
      })),
    ];
  },
  getBrandOptions: async () => {
    const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.BRAND_MD_CODE);
    const brandMasterData = response.data?.master_data || [];

    return [
      {
        value: "",
        label: "-Select Brand-",
      },
      ...brandMasterData.map((brand) => ({
        value: brand.md_id,
        label: brand.md_title,
      })),
    ];
  },
  getTransmissionOptions: async () => {
    const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.TRANSACTION_MD_CODE);
    const transmissionMasterData = response.data?.master_data || [];

    return [
      {
        value: "",
        label: "-Select Transmission-",
      },
      ...transmissionMasterData.map((transmission) => ({
        value: transmission.md_id,
        label: transmission.md_title,
      })),
    ];
  },
  getMasterDataOptions: async (typeCode) => {
    const cacheKey = `md_${typeCode}`;
    if (_categoryCache.has(cacheKey)) return _categoryCache.get(cacheKey);

    const response = await MasterDataService.Queries.getMasterDataByTypeCode(typeCode);
    const items = Array.isArray(response?.data?.master_data) ? response.data.master_data : [];
    const result = items.map((item) => ({ value: item.md_id, label: item.md_title }));
    _categoryCache.set(cacheKey, result);
    return result;
  },
  getLocationOptions: async () => {
    const response = await LocationService.Queries.getAllLocation();
    const locations = response.data?.data || response.data || [];

    return [
      { value: "", label: "-Select Location-" },
      ...locations.map((loc) => ({
        value: loc.l_id,
        label: loc.l_name,
      })),
    ];
  },
  getCategoryOptions: async () => {
    const cacheKey = "cat_root";
    if (_categoryCache.has(cacheKey)) return _categoryCache.get(cacheKey);

    const response = await CategoryService.Queries.getCategories({
      _page: 1,
      _perPage: 200,
      _parent_id: 0,
    });

    if (response?.status !== "success") {
      return [{ value: "", label: "-Select Category-" }];
    }

    const result = [
      { value: "", label: "-Select Category-" },
      ...(response.data?.data || []).map((c) => ({ value: c.c_id, label: c.c_name })),
    ];
    _categoryCache.set(cacheKey, result);
    return result;
  },
  getSubcategoryOptions: async (parentCategoryId) => {
    if (!parentCategoryId) return [{ value: "", label: "-Select Subcategory-" }];

    const cacheKey = `cat_${parentCategoryId}`;
    if (_categoryCache.has(cacheKey)) return _categoryCache.get(cacheKey);

    const response = await CategoryService.Queries.getCategoryChildren(parentCategoryId);

    if (response?.status !== "success") {
      return [{ value: "", label: "-Select Subcategory-" }];
    }

    const result = [
      { value: "", label: "-Select Subcategory-" },
      ...(response.data || []).map((c) => ({ value: c.c_id, label: c.c_name })),
    ];
    _categoryCache.set(cacheKey, result);
    return result;
  },
  getShopsOptions: async (normalizedUserId) => {
    const params = {
      _page: 1,
      _perPage: 1000,
      order: "desc",
      orderBy: "s_id",
      _user_id: normalizedUserId,
    };

    const response = await ShopService.Queries.getShops(params);
    const companyShopsResponse = await ShopService.Queries.getCompanyShops(normalizedUserId);

    const shopsDataFromAPI = response?.data?.data || [];
    const companyShopsDataFromAPI = companyShopsResponse?.data || [];

    const newCompanyShopsData = companyShopsDataFromAPI.map((shop) => ({
      value: shop.shop.s_id,
      label: shop.shop.s_title,
      phone: shop?.shop?.user?.phone || shop?.shop?.s_user_phone || "",
    }));

    const userShopsData = shopsDataFromAPI.map((shop) => ({
      value: shop.s_id,
      label: shop.s_title,
      phone: shop?.user?.phone || shop?.s_user_phone || "",
    }));

    return [{ value: "all", label: "All Shops" }, { value: "pbhome", label: "PBL Home" }, ...userShopsData, ...newCompanyShopsData];
  },
  getModelOptions: async (brandIds) => {
    if (!brandIds || brandIds.length === 0) return [];

    const response = await MasterDataService.Queries.getModelsByBrand(brandIds);
    const modelMasterData = response.data?.data || response.data || [];

    return [
      {
        value: "",
        label: "-Select Model-",
      },
      ...modelMasterData.map((model) => ({
        value: model.vm_id,
        label: model.vm_name,
      })),
    ];
  },
  getPackageOptions: async (brandIds, modelIds) => {
    if (!brandIds || brandIds.length === 0 || !modelIds || modelIds.length === 0) {
      return [{ value: "", label: "-Select Package-" }];
    }

    const response = await PackageService.Queries.getDependentPackages(brandIds, modelIds);
    const packageMasterData = response.data?.data || response.data || [];

    return [
      {
        value: "",
        label: "-Select Package-",
      },
      ...packageMasterData.map((edition) => ({
        value: edition.p_id,
        label: edition.p_name,
      })),
    ];
  },
};

const Actions = {
  loadColorOptions: async ({ setColors, toast }) => {
    try {
      const colorData = await Queries.getColorOptions();
      setColors(colorData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadFuelOptions: async ({ setFuels, toast }) => {
    try {
      const fuelData = await Queries.getFuelOptions();
      setFuels(fuelData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadPurchaseReasonOptions: async ({ setPurchaseReasonData, toast }) => {
    try {
      const options = await Queries.getPurchaseReasonOptions();
      setPurchaseReasonData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadClientIncomeOptions: async ({ setClientIncomeData, toast }) => {
    try {
      const options = await Queries.getClientIncomeOptions();
      setClientIncomeData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadClientCompanyTransactionOptions: async ({ setClientCompanyTransactionData, toast }) => {
    try {
      const options = await Queries.getClientCompanyTransactionOptions();
      setClientCompanyTransactionData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadBankLoanAmountOptions: async ({ setBankLoanAmountData, toast }) => {
    try {
      const options = await Queries.getBankLoanAmountOptions();
      setBankLoanAmountData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadCarAvailableOptions: async ({ setCarAvailableData, toast }) => {
    try {
      const options = await Queries.getCarAvailableOptions();
      setCarAvailableData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadClientAttitudeOptions: async ({ setClientAttitudeData, toast }) => {
    try {
      const options = await Queries.getClientAttitudeOptions();
      setClientAttitudeData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadClientProfessionOptions: async ({ setClientProfessionData, toast }) => {
    try {
      const options = await Queries.getClientProfessionOptions();
      setClientProfessionData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadClientLevelOptions: async ({ setClientLevelData, toast }) => {
    try {
      const options = await Queries.getClientLevelOptions();
      setClientLevelData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadClientSeriousnessOptions: async ({ setClientSeriousnessData, toast }) => {
    try {
      const options = await Queries.getClientSeriousnessOptions();
      setClientSeriousnessData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadCarExchangeCategoryOptions: async ({ setCarExchangeCategoryData, toast }) => {
    try {
      const options = await Queries.getCarExchangeCategoryOptions();
      setCarExchangeCategoryData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadSkeletonOptions: async ({ setSkeletonData, toast }) => {
    try {
      const options = await Queries.getSkeletonOptions();
      setSkeletonData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadConditionOptions: async ({ setConditionData, toast }) => {
    try {
      const options = await Queries.getConditionOptions();
      setConditionData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadGradeOptions: async ({ setGradeData, toast }) => {
    try {
      const options = await Queries.getGradeOptions();
      setGradeData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadExteriorGradeOptions: async ({ setExteriorGradeData, toast }) => {
    try {
      const options = await Queries.getExteriorGradeOptions();
      setExteriorGradeData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadInteriorGradeOptions: async ({ setInteriorGradeData, toast }) => {
    try {
      const options = await Queries.getInteriorGradeOptions();
      setInteriorGradeData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadSeatOptions: async ({ setSeatData, toast }) => {
    try {
      const options = await Queries.getSeatOptions();
      setSeatData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadAvailabilityOptions: async ({ setAvailabilityData, toast }) => {
    try {
      const options = await Queries.getAvailabilityOptions();
      setAvailabilityData(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadBrandOptions: async ({ setBrands, toast }) => {
    try {
      const options = await Queries.getBrandOptions();
      setBrands(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadTransmissionOptions: async ({ setTransmission, toast }) => {
    try {
      const options = await Queries.getTransmissionOptions();
      setTransmission(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadLocationOptions: async ({ setLocationData, toast }) => {
    try {
      const options = await Queries.getLocationOptions();
      setLocationData(options);
    } catch (error) {
      toast.error(error.message || "Failed to fetch locations.");
    }
  },
  loadCategoryOptions: async ({ setCategories, setIsCategoryLoading, toast }) => {
    setIsCategoryLoading(true);
    try {
      const options = await Queries.getCategoryOptions();
      setCategories(options);
    } catch (error) {
      console.error("Error fetching categories:", error);
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Failed to fetch categories");
      }
      setCategories([{ value: "", label: "-Select Category-" }]);
    } finally {
      setIsCategoryLoading(false);
    }
  },
  loadSubcategoryOptions: async ({ parentCategoryId, setSubcategories }) => {
    if (!parentCategoryId) {
      setSubcategories([{ value: "", label: "-Select Subcategory-" }]);
      return;
    }

    try {
      const options = await Queries.getSubcategoryOptions(parentCategoryId);
      setSubcategories(options);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubcategories([{ value: "", label: "-Select Subcategory-" }]);
    }
  },
  loadShopsOptions: async ({ normalizedUserId, setShopsLoading, setShopsData, setSelectedShops, toast }) => {
    if (!normalizedUserId) return;
    try {
      setShopsLoading(true);
      const allShopsData = await Queries.getShopsOptions(normalizedUserId);
      setShopsData(allShopsData);

      const pendingShops = sessionStorage.getItem("pendingShopSelection");
      if (pendingShops) {
        try {
          const shopIds = JSON.parse(pendingShops);
          const selectedShopObjects = shopIds.map((shopId) => {
            const shop = allShopsData.find((s) => s.value === shopId || s.value === String(shopId));
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
  },
  loadModelOptions: async ({ brandIds, setModels, toast }) => {
    if (!brandIds || brandIds.length === 0) {
      setModels([]);
      return;
    }
    try {
      const options = await Queries.getModelOptions(brandIds);
      setModels(options);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  },
  loadPackageOptions: async ({ brandIds, modelIds, setPackageData, setFilterFields, toast }) => {
    if (!brandIds || brandIds.length === 0 || !modelIds || modelIds.length === 0) {
      setPackageData([{ value: "", label: "-Select Package-" }]);
      return;
    }
    try {
      const packageData = await Queries.getPackageOptions(brandIds, modelIds);
      setPackageData(packageData);

      const pendingPackages = sessionStorage.getItem("pendingPackageSelection");
      if (pendingPackages) {
        try {
          const packageIds = JSON.parse(pendingPackages);
          const validPackageIds = packageIds.filter((pkgId) => packageData.some((pkg) => pkg.value === pkgId || pkg.value === String(pkgId)));

          if (validPackageIds.length > 0) {
            setFilterFields((prev) => ({ ...prev, package: validPackageIds }));
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
  },
};

export default {
  Queries,
  Actions,
};
