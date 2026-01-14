"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Loading from '@/components/Loading';
import Footer from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import TableFilter from "@/components/TableFilter";
import Pagination from "@/components/Pagination";
import ShopModal from "@/components/modals/ShopModal";
import StoreService from "@/services/ShopService";
import { DollarSign, Funnel, Loader2, Pencil, Trash2, Settings, Eye, Check, X } from "lucide-react";
import Select from 'react-select';
import constData from "@/lib/constant";
import api from "@/lib/api";
import ColumnVisibilityToggle from "@/components/ColumnVisibilityToggle";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import toast from "react-hot-toast";
import Swal from "sweetalert2";
import MasterDataService from "@/services/MasterDataService";
import VehicleModelService from "@/services/VehicleModelService";
import VehicleService from "@/services/VehicleService";
import UserService from "@/services/UserService";
import { useRouter } from "next/navigation";
import PackageService from "@/services/PackageService";
import PriceHistoryModal from "@/components/modals/PriceHistoryModal";
import PricePreviewModal from "@/components/modals/PricePreviewModal";
import { set } from "lodash";
import { useAppContext } from "@/context/AppContext";
import { hasPermission } from "@/lib/utils";
import ShopService from "@/services/ShopService";

const ProductList = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("")
  const [codeQuery, setCodeQuery] = useState("");
  const [showCodeSearch, setShowCodeSearch] = useState(false);
  const [editionQuery, setEditionQuery] = useState("");
  const [showEditionSearch, setShowEditionSearch] = useState(false);
  const [chassisQuery, setChassisQuery] = useState("");
  const [showChassisSearch, setShowChassisSearch] = useState(false);
  const [priorityQuery, setPriorityQuery] = useState("");
  const [showPrioritySearch, setShowPrioritySearch] = useState(false);
  const [ownerQuery, setOwnerQuery] = useState("");
  const [showOwnerSearch, setShowOwnerSearch] = useState(false);
  const [brandQuery, setBrandQuery] = useState("");
  const [showBrandSearch, setShowBrandSearch] = useState(false);
  const [modelQuery, setModelQuery] = useState("");
  const [showModelSearch, setShowModelSearch] = useState(false);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [editions, setEditions] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [pricePreviewOpen, setPricePreviewOpen] = useState(false);
  const [shops, setShops] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(87);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const filterButtonRef = useRef(null);
  const tooltipRef = useRef(null);
  const editionButtonRef = useRef(null);
  const editionTooltipRef = useRef(null);
  const chassisButtonRef = useRef(null);
  const chassisTooltipRef = useRef(null);
  const priorityButtonRef = useRef(null);
  const priorityTooltipRef = useRef(null);
  const ownerButtonRef = useRef(null);
  const ownerTooltipRef = useRef(null);
  const brandButtonRef = useRef(null);
  const brandTooltipRef = useRef(null);
  const modelButtonRef = useRef(null);
  const modelTooltipRef = useRef(null);
  const [sortColumn, setSortColumn] = useState('v_id'); // Default sort column
  const [sortOrder, setSortOrder] = useState('ASC'); // Default sort order
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pricePreviewProduct, setPricePreviewProduct] = useState(null);
  const [selectedShop, setSelectedShop] = useState("my-shop");
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(['sl', 'name', 'brand', 'model', 'package', 'chassis', 'color', 'costing-price', 'asking-price', 'fixed-price', 'condition', 'availability', 'package', 'code', 'actions']);
  const [editingFixedPriceId, setEditingFixedPriceId] = useState(null);
  const [editingFixedPriceValue, setEditingFixedPriceValue] = useState("");
  const [savingFixedPriceId, setSavingFixedPriceId] = useState(null);
  const [editingPurchasePriceId, setEditingPurchasePriceId] = useState(null);
  const [editingPurchasePriceValue, setEditingPurchasePriceValue] = useState("");
  const [savingPurchasePriceId, setSavingPurchasePriceId] = useState(null);
  const [editingAskingPriceId, setEditingAskingPriceId] = useState(null);
  const [editingAskingPriceValue, setEditingAskingPriceValue] = useState("");
  const [savingAskingPriceId, setSavingAskingPriceId] = useState(null);
  const [editingCostingPriceId, setEditingCostingPriceId] = useState(null);
  const [editingCostingPriceValue, setEditingCostingPriceValue] = useState("");
  const [savingCostingPriceId, setSavingCostingPriceId] = useState(null);

  const { permissionList } = useAppContext();
  const [shopData, setShopData] = useState([]);
  const [user, setUser] = useState(null);
  const [isCompanyShop, setIsCompanyShop] = useState(false);
  // const itemsPerPage = 10
  const router = useRouter();

  // console.log("selectedShop", selectedShop);
  // console.log("permissionList", permissionList);

  const [updateFixedPricePermission, setUpdateFixedPricePermission] = useState(true);
  const [updateCostingPricePermission, setUpdateCostingPricePermission] = useState(true);
  const [updateAskingPricePermission, setUpdateAskingPricePermission] = useState(true);
  const [updatePurchasePricePermission, setUpdatePurchasePricePermission] = useState(true);
  const [updateVariablePricePermission, setUpdateVariablePricePermission] = useState(true);
  const [updateProductPricePermission, setUpdateProductPricePermission] = useState(true);



  useEffect(() => {

    // console.log("----------------selectedShop------------------", selectedShop);

    if (selectedShop !== "my-shop") {
      let companyShopId = selectedShop;
      // console.log("companyShopId", companyShopId);

      let updateProductPriceAction = "Update"
      const hasUpdateProductPricePermission = hasPermission(permissionList, Number(companyShopId), "Vehicle", updateProductPriceAction);
      if (hasUpdateProductPricePermission) {
        setUpdateProductPricePermission(hasUpdateProductPricePermission);
      } else {
        setUpdateProductPricePermission(false);
      }

      let updateFixedPriceAction = "UpdateFixedPrice"
      const hasUpdateFixedPricePermission = hasPermission(permissionList, Number(companyShopId), "Vehicle", updateFixedPriceAction);
      if (hasUpdateFixedPricePermission) {
        setUpdateFixedPricePermission(hasUpdateFixedPricePermission);
      } else {
        setUpdateFixedPricePermission(false);
      }


      let updateCostingPriceAction = "UpdateCostingPrice"
      const hasUpdateCostingPricePermission = hasPermission(permissionList, Number(companyShopId), "Vehicle", updateCostingPriceAction);
      if (hasUpdateCostingPricePermission) {
        setUpdateCostingPricePermission(hasUpdateCostingPricePermission);
      } else {
        setUpdateCostingPricePermission(false);
      }



      let updateAskingPriceAction = "UpdateAskingPrice"
      const hasUpdateAskingPricePermission = hasPermission(permissionList, Number(companyShopId), "Vehicle", updateAskingPriceAction);
      if (hasUpdateAskingPricePermission) {
        setUpdateAskingPricePermission(hasUpdateAskingPricePermission);
      } else {
        setUpdateAskingPricePermission(false);
      }

      // UpdatePurchasePrice
      let updatePurchasePriceAction = "UpdatePurchasePrice"
      const hasUpdatePurchasePricePermission = hasPermission(permissionList, Number(companyShopId), "Vehicle", updatePurchasePriceAction);
      if (hasUpdatePurchasePricePermission) {
        setUpdatePurchasePricePermission(hasUpdatePurchasePricePermission);
      } else {
        setUpdatePurchasePricePermission(false);
      }



      let updateVariablePriceAction = "UpdateVariablePrice"
      const hasUpdateVariablePricePermission = hasPermission(permissionList, Number(companyShopId), "Vehicle", updateVariablePriceAction);
      if (hasUpdateVariablePricePermission) {
        setUpdateVariablePricePermission(hasUpdateVariablePricePermission);
      } else {
        setUpdateVariablePricePermission(false);
      }


    } else {
      setUpdateFixedPricePermission(true);
      setUpdateCostingPricePermission(true);
      setUpdateAskingPricePermission(true);
      setUpdateVariablePricePermission(true);
    }

  }, [selectedShop]);


  // console.log("u====pdateFixedPricePermission======", updateFixedPricePermission);
  // console.log("u====updateCostingPricePermission======", updateCostingPricePermission);

  const columns = [
    { key: 'sl', label: 'SL' },
    { key: 'name', label: 'Name' },
    { key: 'brand', label: 'Brand' },
    { key: 'model', label: 'Model' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'package', label: 'Package' },
    { key: 'chassis', label: 'Chassis No' },
    { key: 'color', label: 'Color' },
    { key: 'price', label: 'Price' },
    { key: 'costing-price', label: 'Costing Price' },
    { key: 'asking-price', label: 'Asking Price' },
    { key: 'fixed-price', label: 'Fixed Price' },
    { key: 'purchase-price', label: 'Purchase Price' },
    { key: 'condition', label: 'Condition' },
    { key: 'owner', label: 'Owner' },
    { key: 'availability', label: 'Availability' },
    { key: 'grade', label: 'Grade' },
    { key: 'milage', label: 'Milage' },
    { key: 'fuel', label: 'Fuel' },
    { key: 'priority', label: 'Priority' },
    { key: 'code', label: 'Code' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  const isColumnVisible = (columnKey) => visibleColumns.includes(columnKey);


  // console.log("=====================", permissionList);

  useEffect(() => {
    const fetchEditions = async () => {
      try {
        const response = await PackageService.Queries.getPackages({
          _page: 1,
          _perPage: 1000
        });
        if (response?.status === "success") {
          setEditions(response?.data?.data);
        } else {
          toast.error(response?.data?.message || "Failed to fetch editions");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch editions");
      }
    };
    fetchEditions();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await UserService.Queries.getUsers({
          _page: 1,
          _perPage: 1000
        });
        if (response?.status === "success") {
          setUsers(response?.data?.data);
        } else {
          toast.error(response?.data?.message || "Failed to fetch users");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch users");
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const brandCode = constData.BRAND_MD_CODE;
        const response = await MasterDataService.Queries.getMasterDataByTypeCode(brandCode);
        const brandMasterData = response.data?.master_data || [];
        const brandData = brandMasterData.map((brand) => ({
          value: brand.md_id,
          label: brand.md_title,
        }));
        setBrands(brandData);
      } catch (error) {
        if (error.errors) {
          Object.values(error.errors).forEach((e) => toast.error(e[0]));
        } else {
          toast.error(error.message || "Failed to fetch brands");
        }
      }
    };

    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await VehicleModelService.Queries.getModels({
          _page: 1,
          _perPage: 1000,
        });
        const modelData = response.data?.data?.map((model) => ({
          value: model.vm_id,
          label: model.vm_name,
        })) || [];
        setModels(modelData);
      } catch (error) {
        if (error.errors) {
          Object.values(error.errors).forEach((e) => toast.error(e[0]));
        } else {
          toast.error(error.message || "Failed to fetch models");
        }
      }
    };

    fetchModels();
  }, []);



  // const getPackages = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await PackageService.Queries.getPackages({
  //       _page: 1,
  //       _perPage: 1000
  //     });
  //     setPackages(response?.data?.data);
  //     setLoading(false);
  //   } catch (error) {
  //     setLoading(false);
  //     toast.error(
  //       error.response?.data?.message || "Failed to fetch data types"
  //     );
  //   }
  // };


  // console.log("priorityQuery", priorityQuery);





  const getProducts = async (
    newCodeQuery = codeQuery,
    newEditionQuery = editionQuery,
    newChassisQuery = chassisQuery,
    newPriorityQuery = priorityQuery,
    newOwnerQuery = ownerQuery,
    newBrandQuery = brandQuery,
    newModelQuery = modelQuery,
    searchQuery = query,
    shopId
  ) => {
    try {

      const userData = localStorage.getItem("user");
      const userInfo = userData && JSON.parse(userData);
      const user = JSON.parse(userInfo);


      // console.log("user mode:::", user);



      setLoading(true);
      const params = {
        _page: currentPage,
        _perPage: itemsPerPage,
        _order: 'desc',
        _orderBy: 'v_id',
        _status: 'active',
      };

      const shopToFilter = shopId !== undefined ? shopId : selectedShop;

      if (shopToFilter) {
        if (shopToFilter === 'my-shop') {
          if (user?.user_mode === 'user' || user?.user_mode === 'partner') {
            params._user_id = user?.id;
          }
          // params._user_id = user?.id;
        } else {
          params['_shop_ids[0]'] = shopToFilter;
          delete params._user_id; // When filtering by a specific company shop, we don't want the default user filter
        }
      } else if (user?.user_mode === 'user' || user?.user_mode === 'partner') {
        // Default behavior if no shop is selected
        params._user_id = user?.id;
      }

      if (searchQuery) {
        params._title = searchQuery;
      }

      if (newCodeQuery) {
        params._code = newCodeQuery;
      }

      if (newEditionQuery) {
        params._edition_id = newEditionQuery;
      }

      if (newChassisQuery) {
        params._chassis = newChassisQuery;
      }

      if (newPriorityQuery) {
        params._orderBy = 'v_priority';

        params._order = newPriorityQuery;
      }

      if (newOwnerQuery) {
        params._user_id = newOwnerQuery;
      }

      if (newBrandQuery) {
        params._brand_id = newBrandQuery;
      }

      if (newModelQuery) {
        params._model_id = newModelQuery;
      }


      // console.log("_priority_order", _priority_order);

      const response = await VehicleService.Queries.getVehiclesWithLogin(params);

      if (response?.status == "success") {
        setTotalItems(response?.data?.total)
        setProducts(response?.data?.data)
        setLoading(false);
      } else {
        setLoading(false);
        toast.error(response?.data?.message || "Failed to fetch products");
      }

    } catch (error) {
      setLoading(false);
      toast.error(
        error.response?.data?.message || "Failed to fetch data types"
      );
    }
  }


  // console.log("query", query);

  const fetchSearchResults = () => {
    // This is called by TableFilter's debounced search
    // The query state is already updated, so we just need to trigger the API call
    // with all current filter values
    getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery);
  };

  const handleAdd = async () => {
    router.push("/dashboard/products/vehicle/create/");
  }

  const handleEdit = async (id) => {
    router.push(`/dashboard/products/vehicle/edit/${id}`);
  }

  const handlePriceHistory = async (item) => {
    setSelectedProduct(item);
    setOpen(true);
  }

  const handlePricePreview = (item) => {
    setPricePreviewProduct(item);
    setPricePreviewOpen(true);
  }

  const startEditFixedPrice = (item) => {
    setEditingFixedPriceId(item?.v_id);
    setEditingFixedPriceValue(item?.vehicle_db_price?.vp_user_fixed_price ?? "");
  };

  const cancelEditFixedPrice = () => {
    setEditingFixedPriceId(null);
    setEditingFixedPriceValue("");
  };

  const handleFixedPriceSave = async (item) => {
    const newValue = editingFixedPriceValue;
    const numericValue = Number(newValue);

    if (Number.isNaN(numericValue) || numericValue < 0) {
      toast.error("Please enter a valid fixed price.");
      return;
    }

    if (!item?.v_id) {
      toast.error("Product not selected.");
      return;
    }

    setSavingFixedPriceId(item.v_id);
    try {
      const response = await VehicleService.Commands.individualVehicleUpdate(item.v_id, {
        vp_user_fixed_price: newValue ?? "",
        _method: "PUT",
      });

      if (response?.v_id) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.v_id === item.v_id
              ? {
                ...product,
                vehicle_db_price: {
                  ...product.vehicle_db_price,
                  vp_user_fixed_price: newValue ?? "",
                },
              }
              : product
          )
        );
        toast.success("Fixed price updated.");
        cancelEditFixedPrice();
      } else {
        toast.error(response?.data?.message || "Update failed.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed.");
    } finally {
      setSavingFixedPriceId(null);
    }
  };

  const startEditPurchasePrice = (item) => {
    setEditingPurchasePriceId(item?.v_id);
    setEditingPurchasePriceValue(item?.vehicle_db_price?.vp_user_purchase_price ?? "");
  };

  const cancelEditPurchasePrice = () => {
    setEditingPurchasePriceId(null);
    setEditingPurchasePriceValue("");
  };

  const handlePurchasePriceSave = async (item) => {
    const newValue = editingPurchasePriceValue;
    const numericValue = Number(newValue);

    if (Number.isNaN(numericValue) || numericValue < 0) {
      toast.error("Please enter a valid purchase price.");
      return;
    }

    if (!item?.v_id) {
      toast.error("Product not selected.");
      return;
    }

    setSavingPurchasePriceId(item.v_id);
    try {
      const response = await VehicleService.Commands.individualVehicleUpdate(item.v_id, {
        vp_user_purchase_price: newValue ?? "",
        _method: "PUT",
      });

      if (response?.v_id) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.v_id === item.v_id
              ? {
                ...product,
                vehicle_db_price: {
                  ...product.vehicle_db_price,
                  vp_user_purchase_price: newValue ?? "",
                },
              }
              : product
          )
        );
        toast.success("Purchase price updated.");
        cancelEditPurchasePrice();
      } else {
        toast.error(response?.data?.message || "Update failed.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed.");
    } finally {
      setSavingPurchasePriceId(null);
    }
  };

  const startEditAskingPrice = (item) => {
    setEditingAskingPriceId(item?.v_id);
    setEditingAskingPriceValue(item?.vehicle_db_price?.vp_user_asking_price ?? "");
  };

  const cancelEditAskingPrice = () => {
    setEditingAskingPriceId(null);
    setEditingAskingPriceValue("");
  };

  const handleAskingPriceSave = async (item) => {
    const newValue = editingAskingPriceValue;
    const numericValue = Number(newValue);

    if (Number.isNaN(numericValue) || numericValue < 0) {
      toast.error("Please enter a valid asking price.");
      return;
    }

    if (!item?.v_id) {
      toast.error("Product not selected.");
      return;
    }

    setSavingAskingPriceId(item.v_id);
    try {
      const response = await VehicleService.Commands.individualVehicleUpdate(item.v_id, {
        vp_user_asking_price: newValue ?? "",
        _method: "PUT",
      });

      if (response?.v_id) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.v_id === item.v_id
              ? {
                ...product,
                vehicle_db_price: {
                  ...product.vehicle_db_price,
                  vp_user_asking_price: newValue ?? "",
                },
              }
              : product
          )
        );
        toast.success("Asking price updated.");
        cancelEditAskingPrice();
      } else {
        toast.error(response?.data?.message || "Update failed.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed.");
    } finally {
      setSavingAskingPriceId(null);
    }
  };

  const startEditCostingPrice = (item) => {
    setEditingCostingPriceId(item?.v_id);
    setEditingCostingPriceValue(item?.vehicle_db_price?.vp_user_costing_price ?? "");
  };

  const cancelEditCostingPrice = () => {
    setEditingCostingPriceId(null);
    setEditingCostingPriceValue("");
  };

  const handleCostingPriceSave = async (item) => {
    const newValue = editingCostingPriceValue;
    const numericValue = Number(newValue);

    if (Number.isNaN(numericValue) || numericValue < 0) {
      toast.error("Please enter a valid costing price.");
      return;
    }

    if (!item?.v_id) {
      toast.error("Product not selected.");
      return;
    }

    setSavingCostingPriceId(item.v_id);
    try {
      const response = await VehicleService.Commands.individualVehicleUpdate(item.v_id, {
        vp_user_costing_price: newValue ?? "",
        _method: "PUT",
      });

      if (response?.v_id) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.v_id === item.v_id
              ? {
                ...product,
                vehicle_db_price: {
                  ...product.vehicle_db_price,
                  vp_user_costing_price: newValue ?? "",
                },
              }
              : product
          )
        );
        toast.success("Costing price updated.");
        cancelEditCostingPrice();
      } else {
        toast.error(response?.data?.message || "Update failed.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed.");
    } finally {
      setSavingCostingPriceId(null);
    }
  };

  useEffect(() => {
    getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery);
  }, [currentPage, itemsPerPage, sortColumn, sortOrder]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is inside any of the filter buttons
      const isClickInsideFilterButton =
        (filterButtonRef.current && filterButtonRef.current.contains(event.target)) ||
        (editionButtonRef.current && editionButtonRef.current.contains(event.target)) ||
        (modelButtonRef.current && modelButtonRef.current.contains(event.target)) ||
        (chassisButtonRef.current && chassisButtonRef.current.contains(event.target)) ||
        (priorityButtonRef.current && priorityButtonRef.current.contains(event.target)) ||
        (ownerButtonRef.current && ownerButtonRef.current.contains(event.target)) ||
        (brandButtonRef.current && brandButtonRef.current.contains(event.target));

      // Check if the click is inside any of the tooltips
      const isClickInsideTooltip =
        (tooltipRef.current && tooltipRef.current.contains(event.target)) ||
        (editionTooltipRef.current && editionTooltipRef.current.contains(event.target)) ||
        (modelTooltipRef.current && modelTooltipRef.current.contains(event.target)) ||
        (chassisTooltipRef.current && chassisTooltipRef.current.contains(event.target)) ||
        (priorityTooltipRef.current && priorityTooltipRef.current.contains(event.target)) ||
        (ownerTooltipRef.current && ownerTooltipRef.current.contains(event.target)) ||
        (brandTooltipRef.current && brandTooltipRef.current.contains(event.target));

      // Check if the click is inside any react-select component (including its control and menu)
      const isClickInsideReactSelect = event.target.closest('.react-select');

      if (!isClickInsideFilterButton && !isClickInsideTooltip && !isClickInsideReactSelect) {
        setShowCodeSearch(false);
        setShowEditionSearch(false);
        setShowModelSearch(false);
        setShowChassisSearch(false);
        setShowPrioritySearch(false);
        setShowOwnerSearch(false);
        setShowBrandSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [tooltipRef, filterButtonRef, editionTooltipRef, editionButtonRef, modelTooltipRef, modelButtonRef, chassisTooltipRef, chassisButtonRef, priorityTooltipRef, priorityButtonRef, ownerTooltipRef, ownerButtonRef, brandTooltipRef, brandButtonRef]);


  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const response = await VehicleService.Commands.individualVehicleUpdate(id, {
          v_status: "inactive",
          _method: 'PUT'
        });

        // console.log("response:::", response);

        if (response) {
          setProducts(prevProducts => prevProducts.filter(product => product.v_id !== id));
          Swal.fire({
            title: "Deleted!",
            text: "Product deleted successfully!",
            icon: "success"
          });
        }

      } catch (error) {
        if (error.errors) {
          Object.values(error.errors).forEach((e) => toast.error(e[0]));
        } else {
          toast.error(error.message || "Something went wrong");
        }
      }
    }
  };



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


  useEffect(() => {

    const userData = localStorage.getItem("user");
    const userInfo = userData && JSON.parse(userData);
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }

    // getShopData();
  }, []);



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



  // console.log("user", user);


  useEffect(() => {
    if (user?.id) {
      fetchCompanyShops();
    }
  }, [user?.id, fetchCompanyShops]);


  // console.log("ssetSelectedShophopData", selectedShop);



  return (
    <div className="flex flex-col min-h-screen w-full justify-between bg-gray-50 px-6">
      <main className="mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6 my-6 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-xl text-gray-800">Product List</h2>

          <div className="flex flex-col gap-1.5 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2 shadow-sm">
            <label
              htmlFor="status-filter"
              className="text-xs font-semibold uppercase tracking-wide text-gray-600"
            >
              Company Shop
            </label>
            <select
              id="status-filter"
              className="h-10 min-w-[220px] rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedShop}
              onChange={(e) => {
                const newShopId = e.target.value;
                setSelectedShop(newShopId);
                setCurrentPage(1);
                getProducts(
                  codeQuery,
                  editionQuery,
                  chassisQuery,
                  priorityQuery,
                  ownerQuery,
                  brandQuery,
                  modelQuery,
                  query,
                  newShopId
                );
              }}
            >
              <option value="">Select Company Shop</option>
              <option value="my-shop">My Shop</option>
              {shopData.map((shop) => (
                <option key={shop.value} value={shop.value}>{shop.label}</option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Button>
        </div>

        {/* Search Filter */}
        <TableFilter
          query={query}
          setQuery={setQuery}
          setCurrentPage={setCurrentPage}
          fetchSearchResults={fetchSearchResults}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          placeholder="Search..."
          onClearSearch={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery, '')}
        />


        {/* Table Container */}
        <div className="overflow-x-auto overflow-y-auto rounded-md border border-gray-300 mt-4">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-300">
                {isColumnVisible('sl') && <TableHead className="w-[60px] border-r border-gray-300 text-center">SL</TableHead>}
                {isColumnVisible('name') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Name
                    </div>
                  </TableHead>
                )}
                {isColumnVisible('brand') && (
                  <TableHead className="border-r border-gray-300 relative">
                    <div className="flex items-center justify-between relative">
                      <span>Brand</span>

                      <div className="relative">
                        <button
                          onClick={() => { setShowBrandSearch(!showBrandSearch); setShowCodeSearch(false); setShowEditionSearch(false); setShowModelSearch(false); setShowChassisSearch(false); setShowPrioritySearch(false); setShowOwnerSearch(false); }}
                          className="ml-2 focus:outline-none"
                          ref={brandButtonRef}
                        >
                          <Funnel className={`w-4 h-4 ${brandQuery ? 'text-orange-500' : ''}`} />
                        </button>

                        {showBrandSearch && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                        )}
                      </div>
                    </div>
                    {showBrandSearch && (
                      <div className="relative" ref={brandTooltipRef}>
                        <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-48 flex flex-col items-end">
                          <div className="flex items-center w-full mb-2">
                            <Select
                              options={[
                                { value: '', label: 'All Brands' },
                                ...brands
                              ]}
                              value={brands.find(option => option.value === brandQuery) ? brands.find(option => option.value === brandQuery) : { value: '', label: 'All Brands' }}
                              onChange={(selectedOption) =>
                                setBrandQuery(selectedOption ? selectedOption.value : '')
                              }
                              placeholder="Select Brand"
                              isClearable={true}
                              className="w-full text-sm"
                              classNamePrefix="react-select"
                            />

                            {brandQuery && (
                              <button
                                onClick={() => {
                                  setBrandQuery('');
                                  getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, '', modelQuery);
                                  setShowBrandSearch(false);
                                }}
                                className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </TableHead>
                )}

                {isColumnVisible('model') && (
                  <TableHead className="border-r border-gray-300 relative">
                    <div className="flex items-center justify-between relative">
                      <span>Model</span>

                      <div className="relative">
                        <button
                          onClick={() => { setShowModelSearch(!showModelSearch); setShowCodeSearch(false); setShowEditionSearch(false); setShowBrandSearch(false); setShowChassisSearch(false); setShowPrioritySearch(false); setShowOwnerSearch(false); }}
                          className="ml-2 focus:outline-none"
                          ref={modelButtonRef}
                        >
                          <Funnel className={`w-4 h-4 ${modelQuery ? 'text-orange-500' : ''}`} />
                        </button>

                        {showModelSearch && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                        )}
                      </div>
                    </div>
                    {showModelSearch && (
                      <div className="relative" ref={modelTooltipRef}>
                        <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-48 flex flex-col items-end">
                          <div className="flex items-center w-full mb-2">
                            <Select
                              options={[
                                { value: '', label: 'All Models' },
                                ...models
                              ]}
                              value={models.find(option => option.value === modelQuery) ? models.find(option => option.value === modelQuery) : { value: '', label: 'All Models' }}
                              onChange={(selectedOption) =>
                                setModelQuery(selectedOption ? selectedOption.value : '')
                              }
                              placeholder="Select Model"
                              isClearable={true}
                              className="w-full text-sm"
                              classNamePrefix="react-select"
                            />

                            {modelQuery && (
                              <button
                                onClick={() => {
                                  setModelQuery('');
                                  getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, '');
                                  setShowModelSearch(false);
                                }}
                                className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </TableHead>
                )}

                {isColumnVisible('package') && (
                  <TableHead className="border-r border-gray-300 relative">
                    <div className="flex items-center justify-between relative">
                      <span>Package</span>

                      <div className="relative">
                        <button
                          onClick={() => { setShowEditionSearch(!showEditionSearch); setShowCodeSearch(false); setShowModelSearch(false); setShowBrandSearch(false); setShowChassisSearch(false); setShowPrioritySearch(false); setShowOwnerSearch(false); }}
                          className="ml-2 focus:outline-none"
                          ref={editionButtonRef}
                        >
                          <Funnel className={`w-4 h-4 ${editionQuery ? 'text-orange-500' : ''}`} />
                        </button>

                        {showEditionSearch && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                        )}
                      </div>
                    </div>
                    {showEditionSearch && (
                      <div className="relative" ref={editionTooltipRef}>
                        <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-48 flex flex-col items-end">
                          <div className="flex items-center w-full mb-2">
                            <Select
                              options={[
                                { value: '', label: 'All Packages' },
                                ...editions.map((edition) => ({
                                  value: edition.p_id,
                                  label: edition.p_name
                                }))
                              ]}
                              value={editions.find(option => option.p_id === editionQuery) ? { value: editionQuery, label: editions.find(option => option.p_id === editionQuery).p_name } : { value: '', label: 'All Packages' }}
                              onChange={(selectedOption) =>
                                setEditionQuery(selectedOption ? selectedOption.value : '')
                              }
                              placeholder="Select Package"
                              isClearable={true}
                              className="w-full text-sm"
                              classNamePrefix="react-select"
                            />

                            {editionQuery && (
                              <button
                                onClick={() => {
                                  setEditionQuery('');
                                  getProducts(codeQuery, '', chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery);
                                  setShowEditionSearch(false);
                                }}
                                className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </TableHead>
                )}

             



                {isColumnVisible('chassis') && (
                  <TableHead className="border-r border-gray-300 relative">
                    <div className="flex items-center justify-between relative">
                      <span>Chassis No</span>

                      <div className="relative">
                        <button
                          onClick={() => { setShowChassisSearch(!showChassisSearch); setShowCodeSearch(false); setShowEditionSearch(false); setShowModelSearch(false); setShowPrioritySearch(false); setShowOwnerSearch(false); setShowBrandSearch(false); }}
                          className="ml-2 focus:outline-none"
                          ref={chassisButtonRef}
                        >
                          <Funnel className={`w-4 h-4 ${chassisQuery ? 'text-orange-500' : ''}`} />
                        </button>

                        {/* Arrow Up when search box is visible */}
                        {showChassisSearch && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                        )}
                      </div>
                    </div>
                    {showChassisSearch && (
                      <div className="relative" ref={chassisTooltipRef}>
                        {/* Arrow Up */}
                        <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />

                        {/* Search Box */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-48 flex flex-col items-end">
                          <div className="flex items-center w-full mb-2">
                            <input
                              type="text"
                              placeholder="Search by Chassis No"
                              className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={chassisQuery}
                              onChange={(e) => setChassisQuery(e.target.value)}
                            />
                            {chassisQuery && (
                              <button
                                onClick={() => {
                                  setChassisQuery('');
                                  getProducts(codeQuery, editionQuery, '', priorityQuery, ownerQuery, brandQuery, modelQuery);
                                  setShowChassisSearch(false);
                                }}
                                className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </TableHead>
                )}


                {isColumnVisible('capacity') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Capacity
                    </div>
                  </TableHead>
                )}

                {isColumnVisible('color') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Color
                    </div>
                  </TableHead>
                )}


                {isColumnVisible('price') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Price
                    </div>
                  </TableHead>
                )}

                {/* costing-price */}
                {isColumnVisible('costing-price') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Costing Price
                    </div>
                  </TableHead>
                )}

                {/* asking-price */}
                {isColumnVisible('asking-price') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Asking Price
                    </div>
                  </TableHead>
                )}



                {isColumnVisible('fixed-price') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Fixed Price
                    </div>
                  </TableHead>
                )}

                {/* purchase-price */}
                {isColumnVisible('purchase-price') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Purchase Price
                    </div>
                  </TableHead>
                )}

                {isColumnVisible('condition') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Condition
                    </div>
                  </TableHead>
                )}

                {isColumnVisible('owner') && (
                  <TableHead className="border-r border-gray-300 relative">
                    <div className="flex items-center justify-between relative">
                      <span>Owner</span>

                      <div className="relative">
                        <button
                          onClick={() => { setShowOwnerSearch(!showOwnerSearch); setShowCodeSearch(false); setShowEditionSearch(false); setShowModelSearch(false); setShowChassisSearch(false); setShowPrioritySearch(false); setShowBrandSearch(false); }}
                          className="ml-2 focus:outline-none"
                          ref={ownerButtonRef}
                        >
                          <Funnel className={`w-4 h-4 ${ownerQuery ? 'text-orange-500' : ''}`} />
                        </button>

                        {/* Arrow Up when search box is visible */}
                        {showOwnerSearch && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                        )}
                      </div>
                    </div>
                    {showOwnerSearch && (
                      <div className="relative" ref={ownerTooltipRef}>
                        {/* Arrow Up */}
                        <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />
                        {/* Search Box */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-48 flex flex-col items-end">
                          <div className="flex items-center w-full mb-2">
                            <Select
                              options={[
                                { value: '', label: 'All Owners' },
                                ...users.map(user => ({
                                  value: user.id,
                                  label: user.name
                                }))
                              ]}
                              value={users.find(option => option.id === ownerQuery) ? { value: ownerQuery, label: users.find(option => option.id === ownerQuery).name } : { value: '', label: 'All Owners' }}
                              onChange={(selectedOption) =>
                                setOwnerQuery(selectedOption ? selectedOption.value : '')
                              }
                              placeholder="Select Owner"
                              isClearable={true}
                              className="w-full text-sm"
                              classNamePrefix="react-select"
                            />

                            {ownerQuery && (
                              <button
                                onClick={() => {
                                  setOwnerQuery('');
                                  getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, '', brandQuery, modelQuery);
                                  setShowOwnerSearch(false);
                                }}
                                className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </TableHead>
                )}


                {isColumnVisible('availability') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Availability
                    </div>
                  </TableHead>
                )}


                 {isColumnVisible('grade') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Grade
                    </div>
                  </TableHead>
                )}


                
                 {isColumnVisible('milage') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Milage
                    </div>
                  </TableHead>
                )}


                   {isColumnVisible('fuel') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Fuel
                    </div>
                  </TableHead>
                )}


                {isColumnVisible('priority') && (
                  <TableHead className="border-r border-gray-300 relative">
                    <div className="flex items-center justify-between relative">
                      <span>Priority</span>

                      <div className="relative">
                        <button
                          onClick={() => { setShowPrioritySearch(!showPrioritySearch); setShowCodeSearch(false); setShowEditionSearch(false); setShowModelSearch(false); setShowChassisSearch(false); setShowOwnerSearch(false); setShowBrandSearch(false); }}
                          className="ml-2 focus:outline-none"
                          ref={priorityButtonRef}
                        >
                          <Funnel className={`w-4 h-4 ${priorityQuery ? 'text-orange-500' : ''}`} />
                        </button>

                        {/* Arrow Up when search box is visible */}
                        {showPrioritySearch && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                        )}
                      </div>
                    </div>
                    {showPrioritySearch && (
                      <div className="relative" ref={priorityTooltipRef}>
                        {/* Arrow Up */}
                        <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />
                        {/* Search Box */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-48 flex flex-col items-end">
                          <div className="flex items-center w-full mb-2">
                            <Select
                              options={[
                                { value: '', label: 'All Priority' },
                                { value: 'ASC', label: 'Ascending' },
                                { value: 'DESC', label: 'Descending' }
                              ]}
                              value={priorityQuery ? { value: priorityQuery, label: priorityQuery === 'ASC' ? 'Ascending' : 'Descending' } : { value: '', label: 'All Priority' }}
                              onChange={(selectedOption) =>
                                setPriorityQuery(selectedOption ? selectedOption.value : '')
                              }
                              placeholder="Select Priority Order"
                              isClearable={true}
                              className="w-full text-sm"
                              classNamePrefix="react-select"
                            />

                            {priorityQuery && (
                              <button
                                onClick={() => {
                                  setPriorityQuery('');
                                  getProducts(codeQuery, editionQuery, chassisQuery, '', ownerQuery, brandQuery, modelQuery);
                                  setShowPrioritySearch(false);
                                }}
                                className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </TableHead>
                )}


                {/* {isColumnVisible('package') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Package
                    </div>
                  </TableHead>
                )} */}



                {isColumnVisible('code') && (
                  <TableHead className="border-r border-gray-300 relative">
                    <div className="flex items-center justify-between relative">
                      <span>Code</span>

                      <div className="relative">
                        <button
                          onClick={() => { setShowCodeSearch(!showCodeSearch); setShowEditionSearch(false); setShowModelSearch(false); setShowChassisSearch(false); setShowPrioritySearch(false); setShowOwnerSearch(false); setShowBrandSearch(false); }}
                          className="ml-2 focus:outline-none"
                          ref={filterButtonRef}
                        >
                          <Funnel className={`w-4 h-4 ${codeQuery ? 'text-orange-500' : ''}`} />
                        </button>

                        {/* Arrow Up when search box is visible */}
                        {showCodeSearch && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                        )}
                      </div>
                    </div>
                    {showCodeSearch && (
                      <div className="relative" ref={tooltipRef}>
                        {/* Arrow Up */}
                        <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />

                        {/* Search Box */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-48 flex flex-col items-end">
                          <div className="flex items-center w-full mb-2">
                            <input
                              type="text"
                              placeholder="Search by Code"
                              className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={codeQuery}
                              onChange={(e) => setCodeQuery(e.target.value)}
                            />
                            {codeQuery && (
                              <button
                                onClick={() => {
                                  setCodeQuery('');
                                  getProducts('', editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery);
                                  setShowCodeSearch(false);
                                }}
                                className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </TableHead>
                )}

                {isColumnVisible('status') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Status
                    </div>
                  </TableHead>
                )}

                {isColumnVisible('actions') && (
                  <TableHead className="text-right w-[10]">
                    <div className="flex justify-end items-center w-full">
                      <button
                        onClick={() => setShowColumnToggle(!showColumnToggle)}
                        className="text-gray-600 hover:text-gray-800 focus:outline-none"
                        title="Toggle columns"
                      >
                        <Settings size={20} />
                      </button>
                    </div>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {!loading && products?.length > 0 ? (
                products.map((item, index) => (
                  <TableRow key={item.id || index} className="border-b border-gray-200">
                    {isColumnVisible('sl') && <TableCell className="border-r border-gray-200 text-center py-4">{index + 1}</TableCell>}
                    {isColumnVisible('name') && (
                      <TableCell className="border-r border-gray-200 font-medium py-4">
                        <a className="text-blue-600" target="_blank" href={`/product/${item?.v_id}`}>{item?.v_title}</a>
                      </TableCell>
                    )}
                    {isColumnVisible('brand') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_brand_name}</TableCell>}
                    {isColumnVisible('model') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_model_name}</TableCell>}
                    {isColumnVisible('package') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_edition_name}</TableCell>}
                    {isColumnVisible('chassis') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_chassis}</TableCell>}
                    {isColumnVisible('capacity') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_capacity}</TableCell>}
                    {isColumnVisible('color') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_color_name}</TableCell>}
                    {isColumnVisible('price') && (
                      <TableCell className="border-r border-gray-200 font-medium py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handlePricePreview(item)}
                            className="text-gray-600 hover:text-blue-600"
                            aria-label="View price details"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </TableCell>
                    )}
                    {isColumnVisible('costing-price') && (
                      <TableCell className="border-r border-gray-200 font-medium py-4">
                        {editingCostingPriceId === item?.v_id ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="number"
                              inputMode="decimal"
                              className="h-9 w-full min-w-[7rem] rounded-md border border-gray-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={editingCostingPriceValue}
                              onChange={(e) => setEditingCostingPriceValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleCostingPriceSave(item);
                                }
                                if (e.key === "Escape") {
                                  cancelEditCostingPrice();
                                }
                              }}
                              aria-label="Edit costing price"
                            />


                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleCostingPriceSave(item)}
                                disabled={savingCostingPriceId === item?.v_id}
                                className="rounded-md border border-green-200 bg-green-50 p-1 text-green-700 hover:bg-green-100 disabled:opacity-60"
                                aria-label="Save costing price"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditCostingPrice}
                                disabled={savingCostingPriceId === item?.v_id}
                                className="rounded-md border border-gray-200 bg-gray-50 p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-60"
                                aria-label="Cancel costing price edit"
                              >
                                <X size={16} />
                              </button>
                            </div>





                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2 group">
                            <span>{item?.vehicle_db_price?.vp_user_costing_price ?? "-"}</span>

                            {
                              updateCostingPricePermission && (
                                <button
                                  type="button"
                                  onClick={() => startEditCostingPrice(item)}
                                  className="rounded-md p-1 text-gray-500 opacity-0 transition hover:bg-gray-100 hover:text-gray-700 group-hover:opacity-100"
                                  aria-label="Edit costing price"
                                >
                                  <Pencil size={14} />
                                </button>
                              )
                            }
                          </div>
                        )}
                      </TableCell>
                    )}

                    {isColumnVisible('asking-price') && (
                      <TableCell className="border-r border-gray-200 font-medium py-4">
                        {editingAskingPriceId === item?.v_id ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="number"
                              inputMode="decimal"
                              className="h-9 w-full min-w-[7rem] rounded-md border border-gray-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={editingAskingPriceValue}
                              onChange={(e) => setEditingAskingPriceValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleAskingPriceSave(item);
                                }
                                if (e.key === "Escape") {
                                  cancelEditAskingPrice();
                                }
                              }}
                              aria-label="Edit asking price"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleAskingPriceSave(item)}
                                disabled={savingAskingPriceId === item?.v_id}
                                className="rounded-md border border-green-200 bg-green-50 p-1 text-green-700 hover:bg-green-100 disabled:opacity-60"
                                aria-label="Save asking price"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditAskingPrice}
                                disabled={savingAskingPriceId === item?.v_id}
                                className="rounded-md border border-gray-200 bg-gray-50 p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-60"
                                aria-label="Cancel asking price edit"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2 group">
                            <span>{item?.vehicle_db_price?.vp_user_asking_price ?? "-"}</span>

                            {
                              updateAskingPricePermission && (
                                <button
                                  type="button"
                                  onClick={() => startEditAskingPrice(item)}
                                  className="rounded-md p-1 text-gray-500 opacity-0 transition hover:bg-gray-100 hover:text-gray-700 group-hover:opacity-100"
                                  aria-label="Edit asking price"
                                >
                                  <Pencil size={14} />
                                </button>
                              )
                            }



                          </div>
                        )}
                      </TableCell>
                    )}

                    {isColumnVisible('fixed-price') &&
                      <TableCell className="border-r border-gray-200 font-medium py-4">
                        {editingFixedPriceId === item?.v_id ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="number"
                              inputMode="decimal"
                              className="h-9 w-full min-w-[7rem] rounded-md border border-gray-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={editingFixedPriceValue}
                              onChange={(e) => setEditingFixedPriceValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleFixedPriceSave(item);
                                }
                                if (e.key === "Escape") {
                                  cancelEditFixedPrice();
                                }
                              }}
                              aria-label="Edit fixed price"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleFixedPriceSave(item)}
                                disabled={savingFixedPriceId === item?.v_id}
                                className="rounded-md border border-green-200 bg-green-50 p-1 text-green-700 hover:bg-green-100 disabled:opacity-60"
                                aria-label="Save fixed price"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditFixedPrice}
                                disabled={savingFixedPriceId === item?.v_id}
                                className="rounded-md border border-gray-200 bg-gray-50 p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-60"
                                aria-label="Cancel fixed price edit"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2 group">
                            <span>{item?.vehicle_db_price?.vp_user_fixed_price ?? "-"}</span>

                            {
                              updateFixedPricePermission && (
                                <button
                                  type="button"
                                  onClick={() => startEditFixedPrice(item)}
                                  className="rounded-md p-1 text-gray-500 opacity-0 transition hover:bg-gray-100 hover:text-gray-700 group-hover:opacity-100"
                                  aria-label="Edit fixed price"
                                >
                                  <Pencil size={14} />
                                </button>
                              )
                            }

                          </div>
                        )}
                      </TableCell>}


                    {isColumnVisible('purchase-price') && (
                      <TableCell className="border-r border-gray-200 font-medium py-4">
                        {editingPurchasePriceId === item?.v_id ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="number"
                              inputMode="decimal"
                              className="h-9 w-full min-w-[7rem] rounded-md border border-gray-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={editingPurchasePriceValue}
                              onChange={(e) => setEditingPurchasePriceValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handlePurchasePriceSave(item);
                                }
                                if (e.key === "Escape") {
                                  cancelEditPurchasePrice();
                                }
                              }}
                              aria-label="Edit purchase price"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handlePurchasePriceSave(item)}
                                disabled={savingPurchasePriceId === item?.v_id}
                                className="rounded-md border border-green-200 bg-green-50 p-1 text-green-700 hover:bg-green-100 disabled:opacity-60"
                                aria-label="Save purchase price"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditPurchasePrice}
                                disabled={savingPurchasePriceId === item?.v_id}
                                className="rounded-md border border-gray-200 bg-gray-50 p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-60"
                                aria-label="Cancel purchase price edit"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2 group">
                            <span>{item?.vehicle_db_price?.vp_user_purchase_price ?? "-"}</span>


                            {
                              updatePurchasePricePermission && (
                                <button
                                  type="button"
                                  onClick={() => startEditPurchasePrice(item)}
                                  className="rounded-md p-1 text-gray-500 opacity-0 transition hover:bg-gray-100 hover:text-gray-700 group-hover:opacity-100"
                                  aria-label="Edit purchase price"
                                >
                                  <Pencil size={14} />
                                </button>
                              )
                            }


                          </div>
                        )}
                      </TableCell>
                    )}
                    {isColumnVisible('condition') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_condition_name}</TableCell>}
                    {isColumnVisible('owner') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_shop_user_name}</TableCell>}
                    {isColumnVisible('availability') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_availability_name}</TableCell>}
                    {isColumnVisible('grade') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_grade_name}</TableCell>}
                    {isColumnVisible('milage') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_mileage}</TableCell>}
                    {isColumnVisible('fuel') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_fuel_name}</TableCell>}
                    {isColumnVisible('priority') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_priority}</TableCell>}
                    {/* {isColumnVisible('package') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_edition_name}</TableCell>} */}
                    {isColumnVisible('code') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_code}</TableCell>}
                    {isColumnVisible('status') && (
                      <TableCell className="border-r border-gray-200 font-medium py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-semibold ${item.v_status === 'active'
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                        >
                          {item.v_status === 'active' ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                    )}
                    {isColumnVisible('actions') && (
                      <TableCell className="flex justify-end gap-2 border-r border-gray-200 font-medium py-4">

                        <button
                          onClick={() => handlePriceHistory(item)}
                          className="text-blue-600 hover:text-blue-800"
                          aria-label={`Price History`}
                        >
                          <DollarSign size={18} />
                        </button>

                        {/* {(() => {
                          const companyShopId = item?.v_shop_id;
                          const priceAction = "Update";
                          const hasCreatePermission = hasPermission(permissionList, companyShopId, "Vehicle", priceAction);

                          if (!hasCreatePermission) return null;

                          return (
                            <button
                              onClick={() => handleEdit(item.v_id)}
                              className="text-blue-600 hover:text-blue-800"
                              aria-label={`Edit shop ${item.s_title}`}
                            >
                              <Pencil size={18} />
                            </button>
                          );
                        })()} */}

                        {
                          updateProductPricePermission && (
                            <button
                              onClick={() => handleEdit(item.v_id)}
                              className="text-blue-600 hover:text-blue-800"
                              aria-label={`Edit shop ${item.s_title}`}
                            >
                              <Pencil size={18} />
                            </button>
                          )
                        }


                        <button
                          // Add delete handler here
                          onClick={() => handleDelete(item?.v_id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label={`Delete shop ${item.s_title}`}
                        >
                          <Trash2 size={21} />
                        </button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={20} className="h-[300px] md:h-[300px] lg:h-[400px] xl:h-[600px] text-center py-4 text-gray-500">
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="animate-spin w-5 h-5 text-blue-500" />
                        <span className="text-gray-500 font-semibold ">Loading...</span>
                      </div>
                    ) : (
                      <div> No Product found.</div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </main>
      <Footer />

      {/* Shop Modal */}
      <PriceHistoryModal
        open={open}
        setOpen={setOpen}
        selectedProduct={selectedProduct}
      // brands={brands}
      // getModels={getModels}
      // initialData={selectedModel}
      />

      <PricePreviewModal
        open={pricePreviewOpen}
        setOpen={setPricePreviewOpen}
        selectedProduct={pricePreviewProduct}
        updateProductPricePermission={updateProductPricePermission}
      />

      {/* Column Visibility Toggle Modal */}
      {showColumnToggle && (
        <ColumnVisibilityToggle
          columns={columns}
          visibleColumns={visibleColumns}
          onColumnsChange={setVisibleColumns}
          onClose={() => setShowColumnToggle(false)}
        />
      )}
    </div>
  );
};

export default ProductList;
